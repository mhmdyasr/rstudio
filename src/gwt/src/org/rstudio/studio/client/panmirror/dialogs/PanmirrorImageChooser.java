
/*
 * PanmirrorImageChooser.java
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

package org.rstudio.studio.client.panmirror.dialogs;

import org.rstudio.core.client.ElementIds.TextBoxButtonId;
import org.rstudio.core.client.files.FileSystemItem;
import org.rstudio.core.client.widget.ProgressIndicator;
import org.rstudio.core.client.widget.ProgressOperationWithInput;
import org.rstudio.core.client.widget.TextBoxWithButton;
import org.rstudio.studio.client.RStudioGinjector;
import org.rstudio.studio.client.panmirror.PanmirrorUIContext;

import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;

public class PanmirrorImageChooser extends TextBoxWithButton {

   
   public PanmirrorImageChooser(PanmirrorUIContext uiContext)
   {
      super("Image (File or URL):", "", "Browse...", null, TextBoxButtonId.CHOOSE_IMAGE, false, null);
      PanmirrorDialogsUtil.setFullWidthStyles(this);
      
      addClickHandler(new ClickHandler() {

         @Override
         public void onClick(ClickEvent event)
         {
            FileSystemItem defaultDir = FileSystemItem.createDir(uiContext.getDefaultResourceDir.get());
               
            RStudioGinjector.INSTANCE.getFileDialogs().openFile(
               "Choose Image",
               RStudioGinjector.INSTANCE.getRemoteFileSystemContext(),
               defaultDir,
               new ProgressOperationWithInput<FileSystemItem>()
               {
                  public void execute(FileSystemItem input,
                                      ProgressIndicator indicator)
                  {
                     if (input == null)
                        return;

                     // compute relative path
                     String mappedPath = uiContext.mapPathToResource.map(input.getPath());
                     if (mappedPath != null) 
                     {
                        setText(mappedPath);
                     }
                     else
                     {
                        RStudioGinjector.INSTANCE.getGlobalDisplay().showErrorMessage(
                           "Image Location Error",
                           "The selected image cannot be included in this document.\n\n" +
                           "Normally, images should be located within the document directory (" + 
                           uiContext.getDefaultResourceDir.get() + ")");
                          
                     }
                     indicator.onCompleted();
                    
                  }
               });
         }
      });
   }
   
}