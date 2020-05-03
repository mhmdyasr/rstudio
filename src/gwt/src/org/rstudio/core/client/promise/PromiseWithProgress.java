/*
 * PromiseWithProgress.java
 *
 * Copyright (C) 2009-20 by RStudio, Inc.
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

package org.rstudio.core.client.promise;

import org.rstudio.core.client.CommandWithArg;
import org.rstudio.studio.client.RStudioGinjector;
import org.rstudio.studio.client.common.GlobalDisplay;
import org.rstudio.studio.client.common.GlobalProgressDelayer;

import elemental2.promise.IThenable;
import elemental2.promise.Promise;
import elemental2.promise.IThenable.ThenOnFulfilledCallbackFn;
import elemental2.promise.IThenable.ThenOnRejectedCallbackFn;


public class PromiseWithProgress<V>
{ 
   public PromiseWithProgress(Promise<V> promise, V errorVal, int delayMs, CommandWithArg<V> completed)
   {
      this(promise, "Working...", errorVal, delayMs, completed);
   }
   
   public PromiseWithProgress(Promise<V> promise, String progress, V errorVal, int delayMs, CommandWithArg<V> completed)
   {
      // setup progress
      GlobalDisplay globalDisplay = RStudioGinjector.INSTANCE.getGlobalDisplay();
      GlobalProgressDelayer progressDelayer = new GlobalProgressDelayer(globalDisplay, delayMs, progress);
      
      // execute the promise
      promise.then(new ThenOnFulfilledCallbackFn<V,V>() {
         @Override
         public IThenable<V> onInvoke(V v)
         {
            progressDelayer.dismiss();
            completed.execute(v);
            return null;
           
         }
      },new ThenOnRejectedCallbackFn<V>() {
      
         @Override
         public IThenable<V> onInvoke(Object error)
         {
            progressDelayer.dismiss();
            globalDisplay.showErrorMessage("Error", error.toString());
            completed.execute(errorVal);
            return null;
         }
      });
   }
   
}
