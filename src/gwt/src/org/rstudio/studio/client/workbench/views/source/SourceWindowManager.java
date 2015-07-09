/*
 * SourceWindowManager.java
 *
 * Copyright (C) 2009-15 by RStudio, Inc.
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
package org.rstudio.studio.client.workbench.views.source;

import java.util.HashMap;

import org.rstudio.core.client.Size;
import org.rstudio.core.client.dom.WindowEx;
import org.rstudio.studio.client.application.events.CrossWindowEvent;
import org.rstudio.studio.client.application.events.EventBus;
import org.rstudio.studio.client.common.filetypes.FileTypeRegistry;
import org.rstudio.studio.client.common.satellite.Satellite;
import org.rstudio.studio.client.common.satellite.SatelliteManager;
import org.rstudio.studio.client.common.satellite.events.SatelliteClosedEvent;
import org.rstudio.studio.client.server.ServerError;
import org.rstudio.studio.client.server.ServerRequestCallback;
import org.rstudio.studio.client.server.Void;
import org.rstudio.studio.client.server.VoidServerRequestCallback;
import org.rstudio.studio.client.workbench.views.source.events.LastSourceDocClosedEvent;
import org.rstudio.studio.client.workbench.views.source.events.LastSourceDocClosedHandler;
import org.rstudio.studio.client.workbench.views.source.events.PopoutDocEvent;
import org.rstudio.studio.client.workbench.views.source.events.SourceDocAddedEvent;
import org.rstudio.studio.client.workbench.views.source.model.SourceDocument;
import org.rstudio.studio.client.workbench.views.source.model.SourceServerOperations;
import org.rstudio.studio.client.workbench.views.source.model.SourceWindowParams;

import com.google.gwt.core.client.JsArray;
import com.google.gwt.user.client.Window;
import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.Singleton;

@Singleton
public class SourceWindowManager implements PopoutDocEvent.Handler,
                                            SourceDocAddedEvent.Handler,
                                            LastSourceDocClosedHandler,
                                            SatelliteClosedEvent.Handler
{
   @Inject
   public SourceWindowManager(
         Provider<SatelliteManager> pSatelliteManager, 
         Provider<Satellite> pSatellite,
         SourceServerOperations server,
         EventBus events,
         FileTypeRegistry registry)
   {
      events_ = events;
      server_ = server;
      pSatelliteManager_ = pSatelliteManager;
      pSatellite_ = pSatellite;
      events_.addHandler(PopoutDocEvent.TYPE, this);
      events_.addHandler(SourceDocAddedEvent.TYPE, this);
      events_.addHandler(LastSourceDocClosedEvent.TYPE, this);
      events_.addHandler(SatelliteClosedEvent.TYPE, this);
      
      // the main window maintains an array of all open source documents 
      // across all satellites; rather than attempt to synchronize this list 
      // among satellites, the main window exposes it on its window object for
      // the satellites to read 
      if (isMainSourceWindow())
      {
         exportSourceDocs();
      }
   }

   // Public methods ----------------------------------------------------------
   public String getSourceWindowId()
   {
      return sourceWindowId(Window.Location.getParameter("view"));
   }
   
   public boolean isMainSourceWindow()
   {
      return !pSatellite_.get().isCurrentWindowSatellite();
   }
   
   public JsArray<SourceDocument> getSourceDocs()
   {
      if (isMainSourceWindow())
         return sourceDocs_;
      else
         return getMainWindowSourceDocs();
   }
   
   public boolean isSourceWindowOpen(String windowId)
   {
      return sourceWindows_.containsKey(windowId);
   }
   
   public String getWindowIdOfDocPath(String path)
   {
      JsArray<SourceDocument> docs = getSourceDocs();
      for (int i = 0; i < docs.length(); i++)
      {
         if (docs.get(i).getPath() != null && 
             docs.get(i).getPath().equals(path))
         {
            String windowId = 
                  docs.get(i).getProperties().getString(SOURCE_WINDOW_ID);
            if (windowId != null)
               return windowId;
            else
               return "";
         }
      }
      return null;
   }
   
   public void fireEventToSourceWindow(String windowId, CrossWindowEvent<?> evt)
   {
      pSatelliteManager_.get().activateSatelliteWindow(
            SourceSatellite.NAME_PREFIX + windowId);
      WindowEx window = pSatelliteManager_.get().getSatelliteWindowObject(
            SourceSatellite.NAME_PREFIX + windowId);
      if (window != null)
      {
         events_.fireEventToSatellite(evt, window);
      }
   }

   // Event handlers ----------------------------------------------------------
   @Override
   public void onPopoutDoc(final PopoutDocEvent evt)
   {
      // assign a new window ID to the source document
      final String windowId = createSourceWindowId();
      HashMap<String,String> props = new HashMap<String,String>();
      props.put(SOURCE_WINDOW_ID, windowId);
      evt.getDoc().getProperties().setString(
            SOURCE_WINDOW_ID, windowId);
      
      // update the document's properties to assign this ID
      server_.modifyDocumentProperties(
            evt.getDoc().getId(), props, new ServerRequestCallback<Void>()
            {
               @Override
               public void onResponseReceived(Void v)
               {
                  SourceWindowParams params = SourceWindowParams.create(
                        windowId, evt.getDoc());
                  pSatelliteManager_.get().openSatellite(
                        SourceSatellite.NAME_PREFIX + windowId, params, 
                        new Size(800, 800));
                  sourceWindows_.put(windowId, 
                        pSatelliteManager_.get().getSatelliteWindowObject(
                              SourceSatellite.NAME_PREFIX + windowId));
               }

               @Override
               public void onError(ServerError error)
               {
                  // do nothing here (we just won't pop out the doc)
               }
            });
   }
   
   @Override
   public void onSourceDocAdded(SourceDocAddedEvent e)
   {
      // ensure the doc isn't already in our index
      for (int i = 0; i < sourceDocs_.length(); i++)
      {
         if (sourceDocs_.get(i).getId() == e.getDoc().getId())
            return;
      }
      
      sourceDocs_.push(e.getDoc());
   }

   @Override
   public void onLastSourceDocClosed(LastSourceDocClosedEvent event)
   {
      // if this is a source document window and its last document closed,
      // close the doc itself
      if (!isMainSourceWindow())
      {
         WindowEx.get().close();
      }
   }

   @Override
   public void onSatelliteClosed(SatelliteClosedEvent event)
   {
      // when a satellite closes, close all the source docs it contained
      for (int i = 0; i < sourceDocs_.length(); i++)
      {
         SourceDocument doc = sourceDocs_.get(i);
         if (doc.getProperties().getString(SOURCE_WINDOW_ID) == 
               sourceWindowId(event.getName()))
         {
            server_.closeDocument(doc.getId(), new VoidServerRequestCallback());
         }
      }
   }

   // Private methods ---------------------------------------------------------
   
   private String createSourceWindowId()
   {
      String alphanum = "0123456789abcdefghijklmnopqrstuvwxyz";
      String id = "";
      for (int i = 0; i < 12; i++)
      {
         id += alphanum.charAt((int)(Math.random() * alphanum.length()));
      }
      return id;
   }
   
   private String sourceWindowId(String input)
   {
      if (input != null && input.startsWith(SourceSatellite.NAME_PREFIX))
      {
         return input.substring(SourceSatellite.NAME_PREFIX.length());
      }
      return "";
   }
   
   private final native JsArray<SourceDocument> getMainWindowSourceDocs() /*-{
      return $wnd.opener.rstudioSourceDocs;
   }-*/;
   
   private final native void exportSourceDocs() /*-{
      $wnd.rstudioSourceDocs = this.@org.rstudio.studio.client.workbench.views.source.SourceWindowManager::sourceDocs_;
   }-*/;
   
   private EventBus events_;
   private Provider<SatelliteManager> pSatelliteManager_;
   private Provider<Satellite> pSatellite_;
   private SourceServerOperations server_;
   private HashMap<String, WindowEx> sourceWindows_ = 
         new HashMap<String,WindowEx>();
   private JsArray<SourceDocument> sourceDocs_ = 
         JsArray.createArray().cast();
   
   public final static String SOURCE_WINDOW_ID = "source_window_id";
}
