/*
 * to_prosemirror.ts
 *
 * Copyright (C) 2019-20 by RStudio, PBC
 *
 * Unless you have received this program directly from RStudio pursuant
 * to the terms of a commercial license agreement with RStudio, then
 * this program is licensed to you under the terms of version 3 of the
 * GNU Affero General Public License. This program is distributed WITHOUT
 * ANY EXPRESS OR IMPLIED WARRANTY, INCLUDING THOSE OF NON-INFRINGEMENT,
 * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. Please refer to the
 * AGPL (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.
 *
 */

import { Mark, Node as ProsemirrorNode, NodeType, Schema } from 'prosemirror-model';

import {
  PandocTokenReader,
  PandocToken,
  PandocAst,
  ProsemirrorWriter,
  PandocBlockReaderFn,
  PandocCodeBlockFilter,
  PandocInlineHTMLReaderFn,
} from '../api/pandoc';
import { pandocAttrReadAST, PandocAttr } from '../api/pandoc_attr';

export function pandocToProsemirror(
  ast: PandocAst,
  schema: Schema,
  readers: readonly PandocTokenReader[],
  blockReaders: readonly PandocBlockReaderFn[],
  inlineHTMLReaders: readonly PandocInlineHTMLReaderFn[],
  codeBlockFilters: readonly PandocCodeBlockFilter[],
) {
  const parser = new Parser(schema, readers, blockReaders, inlineHTMLReaders, codeBlockFilters);
  return parser.parse(ast);
}

const CODE_BLOCK_ATTR = 0;
const CODE_BLOCK_TEXT = 1;

class Parser {
  private readonly schema: Schema;
  private readonly inlineHTMLReaders: readonly PandocInlineHTMLReaderFn[];
  private readonly handlers: { [token: string]: ParserTokenHandlerCandidate[] };

  constructor(
    schema: Schema,
    readers: readonly PandocTokenReader[],
    blockReaders: readonly PandocBlockReaderFn[],
    inlineHTMLReaders: readonly PandocInlineHTMLReaderFn[],
    codeBlockFilters: readonly PandocCodeBlockFilter[],
  ) {
    this.schema = schema;
    this.inlineHTMLReaders = inlineHTMLReaders;
    this.handlers = this.createHandlers(readers, blockReaders, codeBlockFilters);
  }

  public parse(ast: any): ProsemirrorNode {
    // create state
    const state: ParserState = new ParserState(this.schema);

    // create writer (compose state w/ writeTokens function)
    const parser = this;
    const writer: ProsemirrorWriter = {
      openNode: state.openNode.bind(state),
      closeNode: state.closeNode.bind(state),
      openNoteNode: state.openNoteNode.bind(state),
      addNode: state.addNode.bind(state),
      openMark: state.openMark.bind(state),
      closeMark: state.closeMark.bind(state),
      writeText: state.writeText.bind(state),
      writeInlineHTML(html: string) {
        parser.writeInlineHTML(this, html);
      },
      writeTokens(tokens: PandocToken[]) {
        parser.writeTokens(this, tokens);
      },
    };

    // write all tokens
    writer.writeTokens(ast.blocks);

    // return the doc
    return state.doc();
  }

  private writeTokens(writer: ProsemirrorWriter, tokens: PandocToken[]) {
    tokens.forEach(tok => this.writeToken(writer, tok));
  }

  private writeToken(writer: ProsemirrorWriter, tok: PandocToken) {
    // look for a handler.match function that wants to handle this token
    const handlers = this.handlers[tok.t] || [];
    for (const handler of handlers) {
      // It's not enough for a pandoc reader's preferred token to match the
      // current token; it's possible based on the `match` method for the
      // reader to decline to handle it.
      if (handler.match && handler.match(tok)) {
        handler.handler(writer, tok);
        return;
      }
    }

    // if we didn't find one, look for the default handler
    for (const handler of handlers) {
      if (!handler.match) {
        handler.handler(writer, tok);
        return;
      }
    }

    throw new Error(`No handler for pandoc token ${tok.t}`);
  }

  private writeInlineHTML(writer: ProsemirrorWriter, html: string) {
    // see if any of our readers want to take it
    for (const reader of this.inlineHTMLReaders) {
      if (reader(this.schema, html, writer)) {
        return;
      }
    }

    // otherwise just write it
    const mark = this.schema.marks.raw_html.create();
    writer.openMark(mark);
    writer.writeText(html);
    writer.closeMark(mark);
  }

  // create parser token handler functions based on the passed readers
  private createHandlers(
    readers: readonly PandocTokenReader[],
    blockReaders: readonly PandocBlockReaderFn[],
    codeBlockFilters: readonly PandocCodeBlockFilter[],
  ) {
    const handlers: { [token: string]: ParserTokenHandlerCandidate[] } = {};

    for (const reader of readers) {
      // resolve children (provide default impl)
      const getChildren = reader.getChildren || ((tok: PandocToken) => tok.c);

      // resolve getAttrs (provide default imple)
      const getAttrs = reader.getAttrs ? reader.getAttrs : (tok: PandocToken) => ({});

      let handler: ParserTokenHandler;

      // see if there is a low-level handler
      if (reader.handler) {
        handler = reader.handler(this.schema);
      }

      // text
      else if (reader.text) {
        handler = (writer: ProsemirrorWriter, tok: PandocToken) => {
          if (reader.getText) {
            const text = reader.getText(tok);
            writer.writeText(text);
          }
        };

        // marks
      } else if (reader.mark) {
        handler = (writer: ProsemirrorWriter, tok: PandocToken) => {
          const markType = this.schema.marks[reader.mark as string];
          const mark = markType.create(getAttrs(tok));
          writer.openMark(mark);
          if (reader.getText) {
            writer.writeText(reader.getText(tok));
          } else {
            writer.writeTokens(getChildren(tok));
          }
          writer.closeMark(mark);
        };

        // blocks
      } else if (reader.block) {
        const nodeType = this.schema.nodes[reader.block];
        handler = (writer: ProsemirrorWriter, tok: PandocToken) => {
          // give the block readers first crack (e.g. handle a paragraph node with
          // a single image as a figure node)
          for (const blockReader of blockReaders) {
            if (blockReader(this.schema, tok, writer)) {
              return;
            }
          }

          writer.openNode(nodeType, getAttrs(tok));
          if (reader.getText) {
            writer.writeText(reader.getText(tok));
          } else {
            writer.writeTokens(getChildren(tok));
          }
          writer.closeNode();
        };

        // nodes
      } else if (reader.node) {
        const nodeType = this.schema.nodes[reader.node];
        handler = (writer: ProsemirrorWriter, tok: PandocToken) => {
          if (reader.getChildren) {
            writer.openNode(nodeType, getAttrs(tok));
            writer.writeTokens(getChildren(tok));
            writer.closeNode();
          } else {
            let content: ProsemirrorNode[] = [];
            if (reader.getText) {
              content = [this.schema.text(reader.getText(tok))];
            }
            writer.addNode(nodeType, getAttrs(tok), content);
          }
        };

        // code blocks
      } else if (reader.code_block) {
        handler = (writer: ProsemirrorWriter, tok: PandocToken) => {
          // default attr and nodeType (before filters)
          let attr: {} = pandocAttrReadAST(tok, CODE_BLOCK_ATTR);
          let nodeType = this.schema.nodes.code_block;

          // allow code block filters (e.g. yaml passthrough, rmd chunks) to have a shot
          for (const filter of codeBlockFilters) {
            if ((attr as PandocAttr).classes.includes(filter.class)) {
              attr = filter.getAttrs(tok);
              nodeType = filter.nodeType(this.schema);
              break;
            }
          }

          // trim trailing newline if we have one
          let text = tok.c[CODE_BLOCK_TEXT] as string;
          if (text.endsWith('\n')) {
            text = text.substr(0, text.length - 1);
          }

          // write node
          writer.openNode(nodeType, attr);
          writer.writeText(text);
          writer.closeNode();
        };
      } else {
        throw new Error('pandoc reader was malformed or unrecognized');
      }

      // Ensure an array exists
      handlers[reader.token] = handlers[reader.token] || [];

      handlers[reader.token].push({
        match: reader.match,
        handler,
      });
    }
    return handlers;
  }
}

class ParserState {
  private readonly schema: Schema;
  private readonly stack: ParserStackElement[];
  private readonly notes: ProsemirrorNode[];
  private marks: Mark[];
  private footnoteNumber: number;

  constructor(schema: Schema) {
    this.schema = schema;
    this.stack = [{ type: this.schema.nodes.body, attrs: {}, content: [] }];
    this.notes = [];
    this.marks = Mark.none;
    this.footnoteNumber = 1;
  }

  public doc(): ProsemirrorNode {
    const content: ProsemirrorNode[] = [];
    content.push(this.top().type.createAndFill(null, this.top().content) as ProsemirrorNode);
    content.push(this.schema.nodes.notes.createAndFill(null, this.notes) as ProsemirrorNode);
    return this.schema.topNodeType.createAndFill({}, content) as ProsemirrorNode;
  }

  public writeText(text: string) {
    if (!text) {
      return;
    }
    const nodes: ProsemirrorNode[] = this.top().content;
    const last: ProsemirrorNode = nodes[nodes.length - 1];
    const node: ProsemirrorNode = this.schema.text(text, this.marks);
    const merged: ProsemirrorNode | undefined = this.maybeMerge(last, node);
    if (last && merged) {
      nodes[nodes.length - 1] = merged;
    } else {
      nodes.push(node);
    }
  }

  public addNode(type: NodeType, attrs: {}, content: ProsemirrorNode[]) {
    const node: ProsemirrorNode | null | undefined = type.createAndFill(attrs, content, this.marks);
    if (!node) {
      return null;
    }
    if (this.stack.length) {
      if (type === this.schema.nodes.note) {
        this.notes.push(node);
      } else {
        this.top().content.push(node);
      }
    }
    return node;
  }

  public openNode(type: NodeType, attrs: {}) {
    this.stack.push({ type, attrs, content: [] });
  }

  public closeNode(): ProsemirrorNode {
    // get node info
    const info: ParserStackElement = this.stack.pop() as ParserStackElement;

    // clear marks if the node type isn't inline
    if (!info.type.isInline) {
      if (this.marks.length) {
        this.marks = Mark.none;
      }
    }

    return this.addNode(info.type, info.attrs, info.content) as ProsemirrorNode;
  }

  public openMark(mark: Mark) {
    this.marks = mark.addToSet(this.marks);
  }

  public closeMark(mark: Mark) {
    this.marks = mark.removeFromSet(this.marks);
  }

  public openNoteNode(ref: string) {
    this.openNode(this.schema.nodes.note, { ref, number: this.footnoteNumber++ });
  }

  private top(): ParserStackElement {
    return this.stack[this.stack.length - 1];
  }

  private maybeMerge(a: ProsemirrorNode, b: ProsemirrorNode): ProsemirrorNode | undefined {
    if (a && a.isText && b.isText && Mark.sameSet(a.marks, b.marks)) {
      return this.schema.text(((a.text as string) + b.text) as string, a.marks);
    } else {
      return undefined;
    }
  }
}

interface ParserStackElement {
  type: NodeType;
  attrs: {};
  content: ProsemirrorNode[];
}

type ParserTokenHandler = (writer: ProsemirrorWriter, tok: PandocToken) => void;

interface ParserTokenHandlerCandidate {
  match?: (tok: PandocToken) => boolean;
  handler: ParserTokenHandler;
}
