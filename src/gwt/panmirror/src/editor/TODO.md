## Info

pandoc schema: <https://github.com/jgm/pandoc-types/blob/master/Text/Pandoc/Definition.hs#L94>

## Feedback

## TODO


Math:

- MathJax preview. When containing the selection, the math will show both the code and the preview. When not containing the selection will show the preview. (so probably require a node view for this). Consider a “done” gesture for display math. May need to bring back
escaping of $ in math as this mode will clearly not be "source mode" style latex equation editing

- Possibly have a special editing mode for thereoms?

## Future

Parse plain text for markdown

Async dialogs won't work with collab (b/c they could use an old state).

Revisit doing smart patches of Prosemirror doc: https://github.com/rstudio/rstudio/tree/feature/panmirror-smart-patch

Consider porting https://gitlab.com/mpapp-public/manuscripts-symbol-picker

Fixed size tables (with last column resized) overflow-x when editing
container is made very small.

Keyboard selection of image node (arrow handlers)
Also backspace handler for paragraph just after an image (currently deletes image)

You can arrow horizontally into figure captions within tables (e.g. put 3
images in cells of the same row)

Tab key handling for image shelf

Tables must have some sort of arrow key handler that is causing us to 
enter an empty table caption directly above the table (doesn't happen
with paragraphs, etc.)

Markup extension filtering (e.g. shortcodes) might be better done in Lua

Use Joe's trFindNodes (for loop requires ES6)

Aggregated fixup/appendTransaction transactions:
- fixups and mutating appendTransaction handlers should be passed a transform 
(so that no calls to trTranform are necessary in handlers). this will mean
that we lose access to selection oriented functions and tr.setMeta. this in 
turn could ripple out to some other handler code. 
- We should also always call mapResult and check for deleted
- alternatively, could we give each handler a fresh transaction and then merge them

Google Docs style list toggling

Slack style handling of marks?

Reveal codes / typora behavior

Unit testing for core panmirror code

Insert special character UX

Deleting withProgress in TextEditingTargetVisualMode breaks everything! (see inline comment)


multimarkdown support is incomplete: -mmd\_title\_block -mmd\_link\_attributes (not written, likely limitation of pandoc) -mmd\_header\_identifiers (work fine, but we currently allow edit of classes + keyvalue for markdown\_mmd)

no support for +pandoc\_title\_block

Example lists don't round trip through the AST:
  - (@good) referenced elsewhere via (@good) just becomes a generic example (@) with a literal numeric reference.
  - The writer doesn't preserve the (@) or the (@good) when writing

We currently can't round-trip reference links (as pandoc doesn't seem to write them, this is not disimillar from the situation w/ inline footnotes so may be fine)

allow more control over markdown output, particularly list indenting (perhaps get a PR into pandoc to make it flexible)

as with above, make character escaping configurable

No editing support for fancy list auto-numbering (\#. as list item that is auto-numbered)

Consider special Knit behavior from Visual Mode: execute w/ keep_md and only re-executes R code when the code chunks have actually changed.

MathQuill/MathJax: <https://pboysen.github.io/> <https://discuss.prosemirror.net/t/odd-behavior-with-nodeview-and-atom-node/1521>

critic markup: <http://criticmarkup.com/>

pandoc scholar: <https://pandoc-scholar.github.io/> pandoc jats: <https://github.com/mfenner/pandoc-jats>

Notes on preformance implications of scanning the entire document + some discussion of the tricky nature of doing step by step inspection: <https://discuss.prosemirror.net/t/changed-part-of-document/992> <https://discuss.prosemirror.net/t/reacting-to-node-adding-removing-changing/676> <https://discuss.prosemirror.net/t/undo-and-cursor-position/677/5>

## Known issues:

- Can only preview images in the first listed hugo static dir

- When dragging and dropping an image to a place in the document above the original position the shelf sometimes
  stays in it's original position (until you scroll)

- Tables with a large number of columns are written as HTML when variable column widths are presented 
  (presumably b/c it can't represent the percentage  granularity w/ markdown) Perhaps don't set widths 
  on all of the columns (only ones explicitly sized?). Or, detect when this occurs by examining the doc before
  and markdown after transformation and automatically adjust the value?

- Clear Formatting doesn't play well with table selections (only one of the cells is considered part of the "selected nodes")

- Semicolons in citations cannot be escaped (they always indicate a delimiter). Solution to this would be
  to mark them explicitly with an input rule (and color them so user sees that there is a state change).

- Edit attributes button is incorrectly positioned in note (this is due to the additional dom elements created by the node view)
  Note however that headings and divs seem to be poorly supported in notes anyway.

## Project/Build

Can we minify the typescript library?

<https://fuse-box.org/docs/getting-started/typescript-project>

Can we combine the editor library w/ the prosemirror/orderedmap dependencies? <https://github.com/fathyb/parcel-plugin-typescript>

<https://stackoverflow.com/questions/44893654/how-do-i-get-typescript-to-bundle-a-3rd-party-lib-from-node-modules>

<https://www.typescriptlang.org/docs/handbook/gulp.html> <https://www.npmjs.com/package/@lernetz/gulp-typescript-bundle>

<https://webpack.js.org/guides/typescript/>

<https://github.com/gulp-community/gulp-concat>

may need to make use of project references (allows mutliple tsconfig.json files that all reference eachother) <https://www.typescriptlang.org/docs/handbook/project-references.html> will ultimately need something like lerna: <https://blog.logrocket.com/setting-up-a-monorepo-with-lerna-for-a-typescript-project-b6a81fe8e4f8/>

create-react-app currently doesn't support project references: <https://github.com/facebook/create-react-app/issues/6799>

simple explanation: <https://stackoverflow.com/questions/51631786/how-to-use-project-references-in-typescript-3-0> <https://gitlab.com/parzh/re-scaled/commit/ca47c1f6195b211ed5d61d2821864c8cecd86bad> <https://www.typescriptlang.org/docs/handbook/project-references.html#structuring-for-relative-modules>
