/*!
 Combobox - a jQuery UI based widget for entering custom values, or selecting from a list of values.
 Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved.

 */
/**
 * @fileOverview
 * Combobox is a custom form element used for allowing selection from a pre-defined list of values, or entering a
 * custom value, in one control.
 *
 * The markup expected by this widget is simply a text field and the list of values are provided via the 'source' option.
 *
 * Supported options:
 * - source:                    An array of the following format, used as the list of values menu source
 *                              [ { label: "label1", value: "value1" }, ...]
 * - multipleValues:            [Defaults false] True if multiple values are supported in the text area, where picking
 *                              additional values will add to the existing selection.
 * - multipleValueDelimiter:    [Defaults ','] Delimiter used to separate multiple values (multipleValues must be true)
 * - label:                     Label text used by the show all button to provide an accessible and unique label
 *
 *
 * Open Issues:
 *
 * Future:
 *
 *
 * Depends:
 *      jquery-2.2.3.js
 *      jquery.ui.core.js
 *      jquery.ui.widget.js
 *      core.js
 *      util.js
 *      debug.js
 *      actions.js
 *      lang.js
 *      widget.menu.js
 */

/*global apex,$v*/

(function ( $, util, actions, lang, debug, undefined ) {
    "use strict";

    // class variables
    var C_COMBOBOX = "a-Combobox",
        SEL_COMBOBOX = "." + C_COMBOBOX,
        C_COMBOBOX_WRAPPER = C_COMBOBOX + "-wrapper",
        SEL_COMBOBOX_WRAPPER = "." + C_COMBOBOX_WRAPPER,
        C_COMBOBOX_INPUT = C_COMBOBOX + "-input",
        C_COMBOBOX_BUTTON = C_COMBOBOX + "-button",
        // Button classes
        C_BUTTON = "a-Button",
        C_BUTTON_WITH_ICON = C_BUTTON + "--withIcon",
        C_BUTTON_NO_LABEL = C_BUTTON + "--noLabel",
        // Icon classes
        C_ICON = "a-Icon",
        C_ICON_DROP_DOWN = "icon-menu-drop-down",
        // js classes
        C_JS_MENU_BUTTON = "js-menuButton";

    // Other Constants
    var COMBOBOX = "combobox",
        VALUES_POSTFIX = "-values",
        MENU_POSTFIX = "-menu",
        SHOW_ALL_BUTTON_POSTFIX = "-showAll";

    $.widget( "apex." + COMBOBOX, {
        version: "5.1",
        widgetEventPrefix: COMBOBOX,
        options: {
            source: [],
            multipleValues: false,
            multipleValueDelimiter: ",",
            label: ""
        },
        _create: function() {
            var out = util.htmlBuilder(),
                self = this,
                lOptions = this.options,
                lComboboxCount = $( SEL_COMBOBOX ).length;

            this.baseId = this.element[ 0 ].id || COMBOBOX + ( lComboboxCount + 1 );
            this.actions = actions.createContext( COMBOBOX, this.element[ 0 ] );

            if ( lOptions.label ) {
                debug.warn( "Label not provided, which is an accessibility issue (unless the 'label' option is later set)." );
            }

            //todo aria labelling for the group?
            out.markup( "<span" )
                .attr( "class", C_COMBOBOX_WRAPPER )
                .markup( "></span>" );

            this.element
                .wrap( out.toString() )
                .addClass( C_COMBOBOX );

            this.wrapper$ = this.element.closest( SEL_COMBOBOX_WRAPPER );

            this._createShowAllButton();


            // Handlers and actions
            this._on( this.element, {
                keydown: function( pEvent ) {

                    // If either Option+Down or Command+Down (Mac) or Alt+Down (Windows) is pressed, open the menu
                    // (Emulates native select list behaviour)
                    if ( ( pEvent.altKey || pEvent.metaKey ) && pEvent.which === $.ui.keyCode.DOWN ) {

                        self.menu$.menu( "open", self.element, false );

                        // focus first item in the menu
                        self.menu$.find( ":focusable" ).first().focus();
                    }
                }
            });

            // Actions need to be added after the menu is initialised
            this.actions.add( {
                name: this.baseId + VALUES_POSTFIX,
                label: lang.getMessage( "APEX.COMBOBOX.LIST_OF_VALUES" ),
                set: function( pValue ) {
                    var lCurrentValue = self.element.val();

                    if ( lOptions.multipleValues ) {
                        self.element.val( ( lCurrentValue ? lCurrentValue + lOptions.multipleValueDelimiter : lCurrentValue )  + pValue );
                    } else {
                        self.element.val( pValue );
                    }
                    if ( lCurrentValue !== self.element.val( ) ) {
                        self.element.change();
                    }
                },
                get: function() {
                    return self.element.val();
                },
                choices: lOptions.source
            });


        },
        _setOption: function( key, value ) {

            this._super( key, value );

            switch( key ) {
                case "multipleValues":

                    //todo we shouldn't leave multiple values in this.element, if multipleValues = false

                    //todo remove the added value from the menu list

                    break;
                case "source":

                    // Update menu choices
                    this.actions.lookup( this.baseId + VALUES_POSTFIX ).choices = value;
                    this.actions.updateChoices( this.baseId + VALUES_POSTFIX );

                    break;
                case "label":
                    $( "#" + this.baseId + SHOW_ALL_BUTTON_POSTFIX, this.wrapper$ )
                        .attr( "title", lang.formatMessage( "APEX.COMBOBOX.SHOW_ALL_VALUES", value ) )
                        .attr( "aria-label", lang.formatMessage( "APEX.COMBOBOX.SHOW_ALL_VALUES", value ) );

                    break;
            }

        },
        _createShowAllButton: function() {
            var out = util.htmlBuilder();

            out.markup( "<button type='button'" )
                .attr( "id", this.baseId + SHOW_ALL_BUTTON_POSTFIX )
                .attr( "tabindex", "-1" )
                .attr( "title", lang.formatMessage( "APEX.COMBOBOX.SHOW_ALL_VALUES", this.options.label ) )
                .attr( "aria-label", lang.formatMessage( "APEX.COMBOBOX.SHOW_ALL_VALUES", this.options.label ) )
                .attr( "class", C_BUTTON + " " + C_BUTTON_WITH_ICON + " " + C_BUTTON_NO_LABEL + " " + C_JS_MENU_BUTTON )
                .attr( "data-menu", this.baseId + MENU_POSTFIX )
                .attr( "aria-haspopup", true )
                .attr( "aria-expanded", false )
                .markup( ">" );

            out.markup( "<span" )
                .attr( "aria-hidden", true )
                .attr( "class", C_ICON + " " + C_ICON_DROP_DOWN )
                .markup( ">" )
                .markup( "</span>" );

            out.markup( "</button>" );

            this.wrapper$.append( out.toString() );

            // Setup values menu
            this.menu$ = $( "<div/>", {
                id: this.baseId + MENU_POSTFIX,
                class: "",
                style: "display:none;"
            }).appendTo( "body" );

            this.menu$.menu( {
                actionsContext: this.actions,
                items: [
                    {
                        type: "radioGroup",
                        action: this.baseId + VALUES_POSTFIX
                    }
                ]
            });

        },

        _destroy: function() {

            // Move the base input out of the wrapper first
            this.element.insertBefore( this.wrapper$ );

            // Then we can just remove the wrapper (which also contains the menu button)
            this.wrapper$.remove();

            // Remove the values menu
            this.menu$.remove();

            // Clean up classes
            this.element.removeClass( C_COMBOBOX );

            // Remove actions context
            actions.removeContext( COMBOBOX, this.element[ 0 ] );
        }

    });



})( apex.jQuery, apex.util, apex.actions, apex.lang, apex.debug );
