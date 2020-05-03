/*
 * extension.ts
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

import { ProsemirrorCommand } from './command';
import { PandocMark } from './mark';
import { PandocNode } from './node';
import { EditorUI } from './ui';
import { BaseKeyBinding } from './basekeys';
import { AppendTransactionHandler, AppendMarkTransactionHandler } from './transaction';
import { EditorOptions } from './options';
import { PandocExtensions } from './pandoc';
import { FixupFn } from './fixup';
import { EditorEvents } from './events';
import { PandocCapabilities } from './pandoc_capabilities';
import { EditorFormat } from './format';

export interface Extension {
  marks?: PandocMark[];
  nodes?: PandocNode[];
  baseKeys?: (schema: Schema) => readonly BaseKeyBinding[];
  inputRules?: (schema: Schema) => readonly InputRule[];
  commands?: (schema: Schema, ui: EditorUI, mac: boolean) => readonly ProsemirrorCommand[];
  plugins?: (schema: Schema, ui: EditorUI, mac: boolean) => readonly Plugin[];
  appendTransaction?: (schema: Schema) => readonly AppendTransactionHandler[];
  appendMarkTransaction?: (schema: Schema) => readonly AppendMarkTransactionHandler[];
  fixups?: (schema: Schema, view: EditorView) => Readonly<FixupFn[]>;
}

// return an extension conditional on the active EditorOptions
export type ExtensionFn = (
  pandocExtensions: PandocExtensions,
  pandocCapabilities: PandocCapabilities,
  ui: EditorUI,
  format: EditorFormat,
  options: EditorOptions,
  events: EditorEvents,
) => Extension | null;

// create an ExtensionFn for a given extension and format option that must be enabled
export function extensionIfEnabled(extension: Extension, name: string | string[]) {
  return (pandocExtensions: PandocExtensions) => {
    if (extensionEnabled(pandocExtensions, name)) {
      return extension;
    } else {
      return null;
    }
  };
}

export function extensionEnabled(pandocExtensions: PandocExtensions, name: string | string[]) {
  // match single extension name
  if (typeof name === 'string') {
    if (pandocExtensions[name]) {
      return true;
    }

    // match any one of several names
  } else if (Array.isArray(name)) {
    for (const nm of name) {
      if (pandocExtensions[nm]) {
        return true;
      }
    }
  }

  return false;
}
