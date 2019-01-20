/*!
 Toolbar - A jQuery UI based widget for toolbars in APEX
 Copyright (c) 2015, 2017, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @fileOverview
 * A jQuery UI widget for toolbars in Application Express. It is assumed that any toolbar behaviours are defined
 * via the Application Express 'actions' construct. Follows WAI-ARIA guidelines for the 'toolbar' widget.
 *
 * General To Do
 * - Responsive behaviour; collapse priority, some types collapse well (button, menu, button group), some not so well (text, select list)
 * - Add actions callback, for when you don't want the toolbar to respond to actions
 * - Allow cursorKeyNavigation to be set through option interface (currently this can only be set during initialisation)
 *
 * Open Questions
 * - For toggle buttons, should we use toggle buttons, or are checkboxes styled as buttons better? (Currently checkboxes styled as buttons)
 * - Should we add a 'search' type, that contained search field, go button and possibly also search-scope limiting menu (eg column specific search)
 * - Should we allow a custom type, similar to how menus do. May open the door for other useful toolbar components, for example sliders.
 *
 * Documentation
 * - Actionable toolbar controls must have a corresponding action
 * - The toolbar widget exposes the following widget options:
 *      label {string}:                 Optional label for the toolbar, not visually displayed but required for accessibility
 *      toolbarFor {string}:            Optional ID of the element the toolbar effects, important for accessibility to allow easy navigation to that element
 *      idPrefix {string}:              Optional prefix to use when generating element IDs
 *      actionsContext {string}:        Optional, and only used for apex.actions integration and for a non-global context, if not given apex.actions is used
 *      small {boolean}:                When true, toolbar renders with compact style. Defaults to false.
 *      simple {boolean}:               When true, toolbar renders with simple style, reduced borders. Defaults to false.
 *      toolbarClass {string}:          Optional CSS class applied to the main toolbar DIV element.
 *      cursorKeyNavigation {boolean}:  When true, toolbar manages cursor key navigation and the toolbar becomes a single tab stop, following the ARIA keyboard
 *                                      guidelines for a simple toolbar widget. Setting this to false will mean the default browser TAB navigation is used, which may
 *                                      be preferable if the toolbar contains some elements (eg textareas) that themselves use the LEFT / RIGHT keys (which is common in
 *                                      our apps, hence a default of false). Defaults to false. ( Note: Can only be set when initialising the widget, not set through
 *                                      option interface).
 *      data {array}:                   The main toolbar metadata passed as an array. Array of control group objects with the following properties:
 *          id {string}:                    A unique name for the group. Used by the findGroup method
 *          align {string}:                 Horizontal position of the control group in the toolbar. Available values: "start" (default), "center", and "end"
 *          customCSS {string}:             Optional CSS class name that can be applied to a control group
 *          groupTogether {boolean}:        Whether the controls in the group are grouped together with no padding. Defaults to false.
 *          controls: {array}:              Array containing the toolbar control objects in this control group. Object with the following properties:
 *              type {string}:              The type of control, available values: "STATIC", "TEXT", "SELECT", "BUTTON", "MENU", "RADIO_GROUP", "TOGGLE".
 *
 *              Each type supports different properties that should be passes with the 'type', as detailed below:
 *              Most properties are optional. The action property is always required. Where possible state information
 *              such as labels, and icons is taken from the associated action.
 *
 *              STATIC control properties:
 *              content {string}:           The static markup content. Can only have one of label or content
 *              label {string}:             The text used for the content this is ignored if content is provided
 *
 *              TEXT control properties:
 *              label {string}:             The text used for the input element's TITLE and accessible label text
 *              size {string}:              Numeric size, passes as string. Defaults to "30"
 *              maxChars {string}:          Maximum length of characters. Defaults to "4000"
 *              placeholder {string}:       The optional text used for the input element's placeholder.
 *              enterAction {string}:       Action name to invoke when the enter key is pressed
 *
 *              SELECT control properties:
 *              label {string}:             The text used for the select element's TITLE
 *              title {string}:             The text used as the title attribute
 *              action {string}:            The action name, triggers when the select list changes value. Action must be defined separately
 *                                          The choices (options) for the select list are defined in the action.
 *
 *              BUTTON control properties:
 *              label {string}:             The text used for the button label
 *              title {string}:             The text used as the title attribute
 *              action {string}:            The action name, triggers when the button is activated. Action must be defined separately
 *              hot {boolean}:              If the button is a styled 'hot'. Buttons are not hot by default.
 *              iconOnly {boolean}:         If the button display just an icon and no visible text. Defaults to false.
 *              iconBeforeLabel {boolean}:  Only applies if the button has a label and an icon. If true the icon comes before the label
 *                                          otherwise it comes after the label.
 *              icon {string}:              The CSS class used for the icon
 *
 *              MENU control properties:
 *              label {string}:             The text used for the menu button label. There is no action so this is not defaulted from the action.
 *              title {string}:             The text used as the title attribute  There is no action so this is not defaulted from the action.
 *              hot {boolean}:              If the button is a styled 'hot' not typical for menu buttons. Buttons are not hot by default.
 *              iconOnly {boolean}:         If the button display just an icon and no visible text. Defaults to false.
 *              icon {string}:              The CSS class used for the icon.  There is no action so this is not defaulted from the action.
 *              iconBeforeLabel {boolean}:  Only applies if the button has a label and an icon. If true the icon comes before the label
 *                                          otherwise it comes after the label.
 *              menu {object}:              If the button is a menu button, we pass the menu object here (uses same syntax and properties of widget.menu).
 *                                          The menubar option must be false (the default). Options actionsContext and
 *                                          idPrefix are set automatically.
 *                                          Note: The menu will have an ID of <prefix> + id + "_menu"
 *              menuId {string}:            The id of an externally created menu that this menu button should control
 *
 *              RADIO_GROUP control properties:
 *              label {string}:             The text used to label the group of radio buttons
 *              action {string}:            The action name, triggers when the radio group value changes. Action must be defined separately.
 *                                          The choices (radio inputs) for the radio group are defined in the action.
 *
 *              TOGGLE control properties:
 *              action {string}:            The action name, triggers when the checkbox elements changes value. Action must be defined separately
 *              label {string}:             The text used for the input element's label
 *
 * All controls can have an id property. The id is used in the find and findElement methods. The id need only be unique
 * within toolbar data option structure. The DOM element id used is generated using a prefix. The prefix comes from
 * option idPrefix or if that is not given then the id of the toolbar element and if that doesn't have an id the prefix
 * is "tb".
 *
 * The properties: label, placeholder, and title can be replaced with properties labelKey, placeholderKey, and titleKey
 * respectively. The apex.lang.getMessage function will be used to lookup the localized text for the message key
 * in the *Key property value.
 *
 * Depends:
 *    jquery.ui.core.js
 *    jquery.ui.widget.js
 *    apex/util.js
 *    apex/lang.js
 *    apex/debug.js
 *    apex/actions.js
 *    apex/widget.menu.js - indirectly if toolbar contains any menus
 *
 */
/*global apex*/
(function ( $, util, debug, lang ) {
    "use strict";

    var SEL = ".",
        C_TOOLBAR = "a-Toolbar",
        C_TOOLBAR_SMALL = C_TOOLBAR + "--small",
        C_TOOLBAR_SIMPLE = C_TOOLBAR + "--simple",
        C_TOOLBAR_GROUP = C_TOOLBAR + "-group",
        C_TOOLBAR_GROUP_CONTAINER = C_TOOLBAR + "-groupContainer",
        C_TOOLBAR_GROUP_CONTAINER_START = C_TOOLBAR_GROUP_CONTAINER + "--start",
        C_TOOLBAR_GROUP_CONTAINER_CENTER = C_TOOLBAR_GROUP_CONTAINER + "--center",
        C_TOOLBAR_GROUP_CONTAINER_END = C_TOOLBAR_GROUP_CONTAINER + "--end",
        C_TOOLBAR_GROUP_TOGETHER = C_TOOLBAR_GROUP + "--together",
        C_TOOLBAR_ITEM = C_TOOLBAR + "-item",
        C_TOOLBAR_INPUT = C_TOOLBAR + "-input",
        C_TOOLBAR_INPUT_TEXT = C_TOOLBAR + "-inputText",
        C_TOOLBAR_INPUT_CHECKBOX = C_TOOLBAR + "-inputCheckbox",
        C_TOOLBAR_STATIC = C_TOOLBAR + "-static",
        C_TOOLBAR_BUTTON = C_TOOLBAR + "-button",
        C_TOOLBAR_BUTTON_ITEM = C_TOOLBAR_BUTTON + "-item",
        C_TOOLBAR_RADIO_GROUP = C_TOOLBAR + "-radioGroup",
        C_TOOLBAR_TOGGLE_BUTTON = C_TOOLBAR + "-toggleButton",
        C_TOOLBAR_MENU = C_TOOLBAR + "-menu",
        C_TOOLBAR_SELECT_LIST = C_TOOLBAR + "-selectList",
        // general button classes
        C_BUTTON = "a-Button",
        C_BUTTON_HOT = C_BUTTON + "--hot",
        C_BUTTON_LABEL = "a-Button-label",
        C_BUTTON_ICON = "a-Button--withIcon",
        C_BUTTON_NO_LABEL = "a-Button--noLabel",
        // general icon classes
        C_ICON = "a-Icon",
        C_ICON_MENU_DROPDOWN = C_ICON + " icon-menu-drop-down",
        // js classes
        C_JS_MENU_BUTTON = "js-menuButton",
        C_JS_ACTION_BUTTON = "js-actionButton",
        C_JS_ACTION_RADIO_GROUP = "js-actionRadioGroup",
        C_JS_ACTION_CHECKBOX = "js-actionCheckbox",
        C_JS_ACTION_SELECT = "js-actionSelect",
        // utility classes
        C_IS_ACTIVE = "is-active",
        // selectors
        SEL_TOOLBAR_INPUT = SEL + C_TOOLBAR_INPUT
        ;

    var POSITION_START = "start",
        POSITION_CENTER = "center",
        POSITION_END = "end";

    var keys = $.ui.keyCode;

    $.widget( "apex.toolbar", {
        version: "5.1",
        widgetEventPrefix: "toolbar",
        options: {
            label:                  "",
            toolbarFor:             null,
            idPrefix:               null,
            actionsContext:         null,
            small:                  false,
            simple:                 false,
            toolbarClass:           "",
            cursorKeyNavigation:    false,
            data:                   []
        },

        /*
         * Lifecycle methods
         */
        _create: function () {
            var fn,
                ctrl$ = this.element,
                self = this,
                o = this.options;

            function observer( action, op ) {
                if ( op === "update" || op === "updateChoices" ) {

                    // enable/disable any TEXT controls if the associated action (enterAction) is enabled/disabled
                    if ( self.enterActions[action.name] ) {
                        ctrl$.find( '[data-enter-action="' + action.name + '"]' ).prop( "disabled", !!action.disabled );
                    }

                    // Show the groups unless they have no visible content. Don't bother checking if the whole toolbar is invisible
                    if ( ctrl$.is( ":visible" ) ) {
                        ctrl$.find( "." + C_TOOLBAR_GROUP ).each( function() {
                            var lHasVisibleChildren,
                                group$ = $( this );

                            // Check 'display' property (instead of checking :visible pseudo), because the :visible
                            // check would never return anything if the group itself is not visible (bug #26637234)
                            lHasVisibleChildren = group$.children().filter( function() {
                                return !this.style || this.style.display !== "none";
                            }).length > 0;

                            group$.toggle( lHasVisibleChildren );
                        } );
                    }

                    // would like to disable the menu button of a menu that has no items or all hidden items but
                    // it is not possible to know if a menu will be empty because the set of items or item
                    // states can change in the menu beforeopen event.
                }
            }
            fn = util.debounce( observer, 10);

            this.menus = {}; // object map storing all menus, indexed by menu ID
            this.enterActions = {}; // object map to store actions used in TEXT enterAction properties
            this.nextId = 1;

            ctrl$
                .addClass( C_TOOLBAR )
                .attr( "role", "toolbar" )
                .attr( "aria-label", ( o.label ? o.label : lang.formatMessage( "APEX.TB.TOOLBAR" ) ) );

            if ( o.toolbarFor ) {
                ctrl$.attr( "aria-controls", o.toolbarFor );
            }
            if ( o.small ) {
                ctrl$.addClass( C_TOOLBAR_SMALL );
            }
            if ( o.simple ) {
                ctrl$.addClass( C_TOOLBAR_SIMPLE );
            }
            if ( o.toolbarClass ) {
                ctrl$.addClass( o.toolbarClass );
            }

            if ( apex.actions  ) {
                this.actionsContext = o.actionsContext || apex.actions;
                this.actionsContext.observe( fn );
                this.actionObserver = fn; // save for cleanup
            }

            this.refresh();

            if ( o.cursorKeyNavigation ) {
                this.toolbarHasChanged();
                this._on( this._keyNavHandlers );
            }

        },
        _keyNavHandlers: {
            keydown: function ( pEvent ) {
                var self = this,
                    kc = pEvent.which,
                    lCurrentFocusable$ = $( pEvent.target );

                function _moveNext( pFrom$ ) {
                    var lNextFocusable$, lNewIdx;

                    pFrom$.attr( "tabindex", "-1" );
                    lNewIdx = parseFloat( self.focusableElements.index( pFrom$[ 0 ] ) + 1 );
                    if ( lNewIdx >= self.focusableElements.length ) {
                        lNextFocusable$ = self.focusableElements.first();
                    } else {
                        lNextFocusable$ = self.focusableElements.filter( ":eq(" + lNewIdx + ")" );
                    }

                    // If this is a radio, and the next focusable element is another radio in the same group, ignore it
                    // and move on to the next
                    if ( pFrom$.is( ":input[type=radio]" ) && pFrom$.attr( "name" ) === lNextFocusable$.attr( "name" ) ) {
                        _moveNext( lNextFocusable$ );
                    } else {
                        lNextFocusable$
                            .attr( "tabindex", "0" )
                            .focus();
                    }

                    pEvent.preventDefault();

                }

                function _movePrev( pFrom$ ) {
                    var lPrevFocusable$, lNewIdx;

                    pFrom$.attr( "tabindex", "-1" );
                    lNewIdx = parseFloat( self.focusableElements.index( pFrom$[ 0 ] ) - 1 );
                    if ( lNewIdx < 0 ) {
                        lPrevFocusable$ = self.focusableElements.last();
                    } else {
                        lPrevFocusable$ = self.focusableElements.filter( ":eq(" + lNewIdx + ")" );
                    }

                    // If this is a radio, and the previous focusable element is another radio in the same group, ignore it
                    // and move on to the previous
                    if ( pFrom$.is( ":input[type=radio]" ) && pFrom$.attr( "name" ) === lPrevFocusable$.attr( "name" ) ) {
                        _movePrev( lPrevFocusable$ );
                    } else {
                        lPrevFocusable$
                            .attr( "tabindex", "0" )
                            .focus();
                    }

                    pEvent.preventDefault();

                }

                if ( lCurrentFocusable$.is( ":input[type=text],:input[type=radio],select" ) ) {

                    // If this is a control that requires arrow keys to operate, respond to either TAB or SHIFT+TAB to move to
                    // either the next or previous
                    if ( pEvent.shiftKey && kc === keys.TAB ) {
                        _movePrev( lCurrentFocusable$ );
                    } else if ( kc === keys.TAB ) {
                        _moveNext( lCurrentFocusable$ );
                    }
                } else {

                    // Otherwise, use LEFT / RIGHT to move to next / previous
                    if ( kc === keys.LEFT ) {
                        _movePrev( lCurrentFocusable$ );
                    } else if ( kc === keys.RIGHT ) {
                        _moveNext( lCurrentFocusable$ );
                    }
                }
            }
        },
        _destroy: function () {
            var lMenu,
                ctrl$ = this.element,
                o = this.options;

            ctrl$
                .removeClass( C_TOOLBAR + " " + C_TOOLBAR_SMALL + " " + C_TOOLBAR_SIMPLE + " " + o.toolbarClass)
                .removeAttr( "role" )
                .empty();

            if ( this.actionsContext ) {
                this.actionsContext.unobserve( this.actionObserver );
            }
            
            for ( lMenu in this.menus ) {
                if ( this.menus.hasOwnProperty( lMenu ) ) {
                    $( "#" + lMenu ).remove();
                }
            }

        },
        _setOption: function ( key, value ) {
            var ctrl$ = this.element;

            if ( key === "small" ) {
                ctrl$.toggleClass( C_TOOLBAR_SMALL, value );
            }

            if ( key === "simple" ) {
                ctrl$.toggleClass( C_TOOLBAR_SIMPLE, value );
            }

            if ( key === "toolbarClass" ) {
                ctrl$
                    .removeClass( this.options.toolbarClass )
                    .addClass( value );
            }

            /* todo
            if ( key === "cursorKeyNavigation" ) {
                if ( value ) {
                    this._on( this._keyNavHandlers );
                } else {
                    this._off( this._keyNavHandlers );
                }
            }
            */

            this._super( key, value );

            // todo what to do with disabled option changes?
            // to disable a toolbar is not the same as disabling all the actions
            // the toolbar controls should be disabled; should not respond to clicks or keyboard
            // are they still tabstops? Should the buttons, inputs be disabled.
            // Problem is that if the action is updated the disabled state of the toolbar control will be changed.
            // could disassociate the toolbar controls from actions by removing the class or data attribute.

            if ( key === "data" ) {
                this.refresh();
            }
        },
        /*
         * Private methods
         */
        _getControlProperty: function( pControl, pProp ) {
            var a, value;

            // first check to see if the toolbar control has the property
            value = pControl[pProp];
            // then fall back to action
            if ( value === undefined && pControl.action ) {
                a = this.actionsContext.lookup( pControl.action );
                if ( a && a[pProp] ) {
                    value = a[pProp];
                }
            }
            return value;
        },
        _getLocalizedControlProperty: function( pControl, pProp ) {
            var a,
                text = null;

            // first check for a message key or property in the control
            if ( pControl[pProp + "Key"] ) {
                text = lang.getMessage( pControl[pProp + "Key"] );
            } else if ( pControl[pProp] !== undefined ) {
                text = pControl[pProp];
            }
            // fall back to a property in the action
            if ( !text && pControl.action ) {
                a = this.actionsContext.lookup( pControl.action );
                if ( a && a[pProp] !== undefined ) {
                    text = a[pProp]; // the actions facility will always localize the text if it can
                }
            }
            return text;
        },
        _getNoUpdate: function( pControl ) {
            if ( pControl.label || pControl.labelKey || pControl.icon || pControl.title || pControl.titleKey ) {
                return "true";
            }
            return null;
        },
        _getId: function( pControl ) {
            var lIdprefix = this.options.idPrefix || this.element[0].id || "tb";

            if ( pControl.id ) {
                return lIdprefix + "_" + pControl.id;
            }
            return null;
        },
        _forceId: function( pControl ) {
            if ( !pControl.id ) {
                pControl.id = "m" + this.nextId;
                this.nextId += 1;
            }
        },
        _buildText: function( out, pControl ) {
            var lControl = $.extend({
                id: "",
                label: "",
                size: "30",
                maxChars: "4000",
                placeholder: "",
                action: ""
            }, pControl );

            if ( lControl.enterAction ) {
                // remember enter actions for use in the actions observer
                this.enterActions[lControl.enterAction] = true;
            }

            out.markup( "<input" )
                .optionalAttr( "id", this._getId( lControl ) )
                .attr( "class", C_TOOLBAR_INPUT + " " + C_TOOLBAR_INPUT_TEXT + " " + C_TOOLBAR_ITEM )
                .attr( "title", this._getLocalizedControlProperty( lControl, "label" ) )
                .attr( "type", "text" )
                .attr( "size", lControl.size )
                .attr( "maxlength",  lControl.maxChars )
                .attr( "value", "" )
                .optionalAttr( "placeholder", this._getLocalizedControlProperty( lControl, "placeholder" ) )
                .optionalAttr( "data-enter-action", lControl.enterAction )
                .markup( " />" );
        },

        _buildStatic: function( out, pControl ) {

            out.markup( "<span" )
                .optionalAttr( "id", this._getId( pControl ) )
                .attr( "class", C_TOOLBAR_STATIC + " " + C_TOOLBAR_ITEM ) // todo allow additional classes from toolbar control?
                .markup( ">" );
            if ( pControl.content ) {
                out.markup( pControl.content );
            } else {
                out.content( this._getLocalizedControlProperty( pControl, "label" ) );
            }
            out.markup( "</span>" );
        },

        _buildSelect: function( out, pControl ) {
            var lTitle,
                lAction = this.actionsContext.lookup( pControl.action );

            lTitle = this._getLocalizedControlProperty( pControl, "title" );
            if ( !lTitle ) {
                // if there is no title use the label as the title
                lTitle = this._getLocalizedControlProperty( pControl, "label" );
            }

            out.markup( "<select" )
                .optionalAttr( "id", this._getId( pControl ) )
                .attr( "class", C_TOOLBAR_SELECT_LIST + " " + C_JS_ACTION_SELECT + " " + C_TOOLBAR_ITEM )
                .attr( "size", "1" )
                .optionalAttr( "title", lTitle )
                .optionalAttr( "aria-label", lTitle )
                .optionalBoolAttr( "disabled", lAction && !!lAction.disabled )
                .attr( "data-action", pControl.action )
                .markup( "></select>" );
            // the action is responsible for rendering the options
        },
        _buildButton: function( out, pControl ) {
            var lMenuId, lLabel, lIcon, lTitle, lAction,
                lButtonClass = C_BUTTON + " " + C_TOOLBAR_ITEM,
                lIsMenuButton = pControl.menu || pControl.menuId;

            function renderIcon() {
                out.markup( "<span" )
                    .attr( "class", C_ICON + " " + lIcon )
                    .markup( "></span>" );
            }

            if ( lIsMenuButton ) {

                if ( pControl.menu ) {
                    // If menu button, construct menu DIV id and append menu button class
                    // menu buttons must have an id
                    this._forceId( pControl );
                    lMenuId = this._getId( pControl ) + "_menu";
                } else {
                    lMenuId = pControl.menuId;
                }
                lButtonClass += " " + C_JS_MENU_BUTTON;
            } else {

                // If not a menu, assume this is just an action button and append the action button class
                lButtonClass += " " + C_JS_ACTION_BUTTON;
            }

            lIcon = this._getControlProperty( pControl, "icon" );
            if ( lIcon ) {
                lButtonClass += " " + C_BUTTON_ICON;
            }
            if ( pControl.iconOnly ) {
                lButtonClass += " " + C_BUTTON_NO_LABEL;
            }
            if ( pControl.hot ) {
                lButtonClass += " " + C_BUTTON_HOT;
            }

            lAction = this.actionsContext.lookup( pControl.action );
            if ( lAction && lAction.get && !lAction.onLabel ) {
                if ( lAction.get( pControl.action ) ) {
                    lButtonClass += " " + C_IS_ACTIVE;
                }
            }

            out.markup( "<button type='button'" )
                .attr( "class", lButtonClass )
                .optionalAttr( "id", this._getId( pControl ) )
                .optionalBoolAttr( "disabled", lAction && !!lAction.disabled );

            lLabel = this._getLocalizedControlProperty( pControl, "label" );
            lTitle = this._getLocalizedControlProperty( pControl, "title" );

            if ( !lLabel && lAction && lAction.get ) {
                lLabel = lAction.get() ? lAction.onLabel : lAction.offLabel;
            }

            // Only emit title / aria-label attributes when the button is icon only
            if ( pControl.iconOnly ) {
                if ( !lTitle ) {
                    // for icon only buttons it is important that the visual and accessible text,
                    // if there is no title use the label as the title
                    lTitle = lLabel;
                }
                out.attr( "title", lTitle )
                    .attr( "aria-label", lLabel );
            } else if ( lTitle ) {
                out.attr( "title", lTitle );
            }

            // Setup either an action button, or menu button depending on if this is a menu button
            if ( lIsMenuButton ) {
                out.attr( "data-menu", lMenuId )
                    .attr( "aria-haspopup", true )
                    .attr( "aria-expanded", false );
            } else {
                out.attr( "data-action", pControl.action )
                   .optionalAttr( "data-no-update", this._getNoUpdate( pControl ) );
            }
            out.markup( ">" );

            // Emit icon span if icon is passed and comes before the label
            if ( lIcon && pControl.iconBeforeLabel ) {
                renderIcon();
            }

            // If this is not an iconOnly button, emit the button text
            if ( !pControl.iconOnly ) {
                out.markup( "<span class='" + C_BUTTON_LABEL + "'>" )
                    .content( lLabel )
                    .markup( "</span>" );
            }

            // Emit icon span if icon is passed and doesn't come before the label
            if ( lIcon && !pControl.iconBeforeLabel ) {
                renderIcon();
            }

            // Menu buttons need the menu arrow down
            if ( lIsMenuButton ) {
                out.markup( "<span" )
                    .attr( "class", C_ICON_MENU_DROPDOWN )
                    .markup( "></span>" );
            }
            out.markup( "</button>" );

            // If this is a menu button with the menu defined here, add menu object to widget menu object map to create the menu later
            if ( pControl.menu ) {
                this.menus[ lMenuId ] = pControl.menu;
            }
        },

        _buildRadioButtonGroup: function( out, pControl ) {
            out.markup( "<div role='group'" )
                .attr( "aria-label", this._getLocalizedControlProperty( pControl, "label" ) )
                .attr( "class", C_TOOLBAR_RADIO_GROUP + " " + C_JS_ACTION_RADIO_GROUP + " " + C_TOOLBAR_ITEM )
                .attr( "data-action", pControl.action )
                .attr( "data-item", C_BUTTON )
                .attr( "data-item-wrap", C_TOOLBAR_BUTTON_ITEM )
                .markup( "></div>" );
            // the action is responsible for rendering the radio group inputs
        },
        _buildToggle: function( out, pControl ) {
            var checked, cls,
                lAction = this.actionsContext.lookup( pControl.action );

            // because of the label the id is required
            this._forceId( pControl );

            checked = lAction && lAction.get( pControl.action );
            cls =  C_TOOLBAR_INPUT + " " + C_TOOLBAR_INPUT_CHECKBOX;
            if ( checked ) {
                cls += " " + C_IS_ACTIVE;
            }

            out.markup( "<div" )
                .attr( "class", C_TOOLBAR_TOGGLE_BUTTON + " " + C_JS_ACTION_CHECKBOX + " " + C_TOOLBAR_ITEM )
                .attr( "data-action", pControl.action )
                .optionalAttr( "data-no-update", this._getNoUpdate( pControl ) )
                .markup( ">" );
            out.markup( "<input type='checkbox'" )
                .attr( "class", cls )
                .attr( "name", pControl.action )
                .attr( "id", this._getId( pControl ) )
                .optionalBoolAttr( "checked", checked )
                .optionalBoolAttr( "disabled", lAction && !!lAction.disabled )
                .markup( " />" );
            out.markup( "<label" )
                .attr( "for", this._getId( pControl ) )
                .attr( "class", C_BUTTON )
                .markup( ">" )
                .content( this._getLocalizedControlProperty( pControl, "label" ) )
                .markup( "</label>" );
            out.markup( "</div>" );
        },
        _buildToolbar: function( out, pData ) {
            var i,
                lGroupContainerStart = [],
                lGroupContainerCenter = [],
                lGroupContainerEnd = [];

            // Iterate over toolbar data, and build position container arrays based on 'align' property
            for ( i = 0; i < pData.length; i++ ) {

                // if align is not passed, or it's set to "start"
                if ( !pData[ i ].align || pData[ i ].align === POSITION_START ) {
                    lGroupContainerStart.push( pData[ i ] );
                } else if ( pData[ i ].align === POSITION_CENTER ) {
                    lGroupContainerCenter.push( pData[ i ] );
                } else if ( pData[ i ].align === POSITION_END ) {
                    lGroupContainerEnd.push( pData[ i ] );
                }
            }

            if ( lGroupContainerStart.length ) {
                this._buildGroupContainer( out, POSITION_START, lGroupContainerStart );
            }
            if ( lGroupContainerCenter.length ) {
                this._buildGroupContainer( out, POSITION_CENTER, lGroupContainerCenter );
            }
            if ( lGroupContainerEnd.length ) {
                this._buildGroupContainer( out, POSITION_END, lGroupContainerEnd );
            }

        },

        _buildGroupContainer: function( out, pPosition, pGroupContainer ) {
            var i, j, lGroup, lControl, lGroupCSS,
                lGroupContainerCSS = C_TOOLBAR_GROUP_CONTAINER;

            switch( pPosition ) {
                case POSITION_START:
                    lGroupContainerCSS += " " + C_TOOLBAR_GROUP_CONTAINER_START;
                    break;
                case POSITION_CENTER:
                    lGroupContainerCSS += " " + C_TOOLBAR_GROUP_CONTAINER_CENTER;
                    break;
                case POSITION_END:
                    lGroupContainerCSS += " " + C_TOOLBAR_GROUP_CONTAINER_END;
                    break;
            }

            out.markup( "<div" )
                .attr( "class", lGroupContainerCSS )
                .markup( ">" );

            // Iterate over toolbar data and call appropriate building functions
            for ( i = 0; i < pGroupContainer.length; i++ ){
                lGroupCSS = C_TOOLBAR_GROUP;
                lGroup = pGroupContainer[ i ];

                if ( lGroup.customCSS ) {
                    lGroupCSS += " " + lGroup.customCSS;
                }

                if ( lGroup.groupTogether ) {
                    lGroupCSS += " " + C_TOOLBAR_GROUP_TOGETHER;
                }

                out.markup( "<div" )
                    .attr( "class", lGroupCSS )
                    .markup( ">" );

                for ( j = 0; j < lGroup.controls.length; j++ ) {
                    lControl = lGroup.controls[ j ];

                    switch ( lControl.type ) {
                        case "STATIC":
                            this._buildStatic( out, lControl );
                            break;
                        case "TEXT":
                            this._buildText( out, lControl );
                            break;
                        case "SELECT":
                            this._buildSelect( out, lControl );
                            break;
                        case "MENU": // menu needs to render a button to open the menu
                        case "BUTTON":
                            this._buildButton( out, lControl );
                            break;
                        case "RADIO_GROUP":
                            this._buildRadioButtonGroup( out, lControl );
                            break;
                        case "TOGGLE":
                            this._buildToggle( out, lControl );
                            break;
                        default:
                            debug.error("Unknown toolbar control type: " + lControl.type);
                    }
                }

                out.markup( "</div>" ); // end C_TOOLBAR_GROUP

            }

            out.markup( "</div>" ); // end C_TOOLBAR_GROUP_CONTAINER

        },

        /*
         * Public methods
         */

        /**
         * Refresh the the toolbar. Render the toolbar based on the data option.
         * Call this when the contents of the data option structure (toolbar controls) change.
         * It is called automatically when the the data option is set with $(...).toolbar("option", "data", newData);
         */
        refresh: function() {
            var i, j, controls, control, lMenu, lMenuOptions, lAction,
                self = this,
                ctrl$ = this.element,
                o = this.options,
                containers = o.data,
                out = util.htmlBuilder();

            // First let's clean up any old menus
            for ( lMenu in this.menus ) {
                if ( this.menus.hasOwnProperty( lMenu ) ) {
                    $( "#" + lMenu ).remove();
                }
            }

            this._buildToolbar( out, o.data );

            ctrl$.html( out.toString() );

            // update any actions that are hidden or have choices so that the toolbar gets updated
            for ( i = 0; i < containers.length; i++ ) {
                controls = containers[i].controls;
                if ( controls ) {
                    for ( j = 0; j < controls.length; j++ ) {
                        control = controls[j];
                        lAction = this.actionsContext.lookup( control.action );
                        if ( lAction ) {
                            if ( lAction.hide ) {
                                this.actionsContext.update( control.action );
                            }
                            if ( lAction.choices ) {
                                this.actionsContext.updateChoices( control.action );
                            }
                        }
                    }
                }
            }

            // enter key handler where we have a TEXT type with an action
            ctrl$.find( SEL_TOOLBAR_INPUT ).on( "keydown", function( event ) {
                var lTarget$ = $( event.target ),
                    lAction = lTarget$.attr( "data-enter-action" );

                // If TEXT type has a 'data-enter-action' attribute and the ENTER key is pressed, perform the action
                if ( lAction && event.which === 13 ) {
                    self.actionsContext.invoke( lAction );

                    // Prevent default ENTER key behaviour; this prevents browser default behaviour of submitting the
                    // page on ENTER if the page only has 1 form field (bug #26641429)
                    event.preventDefault();
                }
            } );

            for ( lMenu in this.menus ) {
                if ( this.menus.hasOwnProperty( lMenu ) ) {
                    $( "<div/>", {
                        id: lMenu,
                        "class": C_TOOLBAR_MENU,
                        style: "display:none;"
                    }).appendTo( "body" );

                    lMenuOptions = this.menus[ lMenu ];
                    lMenuOptions.actionsContext = this.actionsContext;
                    lMenuOptions.idPrefix = this.options.idPrefix || this.element[0].id || "tb";
                    $( "#" + lMenu ).menu( lMenuOptions );
                }
            }
        },

        /**
         * If the toolbar has changed, for example if actions associated with toolbar controls have been updated, such
         * that the control is newly hidden, enabled, etc., this method must be called to update the focusable element
         * management.
         *
         * Note: This only needs to be called if this.options.cursorKeyNavigation is set to true.
         */
        toolbarHasChanged: function() {
            var lLastFocused$, lLastFocusedIdx;

            this.focusableElements = this.element.find( ":focusable" );

            // Keep last focused item
            lLastFocused$ = this.focusableElements.filter( "[tabindex=0]" );

            if ( lLastFocused$.length ) {
                lLastFocusedIdx = this.focusableElements.index( lLastFocused$[ 0 ] );
            } else {
                lLastFocusedIdx = 0;
            }

            this.focusableElements
                .filter( ":eq(" + lLastFocusedIdx + ")" ).attr( "tabindex", "0" )
                .end()
                .not( ":eq(" + lLastFocusedIdx + ")" ).attr( "tabindex", "-1" );

        },

        /**
         * Hide the toolbar control with the given id.
         *
         * This method is most useful for controls that don't have an action such as TEXT and
         * MENU. For MENU type controls only the menu button is hidden; it does not affect the associated menu.
         *
         * For controls associated with an action (those with an action property) this is just a
         * convenience method that hides the associated action.
         *
         * @param pId the id of the to toolbar control or menu item
         */
        hideControl: function( pId ) {
            var ctrl = this.find( pId );

            if ( ctrl ) {
                if ( ctrl.action ) {
                    this.actionsContext.hide( ctrl.action );
                } else {
                    this.findElement( pId ).hide();
                    if ( this.actionObserver ) {
                        // there isn't really an action being updated but call the observer anyway
                        // so it can do its hide/show group logic
                        this.actionObserver( {}, "update" );
                    }
                }
            }
        },

        /**
         * Show the toolbar control with the given id.
         *
         * This method is most useful for controls that don't have an action such as TEXT and
         * MENU. For MENU type controls only the menu button is shown; it does not affect the associated menu.
         *
         * For controls associated with an action (those with an action property) this is just a
         * convenience method that shows the associated action.
         *
         * @param pId the id of the to toolbar control or menu item
         */
        showControl: function( pId ) {
            var ctrl = this.find( pId );

            if ( ctrl ) {
                if ( ctrl.action ) {
                    this.actionsContext.show( ctrl.action );
                } else {
                    this.findElement( pId ).show();
                    if ( this.actionObserver ) {
                        // there isn't really an action being updated but call the observer anyway
                        // so it can do its hide/show group logic
                        this.actionObserver( {}, "update" );
                    }
                }
            }
        },

        /**
         * Disable the toolbar control with the given id.
         *
         * This method is most useful for controls that don't have an action such as TEXT and
         * MENU. For MENU type controls only the menu button is disabled; it does not affect the associated menu.
         * Note for TEXT controls that are associated with an action with enterAction they will be
         * disabled when the action is.
         *
         * For controls associated with an action (those with an action property) this is just a
         * convenience method that disabled the associated action.
         *
         * @param pId the id of the to toolbar control or menu item
         */
        disableControl: function( pId ) {
            var ctrl = this.find( pId );

            if ( ctrl ) {
                if ( ctrl.action ) {
                    this.actionsContext.disable( ctrl.action );
                } else {
                    this.findElement( pId ).prop( "disabled", true );
                }
            }
        },

        /**
         * Enable the toolbar control with the given id.
         *
         * This method is most useful for controls that don't have an action such as TEXT and
         * MENU. For MENU type controls only the menu button is enabled; it does not affect the associated menu.
         * Note for TEXT controls that are associated with an action with enterAction they will be
         * enabled when the action is.
         *
         * For controls associated with an action (those with an action property) this is just a
         * convenience method that enabled the associated action.
         *
         * @param pId the id of the to toolbar control or menu item
         */
        enableControl: function( pId ) {
            var ctrl = this.find( pId );

            if ( ctrl ) {
                if ( ctrl.action ) {
                    this.actionsContext.enable( ctrl.action );
                } else {
                    this.findElement( pId ).prop( "disabled", false );
                }
            }
        },

        /**
         * Find the toolbar control group with the given group id.
         * @param pGroupId the control group id
         * @return {object} the control group or null if not found
         */
        findGroup: function( pGroupId ) {
            var i, container,
                containers = this.options.data;

            // for each container
            for ( i = 0; i < containers.length; i++ ) {
                container = containers[i];
                if ( container.id === pGroupId ) {
                    return container;
                }
            }
            return null;
        },

        /**
         * Find the toolbar control or toolbar menu item for the given id.
         * Changes made to menu items will be in effect the next time the menu is opened.
         * Call toolbar refresh method if changes are made to toolbar controls.
         * Keep in mind that in most cases changes should be made through the actions facility.
         *
         * @param pId the id of the to toolbar control or menu item
         * @return {toolbarControl | menuItem} toolbar control or menu item or null if the id is not found.
         */
        find: function( pId ) {
            var i, j, controls, control, lMenu,
                containers = this.options.data;

            // the id could be for a toolbar control or for a menu item
            // first look in the toolbar controls
            for ( i = 0; i < containers.length; i++ ) {
                controls = containers[i].controls;
                if ( controls ) {
                    for ( j = 0; j < controls.length; j++ ) {
                        control = controls[j];
                        if ( control.id === pId ) {
                            return control;
                        }
                    }
                }
            }
            // next look in each of the menus. Note: this doesn't find things in externally defined menus
            for ( lMenu in this.menus ) {
                if ( this.menus.hasOwnProperty( lMenu ) ) {
                    control = $( "#" + lMenu ).menu( "find", pId );
                    if ( control ) {
                        return control;
                    }
                }
            }
            return null;
        },

        /**
         * Return the jQuery element corresponding to the toolbar control. Doesn't work for menu items.
         * @param pId the id of the to toolbar control.
         * @return {jQuery} jQuery wrapped element or empty jQuery object if not found
         */
        findElement: function( pId ) {
            var el$,
                id = this._getId( {id: pId } );

            el$ = $( "#" + id );
            return el$;
        }
    });


})( apex.jQuery, apex.util, apex.debug, apex.lang );