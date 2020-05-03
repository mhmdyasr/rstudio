/*
 * basekeys.ts
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

import {
  splitBlock,
  liftEmptyBlock,
  createParagraphNear,
  selectNodeBackward,
  joinBackward,
  deleteSelection,
  selectNodeForward,
  joinForward,
  chainCommands,
} from 'prosemirror-commands';
import { undoInputRule } from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';

import { CommandFn } from './command';

export enum BaseKey {
  Enter = 'Enter',
  ModEnter = 'Mod-Enter',
  ShiftEnter = 'Shift-Enter',
  Backspace = 'Backspace',
  Delete = 'Delete|Mod-Delete', // Use pipes to register multiple commands
  Tab = 'Tab',
  ShiftTab = 'Shift-Tab',
}

export interface BaseKeyBinding {
  key: BaseKey;
  command: CommandFn;
}

export function baseKeysPlugin(keys: BaseKeyBinding[]) {
  // collect all keys
  const pluginKeys = [
    // base enter key behaviors
    { key: BaseKey.Enter, command: splitBlock },
    { key: BaseKey.Enter, command: liftEmptyBlock },
    { key: BaseKey.Enter, command: createParagraphNear },

    // base backspace key behaviors
    { key: BaseKey.Backspace, command: selectNodeBackward },
    { key: BaseKey.Backspace, command: joinBackward },
    { key: BaseKey.Backspace, command: deleteSelection },

    // base delete key behaviors
    { key: BaseKey.Delete, command: selectNodeForward },
    { key: BaseKey.Delete, command: joinForward },
    { key: BaseKey.Delete, command: deleteSelection },

    // merge keys provided by extensions
    ...keys,

    // undoInputRule is always the highest priority backspace key
    { key: BaseKey.Backspace, command: undoInputRule },
  ];

  // build arrays for each BaseKey type
  const commandMap: { [key: string]: CommandFn[] } = {};
  for (const baseKey of Object.values(BaseKey)) {
    commandMap[baseKey] = [];
  }
  pluginKeys.forEach(key => {
    commandMap[key.key].unshift(key.command);
  });

  const bindings: { [key: string]: CommandFn } = {};
  for (const baseKey of Object.values(BaseKey)) {
    const commands = commandMap[baseKey];
    // baseKey may contain multiple keys, separated by |
    for (const subkey of baseKey.split(/\|/)) {
      bindings[subkey] = chainCommands(...commands);
    }
  }

  // return keymap
  return keymap(bindings);
}
