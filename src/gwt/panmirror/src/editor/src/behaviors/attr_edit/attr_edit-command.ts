/*
 * attr_edit-command.ts
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

import { EditorState, Transaction, NodeSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Mark, Node as ProsemirrorNode } from 'prosemirror-model';

import { findParentNodeOfType } from 'prosemirror-utils';

import { EditorUI } from '../../api/ui';
import { pandocAttrInSpec } from '../../api/pandoc_attr';
import { getSelectionMarkRange } from '../../api/mark';
import { EditorCommandId, ProsemirrorCommand } from '../../api/command';

import { kEditAttrShortcut } from './attr_edit';
import { AttrEditOptions } from '../../api/attr_edit';

export class AttrEditCommand extends ProsemirrorCommand {
  constructor(ui: EditorUI, editors: AttrEditOptions[]) {
    super(EditorCommandId.AttrEdit, [kEditAttrShortcut], attrEditCommandFn(ui, editors));
  }
}

export function attrEditCommandFn(ui: EditorUI, editors: AttrEditOptions[]) {
  return (state: EditorState, dispatch?: (tr: Transaction<any>) => void, view?: EditorView) => {
    // see if there is an active mark with attrs or a parent node with attrs
    const marks = state.storedMarks || state.selection.$head.marks();
    const mark = marks.find((m: Mark) => pandocAttrInSpec(m.type.spec));

    let node: ProsemirrorNode | null = null;
    let pos: number = 0;
    // node selection of node with attributes
    if (state.selection instanceof NodeSelection && pandocAttrInSpec(state.selection.node.type.spec)) {
      node = state.selection.node;
      pos = state.selection.$anchor.pos;
    } else {
      // selection inside node with editable attributes
      const nodeTypes = editors.map(editor => editor.type(state.schema));
      const parentWithAttrs = findParentNodeOfType(nodeTypes)(state.selection);
      if (parentWithAttrs) {
        node = parentWithAttrs.node;
        pos = parentWithAttrs.pos;
      }
    }

    // return false (disabled) for no targets
    if (!mark && !node) {
      return false;
    }

    // if this is a node and we have a custom attribute editor then just delegate to that
    if (node) {
      const editor = editors.find(ed => ed.type(state.schema) === node!.type)!;
      if (editor && editor.editFn) {
        return editor.editFn(ui)(state, dispatch, view);
      }
    }

    // edit attributes
    async function asyncEditAttrs() {
      if (dispatch) {
        if (mark) {
          await editMarkAttrs(mark, state, dispatch, ui);
        } else {
          await editNodeAttrs(node!, pos, state, dispatch, ui);
        }
        if (view) {
          view.focus();
        }
      }
    }
    asyncEditAttrs();

    // return true
    return true;
  };
}

async function editMarkAttrs(
  mark: Mark,
  state: EditorState,
  dispatch: (tr: Transaction<any>) => void,
  ui: EditorUI,
): Promise<void> {
  const attrs = mark.attrs;
  const markType = mark.type;
  const result = await ui.dialogs.editAttr({ ...attrs });
  if (result) {
    const tr = state.tr;
    const range = getSelectionMarkRange(state.selection, markType);
    tr.removeMark(range.from, range.to, markType);
    tr.addMark(
      range.from,
      range.to,
      markType.create({
        ...attrs,
        ...result.attr,
      }),
    );
    dispatch(tr);
  }
}

async function editNodeAttrs(
  node: ProsemirrorNode,
  pos: number,
  state: EditorState,
  dispatch: (tr: Transaction<any>) => void,
  ui: EditorUI,
): Promise<void> {
  const attrs = node.attrs;
  const result = await ui.dialogs.editAttr({ ...attrs });
  if (result) {
    dispatch(
      state.tr.setNodeMarkup(pos, node.type, {
        ...attrs,
        ...result.attr,
      }),
    );
  }
}
