/*!
 item.js
 Copyright (c) 2012, 2018 Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @namespace apex.item
 * @desc
 * <p>The apex.item namespace contains global functions related to Oracle Application Express items.
 * The {@link apex.item.create} function defines the behavior for an item type.
 * The {@link apex.fn:item|apex.item} function provides access to an {@link item} interface for a specific item. </p>
 */

/*global apex, $x_FormItems, $x_ItemRow, $x*/
(function( debug, $, page ) {
    "use strict";

    /**
     * @interface item
     * @classdesc
     * <p>The item interface is used to access methods and properties of an Oracle Application Express item.
     * You get access to the item interface for a page or column item with the {@link apex.fn:item|apex.item} function.</p>
     *
     * <p>An item interface can apply to either a page item or column item.
     * Page items are items on the page backed by session state in any region.
     * Column items are created by region types such as Interactive Grid that support editable columns.
     * The state of a column item, including its value, changes according to the editing context (active record)
     * of the region and is typically backed by data in an Oracle Application Express {@link model}.</p>
     *
     * <p>Plug-in developers can define the behavior of their item by calling {@link apex.item.create}.</p>
     */

    function Item( pNd, pCallbacks ) {

        /* Check if the apex.item function was called within a constructor ( eg, using the
         * 'new' keyword), if not, we can construct it here. This allows object creation
         * without the 'new' keyword eg:
         *       var lItem = apex.item('P1_MYITEM');
         */
        if ( !( this instanceof Item ) ) {
            return new apex.item( pNd, pCallbacks );
        }

        var self                = this;
        /**
         * <p>The DOM element that best represents the value of the Oracle Application Express item. If the item doesn't exist
         * then the value is false.</p>
         *
         * @member node
         * @memberof item
         * @instance
         * @type {Element|false}
         * @example <caption>The following code checks if the Oracle Application Express item
         * P1_OPTIONAL_ITEM exists before setting its value. Use code similar to this
         * if there is a possibility of the item not existing.</caption>
         * var item = apex.item( "P1_OPTIONAL_ITEM" );
         * if ( item.node ) {
         *     item.setValue( newValue );
         * }
         */
        this.node               = false;
        // xxx should this be documented?
        this.item_type          = false;
        /**
         * <p>The id of the DOM element of the item. If the item doesn't exist then the value is false.</p>
         *
         * @member id
         * @memberof item
         * @instance
         * @type {string|false}
         */
        this.id                 = false;
        this.getValue           = getValue;
        this.init               = init; // todo don't expose this
        this.reinit             = reinit;
        this.setValue           = setValue;
        this.isEmpty            = isEmpty;
        this.isChanged          = isChanged;
        this.enable             = enable;
        this.disable            = disable;
        this.isDisabled         = isDisabled;
        this.show               = show;
        this.hide               = hide;
        this.addValue           = addValue;
        this.removeValue        = removeValue;
        this.setFocus           = setFocus;
        this.setStyle           = setStyle;
        this.afterModify        = afterModify;
        this.loadingIndicator   = loadingIndicator;
        this.displayValueFor    = displayValueFor;
        this.getValidity        = getValidity;
        this.getValidationMessage = getValidationMessage;
        this.getPopupSelector   = getPopupSelector;
        this.delayLoading       = false;

        if ( pCallbacks ) {
            this.callbacks = pCallbacks;
        } else {
            this.callbacks = {};
        }
        this.init( pNd, pCallbacks );


        /**
         * used internally
         * @ignore
         * @memberof item
         */
        function init( pNd, pCallbacks ) {
            var lNodeType, textType, node$;

            // determine type of pNd and assign _self.node accordingly
            try {
                switch ( typeof( pNd ) ) {
                    case 'string':
                        self.node = $( "#" + apex.util.escapeCSS( pNd ), apex.gPageContext$ )[0];
                        break;
                    case 'object':
                        self.node = pNd;
                        break;
                    default:
                        self.node = false;
                }
                if ( !( self.node && self.node.nodeType === 1 ) ) {
                    self.node = false;
                }
            } catch( e ) {
                self.node = false;
            }

            // only proceed if _self.node is not false
            if ( self.node ) {
                self.id = self.node.id;

                // If callbacks have been provided, register them in our global store so that they can later on be used
                // if a page item is looked up.
                if ( pCallbacks ) {
                    apex.page.itemCallbacks[ self.id ] = self.callbacks;
                } else if ( apex.page.itemCallbacks[ self.id ] ) {
                    self.callbacks = apex.page.itemCallbacks[ self.id ];
                }

                // continue with initialisation
                lNodeType = self.node.nodeName.toUpperCase();

                // we need the old code in place, since we have some packaged generating HTML markup still containing
                // the old classes
                if ( lNodeType === 'FIELDSET' ) {
                    node$ = $( self.node );
                    self.item_type = false; // default
                    if ( node$.hasClass("checkbox_group") ) {
                        self.item_type = "CHECKBOX_GROUP";
                    } else if ( node$.hasClass("radio_group") ) {
                        self.item_type = "RADIO_GROUP";
                    } else if ( node$.hasClass("shuttle") ) {
                        self.item_type = "SHUTTLE";
                    }

                // if the node is a DIV, assign item_type based on the class name
                } else if ( lNodeType === 'DIV' ) {
                    node$ = $( self.node );
                    self.item_type = false; // default
                    if ( node$.hasClass("apex-item-checkbox") ) {
                        self.item_type = "CHECKBOX_GROUP";
                    } else if ( node$.hasClass("apex-item-radio") ) {
                        self.item_type = "RADIO_GROUP";
                    } else if ( node$.hasClass("apex-item-group--shuttle") ) {
                        self.item_type = "SHUTTLE";
                    }

                // if node type is an input, assign item_type as the node type (CHECKBOX, RADIO, TEXT etc.)
                } else if ( lNodeType === 'INPUT' ) {
                    self.item_type = self.node.type.toUpperCase();

                    // switch on item_type to ensure item_type and display_span attributes are initialised
                    switch ( self.item_type ) {
                        case 'CHECKBOX':
                        case 'RADIO':
                            break;
                        case 'TEXT':
                            textType = self.node.parentNode.className.toUpperCase();
                            if ( $( self.node ).hasClass( "apex-item-popup-lov") || textType === "LOV" ) {
                                if ( $( '#' + self.id + '_HIDDENVALUE', apex.gPageContext$ ).length > 0) {
                                    self.item_type = 'POPUP_KEY_LOV';
                                } else {
                                    self.item_type = 'POPUP_LOV';
                                }
                            } 
                            
                            break;
                        case 'HIDDEN':
                            self.display_span = $x( self.id + '_DISPLAY' );
                            if ( self.display_span ) {
                                self.item_type = 'DISPLAY_SAVES_STATE';
                            }
                            break;
                        default:
                            self.item_type = 'TEXT';
                    }

                    // if the node type is not a fieldset or an input, initialise item_type accordingly
                } else {
                    self.item_type = lNodeType;
                    switch ( self.item_type ) {
                        case 'TEXTAREA':
                            try {
                                if (window.CKEDITOR && window.CKEDITOR.instances[ self.id ] ) {
                                    self.item_type = 'CKEDITOR3';
                                }
                            } catch( e ) {}
                            break;
                        case 'SELECT':
                            break;
                        case 'SPAN':
                            if ( $( self.node ).hasClass( "display_only" ) ) {
                                self.item_type = 'DISPLAY_ONLY';
                            }
                            break;
                        default:
                            self.item_type = false;
                    }
                } // end if on lNodeType
            } //end if (_self.node)
        } //end init

        /**
         * <p>Called when the item is being reused in a new context. This is called for column items when a new record
         * is being edited. This is not normally used for page items. Default behaviour does setValue and suppresses change event.
         * Items that support cascading LOVs should implement this function to first set the item's value (which may also
         * require adding the value as an option in the item), then return a function where the cascade will take place.</p>
         *
         * @memberof item
         * @ignore
         * @param pValue The value to set
         * @param pDisplayValue The display value only if different from pValue
         * @return {function} When an item defines reinit, it will return a function for post processing
         */
        function reinit( pValue, pDisplayValue ) {
            if ( $.isFunction( self.callbacks.reinit )) {
                return self.callbacks.reinit.call( self, pValue, pDisplayValue );
            } else {
                self.setValue( pValue, pDisplayValue, true );
            }
        }

        /**
         * <p>Returns the current value of an Oracle Application Express item. The initial value of a page item comes from
         * session state when the server renders the page. The initial value of a column item comes from the
         * corresponding field value of the active record of the Oracle Application Express {@link model}. This function
         * always returns the current value of the item, which may have been changed by the user or with the {@link item#setValue}
         * method since it was initialized.</p>
         *
         * <p>There are two shorthand functions related to getValue. The {@link $v} function that returns an item's value in the string format
         * it will be sent to the server. This will either be a single value, or if the item supports multiple values, will be
         * a ':' colon separated list of values. The {@link $v2} function, which is just a shortcut
         * to getValue and returns either a single value, or an array of values. See also {@link item#setValue}.</p>
         *
         * @memberof item
         * @instance
         * @return {string|Array} Returns either a single string value or array of string values if the item
         * supports multiple values (for example the 'Select List' with attribute 'Allow Multi Selection' set to ' Yes'
         * or 'Shuttle' native item types).
         * @example <caption>In this example, the current value of the page item called P1_ITEM will be shown in an alert.</caption>
         * apex.message.alert( "P1_ITEM value = " + apex.item( "P1_ITEM" ).getValue() );
         */
        function getValue() {
            var oEditor, lRadio$, lArray, lReturn;

            if ( !self.node ) {
                return "";
            } // else
            if ( $.isFunction( self.callbacks.getValue ) ) {
                return self.callbacks.getValue.call( self );
            } // else
            lArray = true;
            lReturn= [];
            switch ( self.item_type ) {
                case 'RADIO_GROUP':

                    // radio group should return a single value
                    lRadio$ = $( ':checked', self.node );
                    if ( lRadio$.length === 0 ) {

                        // check if the length of the jQuery object is zero (nothing checked)
                        // if so return an empty string.
                        lReturn = "";
                    } else {

                        // otherwise return the value
                        lReturn = lRadio$.val();
                    }
                    break;
                case 'CHECKBOX_GROUP':
                    $( ':checked', self.node ).each( function() {
                        lReturn[ lReturn.length ] = this.value;
                    });
                    break;
                case 'SELECT':
                    lReturn = $( self.node ).val();
                    if ( lReturn === null || lReturn === undefined ) {
                        if ( $( self.node ).attr( "multiple" ) ) {
                            lReturn = [];
                        } else {
                            lReturn = "";
                        }
                    }
                    break;
                default:
                    lArray = false;
            }
            if ( !lArray ) {
                switch ( self.item_type ) {
                    /* check single checkbox entry */
                    case 'CHECKBOX'             :lReturn = ( self.node.checked ) ? self.node.value : ""; break;
                    /* check single radio entry */
                    case 'RADIO'                :lReturn = ( self.node.checked ) ? self.node.value : ""; break;
                    case 'POPUP_KEY_LOV'        :lReturn = $( '#' + self.node.id + "_HIDDENVALUE", apex.gPageContext$ ).val(); break;
                    case 'TEXT':
                    case 'POPUP_LOV':
                    case 'HIDDEN':
                    case 'DISPLAY_SAVES_STATE':
                    case 'TEXTAREA':
                        lReturn = self.node.value;
                        break;
                    case 'DISPLAY_ONLY'         :lReturn = self.node.innerHTML; break;
                    default                     :lReturn = "";
                }
            }
            return lReturn;
        } //end getValue

        /**
         * <p>Sets the Oracle Application Express item value. This function sets the current value of the
         * item. For page items the session state is not affected until the page is submitted (or the item
         * is explicitly saved to the server using ajax or a dynamic action). For column items the region
         * such as Interactive Grid takes care of writing the value back to the Oracle Application Express {@link model}
         * when appropriate.</p>
         *
         * <p>Normally a change event is explicitly triggered on the item node when the value is set. This allows
         * cascading LOV functionality and dynamic action change events to work.
         * The caller may suppress the change event for the item being set, if needed. The change event should be
         * suppressed when the value is set while processing a change event triggered on the same item, to prevent
         * an infinite loop.</p>
         *
         * <p>There is a shorthand function for setValue {@link $s}. See also {@link item#getValue}.</p>
         *
         * @memberof item
         * @instance
         * @param {string|string[]} pValue The value to set. For items that support multiple values (for example a
         * 'Shuttle'), an array of string values can be passed to set multiple values at once.
         * @param {string} [pDisplayValue] The display value, only if different from pValue and can't be determined by the item itself.
         *   For example, for the item type Popup LOV, with the attribute Input Field =
         *   'Not Enterable, Show Display Value and Store Return Value', this value sets the Input Field display value.
         *   The value of pValue is used to set the item's hidden return field.
         * @param {boolean=} pSuppressChangeEvent Pass true to prevent the change event from being triggered
         *   for the item being set. The default is false.
         * @example <caption>In this example, the value of the page item called P1_ITEM will be set to 10.
         * As <code class="prettyprint">pSuppressChangeEvent</code> has not been passed, the default behavior of the
         * <code class="prettyprint">change</code> event triggering for P1_ITEM will occur.</caption>
         * apex.item( "P1_ITEM" ).setValue( "10" );
         * @example <caption>In this example, P1_ITEM is a Popup LOV page item with the attribute
         * Input Field = Not Enterable, Show Display Value and Store Return Value, set to Input Field.
         * The display value of P1_ITEM will be set to SALES, and the hidden return value will be set to 10.
         * As true has been passed for the <code class="prettyprint">pSuppressChangeEvent</code> parameter,
         * the <code class="prettyprint">change</code> event will not trigger for the P1_ITEM item.</caption>
         * apex.item( "P1_ITEM" ).setValue( "10", "SALES", true );
         */
        function setValue( pValue, pDisplayValue, pSuppressChangeEvent ) {
            var i, len, lCheck, lOpts, lSelf$, oEditor;

            if ( $.isFunction( self.callbacks.setValue )) {
                self.callbacks.setValue.call( self, pValue, pDisplayValue, pSuppressChangeEvent );
            } else {
                lOpts = false;
                lSelf$ = $( self.node, apex.gPageContext$ );
                if ( !self.node ) {
                    return;
                }
                switch ( self.item_type ) {
                    case 'RADIO_GROUP'      :
                        lOpts = $x_FormItems( self.node, 'RADIO' );
                        break;
                    case 'CHECKBOX_GROUP'   :
                        lOpts = $x_FormItems( self.node, 'CHECKBOX' );
                        break;
                    case 'POPUP_KEY_LOV'    :
                        // popup key lovs store there value in a hidden field
                        $( '#' + self.node.id + '_HIDDENVALUE', apex.gPageContext$ ).val( pValue );
                        lSelf$.val( pDisplayValue );
                        break;
                    case 'SELECT'           :
                        lOpts = self.node.options;
                        break;
                    default                 :
                        lOpts = false;
                }
                if ( lOpts ) {
                    for ( i = 0, len = lOpts.length; i < len; i++ ) {
                        lCheck = lOpts[i].value == pValue;
                        if ( self.item_type === 'RADIO_GROUP' || self.item_type === 'CHECKBOX_GROUP' ) {
                            lOpts[ i ].checked = lCheck;
                        } else {
                            lOpts[ i ].selected = lCheck;
                        }
                    }
                } else {
                    switch ( self.item_type ) {
                        case 'CHECKBOX':
                        case 'RADIO':
                            self.node.checked = self.node.value === pValue;
                            break;
                        case 'TEXT':
                        case 'POPUP_LOV':
                        case 'HIDDEN':
                        case 'TEXTAREA':
                            lSelf$.val( pValue );
                            break;
                        case 'DISPLAY_SAVES_STATE':
                            lSelf$.val( pValue );
                            $( self.display_span, apex.gPageContext$ ).html( pValue );
                            break;
                        case 'DISPLAY_ONLY':
                            lSelf$.html( pValue );
                            break;
                        case 'FCKEDITOR':
                            oEditor = FCKeditorAPI.GetInstance( self.node.id );
                            oEditor.SetHTML( pValue );
                            break;
                    /**
                     * must be some other tag item set it's innerHTML
                     */
                        default:
                            self.node.innerHTML = pValue;
                    }
                }
            }
            self.afterModify();

            /* Only if pSuppressChangeEvent is set to true, do we not trigger the change event.
             * In the case where this is not passed, the change event is triggered (for backwards
             * compatibility). Or if this is explicitly set to false, then the event will also trigger.
             */
            if ( !pSuppressChangeEvent ) {
                $( self.node ).trigger( 'change' );
            }
        } //end setValue

        /**
         * <p>Enables the Oracle Application Express item value that has been disabled, making it available for editing.
         * Not all items support being disabled. This only applies to items that can be edited.
         * See also {@link item#disable}.</p>
         *
         * @memberof item
         * @instance
         *
         * @example <caption>In this example, the page item called P1_ITEM will be enabled and available for edit.</caption>
         * apex.item( "P1_ITEM" ).enable();
         */
        function enable() {
            if ( $.isFunction( self.callbacks.enable ) ) {
                self.callbacks.enable.call( self );
            } else {
                $( self.node )
                    .removeClass( "apex_disabled" )
                    .prop( "disabled", false );

                if ( $.mobile &&
                    ( self.item_type === "TEXTAREA" ||
                        $.inArray( self.node.type, [ "text", "email", "url", "tel", "search", "number", "password", "time", "date", "month", "week", "datetime", "datetime-local", "color" ]) >= 0 )
                    )
                {
                    $( self.node ).textinput( "enable" );
                }
            }
            self.afterModify();
        } // end enable

        /**
         * <p>Disables the Oracle Application Express item, making it unavailable for editing.
         * Not all items support being disabled. This only applies to items that can be edited. See also {@link item#enable}.</p>
         *
         * @memberof item
         * @instance
         *
         * @example <caption>In this example, the page item named P1_ITEM will be disabled and unavailable for editing.</caption>
         * apex.item( "P1_ITEM" ).disable();
         */
        function disable() {
            if ( $.isFunction( self.callbacks.disable )) {
                self.callbacks.disable.call( self );
            } else {
                $( self.node )
                    .addClass( "apex_disabled" )
                    .prop( "disabled", true );

                if ( $.mobile &&
                    ( self.item_type === "TEXTAREA" ||
                        $.inArray( self.node.type, [ "text", "email", "url", "tel", "search", "number", "password", "time", "date", "month", "week", "datetime", "datetime-local", "color" ]) >= 0 )
                    )
                {
                    $( self.node ).textinput( "disable" );
                }
            }
            self.afterModify();
        } // end disable

        /**
         * Returns the disabled state of an item.
         *
         * @memberof item
         * @instance
         * @since 5.1
         * @return {boolean} true if the item is disabled and false otherwise.
         * @example <caption>This example gets the value of an item, but only if it is not disabled.</caption>
         * var value = null;
         * if ( !apex.item( "P1_ITEM" ).isDisabled() ) {
         *     value = apex.item( "P1_ITEM" ).getValue();
         * }
         */
        function isDisabled() {
            if ( $.isFunction( self.callbacks.isDisabled )) {
                return self.callbacks.isDisabled.call( self );
            } else {
                return !!$( self.node ).prop( "disabled" );
            }
        } // end isDisabled

        /**
         * <p>Shows the Oracle Application Express item. When using the show function, it is important to understand the following:</p>
         * <ul>
         * <li>If the item being shown is rendered on a page using table layout (meaning the page references a page
         * template with Grid Layout Type set to 'HTML Table'), and the call to show has specified to show the entire
         * table row (<code class="prettyprint">pShowRow</code> = true), then it is assumed that everything pertaining to the item is contained in that
         * row, and the entire row will be shown.</li>
         * <li>If the item being shown is rendered on a page using table layout, and the call to show has specified
         * not to show the entire table row (<code class="prettyprint">pShowRow</code> = false, or not passed), then the function will attempt to show
         * the item's label, where the <code class="prettyprint">for</code> attribute matches the <code class="prettyprint">id</code> of the item.</li>
         * <li>If the item being shown is rendered on a page using grid layout (meaning the page references a page
         * template with Grid Layout Type set to either 'Fixed Number of Columns', or 'Variable Number of Columns'),
         * and the item references a Label template that includes a Field Container element with a known <code class="prettyprint">id</code>
         * (so where the Field Container > Before Label and Item attribute includes an HTML element with
         * id="#CURRENT_ITEM_CONTAINER_ID#"), then it is assumed that everything pertaining to the item is contained
         * in the Field Container, and this will be shown.</li>
         * <li>If the item is a column item then just the column value is shown. The exact behavior depends on the
         * type of region. For example, in Interactive Grid just the cell content is shown not the whole column.</li>
         * </ul>
         * <p>See also {@link item#hide}.</p>
         *
         * @memberof item
         * @instance
         * @param {boolean} [pShowRow] This parameter is optional. The default if not specified is false. If true,
         * shows the nearest containing table row (TR). This parameter is not supported for column items.
         * Its behavior is undefined. Only applicable when item is on a page using table layout
         * (meaning the page references a page template with Grid Layout Type set to 'HTML Table').
         *
         * @example <caption>In this example, the page item called P1_ITEM will be shown.
         * If P1_ITEM is on a page using grid layout and the item references a Label template that includes a Field
         * Container element with a known ID (as detailed above), then that container element will be shown.
         * Otherwise just the item and its corresponding label will be shown.</caption>
         * apex.item( "P1_ITEM" ).show();
         *
         * @example <caption>In this example, the page item called P1_ITEM's nearest containing table row (TR) will be shown
         * (as pShowRow = true). Showing the entire table row should only be used on a page using table layout.
         * If P1_ITEM is on a page using grid layout, then passing pShowRow = true will not work and could result
         * in adverse consequence for the page layout, where an incorrect table row is wrongly shown.</caption>
         * apex.item( "P1_ITEM" ).show( true );
         */
        function show( pShowRow ) {
            // Note: the logic involving CONTAINER and DISPLAY suffix must be reflected in
            // $x_Toggle so that it tests the correct node for visibility.
            var lNodeId = apex.util.escapeCSS( self.node.id ),
                lNodeDisplay$ = $( '#' + lNodeId + '_CONTAINER', apex.gPageContext$ );

            if ( lNodeDisplay$.length > 0 ) {
                lNodeDisplay$.show();
            } else {
                if ( pShowRow ) {
                    $x_ItemRow( self.node, 'SHOW' );
                } else {
                    if ( $.isFunction( self.callbacks.show )) {
                        self.callbacks.show.call( self );
                    } else {
                        lNodeDisplay$ = $( '#' + lNodeId + '_DISPLAY', apex.gPageContext$ );
                        if ( lNodeDisplay$.length > 0 ) {
                            lNodeDisplay$.show();
                        } else {
                            $( self.node ).show().trigger("apexaftershow");
                        }
                    }

                    // try and show the label as well, regardless of whether callback is defined
                    if ( lNodeId ) {
                        $( 'label[for=' + lNodeId + ']', apex.gPageContext$ ).show();
                    }
                }
            }
        } // end show

        /**
         * <p>Hides the Oracle Application Express item. When using the hide function, it is important to understand the following:</p>
         * <ul>
         * <li>If the item being hidden is rendered on a page using table layout (meaning the page references a page
         * template with Grid Layout Type set to 'HTML Table'), and the call to hide has specified to hide the entire
         * table row (<code class="prettyprint">pHideRow</code> = true), then it is assumed that everything pertaining to the item is contained in that
         * row, and the entire row will be hidden.</li>
         * <li>If the item being hidden is rendered on a page using table layout, and the call to hide has specified
         * not to hide the entire table row (<code class="prettyprint">pHideRow</code> = false, or not passed), then the function will attempt to hide
         * the item's label, where the <code class="prettyprint">for</code> attribute matches the <code class="prettyprint">id</code> of the item.</li>
         * <li>If the item being hidden is rendered on a page using grid layout (meaning the page references a page
         * template with Grid Layout Type set to either 'Fixed Number of Columns', or 'Variable Number of Columns'),
         * and the item references a Label template that includes a Field Container element with a known <code class="prettyprint">id</code>
         * (so where the Field Container > Before Label and Item attribute includes an HTML element with id="#CURRENT_ITEM_CONTAINER_ID#"),
         * then it is assumed that everything pertaining to the item is contained in the Field Container, and this
         * will be hidden.</li>
         * <li>If the item is a column item then just the column value is hidden. The exact behavior depends on the
         * type of region. For example in Interactive Grid just the cell content is hidden not the whole column.</li>
         * </ul>
         * <p>See also {@link item#show}.</p>
         *
         * @memberof item
         * @instance
         * @param {boolean} [pHideRow] This parameter is optional. The default value is false. If true, hides the
         * nearest containing table row (TR). This parameter is not supported for column items.
         * Its behavior is undefined. Only applicable when item is on a page using table layout (meaning the
         * page references a page template with Grid Layout Type set to 'HTML Table').
         *
         * @example <caption>In this example, the page item called P1_ITEM will be hidden.
         * If P1_ITEM is on a page using grid layout and the item references a Label template that includes a
         * Field Container element with a known ID (as detailed above), then that container element will be hidden.
         * Otherwise just the item and its corresponding label will be hidden.</caption>
         * apex.item( "P1_ITEM" ).hide();
         *
         * @example <caption>In this example, the page item called P1_ITEM's nearest containing table row (TR) will
         * be hidden (as pHideRow = true). Hiding the entire table row should only be used on a page using
         * table layout. If P1_ITEM is on a page using grid layout, then passing pHideRow = true will not work and
         * could result in adverse consequence for the page layout, where an incorrect table row is wrongly hidden.</caption>
         * apex.item( "P1_ITEM" ).hide( true );
         *
         */
        function hide( pHideRow ) {
            // Note: the logic involving CONTAINER and DISPLAY suffix must be reflected in
            // $x_Toggle so that it tests the correct node for visibility.
            var lNodeId = apex.util.escapeCSS( self.node.id ),
                lNodeDisplay$ = $( '#' + lNodeId + '_CONTAINER', apex.gPageContext$ );

            if ( lNodeDisplay$.length > 0 ) {
                lNodeDisplay$.hide();
            } else {
                if ( pHideRow ) {
                    $x_ItemRow( self.node, 'HIDE' );
                } else {
                    if ( $.isFunction( self.callbacks.hide )) {
                        self.callbacks.hide.call( self );
                    } else {
                        lNodeDisplay$ = $( '#' + lNodeId + '_DISPLAY', apex.gPageContext$ );
                        if ( lNodeDisplay$.length > 0 ) {
                            lNodeDisplay$.hide();
                        } else {
                            $( self.node ).hide().trigger( "apexafterhide" );
                        }
                    }

                    // try and hide the label as well, regardless of whether callback is defined
                    if ( lNodeId ) {
                        $( 'label[for=' + lNodeId + ']', apex.gPageContext$ ).hide();
                    }
                }
            }
        } // end hide


        /**
         * Returns true or false if an Oracle Application Express item is empty and considers any item value consisting of
         * only whitespace including space, tab, or form-feed, as empty.
         * This also respects if the item type uses a List of Values, and a 'Null Return Value' has been defined in the List
         * of Values. In that case, the 'Null Return Value' is used to assert if the item is empty.
         *
         * @memberof item
         * @instance
         * @return {boolean} true if the Oracle Application Express item is empty and false otherwise.
         * @example <caption>In this example, the call to .isEmpty() determines if the page item called
         * P1_ITEM is empty, and if so displays an alert.</caption>
         * if ( apex.item( "P1_ITEM" ).isEmpty() ) {
         *     apex.message.alert( "P1_ITEM empty!" );
         * }
         */
        function isEmpty() {
            var lItemValue, re, lThis, lReturn,
                lNullValue = "";

            lItemValue = self.getValue(); //does the heavy lifting!

            // Make life easier and always use a string for all compare operations! $v doesn't work in this context
            if ( $.isArray( lItemValue ) ) {
                lItemValue = lItemValue.join( ':' );
            } else {
                lItemValue = "" + lItemValue;
            }

            re = /^\s{1,}$/g; //match any white space including space, tab, form-feed, etc.
            lThis = $x( self.node );

            /* Different item types will be tested for 'is empty' in different ways:
             *
             *  Case 1: text input, textareas will return true if they are null or they match any white space
             *  Case 2: multi select lists return true if they have no options selected or the current value equals the null value (not sure whether this should include null value)
             *  Case 3: all select list will ONLY return true if their current value equals the matching value in the apex.nullmap array
             *  Case 4: display only no state will return true if the span's innerHTML is empty
             *  Case 5: display only save state will return true if the relevant input's value is empty
             *  Case 6: popup lov returns true if null
             *  Case 7: popup key lov returns true if null
             *  Case 8: shuttles will return true by having no options in the right hand select element
             *  Case 9: checkboxes will return true if no checkboxes in the page item's group are checked
             * Case 10: radio groups will return true if no radio buttons in the page item's group are selected
             * Case 11: list managers will return true by having no options in the element
             * Case 12: popup color pickers will return true if no color is specified
             * Case 13: popup date pickers will return true if no date is specified
             * Case 14: CKEditor will return null if the iFrame content is empty
             *
             */

            if ( 'nullValue' in self.callbacks ) {
                if ( $.isFunction( self.callbacks.nullValue )) {
                    return self.callbacks.nullValue.call( self );
                } else {
                    // basic comparison
                    return ( lItemValue.length === 0 ) || ( lItemValue === null ) || ( lItemValue === self.callbacks.nullValue ) || ( ( lItemValue.search( re ) ) > -1 );
                }
            } else {
                if ( self.item_type === 'SELECT' ) {
                    if ( apex.widget && apex.widget.report && apex.widget.report.tabular && apex.widget.report.tabular.gNullValueList ) {
                        $.each( apex.widget.report.tabular.gNullValueList, function( pId, pValue ) {
                            if ( this.name === lThis.name ) {
                                lNullValue = pValue.value;
                                return false;
                            }
                        });
                    }
                    if ( lThis.multiple ) {
                        lReturn = ( lItemValue.length===0 ) || ( lItemValue === lNullValue );   //case 2
                    } else {
                        lReturn = ( lNullValue || lNullValue === "" ) ? ( lItemValue === lNullValue ):false;           //case 3
                    }
                } else {
                    lReturn = ( lItemValue.length === 0 ) || ( lItemValue === null ) || ( ( lItemValue.search( re ) ) > -1);    //case 1,4,5,6,7,9,10,11,12,13,14,15 (exp 2 or 3)
                    //case 8 (exp 1)
                }
                return lReturn;
            }
        } // end isEmpty

        /**
         * Determine if the value of this item has changed since it was first initialized.
         * Return true if the current value of the Oracle Application Express item has changed and false otherwise.
         * Developers rarely have a need to call this function. It is used internally by the Warn on Unsaved Changes feature.
         * Item Plug-in developers should ensure this function works so that the Warn on Unsaved Changes
         * feature can support their plug-in.
         *
         * @memberof item
         * @instance
         * @since 5.1
         * @return {boolean} true if the item value has changed and false otherwise.
         * @example <caption>The following example determines if the value of item P1_ITEM has been changed.</caption>
         * if ( apex.item( "P1_ITEM" ).isChanged() ) {
         *     // do something
         * }
         */
        function isChanged() {
            var i, opt, curValue, origValue, elements,
                changed = false;

            function checkMulti() {
                var changed = curValue.length !== origValue.length;
                if ( !changed ) {
                    for ( i = 0; i < origValue.length; i++ ) {
                        if ( curValue[i] !== origValue[i] ) {
                            changed = true;
                            break;
                        }
                    }
                }
                return changed;
            }

            if ( $.isFunction( self.callbacks.isChanged )) {
                return self.callbacks.isChanged.call( self );
            } else {
                switch ( self.item_type ) {
                    case 'TEXTAREA':
                    case 'TEXT':
                    case 'POPUP_LOV':
                        changed = self.node.value !== self.node.defaultValue;
                        break;
                    case 'SELECT':
                        curValue = $( self.node ).val();
                        if ( self.node.type === "select-multiple" ) {
                            if ( !curValue ) {
                                curValue = [];
                            }
                            origValue = [];
                            for ( i = 0; i < self.node.options.length; i++ ) {
                                opt = self.node.options[i];
                                if ( opt.attributes.selected !== undefined ) {
                                    origValue.push( opt.value );
                                }
                            }
                            changed = checkMulti();
                        } else {
                            origValue = "";
                            for ( i = 0; i < self.node.options.length; i++ ) {
                                opt = self.node.options[i];
                                if ( opt.attributes.selected !== undefined ) {
                                    origValue = opt.value;
                                    break;
                                }
                            }
                            changed = curValue !== origValue;
                        }
                        break;
                    case 'RADIO_GROUP':
                        curValue = self.getValue();
                        origValue = "";
                        elements = $x_FormItems( self.node, 'RADIO' );
                        for ( i = 0; i < elements.length; i++ ) {
                            if ( elements[i].defaultChecked ) {
                                origValue = elements[i].value;
                                break;
                            }
                        }
                        changed = curValue !== origValue;
                        break;
                    case 'CHECKBOX_GROUP':
                        curValue = self.getValue();
                        origValue = [];
                        elements = $x_FormItems( self.node, 'CHECKBOX' );
                        for ( i = 0; i < elements.length; i++ ) {
                            if ( elements[i].defaultChecked ) {
                                origValue.push( elements[i].value );
                            }
                        }
                        changed = checkMulti();
                        break;
                    case 'RADIO':
                    case 'CHECKBOX':
                        changed = self.node.checked !== self.node.defaultChecked;
                        break;
                    case 'POPUP_KEY_LOV':
                        // NOTE this is comparing the display value to detect a change. Comparing the hidden value
                        // would never find a change because a hidden value and defaultValue are always identical.
                        // So this will fail in the case where the current and original display values are identical
                        // but the return values are different. This seems too unlikely to worry about.
                        changed = self.node.value !== self.node.defaultValue;
                        break;
                    // because user can't change these directly they are never changed so let them default
                    //case 'DISPLAY_SAVES_STATE':
                    //case 'DISPLAY_ONLY':
                    //case 'HIDDEN':
                    // other types will need to implement their own changed logic
                }
            }
            return changed;
        }

        // todo may need a method to mark as not changed clearChange

        /**
         * <p>Adds the given value to the current list of values of an Oracle Application Express item that supports multiple
         * values.</p>
         *
         * @memberof item
         * @instance
         * @param {string} pValue The value to be added.
         *
         * @example <caption>In this example, the page item called P1_ITEM will have the value 100 added to the values
         * currently selected.</caption>
         * apex.item( "P1_ITEM" ).addValue("100");
         */
        function addValue( pValue ) {
            if ( $.isFunction( self.callbacks.addValue )) {
                self.callbacks.addValue.call( self, pValue );
            } else {
                debug.error( "No default handling defined for addValue" );
            }
            self.afterModify();
        } // end addValue

        /**
         * @TODO Add documentation
         * @ignore
         * @memberof item
         **/
        function removeValue() {
            if ( $.isFunction( self.callbacks.removeValue )) {
                self.callbacks.removeValue.call( self );
            } else {
                debug.error( "No default handling defined for removeValue" );
            }
            self.afterModify();
        } // end removeValue

        /**
         * <p>Places user focus on the Oracle Application Express item, taking into account how specific items are designed to receive focus.</p>
         *
         * @memberof item
         * @instance
         * @example <caption>In this example, user focus is set to the page item named P1_ITEM.</caption>
         * apex.item( "P1_ITEM" ).setFocus();
         **/
        function setFocus() {
            var lSetFocusTo$;

            if ( 'setFocusTo' in self.callbacks ) {
                if ( $.isFunction( self.callbacks.setFocusTo ) ) {

                    // setFocusTo can be a function
                    lSetFocusTo$ = self.callbacks.setFocusTo.call ( self );
                } else {

                    // If not a function, setFocusTo can be either a DOM object, jQuery selector or jQuery object
                    lSetFocusTo$ = $( self.callbacks.setFocusTo );
                }
            } else {

                // Default handling is to use the element with the ID of the page item
                lSetFocusTo$ = $( "#" + apex.util.escapeCSS( self.id ), apex.gPageContext$ );
            }
            lSetFocusTo$.focus();
        } // end setFocus


        /**
         * <p>Sets a style for the Oracle Application Express item, taking into account how specific items are
         * designed to be styled.</p>
         *
         * <p class="important">Note: Using setStyle is not a best practice. It is better to add or remove CSS classes
         * and use CSS rules to control the style of items. Also keep in mind that the exact markup of native and plug-in items can
         * change from one release to the next.</p>
         *
         * @memberof item
         * @instance
         * @param {string} pPropertyName The CSS property name that will be set.
         * @param {string} pPropertyValue The value used to set the CSS property.
         * @example <caption>In this example, the CSS property color will be set to red for the page item called P1_ITEM.</caption>
         * apex.item( "P1_ITEM" ).setStyle( "color", "red" );
         */
        function setStyle( pPropertyName, pPropertyValue ) {
            var lSetStyleTo$;

            if ( 'setStyleTo' in self.callbacks ) {
                if ( $.isFunction( self.callbacks.setStyleTo ) ) {

                    // setStyleTo can be a function
                    lSetStyleTo$ = self.callbacks.setStyleTo.call ( self );
                } else {

                    // If not a function, setStyleTo can be either a DOM object, jQuery selector or jQuery object
                    lSetStyleTo$ = $( self.callbacks.setStyleTo );
                }
            } else {

                // Default handling is to use the element with the ID of the page item
                lSetStyleTo$ = $( "#" + apex.util.escapeCSS( self.id ), apex.gPageContext$ );
            }
            lSetStyleTo$.css( pPropertyName, pPropertyValue );
            self.afterModify();
        } // end setStyle

        /**
         * @ignore
         * @memberof item
         */
        function afterModify() {
            /* Some frameworks need to get notified if widgets are modified */
            if ( $.isFunction( self.callbacks.afterModify )) {
                self.callbacks.afterModify.call( self );
            }
        } // end afterModify

        /**
         * @ignore
         * @memberof item
         */
        function loadingIndicator( pLoadingIndicator$ ) {
            var lLoadingIndicator$;

            if ( 'loadingIndicator' in self.callbacks ) {
                if ( $.isFunction( self.callbacks.loadingIndicator )) {

                    // loadingIndicator currently just supports a function currently.
                    // The function receives the loading indicator span as 1st argument
                    // and must return the created jQuery object.
                    lLoadingIndicator$ = self.callbacks.loadingIndicator.call( self, pLoadingIndicator$ );
                }
            }
            return lLoadingIndicator$;
        } // loadingIndicator

        /**
         * <p>Returns the display value corresponding to the value given by pValue for the Oracle Application Express item.
         * This method is intended for items that have both a value and display value, such as select lists.</p>
         * <p>If the item type does not have a display value distinct from the value then <code class="prettyprint">pValue</code> is returned;
         * meaning that the value is the display value. For item types that have a display value but don't have access
         * to all possible values and display values then this function only works when <code class="prettyprint">pValue</code> is the current value of the item.
         * For the native items, this only applies to item type Popup LOV, with the attribute Input Field = "Not Enterable, Show Display Value and Store Return Value".
         * For item types such as select lists that have access to all their values, if <code class="prettyprint">pValue</code>
         * is not a valid value then <code class="prettyprint">pValue</code> is returned.</p>
         *
         * @memberof item
         * @instance
         * @since 5.1
         * @param {string} pValue The value to return the corresponding display value.
         * @returns {string} The string display value corresponding to the given
         *     <code class="prettyprint">pValue</code> as described above.
         *
         * @example <caption>This example gets a display value from a select list item called P1_ITEM and displays
         * it in an alert.</caption>
         * apex.message.alert( "The correct answer is: " + apex.item( "P1_ITEM" ).displayValueFor( "APPLES" ) );
         */
        function displayValueFor( pValue ) {
            var display = pValue;

            if ( display === undefined || display === null ) {
                display = "";
            }
            if ( $.isFunction( self.callbacks.displayValueFor ) ) {
                display = self.callbacks.displayValueFor.call( self, pValue );
            } else {
                if ( self.node.type === "password" ) {
                    return "******";
                }
                switch ( self.item_type ) {
                case 'POPUP_KEY_LOV':
                    if ( pValue === self.getValue() ) {
                        display = $( self.node ).val();
                    }
                    break;
                case 'SHUTTLE':
                    if ( pValue !== undefined && pValue !== null ) {
                        display = "";
                        $( self.node ).find( "td.shuttleSelect2 option" ).each( function ( i, o ) { display += ',' + $( o ).html(); } );
                        if ( display === undefined || display === null ) {
                            display = pValue;
                        } else {
                            display = display.substr( 1 );
                        }

                    }
                    break;
                case 'SELECT':
                    if ( pValue !== undefined && pValue !== null ) {
                        display = $( self.node ).find( "[value='" + apex.util.escapeCSS( pValue + "" ) + "']" ).html();
                        if ( display === undefined || display === null ) {
                            display = pValue;
                        }
                    }
                    break;
                }
            }
            return display;
        }

        /**
         * <p>Return a ValidityState object as defined by the HTML5 constraint validation API for the
         * Oracle Application Express item. If a plug-in item implements its own validation then the object may not contain
         * all the fields defined by HTML5. At a minimum it must have the valid property. If the item doesn't support
         * HTML5 validation then it is assumed to be valid.</p>
         *
         * <p>This function does not actually validate the item value. For many item types the browser can do the
         * validation automatically if you add HTML5 constraint attributes such as pattern. Validation can be done
         * using the HTML5 constraint validation API.</p>
         *
         * <p>Developers rarely have a need to call this function. It is used internally by the client side validation
         * feature. Item plug-in developers should ensure this function works with their plug-in.</p>
         *
         * @memberof item
         * @instance
         * @since 5.1
         * @return {object} A ValidityState object as described above.
         *
         * @example <caption>The following example displays a message in an alert dialog if the item called P1_ITEM is not valid.</caption>
         * var item = apex.item( "P1_ITEM" );
         * if ( !item.getValidity().valid ) {
         *     apex.message.alert( "Error: " + item.getValidationMessage() );
         * }
         */
        function getValidity() {
            var validity = null;

            if ( $.isFunction( self.callbacks.getValidity ) ) {
                validity = self.callbacks.getValidity.call( self );
            } else {
                validity = self.node.validity || { valid:true };
            }
            return validity;
        }

        /**
         * <p>Return a validation message if the Oracle Application Express item is not valid and empty string otherwise.</p>
         *
         * <p>The message comes from the element's validationMessage property. An APEX extension allows specifying a
         * custom message, which overrides the element's validationMessage, by adding a custom attribute named
         * data-valid-message. If the item has this attribute then its value is returned if the item is not valid.
         * As the name implies, the text of the message should describe what is expected of valid input, rather than
         * what went wrong.</p>
         *
         * @memberof item
         * @instance
         * @since 5.1
         * @return {string} A validation message, if the item is not valid and empty string otherwise.
         *
         * @example <caption>See the example for {@link item#getValidity} for an example of this function.</caption>
         */
        function getValidationMessage() {
            var validMessage,
                message = "";

            // todo consider how the callback can easily participate in the default data-valid-message behavior? pass in the message if there is one?
            if ( $.isFunction( self.callbacks.getValidationMessage ) ) {
                message = self.callbacks.getValidationMessage.call( self );
            } else {
                validMessage = $( self.node ).attr( "data-valid-message" );
                if ( !self.getValidity().valid && validMessage  ) {
                    message = validMessage;
                } else {
                    message = self.node.validationMessage || "";
                }
            }
            return message;
        }

        /**
         * Any item type that uses a popup (a div added near the end of the document that is positioned near the input
         * and floating above) needs to provide a selector that locates the top level element of the popup.
         * This allows the item type to be used in the grid widget.
         * In addition the popup element must be focusable (tabindex = -1).
         * For best behavior of a popup in the grid. The popup should
         * - have a way of taking focus
         * - return focus to the grid when it closes
         * - close on escape when it has focus and
         * - close when the element it is attached to loses focus
         * - manage its tab stops so they cycle in the popup or return to the grid at the ends
         *
         * @ignore
         * @memberof item
         * @since 5.1
         * @return {string} selector that identifies a popup associated with this item or null if there is no popup
         */
        function getPopupSelector() {
            if ( $.isFunction( self.callbacks.getPopupSelector ) ) {
                return self.callbacks.getPopupSelector.call( self );
            } // else
            return null;
        }
    }

    /**
     * <p>Return an {@link item} interface that is used to access item related methods and properties.</p>
     *
     * <p>Item plug-in developers can override much of the item behavior, by calling {@link apex.item.create} with their overrides.</p>
     *
     * @function fn:item
     * @memberof apex
     * @param {Element|string} pNd The DOM Element or string id (item name) of the item.
     * @returns {item} The item interface for the given item name. If there is no such item on the page the
     *   returned item interface node property will be false.
     * @example <caption>This function is not used by itself. See the examples for methods of the {@link item} interface.</caption>
     *
     **/
    // note pCallbacks not documeted on purpose
    apex.item = Item;

    /**
     * <p>This function is only for item plug-in developers. It provides a plug-in specific implementation for the item.
     * This is necessary to seamlessly integrate a plug-in item type with the built-in item
     * related client-side functionality of Oracle Application Express.</p>
     *
     * @function create
     * @memberof apex.item
     * @since 5.1
     * @static
     * @param {Element|string} pNd The page or column item name (element id) or DOM node.
     * @param {object} pItemImpl An object with properties that provide any functions needed to customize the
     * Oracle Application Express item instance behavior. The {@link item} interface has default implementations
     * for each of its methods that are appropriate for many page items particularly for items that use standard
     * form elements. For each method of {@Link item} you should check if the default handling is appropriate for
     * your item plug-in. If it isn't you can provide your own implementation of the corresponding function
     * through this pItemImpl object. The default behavior is used for any functions omitted.
     * <p>ItemImpl can contain any of the following properties:</p>
     *
     * @param {function} pItemImpl.addValue <em>function(value)</em> Specify a function for adding a value to the item,
     * where the item supports multiple values. This is called by the {@link item#addValue} method which has no default
     * behavior for adding a value. Currently there is no client-side functionality of Oracle Application Express dependent on this.
     * <p>Note: Even if this function is defined, the default handling always calls the afterModify method.</p>
     *
     * @param {function} pItemImpl.afterModify <em>function()</em> Specify a function that is called after an item is modified.
     *   This is useful, for example as some frameworks need to be notified if widgets are
     *   modified, for example their value has been set, or they have been disabled in order to keep both the native
     *   and enhanced controls in sync. This callback provides the hook to do so.
     *
     * @param {boolean} pItemImpl.delayLoading <p>Specify if the item needs to delay APEX page loading. There are many places
     * in the APEX framework where client-side logic is run after the page has finished loading, for example Dynamic Actions
     * set to 'Fire on Initialization', or code defined in the page level attribute 'Execute when Page Loads'. If an item
     * takes longer to initialize (for example if it uses a module loader like requirejs to load additional modules,
     * or if the underlying JavaScript widget itself takes longer to initialize), setting delayLoading to true allows
     * you to tell APEX to wait for your item to finish initializing, before firing it's built in page load logic. This
     * allows you as a developer to ensure that your item is compatible with these built-in APEX features like Dynamic
     * Actions.</p>
     * <p>When this is set to true, <em>apex.item.create</em> will return a <code class="prettyprint">jQuery</code> deferred object, which will need to be resolved in order
     * for page loading to complete.</p>
     * <p>Note: If using this option, you must ensure your item initializes as quickly as possible, and also that
     * the returned deferred object is always resolved, to avoid disrupting the default APEX page load behavior.</p>
     *
     * @param {function} pItemImpl.disable <em>function()</em> Specify a function for disabling the item, which overrides the
     *   default {@link item#disable} behavior. The default behavior sets the disabled property of the item node to true.
     *   Providing this override could be useful for example where the item consists of compound elements which
     *   also need disabling, or if the item is based on a widget that already has its own disable method that you want
     *   to reuse. Ensuring the item can disable correctly means certain item related client-side functionality of
     *   Oracle Application Express still works, for example when using the Disable action of a Dynamic Action to disable
     *   the item.
     *   <p>Note: Even if this function is defined, the default handling always calls the afterModify method.</p>
     *
     * @param {function} pItemImpl.displayValueFor <em>function(value):string</em> Specify a function that returns a string
     *   display value that corresponds to the given value. This overrides the default behavior of the
     *   {@link item#displayValueFor} method. The default behavior supports a normal select element and conceals the
     *   value of password inputs.
     *
     * @param {function} pItemImpl.enable <em>function()</em> Specify a function for enabling the item, which overrides the
     *   default {@link item#enable} behavior. The default behavior sets the disabled property of the item node to false.
     *   Providing this override could be useful for example where the item consists of compound elements which
     *   also need enabling, or if the item is based on a widget that already has its own enable method that you want
     *   to reuse. Ensuring the item can enable correctly means certain item related client-side functionality
     *   of Oracle Application Express still works, for example when using the Enable action of a Dynamic Action
     *   to enable the item.
     *   <p>Note: Even if this function is defined, the default handling always calls the afterModify method.</p>
     *
     * @param {function} pItemImpl.getValidationMessage <em>function():string</em> Specify a function to return the
     *   validation message, which overrides the default {@link item#getValidationMessage} behavior.
     *
     * @param {function} pItemImpl.getValidity <em>function():ValidityState</em> Specify a function that returns a
     *   validity state object, which overrides the default {@link item#getValidity} behavior.
     *   The returned object must at a minimum have the Boolean valid property. It may include any of the properties
     *   defined for the HTML5 ValidityState object. The default implementation returns the validity object of
     *   the item element if there is one otherwise it returns { valid: true }.
     *
     * @param {function} pItemImpl.getValue <em>function():string</em> Specify a function for getting the item's value,
     *   which overrides the default {@link item#getValue} behavior. The default behavior handles
     *   the standard HTML form elements. Ensuring the item returns its value correctly means certain item related
     *   client-side functionality of Oracle Application Express still works, for example in Dynamic Actions to evaluate
     *   a When condition on the item, or when calling the JavaScript function {@link $v} to get the item's value.
     *
     * @param {function} pItemImpl.hide <em>function()</em> Specify a function for hiding the item, which overrides the default
     *   {@link item#hide} behavior. This could be useful for example where the item consists of compound elements which also
     *   need hiding, or if the item is based on a widget that already has its own hide method that you want to reuse.
     *   Ensuring the item can hide correctly means certain item related client-side functionality of Application
     *   Express still works, for example when using the Hide action of a Dynamic Action, to hide the item.
     *   <p>Note: if the item is in an element with an id that matches the name of the item with a '_CONTAINER' suffix
     *   then the container element is hidden and this function is not called.</p>
     *
     * @param {function} pItemImpl.isChanged <em>function():Boolean</em> Specify a function that returns true if the
     *   current value of the item has changed and false otherwise, which overrides the default {@link item#isChanged}
     *   behavior. This function allows the Warn on Unsaved Changes feature to work.
     *   The default implementation uses built-in functionality of HTML form elements to detect changes.
     *   If this function does not work correctly then changes to the plug-in item type value will not be
     *   detect and the user will not be warned when they leave the page.
     *
     * @param {function} pItemImpl.isDisabled <em>function():Boolean</em> Specify a function that returns true if the
     *   item is disabled and false otherwise, which overrides the default {@link item#isDisabled} behavior.
     *   Ensuring the item returns its value correctly means certain item related client-side functionality of
     *   Oracle Application Express still works, for example client-side validation and Interactive Grid.
     *
     * @param {function} pItemImpl.getPopupSelector <em>function():string</em> Specify a function that returns a
     *   CSS selector that locates the popup used by the item.
     *   Any plug-in item type that uses a popup (a div added near the end of the document
     *   that is positioned near the input item and floating above it) needs to provide a CSS selector that locates
     *   the top level element of the popup. This allows the item type to be used in the Interactive Grid region or
     *   any other region that needs to coordinate focus with the popup. The default implementation returns null.
     *   <p>In addition the top level popup element must be focusable (have attribute tabindex = -1).</p>
     *   <p>For best behavior of a popup in the Interactive Grid. The popup should:
     *   <ul>
     *   <li>have a way of taking focus</li>
     *   <li>close on escape when it has focus</li>
     *   <li>close when the element it is attached to looses focus</li>
     *   <li>return focus to the element that opened the popup when it closes</li>
     *   <li>manage its tab stops so they cycle in the popup or return to the element that opened the popup at the ends</li>
     *   </ul>
     *
     * @param {function} pItemImpl.loadingIndicator <em>function(loadingIndicator$):jQuery</em> Specify a function that normalizes
     *   how the item's loading indicator is displayed during a partial page refresh of the item.
     *   This function must pass the pLoadingIndicator$ parameter as the first parameter, which contains a
     *   jQuery object with a reference to the DOM element for the loading indicator. The function then adds
     *   this loading indicator to the appropriate DOM element on the page for the item, and also returns the
     *   jQuery object reference to the loading indicator, such that the framework has a reference to it,
     *   so it can remove it once the call is complete.
     *   <p>This is used, for example, if the item is a Cascading LOV and the Cascading LOV Parent Item changes,
     *   or when setting the item's value by using one of the server-side Dynamic Actions such as
     *   Set Value - SQL Statement.</p>
     *
     * @param {string} pItemImpl.nullValue Specify a value to be used to determine if the item is null.
     *   This is used when the item supports definition of a List of Values, where a developer can define a
     *   Null Return Value for the item and where the default item handling needs to know this in order to
     *   assert if the item is null or empty. This can be done by following these steps:
     *   <p>From the Render function in the plug-in definition, emit the value stored in p_item.lov_null_value as
     *   part of the item initialization JavaScript code that fires when the page loads. For example:
     *   <pre class=class="prettyprint"><code>
     *   # Assumes that you have some JavaScript function called 'com_your_company_your_item'
     *   # that accepts 2 parameters, the first being the name of the item and the second being
     *   # an object storing properties (say pOptions) required by the item's client side code.
     *   apex_javascript.add_onload_code (
     *       p_code => 'com_your_company_your_item('||
     *           apex_javascript.add_value(
     *               apex_plugin_util.page_item_names_to_jquery(p_item.name)||', {'||
     *           apex_javascript.add_attribute(
     *               'lovNullValue', p_item.lov_null_value, false, false)||
     *      '});' );
     *   </code></pre>
     *   <p>Then, in the implementation of com_your_company_your_item( pName, pOptions ) you have the value defined for
     *   the specific item's Null Return Value in the pOptions.lovNullValue property. This can then be used in your
     *   call to {@link apex.item.create}, to set the nullValue property.</p>
     *   <p>Ensuring the nullValue property is set means certain item related client-side functionality of
     *   Oracle Application Express still works, for example, in Dynamic Actions to correctly evaluate an is null
     *   or is not null when condition on the item, or when calling the JavaScript function
     *   {@link item#isEmpty} to determine if the item is null.</p>
     *
     * @param {function} pItemImpl.reinit <em>function(value, display):function</em> Specify a function to
     *   initialize an item's value when it is reused in a new context. This is only called for column items every time
     *   a new record is being edited. The default behaviour calls {@link item#setValue} and suppresses the change event.
     *   Items that support cascading LOVs should implement this function to first set the item's value (which may also
     *   require adding the value as an option in the item), then return a function where the cascade will take place.
     *
     * @param {Element|string|function} pItemImpl.setFocusTo Specify the element to receive focus
     *   when focus is set to the item using the {@link item#setFocus} method. This can be defined as either a jQuery
     *   selector, jQuery object or DOM Element which identifies the DOM element, or a no argument function that returns a jQuery
     *   object referencing the element. This can be useful when the item consists of compound elements,
     *   and you do not want focus to go to the element that has an ID matching the item name, which is the
     *   default behavior. For example, the native item type Popup LOV when the attribute Input Field is set to
     *   Not Enterable, Show Display Value and Store Return Value renders a disabled input field as the main
     *   element with an ID matching the item name and a popup selection icon next to the input.
     *   In this case, because you do not want focus to go to the disabled input, use the setFocusTo
     *   item property and set that to the popup selection icon.
     *   <p>Ensuring the item sets focus correctly means certain item related client-side functionality of
     *   Oracle Application Express still works, for example when using the Set Focus action of a Dynamic Action to
     *   set focus to the item, when users follow the Go to Error link that displays in a validation error
     *   message to go straight to the associated item, or when the item is the first item on a page and
     *   the developer has the page level attribute Cursor Focus set to First item on page.</p>
     *
     * @param {Element|string|function} pItemImpl.setStyleTo Specify the element to receive style, when style is set to
     *   the item using the {@link item#setStyle} method. This can be defined as either a jQuery selector,
     *   jQuery object or DOM Element which identifies the DOM element(s), or a no argument function that returns a jQuery object
     *   referencing the element(s). This is useful when the item consists of compound elements, and you do not
     *   want style to be set to the element or just the element, that has an ID matching the item name which is
     *   the default behavior.
     *   <p>Ensuring the item sets style correctly means certain item related client-side
     *   functionality of Oracle Application Express still works, for example when using the Set Style action of a
     *   Dynamic Action to add style to the item.</p>
     *   <p>Note: Even if this property is defined, the default behavior of {@link item#setStyle} calls the afterModify method.</p>
     *
     * @param {function} pItemImpl.setValue <em>function(value, displayValue, suppressChangeEvent)</em> Specify a function for
     *   setting the item's value, which overrides the default {@link item#setValue} behavior. The default behavior handles
     *   the standard HTML form elements. Ensuring the item can set its value correctly means certain item related
     *   client-side functionality of Oracle Application Express still works, for example
     *   when using the Set Value action of a Dynamic Action to set the item's value, or when calling the
     *   JavaScript function {@link $s} to set the item's value.
     *   <p>Note: Even when this function is defined, the default handling always calls the afterModify function and
     *   triggers the change event according to the pSuppressChangeEvent parameter. The pSuppressChangeEvent parameter
     *   is provided to this function for informational purpose only. In most cases it can be ignored.</p>
     *
     * @param {function} pItemImpl.show <em>function()</em> Specify a function for showing the item, which overrides the
     *   default {@link item#show} behavior. This is useful for example where the item consists of compound elements which
     *   also need showing, or if the item is based on a widget that already has its own show method that you want
     *   to reuse. Ensuring the item can show correctly means certain item related client-side functionality of
     *   Oracle Application Express still works, for example when using the Show action of a Dynamic Action, to show the item.
     *   <p>Note: if the item is in an element with an id that matches the name of the item with a '_CONTAINER' suffix
     *   then the container element is shown and this function is not called.</p>
     *
     * @returns {object} Returns a <code class="prettyprint">jQuery</code> Deferred object when delayLoading is set to true. The <code class="prettyprint">jQuery</code> deferred object must
     * be resolved in order for APEX page load to complete. If delayLoading is set to false (the default), then nothing is
     * returned.
     *
     * @example <caption>The following example shows a call to apex.item.create( pNd, pItemImpl )
     *   with most available callbacks and properties passed to illustrate the syntax (although
     *   it is unlikely that any plug-in needs to supply all of these).</caption>
     * apex.item.create( "P100_COMPANY_NAME", {
     *     displayValueFor: function( pValue ) {
     *         var lDisplayValue;
     *         // code to determine the display value for pValue
     *         return lDisplayValue;
     *     },
     *     getPopupSelector: function() {
     *         return "<some CSS selector>";
     *     },
     *     getValidity: function() {
     *         var lValidity = { valid: true };
     *         if ( <item is not valid expression> ) {
     *             lValidity.valid = false;
     *         }
     *         return lValidity;
     *     },
     *     getValidationMessage: function() {
     *         // return validation message if invalid or empty string otherwise
     *     },
     *     getValue: function() {
     *         var lValue;
     *         // code to determine lValue based on the item type.
     *         return lValue;
     *     },
     *     setValue: function( pValue, pDisplayValue ) {
     *         // code that sets pValue and pDisplayValue (if required), for the item type
     *     },
     *     reinit: function( pValue, pDisplayValue ) {
     *         // set the value possibly using code like
     *         // this.setValue( pValue, null, true );
     *         return function() {
     *            // make an ajax call that gets new option values for the item
     *         }
     *     },
     *     disable: function() {
     *         // code that disables the item type
     *     },
     *     enable: function() {
     *         // code that enables the item type
     *     },
     *     isDisabled: function() {
     *         // return true if item is disabled and false otherwise
     *     }
     *     show: function() {
     *         // code that shows the item type
     *     },
     *     hide: function() {
     *         // code that hides the item type
     *     },
     *     isChanged: function() {
     *         var lChanged;
     *         // code to determine if the value has changed
     *         return lChanged;
     *     },
     *     addValue: function( pValue ) {
     *         // code that adds pValue to the values already in the item type
     *     },
     *     nullValue: "<null return value for the item>",
     *     setFocusTo: $( "<some jQuery selector>" ),
     *     setStyleTo: $( "<some jQuery selector>" ),
     *     afterModify: function(){
     *         // code to always fire after the item has been modified (value set, enabled, etc.)
     *     },
     *     loadingIndicator: function( pLoadingIndicator$ ){
     *         // code to add the loading indicator in the best place for the item
     *         return pLoadingIndicator$;
     *     }
     * });
     *
     @example <caption>The following example shows a call to apex.item.create( pNd, pItemImpl )
     *   with delayLoading option set to true. Doing so results in the create function returning a
     *   deferred object, which must be later resolved in order for page load to complete.</caption>
     * var lDeferred = apex.item.create( "P100_COMPANY_NAME", {
     *     delayLoading: true
     * });
     *
     * // At some point later in the code when the item has finished its initialization, resolve the deferred object
     * lDeferred.resolve();
     */
    apex.item.create = function ( pNd, pItemImpl ) {
        var lDeferred;

        apex.item( pNd, pItemImpl );

        if ( pItemImpl.delayLoading ) {

            // Add a new deferred object to the stack, and return it for the item to be resolve when it's ready
            lDeferred = $.Deferred();
            page.loadingDeferreds.push( lDeferred );
            return lDeferred;
        }

    };

    // todo consider if there is a need for apex.item.destroy

})( apex.debug, apex.jQuery, apex.page );
