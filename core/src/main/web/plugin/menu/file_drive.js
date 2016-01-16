/*
 * Adds a button to the File/Open submenu to open a .bkr file saved in Google Drive.
 */

define(function(require, exports, module) {
  'use strict';
  var menuItems = [
    {
      parent: "File",
      id: "file-menu",
      submenu: "Open",
      items: [
        {
          name: "Open from Google Drive (.bkr)",
          id: "open-menuitem",
          reducedName: "Open from Drive...",
          tooltip: "Open a bkr notebook file from Google Drive",
          sortorder: 110,
          action: function() {
            // TODO this is temporary
            bkHelper.openWithDialog('bkr');
          }
        }
      ]
    },
  ];

  var menuItemsPromise = bkHelper.newPromise(menuItems);

  exports.getMenuItems = function() {
    return menuItemsPromise;
  };
});
