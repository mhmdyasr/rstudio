/*
 * superscript.ts
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

import { Schema, Mark, Fragment } from 'prosemirror-model';

import { MarkCommand, EditorCommandId } from '../api/command';
import { Extension, extensionIfEnabled } from '../api/extension';
import { PandocOutput, PandocTokenType } from '../api/pandoc';
import { delimiterMarkInputRule } from '../api/mark';

const extension: Extension = {
  marks: [
    {
      name: 'superscript',
      spec: {
        parseDOM: [{ tag: 'sup' }],
        toDOM() {
          return ['sup'];
        },
      },
      pandoc: {
        readers: [
          {
            token: PandocTokenType.Superscript,
            mark: 'superscript',
          },
        ],
        writer: {
          priority: 10,
          write: (output: PandocOutput, _mark: Mark, parent: Fragment) => {
            output.writeMark(PandocTokenType.Superscript, parent);
          },
        },
      },
    },
  ],

  commands: (schema: Schema) => {
    return [new MarkCommand(EditorCommandId.Superscript, [], schema.marks.superscript)];
  },

  inputRules: (schema: Schema) => {
    return [delimiterMarkInputRule('\\^', schema.marks.superscript)];
  },
};

export default extensionIfEnabled(extension, 'superscript');
