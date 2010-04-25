/*
 * Duplicate tab v1.0.0
 * Create a new tab with the url and history of the current one.
 * 
 * This extension was created in an effort to alleviate the burden of foresight
 * required to identify when you want to follow a link in a new tab as opposed
 * to the current tab.  If it happens that you want to retain your tab state,
 * but continue browsing, just duplicate the tab!
 *
 * Copyright © 2010 Mjumbe Wawatu Ukweli <mjumbewu@gmail.com>
 */

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 2 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

function duplicate_tab(window, embed) 
{
  /*
  Duplicate the given embed object into a new tab in the given window
  */
  
  var shell = Epiphany.EphyShell.get_default();
  var current_url = embed.get_web_view().get_location();
  
  var new_tab = new Epiphany.EphyShell.tab(shell, window, embed,
    current_url,
    Epiphany.EphyNewTabFlags.OPEN_PAGE |
    Epiphany.EphyNewTabFlags.IN_EXISTING_WINDOW |
    Epiphany.EphyNewTabFlags.JUMP);
}

function duplicate_current_tab(window)
{
  /* 
  Duplicates the embed object in the current tab in the given window
  */
  
  var embed = window.get_active_child();
  duplicate_tab(window, embed);
}

function file_duplicate_tab_cb(action, window)
{
  /*
  Callback for the duplicate tab action
  */
  
  duplicate_current_tab(window)
}

function create_duplicate_action()
{
  /*
  Create a new action to duplicate the current tab
  */
  
  var action = new Gtk.Action({
    name: "TabsDuplicate",
    label: "D_uplicate Tab",
    tooltip: "Duplicate the current tab",
    stock_id: null});
  return action;
}

function create_duplicate_action_group(action)
{
  /*
  Create a new action group to contain the given duplicate tab action.
  */
  
  var action_group = new Gtk.ActionGroup({
    name: "TabsDuplicateActionGroup"});
  action_group.add_action_with_accel(action, "<shift><control>D");
  return action_group;
}

function connect_duplicate_action(action, window)
{
  /*
  Connect the given action to the function that will duplicate the current
  tab in the window.  Return the resulting signal id.
  */
  
  var sig_id = action.signal.activate.connect(file_duplicate_tab_cb, window);
  return sig_id;
}

function add_duplicate_action_group_to_menu(manager, action_group)
{
  /*
  Insert the given action group into the menu.  Return the resulting merge id.
  */
  manager.insert_action_group(action_group, 0);
  merge_id = manager.new_merge_id();
  manager.add_ui(merge_id, "/menubar/TabsMenu/TabsDetach",
    "TabsDuplicateMenu", "TabsDuplicate",
    Gtk.UIManagerItemType.MENUITEM, true);
  manager.add_ui(merge_id, "/EphyNotebookPopup/TabCloseENP",
    "TabsDuplicateENP", "TabsDuplicate",
    Gtk.UIManagerItemType.MENUITEM, true);
  return merge_id;
}

function attach_window(window)
{
  window._duplicate_tab = {};
  var dup = window._duplicate_tab;
  
  dup.action = create_duplicate_action();
  dup.sig_id = connect_duplicate_action(dup.action, window);
  dup.action_group = create_duplicate_action_group(dup.action);
  dup.manager = window.get_ui_manager();
  dup.merge_id = add_duplicate_action_group_to_menu(dup.manager, 
                                                    dup.action_group)
}

function detach_window(window)
{
  var dup = window._duplicate_tab;
  
  dup.manager.remove_ui(dup.merge_id);
  dup.manager.remove_action_group(dup.action_group);
  dup.action_group.remove_action(dup.action);
  dup.action.signal.disconnect(dup.sig_id);
  delete window._duplicate_tab;
}

extension = {
  attach_window: attach_window,
  detach_window: detach_window
};

