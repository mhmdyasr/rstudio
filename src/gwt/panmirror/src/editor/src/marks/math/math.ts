/*
 * math.ts
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

import { Node as ProsemirrorNode, Schema, Mark, Fragment, Slice } from 'prosemirror-model';
import { Plugin, PluginKey, EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { InputRule } from 'prosemirror-inputrules';

import { Extension } from '../../api/extension';
import { PandocTokenType, PandocToken, PandocOutput, PandocExtensions } from '../../api/pandoc';
import { BaseKey } from '../../api/basekeys';
import { markIsActive, getMarkAttrs } from '../../api/mark';
import { PandocCapabilities } from '../../api/pandoc_capabilities';
import { EditorFormat } from '../../api/format';
import { EditorUI } from '../../api/ui';

import { kCodeText } from '../code';

import { InsertInlineMathCommand, InsertDisplayMathCommand, insertMath } from './math-commands';
import { mathAppendMarkTransaction } from './math-transaction';
import { mathHighlightPlugin } from './math-highlight';

import './math-styles.css';

const kInlineMathPattern = '\\$[^ ].*?[^\\ ]\\$';
const kInlineMathRegex = new RegExp(kInlineMathPattern);

const kSingleLineDisplayMathPattern = '\\$\\$[^\n]*?\\$\\$';
const kSingleLineDisplayMathRegex = new RegExp(kSingleLineDisplayMathPattern);

export enum MathType {
  Inline = 'InlineMath',
  Display = 'DisplayMath',
}

const MATH_TYPE = 0;
const MATH_CONTENT = 1;

const extension = (
  pandocExtensions: PandocExtensions,
  _caps: PandocCapabilities,
  _ui: EditorUI,
  format: EditorFormat,
): Extension | null => {
  if (!pandocExtensions.tex_math_dollars) {
    return null;
  }

  // special blogdown handling for markdown renderers that don't support math
  const blogdownMathInCode = format.rmdExtensions.blogdownMathInCode;
  const singleLineDisplayMath = blogdownMathInCode;

  return {
    marks: [
      {
        name: 'math',
        noInputRules: true,
        spec: {
          attrs: {
            type: {},
          },
          inclusive: false,
          excludes: '_',
          parseDOM: [
            {
              tag: "span[class*='math']",
              getAttrs(dom: Node | string) {
                const el = dom as Element;
                return {
                  type: el.getAttribute('data-type'),
                };
              },
              preserveWhitespace: 'full',
            },
          ],

          toDOM(mark: Mark) {
            return [
              'span',
              {
                class: 'math pm-fixedwidth-font pm-light-text-color',
                'data-type': mark.attrs.type,
                spellcheck: 'false',
              },
            ];
          },
        },
        pandoc: {
          readers: [
            {
              token: PandocTokenType.Math,
              mark: 'math',
              getAttrs: (tok: PandocToken) => {
                return {
                  type: tok.c[MATH_TYPE].t,
                };
              },
              getText: (tok: PandocToken) => {
                const delimter = delimiterForType(tok.c[MATH_TYPE].t);
                return delimter + tok.c[MATH_CONTENT] + delimter;
              },
            },
            // extract math from backtick code for blogdown
            ...(blogdownMathInCode
              ? [
                  {
                    token: PandocTokenType.Code,
                    mark: 'math',
                    match: (tok: PandocToken) => {
                      const text = tok.c[kCodeText];
                      return kSingleLineDisplayMathRegex.test(text) || kInlineMathRegex.test(text);
                    },
                    getAttrs: (tok: PandocToken) => {
                      const text = tok.c[kCodeText];
                      return {
                        type: kSingleLineDisplayMathRegex.test(text) ? MathType.Display : MathType.Inline,
                      };
                    },
                    getText: (tok: PandocToken) => {
                      return tok.c[kCodeText];
                    },
                  },
                ]
              : []),
          ],
          writer: {
            priority: 20,
            write: (output: PandocOutput, mark: Mark, parent: Fragment) => {
              // collect math content
              let math = '';
              parent.forEach((node: ProsemirrorNode) => (math = math + node.textContent));

              // if this is blogdownMathInCode just write the content in a code mark
              if (blogdownMathInCode) {
                output.writeToken(PandocTokenType.Code, () => {
                  output.writeAttr();
                  output.write(math);
                });
              } else {
                // strip delimiter
                const delimiter = delimiterForType(mark.attrs.type);
                math = math.substr(delimiter.length, math.length - 2 * delimiter.length);

                // if it's just whitespace then it's not actually math (we allow this state
                // in the editor because it's the natural starting place for new equations)
                if (math.trim().length === 0) {
                  output.writeText(delimiter + math + delimiter);
                } else {
                  output.writeToken(PandocTokenType.Math, () => {
                    // write type
                    output.writeToken(
                      mark.attrs.type === MathType.Inline ? PandocTokenType.InlineMath : PandocTokenType.DisplayMath,
                    );
                    output.write(math);
                  });
                }
              }
            },
          },
        },
      },
    ],

    baseKeys: (_schema: Schema) => {
      if (!singleLineDisplayMath) {
        return [{ key: BaseKey.Enter, command: displayMathNewline() }];
      } else {
        return [];
      }
    },

    inputRules: (schema: Schema) => {
      return [
        // inline math
        new InputRule(
          new RegExp(kInlineMathPattern + '$'),
          (state: EditorState, match: string[], start: number, end: number) => {
            if (!markIsActive(state, schema.marks.math)) {
              const tr = state.tr;
              tr.insertText('$');
              const mark = schema.marks.math.create({ type: MathType.Inline });
              tr.addMark(start, end + 1, mark);
              return tr;
            } else {
              return null;
            }
          },
        ),
        new InputRule(/\$$/, (state: EditorState, match: string[], start: number, end: number) => {
          if (!markIsActive(state, schema.marks.math)) {
            const { parent, parentOffset } = state.selection.$head;
            const text = '$' + parent.textContent.slice(parentOffset);
            if (text.length > 0) {
              const length = mathLength(text);
              if (length > 1) {
                const tr = state.tr;
                tr.insertText('$');
                const startMath = tr.selection.from - 1;
                const mark = schema.marks.math.create({ type: MathType.Inline });
                tr.addMark(startMath, startMath + length, mark);
                return tr;
              }
            }
          }
          return null;
        }),
        // display math
        new InputRule(/^\$\$$/, (state: EditorState, match: string[], start: number, end: number) => {
          const tr = state.tr;
          tr.delete(start, end);
          insertMath(tr.selection, MathType.Display, !singleLineDisplayMath, tr);
          return tr;
        }),
      ];
    },

    commands: (_schema: Schema) => {
      return [new InsertInlineMathCommand(), new InsertDisplayMathCommand(!singleLineDisplayMath)];
    },

    appendMarkTransaction: (_schema: Schema) => {
      return [mathAppendMarkTransaction()];
    },

    plugins: (schema: Schema) => {
      return [
        new Plugin({
          key: new PluginKey('math'),
          props: {
            // paste plain text into math blocks
            handlePaste: handlePasteIntoMath(),
          },
        }),
        mathHighlightPlugin(schema),
      ];
    },
  };
};

function mathLength(text: string) {
  const match = text.match(kInlineMathRegex);
  if (match) {
    return match[0].length;
  } else {
    return 0;
  }
}

function handlePasteIntoMath() {
  return (view: EditorView, _event: Event, slice: Slice) => {
    const schema = view.state.schema;
    if (markIsActive(view.state, schema.marks.math)) {
      const tr = view.state.tr;
      let math = '';
      slice.content.forEach((node: ProsemirrorNode) => (math = math + node.textContent));
      tr.replaceSelectionWith(schema.text(math));
      view.dispatch(tr);
      return true;
    } else {
      return false;
    }
  };
}

// enable insertion of newlines
function displayMathNewline() {
  return (state: EditorState, dispatch?: (tr: Transaction) => void) => {
    // display math mark must be active

    if (!displayMathIsActive(state)) {
      return false;
    }

    // insert a newline
    if (dispatch) {
      const tr = state.tr;
      tr.insertText('\n');
      dispatch(tr);
    }
    return true;
  };
}

function displayMathIsActive(state: EditorState) {
  const schema = state.schema;
  return (
    markIsActive(state, schema.marks.math) &&
    getMarkAttrs(state.doc, state.selection, schema.marks.math).type === MathType.Display
  );
}

export function delimiterForType(type: string) {
  if (type === MathType.Inline) {
    return '$';
  } else {
    return '$$';
  }
}

export default extension;
