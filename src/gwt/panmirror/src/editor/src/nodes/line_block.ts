/*
 * line_block.ts
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

import { Node as ProsemirrorNode, Schema } from 'prosemirror-model';

import { Extension, extensionIfEnabled } from '../api/extension';
import { PandocOutput, PandocTokenType, PandocToken } from '../api/pandoc';

import { EditorCommandId, WrapCommand } from '../api/command';

import './line_block-styles.css';

const extension: Extension = {
  nodes: [
    {
      name: 'line_block',
      spec: {
        content: 'paragraph+',
        group: 'block',
        parseDOM: [
          {
            tag: "div[class*='line-block']",
          },
        ],
        toDOM() {
          return ['div', { class: 'line-block pm-line-block pm-block-border-color pm-margin-bordered' }, 0];
        },
      },
      pandoc: {
        readers: [
          {
            token: PandocTokenType.LineBlock,
            block: 'line_block',
            getChildren: (tok: PandocToken) => {
              return tok.c.map((line: PandocToken[]) => ({ t: PandocTokenType.Para, c: line }));
            },
          },
        ],
        writer: (output: PandocOutput, node: ProsemirrorNode) => {
          output.withOption('writeSpaces', false, () => {
            output.writeToken(PandocTokenType.LineBlock, () => {
              node.forEach(line => {
                output.writeArray(() => {
                  output.writeInlines(line.content);
                });
              });
            });
          });
        },
      },
    },
  ],
  commands: (schema: Schema) => {
    return [new WrapCommand(EditorCommandId.LineBlock, [], schema.nodes.line_block)];
  },
};

export default extensionIfEnabled(extension, 'line_blocks');
