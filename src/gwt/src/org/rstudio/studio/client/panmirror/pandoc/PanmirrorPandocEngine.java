/*
 * PanmirrorPandocEngine.java
 *
 * Copyright (C) 2009-20 by RStudio, PBC
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

package org.rstudio.studio.client.panmirror.pandoc;

import org.rstudio.core.client.StringUtil;
import org.rstudio.core.client.promise.PromiseServerRequestCallback;
import org.rstudio.studio.client.RStudioGinjector;

import com.google.gwt.core.client.JavaScriptObject;
import com.google.gwt.core.client.JsArrayString;
import com.google.inject.Inject;

import elemental2.promise.Promise;
import elemental2.promise.Promise.PromiseExecutorCallbackFn.RejectCallbackFn;
import elemental2.promise.Promise.PromiseExecutorCallbackFn.ResolveCallbackFn;

import jsinterop.annotations.JsType;


@JsType
public class PanmirrorPandocEngine {
   
  
   public PanmirrorPandocEngine() {
      RStudioGinjector.INSTANCE.injectMembers(this);
   }
   
   @Inject
   void initialize(PanmirrorPandocServerOperations server)
   {
      server_ = server;
   }
   
   public Promise<JavaScriptObject> getCapabilities()
   {
      return new Promise<JavaScriptObject>((ResolveCallbackFn<JavaScriptObject> resolve, RejectCallbackFn reject) -> {
         server_.pandocGetCapabilities(
            new PromiseServerRequestCallback<JavaScriptObject>(resolve, reject)
         );
      });
   }

   public Promise<JavaScriptObject> markdownToAst(String markdown, String format, JsArrayString options)
   {
      // rsession pandoc back-end doesn't handle empty stdiput well (SyncProcess.run doesn't
      // ever write stdin if it's empty)
      final String input = !StringUtil.isNullOrEmpty(markdown) ? markdown : " ";
      
      return new Promise<JavaScriptObject>((ResolveCallbackFn<JavaScriptObject> resolve, RejectCallbackFn reject) -> {
         
         server_.pandocMarkdownToAst(
            input, format, options, 
            new PromiseServerRequestCallback<JavaScriptObject>(resolve, reject)
         );
      });
   }
   
   public Promise<String> astToMarkdown(JavaScriptObject ast, String format, JsArrayString options)
   {
      return new Promise<String>((ResolveCallbackFn<String> resolve, RejectCallbackFn reject) -> {
         server_.pandocAstToMarkdown(
            ast, format, options, 
            new PromiseServerRequestCallback<String>(resolve, reject)
         );
      });
   }

   public Promise<String> listExtensions(String format)
   {
      return new Promise<String>((ResolveCallbackFn<String> resolve, RejectCallbackFn reject) -> {
         server_.pandocListExtensions(format, new PromiseServerRequestCallback<String>(resolve, reject));
      });
   }

   private PanmirrorPandocServerOperations server_;
   
}
