/*
 * Hackerfleet Operating System
 * ============================
 * Copyright (C) 2011 - 2017 riot <riot@c-base.org> and others.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

class featureMenu {
    
    constructor(userservice, $state, $log, $scope, $timeout, alert) {
        this.signedin = false;
        this.state = $state;
        this.user = userservice;
        this.scope = $scope;
        this.timeout = $timeout;
        this.alert = alert;
        
        this.changetimeout = null;
        this.gridChangeWatcher = null;
        
        this.lockState = false;
        
        $log.log('[MENU] Featuremenu initializing with Profile: ', userservice.profile);
        console.log(userservice.profile);
        
        let self = this;
        
        this.storeMenuConfig = function () {
            if ('settings' in self.user.profile) {
                console.log('[MENU] Updating menu list for profile:', self.items);
        
                let menu = [];
        
                for (let item of self.items) {
                    menu.push({
                        title: item.title,
                        row: item.row,
                        col: item.col,
                        size: item.size
                    })
                }
                console.log('[MENU] Pushing menu to profile:', menu);
                self.user.profile.settings.menu = menu;
                self.user.saveProfile();
            }
    
            self.changetimeout = null;
        };
        
        this.gridsterOptions = {
            // any options that you can set for angular-gridster (see:  http://manifestwebdesign.github.io/angular-gridster/)
            columns: screen.width / 70,
            rowHeight: 70,
            colWidth: 70,
            defaultSizeX: 5,
            defaultSizeY: 5,
            margins: [5, 5],
            mobileBreakPoint: 400,
            draggable: {
                enabled: false
            },
            resizable: {
                enabled: false
            }
        };
        
        
        $('#bootscreen').hide();
    
        this.handleGridChange = function (newVal, oldVal) {
            if (newVal === oldVal) {
                console.log('No actual change');
                return;
            }
            if (self.changetimeout !== null) {
                self.timeout.cancel(self.changetimeout);
            }
            self.changetimeout = self.timeout(self.storeMenuConfig, 2000);
        };
        
        this.updateMenu = function () {
            console.log('[MENU] Updating featuremenus');
            let row = 0, col = 0;
            
            self.items = [];
            
            let menu = $('#modulemenu');
            
            menu.empty();
            
            
            // TODO: Move these two into the user service. Actually, stuff should be available per default.
            if (typeof self.user.profile.settings === 'undefined') {
                self.user.profile.settings = {};
            }
            
            if (typeof self.user.profile.settings.menu === 'undefined') {
                self.user.profile.settings.menu = [];
            }
            
            console.log('[MENU] Settings:', self.user.profile.settings.menu);
            let store_state = false;
            
            for (let state of self.state.get()) {
                let enabled = [];
                let profile = self.user.profile;
                
                if (typeof profile.components !== 'undefined') {
                    enabled = profile.components.enabled;
                }
                
                if ('icon' in state && true) { // (state.label === 'Map' || state.label in enabled)) {
                    let item = {
                        title: state.label,
                        url: state.url,
                        svg: state.icon,
                        row: 0,
                        col: 0,
                        size: 1
                    };
                    
                    try {
                        let configentry = profile.settings.menu.find(x => x.title === state.label);
                        item.row = configentry.row;
                        item.col = configentry.col;
                        item.size = configentry.size;
                    } catch (e) {
                        item.row = row;
                        item.col = col;
                        item.size = 1;
                        
                        if (typeof profile.components !== 'undefined') {
                            let entry = {
                                title: item.title,
                                col: item.col,
                                row: item.row,
                                size: item.size
                            };
                            profile.settings.menu.push(entry);
                            store_state = true;
                        }
                        
                        col++;
                        if (col === 5) {
                            col = 0;
                            row++;
                        }
                    }
                    
                    let menuentry = '<li><a href="#!' + item.url + '"><img class="module-icon-tiny" src="' + item.svg + '" type="image/svg+xml">' + item.title + '</a></li>';
                    menu.append(menuentry);
                    
                    self.items.push(item);
                } else {
                    console.log('[MENU] Item has either no icon or is disabled:', state);
                }
                
                if (store_state) {
                    self.storeMenuConfig();
                }
            }
            
            if (self.items.length === 0) {
                // TODO: Add link to docs, that explains how to do that.
                this.alert.add('warning', 'No modules', 'The menu is empty. A probable reason could be that you have no modules installed.');
            }
            
            console.log('[MENU] Menudata:', self.items, self.user.profile.settings.menu);
        };
        
        if (typeof this.user.profile.settings !== 'undefined') {
            if (typeof this.user.profile.settings.menu !== 'undefined') {
                this.updateMenu();
            }
        }
        this.scope.$on('Profile.Update', self.updateMenu);
    }
    
    toggleLock() {
        this.lockState = !this.lockState;
        this.gridsterOptions.draggable.enabled = this.lockState;
        this.gridsterOptions.resizable.enabled = this.lockState;
        if (this.lockState) {
            console.log('Enabling gridwatcher');
            this.gridChangeWatcher = this.scope.$watch('$ctrl.items', this.handleGridChange, true);
        } else {
            this.gridChangeWatcher();
        }
    }
}


featureMenu.$inject = ['user', '$state', '$log', '$scope', '$timeout', 'alert'];

export default featureMenu;
