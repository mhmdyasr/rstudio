/*
 * extensions.ts
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

import { InputRule } from 'prosemirror-inputrules';
import { Schema } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { EditorOptions } from './api/options';
import { EditorUI } from './api/ui';
import { ProsemirrorCommand } from './api/command';
import { PandocMark } from './api/mark';
import { PandocNode, CodeViewOptions } from './api/node';
import { Extension, ExtensionFn } from './api/extension';
import { BaseKeyBinding } from './api/basekeys';
import { AppendTransactionHandler, AppendMarkTransactionHandler } from './api/transaction';
import { FixupFn } from './api/fixup';
import {
  PandocTokenReader,
  PandocMarkWriter,
  PandocNodeWriter,
  PandocPreprocessorFn,
  PandocPostprocessorFn,
  PandocBlockReaderFn,
  PandocCodeBlockFilter,
  PandocExtensions,
  PandocInlineHTMLReaderFn,
} from './api/pandoc';
import { EditorEvents } from './api/events';
import { AttrEditOptions } from './api/attr_edit';
import { PandocCapabilities } from './api/pandoc_capabilities';
import { EditorFormat } from './api/format';

// required extensions (base non-customiziable pandoc nodes/marks + core behaviors)
import nodeText from './nodes/text';
import nodeParagraph from './nodes/paragraph';
import nodeHeading from './nodes/heading';
import nodeBlockquote from './nodes/blockquote';
import nodeCodeBlock from './nodes/code_block';
import nodeLists from './nodes/list/list';
import nodeImage from './nodes/image/image';
import nodeFigure from './nodes/image/figure';
import nodeHr from './nodes/hr';
import nodeHardBreak from './nodes/hard_break';
import nodeNull from './nodes/null';
import markEm from './marks/em';
import markStrong from './marks/strong';
import markCode from './marks/code';
import markLink from './marks/link/link';
import behaviorHistory from './behaviors/history';
import behaviorSelectAll from './behaviors/select_all';
import behaviorCursor from './behaviors/cursor';
import behaviorFind from './behaviors/find';
import behaviorClearFormatting from './behaviors/clear_formatting';

// behaviors
import behaviorSmarty from './behaviors/smarty';
import behaviorAttrDuplicateId from './behaviors/attr_duplicate_id';
import behaviorTrailingP from './behaviors/trailing_p';
import behaviorOutline from './behaviors/outline';
import behaviorTextFocus from './behaviors/text_focus';

// marks
import markStrikeout from './marks/strikeout';
import markSuperscript from './marks/superscript';
import markSubscript from './marks/subscript';
import markSmallcaps from './marks/smallcaps';
import markQuoted from './marks/quoted';
import markRawInline from './marks/raw_inline/raw_inline';
import markRawTex from './marks/raw_inline/raw_tex';
import markRawHTML from './marks/raw_inline/raw_html';
import markMath from './marks/math/math';
import markCite from './marks/cite/cite';
import markSpan from './marks/span';
import markXRef from './marks/xref';
import markFormatComment from './marks/format_comment';
import markHTMLComment from './marks/raw_inline/raw_html_comment';
import markShortcode from './marks/shortcode';

// nodes
import nodeFootnote from './nodes/footnote/footnote';
import nodeRawBlock from './nodes/raw_block';
import nodeYamlMetadata from './nodes/yaml_metadata/yaml_metadata';
import nodeRmdCodeChunk from './nodes/rmd_chunk/rmd_chunk';
import nodeDiv from './nodes/div';
import nodeLineBlock from './nodes/line_block';
import nodeTable from './nodes/table/table';
import nodeDefinitionList from './nodes/definition_list/definition_list';

// extension/plugin factories
import { codeMirrorPlugins } from './optional/codemirror/codemirror';
import { attrEditExtension } from './behaviors/attr_edit/attr_edit';

export function initExtensions(
  format: EditorFormat,
  options: EditorOptions,
  ui: EditorUI,
  events: EditorEvents,
  extensions: readonly Extension[] | undefined,
  pandocExtensions: PandocExtensions,
  pandocCapabilities: PandocCapabilities,
): ExtensionManager {
  // create extension manager
  const manager = new ExtensionManager(pandocExtensions, pandocCapabilities, format, options, ui, events);

  // required extensions
  manager.register([
    nodeText,
    nodeParagraph,
    nodeHeading,
    nodeBlockquote,
    nodeCodeBlock,
    nodeLists,
    nodeImage,
    nodeFigure,
    nodeHr,
    nodeHardBreak,
    nodeNull,
    markEm,
    markStrong,
    markCode,
    markLink,
    behaviorHistory,
    behaviorSelectAll,
    behaviorCursor,
    behaviorFind,
    behaviorClearFormatting,
  ]);

  // optional extensions
  manager.register([
    // behaviors
    behaviorSmarty,
    behaviorAttrDuplicateId,
    behaviorTrailingP,
    behaviorOutline,
    behaviorTextFocus,

    // marks
    markStrikeout,
    markSuperscript,
    markSubscript,
    markSmallcaps,
    markQuoted,
    markRawTex,
    markRawHTML,
    markRawInline,
    markMath,
    markCite,
    markSpan,
    markXRef,
    markFormatComment,
    markHTMLComment,
    markShortcode,

    // nodes
    nodeDiv,
    nodeFootnote,
    nodeYamlMetadata,
    nodeRmdCodeChunk,
    nodeTable,
    nodeDefinitionList,
    nodeLineBlock,
    nodeRawBlock,
  ]);

  // register external extensions
  if (extensions) {
    manager.register(extensions);
  }

  // additional extensions dervied from other extensions
  // (e.g. extensions that have registered attr editors)
  manager.register([attrEditExtension(pandocExtensions, manager.attrEditors())]);

  // additional plugins derived from extensions
  const plugins: Plugin[] = [];
  if (options.codemirror) {
    plugins.push(...codeMirrorPlugins(manager.codeViews()));
  }

  // register plugins
  manager.registerPlugins(plugins);

  // return manager
  return manager;
}

export class ExtensionManager {
  private pandocExtensions: PandocExtensions;
  private pandocCapabilities: PandocCapabilities;
  private format: EditorFormat;
  private options: EditorOptions;
  private ui: EditorUI;
  private events: EditorEvents;
  private extensions: Extension[];

  public constructor(
    pandocExtensions: PandocExtensions,
    pandocCapabilities: PandocCapabilities,
    format: EditorFormat,
    options: EditorOptions,
    ui: EditorUI,
    events: EditorEvents,
  ) {
    this.pandocExtensions = pandocExtensions;
    this.pandocCapabilities = pandocCapabilities;
    this.format = format;
    this.options = options;
    this.ui = ui;
    this.events = events;
    this.extensions = [];
  }

  public register(extensions: ReadonlyArray<Extension | ExtensionFn>): void {
    extensions.forEach(extension => {
      if (typeof extension === 'function') {
        const ext = extension(
          this.pandocExtensions,
          this.pandocCapabilities,
          this.ui,
          this.format,
          this.options,
          this.events,
        );
        if (ext) {
          this.extensions.push(ext);
        }
      } else {
        this.extensions.push(extension);
      }
    });
  }

  public registerPlugins(plugins: Plugin[]) {
    this.register([{ plugins: () => plugins }]);
  }

  public pandocMarks(): readonly PandocMark[] {
    return this.collect<PandocMark>((extension: Extension) => extension.marks);
  }

  public pandocNodes(): readonly PandocNode[] {
    return this.collect<PandocNode>((extension: Extension) => extension.nodes);
  }

  public pandocPreprocessors(): readonly PandocPreprocessorFn[] {
    const preprocessors: PandocPreprocessorFn[] = [];
    this.pandocNodes().forEach((node: PandocNode) => {
      if (node.pandoc.preprocessor) {
        preprocessors.push(node.pandoc.preprocessor);
      }
      if (node.pandoc.codeBlockFilter) {
        preprocessors.push(node.pandoc.codeBlockFilter.preprocessor);
      }
    });

    return preprocessors;
  }

  public pandocPostprocessors(): readonly PandocPostprocessorFn[] {
    const postprocessors: PandocPostprocessorFn[] = [];

    this.pandocReaders().forEach((reader: PandocTokenReader) => {
      if (reader.postprocessor) {
        postprocessors.push(reader.postprocessor);
      }
    });

    return postprocessors;
  }

  public pandocBlockReaders(): readonly PandocBlockReaderFn[] {
    const blockReaders: PandocBlockReaderFn[] = [];
    this.pandocNodes().forEach((node: PandocNode) => {
      if (node.pandoc.blockReader) {
        blockReaders.push(node.pandoc.blockReader);
      }
    });
    return blockReaders;
  }

  public pandocInlineHTMLReaders(): readonly PandocInlineHTMLReaderFn[] {
    const htmlReaders: PandocInlineHTMLReaderFn[] = [];
    this.pandocMarks().forEach((mark: PandocMark) => {
      if (mark.pandoc.inlineHTMLReader) {
        htmlReaders.push(mark.pandoc.inlineHTMLReader);
      }
    });
    this.pandocNodes().forEach((node: PandocNode) => {
      if (node.pandoc.inlineHTMLReader) {
        htmlReaders.push(node.pandoc.inlineHTMLReader);
      }
    });
    return htmlReaders;
  }

  public pandocCodeBlockFilters(): readonly PandocCodeBlockFilter[] {
    const codeBlockFilters: PandocCodeBlockFilter[] = [];
    this.pandocNodes().forEach((node: PandocNode) => {
      if (node.pandoc.codeBlockFilter) {
        codeBlockFilters.push(node.pandoc.codeBlockFilter);
      }
    });
    return codeBlockFilters;
  }

  public pandocReaders(): readonly PandocTokenReader[] {
    const readers: PandocTokenReader[] = [];
    this.pandocMarks().forEach((mark: PandocMark) => {
      readers.push(...mark.pandoc.readers);
    });
    this.pandocNodes().forEach((node: PandocNode) => {
      if (node.pandoc.readers) {
        readers.push(...node.pandoc.readers);
      }
    });
    return readers;
  }

  public pandocMarkWriters(): readonly PandocMarkWriter[] {
    return this.pandocMarks().map((mark: PandocMark) => {
      return {
        name: mark.name,
        ...mark.pandoc.writer,
      };
    });
  }

  public pandocNodeWriters(): readonly PandocNodeWriter[] {
    const writers: PandocNodeWriter[] = [];
    this.pandocNodes().forEach((node: PandocNode) => {
      if (node.pandoc.writer) {
        writers.push({
          name: node.name,
          write: node.pandoc.writer,
        });
      }
    });
    return writers;
  }

  public commands(schema: Schema, ui: EditorUI, mac: boolean): readonly ProsemirrorCommand[] {
    return this.collect<ProsemirrorCommand>((extension: Extension) => {
      if (extension.commands) {
        return extension.commands(schema, ui, mac);
      } else {
        return undefined;
      }
    });
  }

  public codeViews() {
    const views: { [key: string]: CodeViewOptions } = {};
    this.pandocNodes().forEach((node: PandocNode) => {
      if (node.code_view) {
        views[node.name] = node.code_view;
      }
    });
    return views;
  }

  public attrEditors() {
    const editors: AttrEditOptions[] = [];
    this.pandocNodes().forEach((node: PandocNode) => {
      if (node.attr_edit) {
        const attrEdit = node.attr_edit();
        if (attrEdit) {
          editors.push(attrEdit);
        }
      }
    });
    return editors;
  }

  public baseKeys(schema: Schema) {
    return this.collect<BaseKeyBinding>((extension: Extension) => {
      if (extension.baseKeys) {
        return extension.baseKeys(schema);
      } else {
        return undefined;
      }
    });
  }

  public appendTransactions(schema: Schema) {
    return this.collect<AppendTransactionHandler>((extension: Extension) => {
      if (extension.appendTransaction) {
        return extension.appendTransaction(schema);
      } else {
        return undefined;
      }
    });
  }

  public appendMarkTransactions(schema: Schema) {
    return this.collect<AppendMarkTransactionHandler>((extension: Extension) => {
      if (extension.appendMarkTransaction) {
        return extension.appendMarkTransaction(schema);
      } else {
        return undefined;
      }
    });
  }

  public plugins(schema: Schema, ui: EditorUI, mac: boolean): readonly Plugin[] {
    return this.collect<Plugin>((extension: Extension) => {
      if (extension.plugins) {
        return extension.plugins(schema, ui, mac);
      } else {
        return undefined;
      }
    });
  }

  public fixups(schema: Schema, view: EditorView) {
    return this.collect<FixupFn>((extension: Extension) => {
      if (extension.fixups) {
        return extension.fixups(schema, view);
      } else {
        return undefined;
      }
    });
  }

  // NOTE: return value not readonly b/c it will be fed directly to a
  // Prosemirror interface that doesn't take readonly
  public inputRules(schema: Schema): InputRule[] {
    return this.collect<InputRule>((extension: Extension) => {
      if (extension.inputRules) {
        return extension.inputRules(schema);
      } else {
        return undefined;
      }
    });
  }

  private collect<T>(collector: (extension: Extension) => readonly T[] | undefined) {
    let items: T[] = [];
    this.extensions.forEach(extension => {
      const collected: readonly T[] | undefined = collector(extension);
      if (collected !== undefined) {
        items = items.concat(collected);
      }
    });
    return items;
  }
}
