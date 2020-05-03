/*
 * math-transaction.ts
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

import { Node as ProsemirrorNode } from 'prosemirror-model';
import { findChildrenByMark } from 'prosemirror-utils';

import { getMarkRange, getMarkAttrs } from '../../api/mark';
import { AppendMarkTransactionHandler, MarkTransaction } from '../../api/transaction';

import { delimiterForType, MathType } from './math';

export function mathAppendMarkTransaction(): AppendMarkTransactionHandler {
  return {
    name: 'math-marks',

    filter: node => node.isTextblock && node.type.allowsMarkType(node.type.schema.marks.math),

    append: (tr: MarkTransaction, node: ProsemirrorNode, pos: number) => {
      // find all math blocks and convert them to text if they no longer conform
      const schema = node.type.schema;
      const maths = findChildrenByMark(node, schema.marks.math, true);
      for (const math of maths) {
        const from = pos + 1 + math.pos;
        const mathRange = getMarkRange(tr.doc.resolve(from), schema.marks.math);
        if (mathRange) {
          const mathAttr = getMarkAttrs(tr.doc, mathRange, schema.marks.math);
          const mathDelim = delimiterForType(mathAttr.type);
          const mathText = tr.doc.textBetween(mathRange.from, mathRange.to);
          const charAfter = tr.doc.textBetween(mathRange.to, mathRange.to + 1);
          const noDelims = !mathText.startsWith(mathDelim) || !mathText.endsWith(mathDelim);
          const spaceAtEdge =
            mathAttr.type === MathType.Inline &&
            (mathText.startsWith(mathDelim + ' ') || mathText.endsWith(' ' + mathDelim));
          const numberAfter = mathAttr.type === MathType.Inline && /\d/.test(charAfter);
          if (noDelims || spaceAtEdge || numberAfter) {
            tr.removeMark(mathRange.from, mathRange.to, schema.marks.math);
            tr.removeStoredMark(schema.marks.math);
          }
        }
      }
    },
  };
}
