/*
 * mark.ts
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

import { Mark, MarkSpec, MarkType, ResolvedPos, Node as ProsemirrorNode } from 'prosemirror-model';
import { EditorState, Selection } from 'prosemirror-state';
import { InputRule } from 'prosemirror-inputrules';

import { PandocTokenReader, PandocMarkWriterFn, PandocInlineHTMLReaderFn } from './pandoc';
import { mergedTextNodes } from './text';
import { findChildrenByMark } from 'prosemirror-utils';
import { MarkTransaction } from './transaction';

export interface PandocMark {
  readonly name: string;
  readonly spec: MarkSpec;
  readonly noInputRules?: boolean;
  readonly pandoc: {
    readonly readers: readonly PandocTokenReader[];
    readonly inlineHTMLReader?: PandocInlineHTMLReaderFn;
    readonly writer: {
      priority: number;
      write: PandocMarkWriterFn;
    };
  };
}

export function markIsActive(state: EditorState, type: MarkType) {
  const { from, $from, to, empty } = state.selection;

  if (empty) {
    return !!type.isInSet(state.storedMarks || $from.marks());
  }

  return !!state.doc.rangeHasMark(from, to, type);
}

export function getMarkAttrs(doc: ProsemirrorNode, range: { from: number; to: number }, type: MarkType) {
  const { from, to } = range;
  let marks: Mark[] = [];

  doc.nodesBetween(from, to, node => {
    marks = [...marks, ...node.marks];
  });

  const mark = marks.find(markItem => markItem.type.name === type.name);

  if (mark) {
    return mark.attrs;
  }

  return {};
}

export function getMarkRange($pos?: ResolvedPos, type?: MarkType) {
  if (!$pos || !type) {
    return false;
  }

  const start = $pos.parent.childAfter($pos.parentOffset);

  if (!start.node) {
    return false;
  }

  const link = start.node.marks.find((mark: Mark) => mark.type === type);
  if (!link) {
    return false;
  }

  let startIndex = $pos.index();
  let startPos = $pos.start() + start.offset;
  let endIndex = startIndex + 1;
  let endPos = startPos + start.node.nodeSize;

  while (startIndex > 0 && link.isInSet($pos.parent.child(startIndex - 1).marks)) {
    startIndex -= 1;
    startPos -= $pos.parent.child(startIndex).nodeSize;
  }

  while (endIndex < $pos.parent.childCount && link.isInSet($pos.parent.child(endIndex).marks)) {
    endPos += $pos.parent.child(endIndex).nodeSize;
    endIndex += 1;
  }

  return { from: startPos, to: endPos };
}

export function getSelectionMarkRange(selection: Selection, markType: MarkType): { from: number; to: number } {
  let range: { from: number; to: number };
  if (selection.empty) {
    range = getMarkRange(selection.$head, markType) as { from: number; to: number };
  } else {
    range = { from: selection.from, to: selection.to };
  }
  return range;
}

export function markInputRule(regexp: RegExp, markType: MarkType, getAttrs?: ((match: string[]) => object) | object) {
  return new InputRule(regexp, (state: EditorState, match: string[], start: number, end: number) => {
    const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;
    const tr = state.tr;
    if (match[1]) {
      const textStart = start + match[0].indexOf(match[1]);
      const textEnd = textStart + match[1].length;
      if (textEnd < end) {
        tr.delete(textEnd, end);
      }
      if (textStart > start) {
        tr.delete(start, textStart);
      }
      end = start + match[1].length;
    }
    const mark = markType.create(attrs);
    tr.addMark(start, end, mark);
    tr.removeStoredMark(mark); // Do not continue with mark.
    return tr;
  });
}

export function delimiterMarkInputRule(delim: string, markType: MarkType, prefixMask?: string) {
  // if there is no prefix mask then this is simple regex we can pass to markInputRule
  if (!prefixMask) {
    const regexp = `(?:${delim})([^${delim}]+)(?:${delim})$`;
    return markInputRule(new RegExp(regexp), markType);

    // otherwise we need custom logic to get mark placement/eliding right
  } else {
    // validate that delim and mask are single characters (our logic for computing offsets
    // below depends on this assumption)
    const validateParam = (name: string, value: string) => {
      // validate mask
      function throwError() {
        throw new Error(`${name} must be a single characater`);
      }
      if (value.startsWith('\\')) {
        if (value.length !== 2) {
          throwError();
        }
      } else if (value.length !== 1) {
        throwError();
      }
    };
    validateParam('delim', delim);

    // build regex (this regex assumes that mask is one character)
    const regexp = `(?:^|[^${prefixMask}])(?:${delim})([^${delim}]+)(?:${delim})$`;

    // return rule
    return new InputRule(new RegExp(regexp), (state: EditorState, match: string[], start: number, end: number) => {
      // init transaction
      const tr = state.tr;

      // compute offset for mask (should be zero if this was the beginning of a line,
      // in all other cases it would be 1). note we depend on the delimiter being
      // of size 1 here (this is enforced above)
      const kDelimSize = 1;
      const maskOffset = match[0].length - match[1].length - kDelimSize * 2;

      // position of text to be formatted
      const textStart = start + match[0].indexOf(match[1]);
      const textEnd = textStart + match[1].length;

      // remove trailing markdown
      tr.delete(textEnd, end);

      // update start/end to reflect the leading mask which we want to leave alone
      start = start + maskOffset;
      end = start + match[1].length;

      // remove leading markdown
      tr.delete(start, textStart);

      // add mark
      const mark = markType.create();
      tr.addMark(start, end, mark);

      // remove stored mark so typing continues w/o the mark
      tr.removeStoredMark(mark);

      // return transaction
      return tr;
    });
  }
}

export function removeInvalidatedMarks(
  tr: MarkTransaction,
  node: ProsemirrorNode,
  pos: number,
  re: RegExp,
  markType: MarkType,
) {
  const markedNodes = findChildrenByMark(node, markType, true);
  markedNodes.forEach(markedNode => {
    const from = pos + 1 + markedNode.pos;
    const markedRange = getMarkRange(tr.doc.resolve(from), markType);
    if (markedRange) {
      const text = tr.doc.textBetween(markedRange.from, markedRange.to);
      if (!text.match(re)) {
        tr.removeMark(markedRange.from, markedRange.to, markType);
        tr.removeStoredMark(markType);
      }
    }
  });
}

export function splitInvalidatedMarks(
  tr: MarkTransaction,
  node: ProsemirrorNode,
  pos: number,
  validLength: (text: string) => number,
  markType: MarkType,
) {
  const hasMarkType = (nd: ProsemirrorNode) => markType.isInSet(nd.marks);
  const markedNodes = findChildrenByMark(node, markType, true);
  markedNodes.forEach(markedNode => {
    const mark = hasMarkType(markedNode.node);
    if (mark) {
      const from = pos + 1 + markedNode.pos;
      const markRange = getMarkRange(tr.doc.resolve(from), markType);
      if (markRange) {
        const text = tr.doc.textBetween(markRange.from, markRange.to);
        const length = validLength(text);
        if (length > -1 && length !== text.length) {
          tr.removeMark(markRange.from + length, markRange.to, markType);
        }
      }
    }
  });
}

export function detectAndApplyMarks(
  tr: MarkTransaction,
  node: ProsemirrorNode,
  pos: number,
  re: RegExp,
  markType: MarkType,
  attrs: {} | ((match: RegExpMatchArray) => {}) = {},
) {
  re.lastIndex = 0;
  const textNodes = mergedTextNodes(node, (_node: ProsemirrorNode, parentNode: ProsemirrorNode) =>
    parentNode.type.allowsMarkType(markType),
  );
  textNodes.forEach(textNode => {
    re.lastIndex = 0;
    let match = re.exec(textNode.text);
    while (match !== null) {
      const from = pos + 1 + textNode.pos + match.index;
      const to = from + match[0].length;
      const range = getMarkRange(tr.doc.resolve(to), markType);
      if (
        (!range || range.from !== from || range.to !== to) &&
        !tr.doc.rangeHasMark(from, to, markType.schema.marks.code)
      ) {
        const mark = markType.create(attrs instanceof Function ? attrs(match) : attrs);
        tr.addMark(from, to, mark);
        if (tr.selection.anchor === to) {
          tr.removeStoredMark(mark.type);
        }
      }
      match = re.lastIndex !== 0 ? re.exec(textNode.text) : null;
    }
  });
  re.lastIndex = 0;
}
