/*
 * definition_list.ts
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

import { Schema } from 'prosemirror-model';

import { PandocTokenType } from '../../api/pandoc';
import { Extension, extensionIfEnabled } from '../../api/extension';
import { BaseKey } from '../../api/basekeys';

import { InsertDefinitionList, InsertDefinitionDescription, InsertDefinitionTerm } from './definition_list-commands';

import {
  definitionListEnter,
  definitionListBackspace,
  definitionListTab,
  definitionListShiftTab,
} from './definition-list-keys';

import { definitionInputRule } from './definition_list-inputrule';

import { insertDefinitionListAppendTransaction } from './definition_list-insert';
import {
  readPandocDefinitionList,
  writePandocDefinitionList,
  writePandocDefinitionListTerm,
  writePandocDefinitionListDescription,
} from './definition_list-pandoc';

import './definition_list-styles.css';

const extension: Extension = {
  nodes: [
    {
      name: 'definition_list_term',
      spec: {
        content: 'inline*',
        isolating: true,
        parseDOM: [{ tag: 'dt' }],
        toDOM(node) {
          return ['dt', { class: 'pm-definition-term pm-show-text-focus' }, 0];
        },
      },
      pandoc: {
        writer: writePandocDefinitionListTerm,
      },
    },
    {
      name: 'definition_list_description',
      spec: {
        content: 'block+',
        parseDOM: [{ tag: 'dd' }],
        toDOM(node) {
          return ['dd', { class: 'pm-definition-description pm-block-border-color pm-margin-bordered' }, 0];
        },
      },
      pandoc: {
        writer: writePandocDefinitionListDescription,
      },
    },
    {
      name: 'definition_list',
      spec: {
        content: '(definition_list_term definition_list_description*)+',
        group: 'block',
        defining: true,
        parseDOM: [{ tag: 'dl' }],
        toDOM(node) {
          return ['dl', { class: 'pm-definition-list' }, 0];
        },
      },
      pandoc: {
        readers: [
          {
            token: PandocTokenType.DefinitionList,
            handler: readPandocDefinitionList,
          },
        ],

        writer: writePandocDefinitionList,
      },
    },
  ],

  commands: (schema: Schema) => {
    return [new InsertDefinitionList(), new InsertDefinitionTerm(schema), new InsertDefinitionDescription(schema)];
  },

  baseKeys: (_schema: Schema) => {
    return [
      { key: BaseKey.Enter, command: definitionListEnter() },
      { key: BaseKey.Backspace, command: definitionListBackspace() },
      { key: BaseKey.Tab, command: definitionListTab() },
      { key: BaseKey.ShiftTab, command: definitionListShiftTab() },
    ];
  },

  inputRules: (_schema: Schema) => {
    return [definitionInputRule()];
  },

  appendTransaction: (_schema: Schema) => {
    return [insertDefinitionListAppendTransaction()];
  },
};

export default extensionIfEnabled(extension, 'definition_lists');
