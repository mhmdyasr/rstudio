/*
 * PanmirrorEditCodeBlockDialog.java
 *
 * Copyright (C) 2020 by RStudio, PBC
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


import com.google.gwt.aria.client.Roles;

import org.rstudio.core.client.ElementIds;
import org.rstudio.core.client.theme.DialogTabLayoutPanel;
import org.rstudio.core.client.theme.VerticalTabPanel;
import org.rstudio.core.client.widget.FormLabel;
import org.rstudio.core.client.widget.ModalDialog;
import org.rstudio.core.client.widget.OperationWithInput;
import org.rstudio.studio.client.panmirror.dialogs.model.PanmirrorAttrProps;
import org.rstudio.studio.client.panmirror.dialogs.model.PanmirrorCodeBlockProps;

import com.google.gwt.user.client.ui.HorizontalPanel;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.SuggestBox;
import com.google.gwt.user.client.ui.Widget;


public class PanmirrorEditCodeBlockDialog extends ModalDialog<PanmirrorCodeBlockProps>
{ 
   public PanmirrorEditCodeBlockDialog(
               PanmirrorCodeBlockProps codeBlock,
               boolean attributes,
               String[] languages,
               OperationWithInput<PanmirrorCodeBlockProps> operation)
   {
      super("Code Block", Roles.getDialogRole(), operation, () -> {
         // cancel returns null
         operation.execute(null);
      });
      
      // create lang (defer parent until we determine whether we support attributes)
      VerticalTabPanel langTab = new VerticalTabPanel(ElementIds.VISUAL_MD_CODE_BLOCK_TAB_LANGUAGE);
      langTab.addStyleName(RES.styles().dialog());
      HorizontalPanel labelPanel = new HorizontalPanel();
      labelPanel.add(new FormLabel("Language"));
      Label langInfo = new Label("(optional)");
      langInfo.addStyleName(RES.styles().inlineInfoLabel());
      labelPanel.add(langInfo);
      langTab.add(labelPanel);
      lang_ = new PanmirrorLangSuggestBox(languages);
      lang_.getElement().setId(ElementIds.VISUAL_MD_CODE_BLOCK_LANG);
      lang_.setText(codeBlock.lang);
      PanmirrorDialogsUtil.setFullWidthStyles(lang_);
      langTab.add(lang_);
      
      // create attr
      VerticalTabPanel attributesTab = new VerticalTabPanel(ElementIds.VISUAL_MD_CODE_BLOCK_TAB_ATTRIBUTES);
      attributesTab.addStyleName(RES.styles().dialog());
      editAttr_ =  new PanmirrorEditAttrWidget();   
      editAttr_.setAttr(codeBlock);
      attributesTab.add(editAttr_);
   
      if (attributes)
      {
         DialogTabLayoutPanel tabPanel = new DialogTabLayoutPanel("Code Block");
         tabPanel.addStyleName(RES.styles().linkDialogTabs());
         tabPanel.add(langTab, "Language", langTab.getBasePanelId());
         tabPanel.add(attributesTab, "Attributes", attributesTab.getBasePanelId());
         tabPanel.selectTab(0);
      
         mainWidget_ = tabPanel;
      }
      else
      {
         mainWidget_ = langTab;
      }
   }
   
   @Override
   protected Widget createMainWidget()
   {
      return mainWidget_;
   }
   
   @Override
   public void focusFirstControl()
   {
      lang_.setFocus(true);
   }
   
   @Override
   protected PanmirrorCodeBlockProps collectInput()
   {
      PanmirrorCodeBlockProps result = new PanmirrorCodeBlockProps();
      PanmirrorAttrProps attr = editAttr_.getAttr();
      result.id = attr.id;
      result.classes = attr.classes;
      result.keyvalue = attr.keyvalue;
      result.lang = lang_.getText().trim();
      return result;
   }


   @Override
   protected boolean validate(PanmirrorCodeBlockProps input)
   {
      return true;
   }
   

   private static PanmirrorDialogsResources RES = PanmirrorDialogsResources.INSTANCE;
   
   private Widget mainWidget_; 
   
   private SuggestBox lang_;
   private PanmirrorEditAttrWidget editAttr_;
  
}
