/*
 *  Copyright 2014 TWO SIGMA OPEN SOURCE, LLC
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

/**
 * This is the module for the UI that shows the list of evaluators and their corresponding
 * settings panel.
 */
(function() {
  'use strict';

  var module = angular.module('bk.core');

  module.controller('pluginManagerCtrl', ['$scope', '$rootScope', '$modalInstance', 'bkCoreManager', 'bkSessionManager', 'bkMenuPluginManager', 'bkEvaluatePluginManager',
                                          'bkEvaluatorManager', 'GLOBALS', 'bkUtils', function($scope, $rootScope, $modalInstance, bkCoreManager, bkSessionManager, bkMenuPluginManager, bkEvaluatePluginManager,
                                              bkEvaluatorManager, GLOBALS, bkUtils) {


    $scope.doClose = function() {
      $scope.evalTabOp.showURL = false;
      $scope.evalTabOp.showWarning = false;
      $scope.evalTabOp.showSecurityWarning = false;
      $scope.evalTabOp.forceLoad = false;
      $scope.evalTabOp.newPluginNameOrUrl = "";
      $modalInstance.close("ok");
    };

    $scope.getEvaluatorDetails = function(name) {
      return bkEvaluatorManager.getVisualParams(name);
    };

    $scope.allowFromUrl = function() {
      return (window.beaker === undefined || window.beaker.disablePluginLoadFromUrl === undefined || !window.beaker.disablePluginLoadFromUrl);
    }
    
    $scope.evalTabOp = {
      newPluginNameOrUrl: "",
      showURL: false,
      showWarning: false,
      showSecurityWarning: false,
      forceLoad: false,
      getLoadedEvaluators: function() {
        return bkEvaluatorManager.getLoadedEvaluators();
      },
      getEvaluatorsWithSpec: function() {
        var activePlugins = bkEvaluatorManager.getLoadedEvaluators();
        var result = {};
        for (var p in activePlugins) {
          if (Object.keys(activePlugins[p].spec).length > 0) {
            result[p] = activePlugins[p];
          }
        }
        return result;
      },
      getLoadingEvaluators: function() {
        return bkEvaluatorManager.getLoadingEvaluators();
      },
      getEvaluatorStatuses: function(name) {
        var knownPlugins = bkEvaluatePluginManager.getKnownEvaluatorPlugins();
        var activePlugins = bkEvaluatorManager.getLoadedEvaluators();
        var loadingPlugins = bkEvaluatorManager.getLoadingEvaluators();
        var result = {};
        for (var p in knownPlugins) {
          var status = false;
          if (activePlugins[p]) {
            status = "active";
          } else {
            for (var l in loadingPlugins) {
              if (loadingPlugins[l].plugin == p) {
                status = "loading";
                break;
              }
            }
            if (!status) {
              status = "known";
            }
          }
          result[p] = status;
        }
        return result;
      },
      setNewPluginNameOrUrl: function(pluginNameOrUrl) {
        this.newPluginNameOrUrl = pluginNameOrUrl;
      },
      togglePlugin: function(name) {
        var plugin = name || this.newPluginNameOrUrl;
        var fromUrl = name ? false : true;
        var status = this.getEvaluatorStatuses()[plugin];

        if (!fromUrl && !_.contains(['active', 'known'], status)) return;
        // for now, if the plugin isn't from a URL or active or known
        // (namely loading) return.
        // TODO: other states we should support: failed and exiting.

        if (status === 'active') {
          // turn off evaluator if on
          if (!bkSessionManager.evaluatorUnused(plugin)) {
            return $scope.evalTabOp.showWarning = true;
          }

          bkSessionManager.removeEvaluator(plugin);
          bkCoreManager.getBkApp().removeEvaluator(plugin);
        } else {
          // otherwise, turn on evaluator
          if (fromUrl) {
            var r = new RegExp('^(?:[a-z]+:)?//', 'i');
            if (r.test(plugin) && !$scope.evalTabOp.forceLoad) {
              return $scope.evalTabOp.showSecurityWarning = true;
            }

            $scope.evalTabOp.forceLoad = false;
            $scope.evalTabOp.newPluginNameOrUrl = "";
          }

          var newEval = { name: '', plugin: plugin };
          bkSessionManager.addEvaluator(newEval);
          bkCoreManager.getBkApp().addEvaluator(newEval);
          $rootScope.$broadcast('languageAdded', { evaluator: plugin });
        }
      }
    };

    $scope.menuTabOp = {
      newMenuPluginUrl: "./plugin/menu/debug.js",
      addMenuPlugin: function () {
        bkMenuPluginManager.loadMenuPlugin(this.newMenuPluginUrl);
      },
      getMenuPlugins: function () {
        return bkMenuPluginManager.getMenuPlugins();
      },
      getLoadingPlugins: function() {
        return bkMenuPluginManager.getLoadingPlugins();
      }
    };

    $rootScope.$on(GLOBALS.EVENTS.LANGUAGE_MANAGER_SHOW_SPINNER, function(event, data) {
      $scope.showSpinner = true;
      $scope.showMessage = true;
      $scope.loadingMessage = 'Restarting ' + data.pluginName + '...';
    });

    $rootScope.$on(GLOBALS.EVENTS.LANGUAGE_MANAGER_HIDE_SPINNER, function(event, data) {
      if (data.error) {
        $scope.loadingMessage += 'failed';
      } else {
        $scope.loadingMessage += 'done';
      }
      $scope.showSpinner = false;
      bkUtils.timeout(function() {
        $scope.showMessage = false;
      }, 3000);
    });

  }]);
})();
