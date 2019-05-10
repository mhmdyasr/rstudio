/* UserPrefsAccessor.java
 *
 * Copyright (C) 2009-19 by RStudio, Inc.
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
 
/* DO NOT HAND-EDIT! This file is automatically generated from the formal user preference schema
 * JSON. To add a preference, add it to "user-prefs-schema.json", then run "generate-prefs.R" to
 * rebuild this file.
 */

package org.rstudio.studio.client.workbench.prefs.model;

import org.rstudio.core.client.js.JsObject;
import org.rstudio.studio.client.workbench.model.SessionInfo;

import com.google.gwt.core.client.JavaScriptObject;
import com.google.gwt.core.client.JsArrayString;
import com.google.gwt.core.client.JsArray;
import org.rstudio.core.client.JsArrayUtil;

/**
 * Accessor class for user preferences.
 */ 
public class UserPrefsAccessor extends Prefs
{
   public UserPrefsAccessor(SessionInfo sessionInfo, 
                            JsArray<JsObject> prefLayers)
   {
      super(prefLayers);
   }
   
   /**
    * Whether to run .Rprofile again after resuming a suspended R session.
    */
   public PrefValue<Boolean> runRprofileOnResume()
   {
      return bool("run_rprofile_on_resume", false);
   }

   /**
    * Whether to save the workspace after the R session ends.
    */
   public PrefValue<String> saveWorkspace()
   {
      return string("save_workspace", "ask");
   }

   public final static String SAVE_WORKSPACE_ALWAYS = "always";
   public final static String SAVE_WORKSPACE_NEVER = "never";
   public final static String SAVE_WORKSPACE_ASK = "ask";

   /**
    * Whether to load the workspace when the R session begins.
    */
   public PrefValue<Boolean> loadWorkspace()
   {
      return bool("load_workspace", true);
   }

   /**
    * The initial working directory for new R sessions.
    */
   public PrefValue<String> initialWorkingDirectory()
   {
      return string("initial_working_directory", "");
   }

   /**
    * The name of the default CRAN mirror.
    */
   public PrefValue<String> cranMirrorName()
   {
      return string("cran_mirror_name", "Global (CDN)");
   }

   /**
    * The host of the default CRAN mirror.
    */
   public PrefValue<String> cranMirrorHost()
   {
      return string("cran_mirror_host", "RStudio");
   }

   /**
    * The URL of the default CRAN mirror.
    */
   public PrefValue<String> cranMirrorUrl()
   {
      return string("cran_mirror_url", "http://cran.rstudio.com/");
   }

   /**
    * The secondary CRAN mirror.
    */
   public PrefValue<String> cranMirrorRepos()
   {
      return string("cran_mirror_repos", "");
   }

   /**
    * The country of the default CRAN mirror.
    */
   public PrefValue<String> cranMirrorCountry()
   {
      return string("cran_mirror_country", "us");
   }

   /**
    * The name of the default Bioconductor mirror.
    */
   public PrefValue<String> bioconductorMirrorName()
   {
      return string("bioconductor_mirror_name", "Seattle (USA)");
   }

   /**
    * The URL of the default Bioconductor mirror.
    */
   public PrefValue<String> bioconductorMirrorUrl()
   {
      return string("bioconductor_mirror_url", "http://www.bioconductor.org");
   }

   /**
    * Whether to always save the R console history.
    */
   public PrefValue<Boolean> alwaysSaveHistory()
   {
      return bool("always_save_history", true);
   }

   /**
    * Whether to remove duplicate entries from the R console history.
    */
   public PrefValue<Boolean> removeHistoryDuplicates()
   {
      return bool("remove_history_duplicates", false);
   }

   /**
    * Show the result of the last expression (.Last.value) in the Environment pane.
    */
   public PrefValue<Boolean> showLastDotValue()
   {
      return bool("show_last_dot_value", false);
   }

   /**
    * The line ending format to use when saving files.
    */
   public PrefValue<String> lineEndingConversion()
   {
      return string("line_ending_conversion", "native");
   }

   public final static String LINE_ENDING_CONVERSION_WINDOWS = "windows";
   public final static String LINE_ENDING_CONVERSION_POSIX = "posix";
   public final static String LINE_ENDING_CONVERSION_NATIVE = "native";
   public final static String LINE_ENDING_CONVERSION_PASSTHROUGH = "passthrough";

   /**
    * Whether to use newlines when saving Makefiles.
    */
   public PrefValue<Boolean> useNewlinesInMakefiles()
   {
      return bool("use_newlines_in_makefiles", true);
   }

   /**
    * The terminal shell to use on Windows.
    */
   public PrefValue<String> windowsTerminalShell()
   {
      return string("windows_terminal_shell", "default");
   }

   public final static String WINDOWS_TERMINAL_SHELL_DEFAULT = "default";
   public final static String WINDOWS_TERMINAL_SHELL_GIT_BASH = "git-bash";
   public final static String WINDOWS_TERMINAL_SHELL_WSL_BASH = "wsl-bash";
   public final static String WINDOWS_TERMINAL_SHELL_CMD = "cmd";
   public final static String WINDOWS_TERMINAL_SHELL_POWERSHELL = "powershell";
   public final static String WINDOWS_TERMINAL_SHELL_NONE = "none";

   /**
    * The terminal shell to use on POSIX operating systems (MacOS and Linux).
    */
   public PrefValue<String> posixTerminalShell()
   {
      return string("posix_terminal_shell", "default");
   }

   public final static String POSIX_TERMINAL_SHELL_DEFAULT = "default";
   public final static String POSIX_TERMINAL_SHELL_BASH = "bash";
   public final static String POSIX_TERMINAL_SHELL_CUSTOM = "custom";
   public final static String POSIX_TERMINAL_SHELL_NONE = "none";

   /**
    * The fully qualified path to the custom shell command to use in the Terminal tab.
    */
   public PrefValue<String> customShellCommand()
   {
      return string("custom_shell_command", "");
   }

   /**
    * The command-line options to pass to the custom shell command.
    */
   public PrefValue<String> customShellOptions()
   {
      return string("custom_shell_options", "");
   }

   /**
    * Show line numbers in RStudio's code editor.
    */
   public PrefValue<Boolean> showLineNumbers()
   {
      return bool("show_line_numbers", true);
   }

   /**
    * Highlight the selected word in RStudio's code editor.
    */
   public PrefValue<Boolean> highlightSelectedWord()
   {
      return bool("highlight_selected_word", true);
   }

   /**
    * Highlight the selected line in RStudio's code editor.
    */
   public PrefValue<Boolean> highlightSelectedLine()
   {
      return bool("highlight_selected_line", false);
   }

   /**
    * Layout of panes in the RStudio workbench.
    */
   public PrefValue<Panes> panes()
   {
      return object("panes", null);
   }

   public static class Panes extends JavaScriptObject
   {
      protected Panes() {} 

      public final static String QUADRANTS_SOURCE = "Source";
      public final static String QUADRANTS_CONSOLE = "Console";
      public final static String QUADRANTS_TABSET1 = "TabSet1";
      public final static String QUADRANTS_TABSET2 = "TabSet2";

      public final native JsArrayString getQuadrants() /*-{
         return this.quadrants;
      }-*/;

      public final native JsArrayString getTabSet1() /*-{
         return this.tabSet1;
      }-*/;

      public final native JsArrayString getTabSet2() /*-{
         return this.tabSet2;
      }-*/;

      public final native boolean getConsoleLeftOnTop() /*-{
         return this.console_left_on_top;
      }-*/;

      public final native boolean getConsoleRightOnTop() /*-{
         return this.console_right_on_top;
      }-*/;

   }

   /**
    * Whether to insert spaces when pressing the Tab key.
    */
   public PrefValue<Boolean> useSpacesForTab()
   {
      return bool("use_spaces_for_tab", true);
   }

   /**
    * The number of spaces to insert when pressing the Tab key.
    */
   public PrefValue<Integer> numSpacesForTab()
   {
      return integer("num_spaces_for_tab", 2);
   }

   /**
    * Whether to automatically detect indentation settings from file contents.
    */
   public PrefValue<Boolean> autoDetectIndentation()
   {
      return bool("auto_detect_indentation", true);
   }

   /**
    * Whether to show the margin guide in the RStudio code editor.
    */
   public PrefValue<Boolean> showMargin()
   {
      return bool("show_margin", true);
   }

   /**
    * Whether to flash the cursor off and on.
    */
   public PrefValue<Boolean> blinkingCursor()
   {
      return bool("blinking_cursor", true);
   }

   /**
    * The number of columns of text after which the margin is shown.
    */
   public PrefValue<Integer> marginColumn()
   {
      return integer("margin_column", 80);
   }

   /**
    * Whether to show invisible characters, such as spaces and tabs, in the RStudio code editor.
    */
   public PrefValue<Boolean> showInvisibles()
   {
      return bool("show_invisibles", false);
   }

   /**
    * Whether to show indentation guides in the RStudio code editor.
    */
   public PrefValue<Boolean> showIndentGuides()
   {
      return bool("show_indent_guides", false);
   }

   /**
    * Whether continue comments (by inserting the comment character) after adding a new line.
    */
   public PrefValue<Boolean> continueCommentsOnNewline()
   {
      return bool("continue_comments_on_newline", false);
   }

   /**
    * The keybindings to use in the RStudio code editor.
    */
   public PrefValue<String> editorKeybindings()
   {
      return string("editor_keybindings", "default");
   }

   public final static String EDITOR_KEYBINDINGS_DEFAULT = "default";
   public final static String EDITOR_KEYBINDINGS_VIM = "vim";
   public final static String EDITOR_KEYBINDINGS_EMACS = "emacs";
   public final static String EDITOR_KEYBINDINGS_SUBLIME = "sublime";

   /**
    * Whether to insert matching pairs, such as () and [], when the first is typed.
    */
   public PrefValue<Boolean> insertMatching()
   {
      return bool("insert_matching", true);
   }

   /**
    * Whether to insert spaces around the equals sign in R code.
    */
   public PrefValue<Boolean> insertSpacesAroundEquals()
   {
      return bool("insert_spaces_around_equals", true);
   }

   /**
    * Whether to insert parentheses after function completions.
    */
   public PrefValue<Boolean> insertParensAfterFunctionCompletion()
   {
      return bool("insert_parens_after_function_completion", true);
   }

   /**
    * Whether to attempt completion of multiple-line statements when pressing Tab.
    */
   public PrefValue<Boolean> tabMultilineCompletion()
   {
      return bool("tab_multiline_completion", false);
   }

   /**
    * Whether to show help tooltips for functions when the cursor has not been recently moved.
    */
   public PrefValue<Boolean> showHelpTooltipOnIdle()
   {
      return bool("show_help_tooltip_on_idle", false);
   }

   /**
    * Which kinds of delimiters can be used to surround the current selection.
    */
   public PrefValue<String> surroundSelection()
   {
      return string("surround_selection", "quotes_and_brackets");
   }

   public final static String SURROUND_SELECTION_NEVER = "never";
   public final static String SURROUND_SELECTION_QUOTES = "quotes";
   public final static String SURROUND_SELECTION_QUOTES_AND_BRACKETS = "quotes_and_brackets";

   /**
    * Whether to enable code snippets in the RStudio code editor.
    */
   public PrefValue<Boolean> enableSnippets()
   {
      return bool("enable_snippets", true);
   }

   /**
    * When to use auto-completion for R code in the RStudio code editor.
    */
   public PrefValue<String> codeCompletion()
   {
      return string("code_completion", "always");
   }

   public final static String CODE_COMPLETION_ALWAYS = "always";
   public final static String CODE_COMPLETION_NEVER = "never";
   public final static String CODE_COMPLETION_TRIGGERED = "triggered";
   public final static String CODE_COMPLETION_MANUAL = "manual";

   /**
    * When to use auto-completion for other languages (such as JavaScript and SQL) in the RStudio code editor.
    */
   public PrefValue<String> codeCompletionOther()
   {
      return string("code_completion_other", "always");
   }

   public final static String CODE_COMPLETION_OTHER_ALWAYS = "always";
   public final static String CODE_COMPLETION_OTHER_TRIGGERED = "triggered";
   public final static String CODE_COMPLETION_OTHER_MANUAL = "manual";

   /**
    * Whether to always use code completion in the R console.
    */
   public PrefValue<Boolean> consoleCodeCompletion()
   {
      return bool("console_code_completion", true);
   }

   /**
    * The number of milliseconds to wait before offering code suggestions.
    */
   public PrefValue<Integer> codeCompletionDelay()
   {
      return integer("code_completion_delay", 250);
   }

   /**
    * The number of characters in a symbol that can be entered before completions are offered.
    */
   public PrefValue<Integer> codeCompletionCharacters()
   {
      return integer("code_completion_characters", 3);
   }

   /**
    * Whether to show function signature tooltips during autocompletion.
    */
   public PrefValue<Boolean> showFunctionSignatureTooltips()
   {
      return bool("show_function_signature_tooltips", true);
   }

   /**
    * Whether to show diagnostic messages (such as syntax and usage errors) for R code as you type.
    */
   public PrefValue<Boolean> showDiagnosticsR()
   {
      return bool("show_diagnostics_r", true);
   }

   /**
    * Whether to show diagnostic messages for C++ code as you type.
    */
   public PrefValue<Boolean> showDiagnosticsCpp()
   {
      return bool("show_diagnostics_cpp", true);
   }

   /**
    * Whether to show diagnostic messages for other types of code (not R or C++).
    */
   public PrefValue<Boolean> showDiagnosticsOther()
   {
      return bool("show_diagnostics_other", true);
   }

   /**
    * Whether to show style diagnostics (suggestions for improving R code style)
    */
   public PrefValue<Boolean> styleDiagnostics()
   {
      return bool("style_diagnostics", false);
   }

   /**
    * Whether to check code for problems after saving it.
    */
   public PrefValue<Boolean> diagnosticsOnSave()
   {
      return bool("diagnostics_on_save", true);
   }

   /**
    * Whether to run code diagnostics in the background, as you type.
    */
   public PrefValue<Boolean> backgroundDiagnostics()
   {
      return bool("background_diagnostics", true);
   }

   /**
    * The number of milliseconds to delay before running code diagnostics in the background.
    */
   public PrefValue<Integer> backgroundDiagnosticsDelayMs()
   {
      return integer("background_diagnostics_delay_ms", 2000);
   }

   /**
    * Whether to run diagnostics in R function calls.
    */
   public PrefValue<Boolean> diagnosticsInRFunctionCalls()
   {
      return bool("diagnostics_in_r_function_calls", true);
   }

   /**
    * Whether to check arguments to R function calls.
    */
   public PrefValue<Boolean> checkArgumentsToRFunctionCalls()
   {
      return bool("check_arguments_to_r_function_calls", false);
   }

   /**
    * Whether to check for unexpected variable assignments inside R function calls.
    */
   public PrefValue<Boolean> checkUnexpectedAssignmentInFunctionCall()
   {
      return bool("check_unexpected_assignment_in_function_call", false);
   }

   /**
    * Whether to generate a warning if a variable is used without being defined in the current scope.
    */
   public PrefValue<Boolean> warnIfNoSuchVariableInScope()
   {
      return bool("warn_if_no_such_variable_in_scope", false);
   }

   /**
    * Whether to generate a warning if a variable is defined without being used in the current scope
    */
   public PrefValue<Boolean> warnVariableDefinedButNotUsed()
   {
      return bool("warn_variable_defined_but_not_used", false);
   }

   /**
    * Whether to automatically discover and offer to install missing R package dependenices.
    */
   public PrefValue<Boolean> autoDiscoverPackageDependencies()
   {
      return bool("auto_discover_package_dependencies", true);
   }

   /**
    * Whether to ensure that source files end with a newline character.
    */
   public PrefValue<Boolean> autoAppendNewline()
   {
      return bool("auto_append_newline", false);
   }

   /**
    * Whether to strip trailing whitespace from each line when saving.
    */
   public PrefValue<Boolean> stripTrailingWhitespace()
   {
      return bool("strip_trailing_whitespace", false);
   }

   /**
    * Whether to save the position of the cursor when a fille is closed, restore it when the file is opened.
    */
   public PrefValue<Boolean> restoreSourceDocumentCursorPosition()
   {
      return bool("restore_source_document_cursor_position", true);
   }

   /**
    * Whether to automatically re-indent code when it's pasted into RStudio.
    */
   public PrefValue<Boolean> reindentOnPaste()
   {
      return bool("reindent_on_paste", true);
   }

   /**
    * Whether to vertically align arguments to R function calls during automatic indentation.
    */
   public PrefValue<Boolean> verticallyAlignArgumentsIndent()
   {
      return bool("vertically_align_arguments_indent", true);
   }

   /**
    * Whether to soft-wrap R source files, wrapping the text for display without inserting newline characters.
    */
   public PrefValue<Boolean> softWrapRFiles()
   {
      return bool("soft_wrap_r_files", false);
   }

   /**
    * Whether to focus the R console after executing an R command from a script.
    */
   public PrefValue<Boolean> focusConsoleAfterExec()
   {
      return bool("focus_console_after_exec", false);
   }

   /**
    * The style of folding to use.
    */
   public PrefValue<String> foldStyle()
   {
      return string("fold_style", "begin-and-end");
   }

   public final static String FOLD_STYLE_BEGIN_ONLY = "begin-only";
   public final static String FOLD_STYLE_BEGIN_AND_END = "begin-and-end";

   /**
    * Whether to automatically save scripts before executing them.
    */
   public PrefValue<Boolean> saveBeforeSourcing()
   {
      return bool("save_before_sourcing", true);
   }

   /**
    * Whether to use syntax highlighting in the R console.
    */
   public PrefValue<Boolean> syntaxColorConsole()
   {
      return bool("syntax_color_console", false);
   }

   /**
    * Whether to allow scrolling past the end of a file.
    */
   public PrefValue<Boolean> scrollPastEndOfDocument()
   {
      return bool("scroll_past_end_of_document", false);
   }

   /**
    * Whether to highlight R function calls in the code editor.
    */
   public PrefValue<Boolean> highlightRFunctionCalls()
   {
      return bool("highlight_r_function_calls", false);
   }

   /**
    * The maximum number of characters to display in a single line in the R console.
    */
   public PrefValue<Integer> consoleLineLengthLimit()
   {
      return integer("console_line_length_limit", 1000);
   }

   /**
    * How to treat ANSI escape codes in the console.
    */
   public PrefValue<String> ansiConsoleMode()
   {
      return string("ansi_console_mode", "on");
   }

   public final static String ANSI_CONSOLE_MODE_OFF = "off";
   public final static String ANSI_CONSOLE_MODE_ON = "on";
   public final static String ANSI_CONSOLE_MODE_STRIP = "strip";

   /**
    * Whether to show a toolbar on code chunks in R Markdown documents.
    */
   public PrefValue<Boolean> showInlineToolbarForRCodeChunks()
   {
      return bool("show_inline_toolbar_for_r_code_chunks", true);
   }

   /**
    * Whether to highlight code chunks in R Markdown documents with a different background color.
    */
   public PrefValue<Boolean> highlightCodeChunks()
   {
      return bool("highlight_code_chunks", true);
   }

   /**
    * Whether to save all open, unsaved files before building the project.
    */
   public PrefValue<Boolean> saveFilesBeforeBuild()
   {
      return bool("save_files_before_build", false);
   }

   /**
    * The default editor font size, in points.
    */
   public PrefValue<Double> fontSizePoints()
   {
      return dbl("font_size_points", 10.0);
   }

   /**
    * The name of the color theme to apply to the text editor in RStudio.
    */
   public PrefValue<String> editorTheme()
   {
      return string("editor_theme", "Textmate (default)");
   }

   /**
    * The default character encoding to use when saving files.
    */
   public PrefValue<String> defaultEncoding()
   {
      return string("default_encoding", "");
   }

   /**
    * Whether to show the toolbar at the top of the RStudio workbench.
    */
   public PrefValue<Boolean> toolbarVisible()
   {
      return bool("toolbar_visible", true);
   }

   /**
    * The directory path under which to place new projects by default.
    */
   public PrefValue<String> defaultProjectLocation()
   {
      return string("default_project_location", "");
   }

   /**
    * Whether to echo R code when sourcing it.
    */
   public PrefValue<Boolean> sourceWithEcho()
   {
      return bool("source_with_echo", false);
   }

   /**
    * Whether to initialize new projects with a Git repo by default.
    */
   public PrefValue<Boolean> newProjectGitInit()
   {
      return bool("new_project_git_init", false);
   }

   /**
    * The default engine to use when processing Sweave documents.
    */
   public PrefValue<String> defaultSweaveEngine()
   {
      return string("default_sweave_engine", "Sweave");
   }

   /**
    * The default program to use when processing LaTeX documents.
    */
   public PrefValue<String> defaultLatexProgram()
   {
      return string("default_latex_program", "pdfLaTeX");
   }

   /**
    * Whether to use Roxygen for documentation.
    */
   public PrefValue<Boolean> useRoxygen()
   {
      return bool("use_roxygen", false);
   }

   /**
    * Whether to use RStudio's data import feature.
    */
   public PrefValue<Boolean> useDataimport()
   {
      return bool("use_dataimport", true);
   }

   /**
    * The program to use to preview PDF files after generation.
    */
   public PrefValue<String> pdfPreviewer()
   {
      return string("pdf_previewer", "default");
   }

   public final static String PDF_PREVIEWER_NONE = "none";
   public final static String PDF_PREVIEWER_DEFAULT = "default";
   public final static String PDF_PREVIEWER_RSTUDIO = "rstudio";
   public final static String PDF_PREVIEWER_DESKTOP_SYNCTEX = "desktop-synctex";
   public final static String PDF_PREVIEWER_SYSTEM = "system";

   /**
    * Whether to always enable the concordance for RNW files.
    */
   public PrefValue<Boolean> alwaysEnableRnwConcordance()
   {
      return bool("always_enable_rnw_concordance", true);
   }

   /**
    * Whether to insert numbered sections in LaTeX.
    */
   public PrefValue<Boolean> insertNumberedLatexSections()
   {
      return bool("insert_numbered_latex_sections", false);
   }

   /**
    * The language of the spelling dictionary to use for spell checking.
    */
   public PrefValue<String> spellingDictionaryLanguage()
   {
      return string("spelling_dictionary_language", "en_US");
   }

   /**
    * The list of custom dictionaries to use when spell checking.
    */
   public PrefValue<JsArrayString> spellingCustomDictionaries()
   {
      return object("spelling_custom_dictionaries", JsArrayUtil.createStringArray());
   }

   /**
    * The number of milliseconds to wait before linting a document after it is loaded.
    */
   public PrefValue<Integer> documentLoadLintDelay()
   {
      return integer("document_load_lint_delay", 5000);
   }

   /**
    * Whether to ignore words in uppercase when spell checking.
    */
   public PrefValue<Boolean> ignoreUppercaseWords()
   {
      return bool("ignore_uppercase_words", true);
   }

   /**
    * Whether to ignore words with numbers in them when spell checking.
    */
   public PrefValue<Boolean> ignoreWordsWithNumbers()
   {
      return bool("ignore_words_with_numbers", true);
   }

   /**
    * Whether to enable real-time spellchecking by default.
    */
   public PrefValue<Boolean> realTimeSpellchecking()
   {
      return bool("real_time_spellchecking", false);
   }

   /**
    * Whether to navigate to build errors.
    */
   public PrefValue<Boolean> navigateToBuildError()
   {
      return bool("navigate_to_build_error", true);
   }

   /**
    * Whether to enable RStudio's Packages pane.
    */
   public PrefValue<Boolean> packagesPaneEnabled()
   {
      return bool("packages_pane_enabled", true);
   }

   /**
    * Whether to use RCPP templates.
    */
   public PrefValue<Boolean> useRcppTemplate()
   {
      return bool("use_rcpp_template", true);
   }

   /**
    * Whether to restore the last opened source documents when RStudio starts up.
    */
   public PrefValue<Boolean> restoreSourceDocuments()
   {
      return bool("restore_source_documents", true);
   }

   /**
    * Whether to handle errors only when user code is on the stack.
    */
   public PrefValue<Boolean> handleErrorsInUserCodeOnly()
   {
      return bool("handle_errors_in_user_code_only", true);
   }

   /**
    * Whether to automatically expand tracebacks when an error occurs.
    */
   public PrefValue<Boolean> autoExpandErrorTracebacks()
   {
      return bool("auto_expand_error_tracebacks", false);
   }

   /**
    * Whether to check for new versions of RStudio when RStudio starts.
    */
   public PrefValue<Boolean> checkForUpdates()
   {
      return bool("check_for_updates", true);
   }

   /**
    * Whether to show functions without source references in the Traceback pane while debugging.
    */
   public PrefValue<Boolean> showInternalFunctions()
   {
      return bool("show_internal_functions", false);
   }

   /**
    * Where to display Shiny applications when they are run.
    */
   public PrefValue<String> shinyViewerType()
   {
      return string("shiny_viewer_type", "window");
   }

   public final static String SHINY_VIEWER_TYPE_USER = "user";
   public final static String SHINY_VIEWER_TYPE_NONE = "none";
   public final static String SHINY_VIEWER_TYPE_PANE = "pane";
   public final static String SHINY_VIEWER_TYPE_WINDOW = "window";
   public final static String SHINY_VIEWER_TYPE_BROWSER = "browser";

   /**
    * Where to display Shiny applications when they are run.
    */
   public PrefValue<String> plumberViewerType()
   {
      return string("plumber_viewer_type", "window");
   }

   public final static String PLUMBER_VIEWER_TYPE_USER = "user";
   public final static String PLUMBER_VIEWER_TYPE_NONE = "none";
   public final static String PLUMBER_VIEWER_TYPE_PANE = "pane";
   public final static String PLUMBER_VIEWER_TYPE_WINDOW = "window";
   public final static String PLUMBER_VIEWER_TYPE_BROWSER = "browser";

   /**
    * The default name to use as the document author when creating new documents.
    */
   public PrefValue<String> documentAuthor()
   {
      return string("document_author", "");
   }

   /**
    * The path to the preferred R Markdown template.
    */
   public PrefValue<String> rmdPreferredTemplatePath()
   {
      return string("rmd_preferred_template_path", "");
   }

   /**
    * Where to display R Markdown documents when they have completed rendering.
    */
   public PrefValue<String> rmdViewerType()
   {
      return string("rmd_viewer_type", "window");
   }

   public final static String RMD_VIEWER_TYPE_WINDOW = "window";
   public final static String RMD_VIEWER_TYPE_PANE = "pane";
   public final static String RMD_VIEWER_TYPE_NONE = "none";

   /**
    * Whether to show verbose diagnostic information when publishing content.
    */
   public PrefValue<Boolean> showPublishDiagnostics()
   {
      return bool("show_publish_diagnostics", false);
   }

   /**
    * Whether to check remote server SSL certificates when publishing content.
    */
   public PrefValue<Boolean> publishCheckCertificates()
   {
      return bool("publish_check_certificates", true);
   }

   /**
    * Whether to use a custom certificate authority (CA) bundle when publishing content.
    */
   public PrefValue<Boolean> usePublishCaBundle()
   {
      return bool("use_publish_ca_bundle", false);
   }

   /**
    * The path to the custom certificate authority (CA) bundle to use when publishing content.
    */
   public PrefValue<String> publishCaBundle()
   {
      return string("publish_ca_bundle", "");
   }

   /**
    * Whether to show chunk output inline for ordinary R Markdown documents.
    */
   public PrefValue<Boolean> rmdChunkOutputInline()
   {
      return bool("rmd_chunk_output_inline", true);
   }

   /**
    * Whether to show the document outline by default when opening R Markdown documents.
    */
   public PrefValue<Boolean> showDocOutlineRmd()
   {
      return bool("show_doc_outline_rmd", false);
   }

   /**
    * Whether to automatically run an R Markdown document's Setup chunk before running other chunks.
    */
   public PrefValue<Boolean> autoRunSetupChunk()
   {
      return bool("auto_run_setup_chunk", true);
   }

   /**
    * Whether to hide the R console when executing inline R Markdown chunks.
    */
   public PrefValue<Boolean> hideConsoleOnChunkExecute()
   {
      return bool("hide_console_on_chunk_execute", true);
   }

   /**
    * The unit of R code to execute when the Execute command is invoked.
    */
   public PrefValue<String> executionBehavior()
   {
      return string("execution_behavior", "statement");
   }

   public final static String EXECUTION_BEHAVIOR_LINE = "line";
   public final static String EXECUTION_BEHAVIOR_STATEMENT = "statement";
   public final static String EXECUTION_BEHAVIOR_PARAGRAPH = "paragraph";

   /**
    * Whether to show the Terminal tab.
    */
   public PrefValue<Boolean> showTerminalTab()
   {
      return bool("show_terminal_tab", true);
   }

   /**
    * Whether to use local echo in the Terminal.
    */
   public PrefValue<Boolean> terminalLocalEcho()
   {
      return bool("terminal_local_echo", true);
   }

   /**
    * Whether to use websockets to communicate with the shell in the Terminal tab.
    */
   public PrefValue<Boolean> terminalWebsockets()
   {
      return bool("terminal_websockets", true);
   }

   /**
    * Whether to automatically close the Terminal tab.
    */
   public PrefValue<Boolean> terminalAutoClose()
   {
      return bool("terminal_auto_close", true);
   }

   /**
    * Whether to track and save changes to system environment variables in the Terminal.
    */
   public PrefValue<Boolean> terminalTrackEnvironment()
   {
      return bool("terminal_track_environment", true);
   }

   /**
    * Whether to print the render command use to knit R Markdown documents in the R Markdown tab.
    */
   public PrefValue<Boolean> showRmdRenderCommand()
   {
      return bool("show_rmd_render_command", false);
   }

   /**
    * Whether to enable moving text on the editing surface by clicking and dragging it.
    */
   public PrefValue<Boolean> enableTextDrag()
   {
      return bool("enable_text_drag", true);
   }

   /**
    * Whether to show hidden files in the Files pane.
    */
   public PrefValue<Boolean> showHiddenFiles()
   {
      return bool("show_hidden_files", false);
   }

   /**
    * The visibility of the Jobs tab.
    */
   public PrefValue<String> jobsTabVisibility()
   {
      return string("jobs_tab_visibility", "default");
   }

   public final static String JOBS_TAB_VISIBILITY_CLOSED = "closed";
   public final static String JOBS_TAB_VISIBILITY_SHOWN = "shown";
   public final static String JOBS_TAB_VISIBILITY_DEFAULT = "default";

   /**
    * Whether to show the Launcher jobs tab in RStudio Pro.
    */
   public PrefValue<Boolean> showLauncherJobsTab()
   {
      return bool("show_launcher_jobs_tab", true);
   }

   /**
    * How to sort jobs in the Launcher tab in RStudio Pro.
    */
   public PrefValue<String> launcherJobsSort()
   {
      return string("launcher_jobs_sort", "recorded");
   }

   public final static String LAUNCHER_JOBS_SORT_RECORDED = "recorded";
   public final static String LAUNCHER_JOBS_SORT_STATE = "state";

   /**
    * How to detect busy status in the Terminal.
    */
   public PrefValue<String> busyDetection()
   {
      return string("busy_detection", "always");
   }

   public final static String BUSY_DETECTION_ALWAYS = "always";
   public final static String BUSY_DETECTION_NEVER = "never";
   public final static String BUSY_DETECTION_WHITELIST = "whitelist";

   /**
    * A whitelist of apps that should not be considered busy in the Terminal.
    */
   public PrefValue<JsArrayString> busyWhitelist()
   {
      return object("busy_whitelist", JsArrayUtil.createStringArray("tmux", "screen"));
   }

   /**
    * The working directory to use when knitting R Markdown documents.
    */
   public PrefValue<String> knitWorkingDir()
   {
      return string("knit_working_dir", "default");
   }

   public final static String KNIT_WORKING_DIR_DEFAULT = "default";
   public final static String KNIT_WORKING_DIR_CURRENT = "current";
   public final static String KNIT_WORKING_DIR_PROJECT = "project";

   /**
    * Which objects to show in the document outline pane.
    */
   public PrefValue<String> docOutlineShow()
   {
      return string("doc_outline_show", "sections_only");
   }

   public final static String DOC_OUTLINE_SHOW_SECTIONS_ONLY = "sections_only";
   public final static String DOC_OUTLINE_SHOW_SECTIONS_AND_CHUNKS = "sections_and_chunks";
   public final static String DOC_OUTLINE_SHOW_ALL = "all";

   /**
    * When to preview LaTeX mathematical equations when cursor has not moved recently.
    */
   public PrefValue<String> latexPreviewOnCursorIdle()
   {
      return string("latex_preview_on_cursor_idle", "always");
   }

   public final static String LATEX_PREVIEW_ON_CURSOR_IDLE_NEVER = "never";
   public final static String LATEX_PREVIEW_ON_CURSOR_IDLE_INLINE_ONLY = "inline_only";
   public final static String LATEX_PREVIEW_ON_CURSOR_IDLE_ALWAYS = "always";

   /**
    * Whether to wrap around when going to the previous or next editor tab.
    */
   public PrefValue<Boolean> wrapTabNavigation()
   {
      return bool("wrap_tab_navigation", false);
   }

   /**
    * The theme to use for the main RStudio user interface.
    */
   public PrefValue<String> globalTheme()
   {
      return string("global_theme", "default");
   }

   public final static String GLOBAL_THEME_CLASSIC = "classic";
   public final static String GLOBAL_THEME_DEFAULT = "default";
   public final static String GLOBAL_THEME_ALTERNATE = "alternate";

   /**
    * Whether to ignore whitespace when generating diffs of version controlled files.
    */
   public PrefValue<Boolean> gitDiffIgnoreWhitespace()
   {
      return bool("git_diff_ignore_whitespace", false);
   }

   /**
    * Whether double-clicking should select a word in the Console pane.
    */
   public PrefValue<Boolean> consoleDoubleClickSelect()
   {
      return bool("console_double_click_select", false);
   }

   /**
    * Whether a git repo should be initialized inside new projects by default.
    */
   public PrefValue<Boolean> newProjGitInit()
   {
      return bool("new_proj_git_init", false);
   }

   /**
    * The root document to use when compiling PDF documents.
    */
   public PrefValue<String> rootDocument()
   {
      return string("root_document", "");
   }

   /**
    * When to show the server home page in RStudio Server Pro.
    */
   public PrefValue<String> showUserHomePage()
   {
      return string("show_user_home_page", "sessions");
   }

   public final static String SHOW_USER_HOME_PAGE_ALWAYS = "always";
   public final static String SHOW_USER_HOME_PAGE_NEVER = "never";
   public final static String SHOW_USER_HOME_PAGE_SESSIONS = "sessions";

   /**
    * Whether to reuse sessions when opening projects in RStudio Server Pro.
    */
   public PrefValue<Boolean> reuseSessionsForProjectLinks()
   {
      return bool("reuse_sessions_for_project_links", false);
   }

   /**
    * Whether to enable RStudio's version control system interface.
    */
   public PrefValue<Boolean> vcsEnabled()
   {
      return bool("vcs_enabled", true);
   }

   /**
    * The path to the Git executable to use.
    */
   public PrefValue<String> gitExePath()
   {
      return string("git_exe_path", "");
   }

   /**
    * The path to the Subversion executable to use.
    */
   public PrefValue<String> svnExePath()
   {
      return string("svn_exe_path", "");
   }

   /**
    * The path to the terminal executable to use.
    */
   public PrefValue<String> terminalPath()
   {
      return string("terminal_path", "");
   }

   /**
    * The path to the RSA key file to use.
    */
   public PrefValue<String> rsaKeyPath()
   {
      return string("rsa_key_path", "");
   }

   /**
    * Whether to use the devtools R package.
    */
   public PrefValue<Boolean> useDevtools()
   {
      return bool("use_devtools", true);
   }

   /**
    * Whether to use Internet2 for networking on R for Windows.
    */
   public PrefValue<Boolean> useInternet2()
   {
      return bool("use_internet2", true);
   }

   /**
    * Whether to use secure downloads when fetching R packages.
    */
   public PrefValue<Boolean> useSecureDownload()
   {
      return bool("use_secure_download", true);
   }

   /**
    * Whether to clean up temporary files after running R CMD CHECK.
    */
   public PrefValue<Boolean> cleanupAfterRCmdCheck()
   {
      return bool("cleanup_after_r_cmd_check", true);
   }

   /**
    * Whether to view the directory after running R CMD CHECK.
    */
   public PrefValue<Boolean> viewDirAfterRCmdCheck()
   {
      return bool("view_dir_after_r_cmd_check", false);
   }

   /**
    * Whether to hide object files in the Files pane.
    */
   public PrefValue<Boolean> hideObjectFiles()
   {
      return bool("hide_object_files", true);
   }

   /**
    * Whether to restore the last project when starting RStudio.
    */
   public PrefValue<Boolean> restoreLastProject()
   {
      return bool("restore_last_project", true);
   }

   /**
    * Whether to clean output after running Texi2Dvi.
    */
   public PrefValue<Boolean> cleanTexi2dviOutput()
   {
      return bool("clean_texi2dvi_output", true);
   }

   /**
    * Whether to enable shell escaping with LaTeX documents.
    */
   public PrefValue<Boolean> latexShellEscape()
   {
      return bool("latex_shell_escape", false);
   }

   

   public int userLayer()
   {
      return LAYER_USER;
   }

   public int projectLayer()
   {
      return LAYER_PROJECT;
   }

   public static final int LAYER_DEFAULT  = 0;
   public static final int LAYER_COMPUTED = 1;
   public static final int LAYER_SYSTEM   = 2;
   public static final int LAYER_USER     = 3;
   public static final int LAYER_PROJECT  = 4;
}
