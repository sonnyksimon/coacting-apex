/*!
 Copyright (c) 2013, 2018, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @uiwidget iconList
 * @since 5.0
 *
 * @borrows contextMenuMixin#contextMenuAction as iconList#contextMenuAction
 * @borrows contextMenuMixin#contextMenu as iconList#contextMenu
 * @borrows contextMenuMixin#contextMenuId as iconList#contextMenuId
 *
 * @classdesc
 * <p>IconList is a ListBox where the items (options) in the list are arranged in a grid; across then down.
 * All the items in the list must be the same size; height and width set with CSS.
 * Arrow key movement is naturally extended to two dimensions.
 * The number of columns depends on the width of the iconList element and the items within it.
 * The iconList does not handle scrolling the item contents but it can be put inside a container that does scroll.
 * It can be used from {@link tableModelView} to support pagination including scroll paging over a model.</p>
 *
 * <p>The primary purpose of an itemList is to allow the user to select one or more items. It also supports
 * type to select, copy to clipboard, context menus, and item activation. Items are activated with double click
 * (single click in navigation mode) or the Enter key.
 * When activated the activate callback is called. This can be used to perform an action such as opening a dialog
 * or navigating.</p>
 *
 * <p>The expected markup (for best accessibility) is a <code class="prettyprint">&lt;ul></code>
 * (or <code class="prettyprint">&lt;ol></code>) containing <code class="prettyprint">&lt;li></code> elements,
 * however it only depends on a single parent element where all the children are the items.
 * The initially selected item(s) can be indicated by giving the item(s) a class of
 * <code class="prettyprint">is-selected</code>. The contents of the item is mostly of no concern to this widget but
 * typically include an icon and a label. The contents should not overflow (spill outside of) the item. The item
 * content cannot have interactive elements such as inputs or buttons.</p>
 *
 * <h3 id="selection-section">Navigation Mode
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#nav-mode-section"></a>
 * </h3>
 * <p>As an alternative to selection an iconList has a navigation mode where the list items are essentially links.
 * A single click on the item will activate it. This is controlled with the {@link iconList#navigation} option.
 * If the item is or contains an anchor the default behavior for activation is to navigate
 * to the <code class="prettyprint">href</code> value. (only one anchor per item is allowed.) When used for
 * navigation the widget should be wrapped in an element with role navigation.</p>
 *
 * <h3 id="selection-section">Selection
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#selection-section"></a>
 * </h3>
 * <p>An iconList can support single or multiple selection. See option {@link iconList#multiple}.</p>
 * <p>It is also possible to include a checkbox for multiple selection using the {@link iconList#itemSelector} option.
 * The item markup can include <code class="prettyprint">&lt;span class="u-selector">&lt;/span></code>
 * if checkbox selection is desired. Must also set option <code class="prettyprint">itemSelector</code> to true.
 * If the markup doesn't contain this u-selector span then it can be added for you if option
 * {@link iconList#addItemSelector} is true.</p>
 *
 * <p>On a touch enabled device where the user has interacted with touch a multi select iconList will
 * automatically enable checkbox selection.</p>
 *
 * <p>Like options in a select element the option items can have a value using the data-value attribute.</p>
 *
 * <h3 id="context-menus-section">Context Menus
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#context-menus-section"></a>
 * </h3>
 * <p>The iconList has easy integration with the {@link menu} widget to provide context menu support.
 * The {@link iconList#contextMenu} option is used to provide a {@link menu} widget options object.
 * When the <code class="prettyprint">contextMenu</code> option is used the {@link menu#event:beforeOpen} event/callback ui argument has these
 * additional properties:</p>
 * <ul>
 * <li>menuElement: The menu jQuery object.</li>
 * <li>iconList: This iconList jQuery object.</li>
 * <li>selection: A jQuery object with the selected items at the time the menu was opened.</li>
 * </ul>
 * <p>Also the {@link menu#event:afterClose} event/callback will automatically focus the iconList if the menu action
 * didn't take the focus and the ui argument has these additional properties:
 * <ul>
 * <li>menuElement: The menu jQuery object.</li>
 * <li>iconList: This iconList jQuery object.</li>
 * </ul>
 *
 * <p>If using the <code class="prettyprint">contextMenu</code> option the {@link iconList#contextMenuId}
 * option can be used to give the menu element an ID.
 * This is useful if other code must refer to the menu element or widget.</p>
 *
 * <p>You can reference an already existing {@link menu} widget by specifying the {@link iconList#contextMenuId}
 * in place of the {@link iconList#contextMenu} option.</p>
 *
 * <p>If for any reason you don't want to use the {@link menu} widget, the {@link iconList#contextMenuAction} option
 * allows you to respond to mouse or keyboard interactions that typically result in a context menu.
 * Specifically Right Mouse click (via <code class="prettyprint">contextmenu</code> event),
 * Shift-F10 key (via <code class="prettyprint">keydown</code> event) and the
 * Windows context menu key (via <code class="prettyprint">contextmenu</code> event).
 * The original event is passed to the {@link iconList#contextMenuAction} function.
 * The event object can be used to position the menu. If you implement your own menu it is best if you put focus
 * back on the iconList using the {@link iconList#focus} method when the menu closes (unless the menu action directs focus
 * elsewhere).</p>
 *
 * <p>Only one of {@link iconList#contextMenuAction} and {@link iconList#contextMenu} or {@link iconList#contextMenuId}
 * can be specified.
 * The {@link iconList#contextMenu} and {@link iconList#contextMenuId} options can only be set when the iconList is
 * initialized and it can't be changed. The {@link iconList#contextMenuAction} cannot be set if the
 * {@link iconList#contextMenu} or {@link iconList#contextMenuId} options were given when the iconList was created.
 * </p>
 *
 * <h3 id="context-menus-section">Accessibility
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#accessibility-section"></a>
 * </h3>
 * <p>For accessibility the iconList should be labeled by using the <code class="prettyprint">aria-labelledby</code>
 * attribute to point to an element that contains the label. The widget will append text for screen readers only that
 * indicates the number of rows and columns. For best accessibility when used for navigation the markup should be a
 * <code class="prettyprint">&lt;div></code> with anchor (<code class="prettyprint">&lt;a></code>) children
 * as shown in second example in the initializer section.</p>
 *
 * <p>For accessibility make sure that any images or icons used in the items have a text alternative if appropriate.</p>
 *
 * <h3 id="keyboard-section">
 *   Keyboard End User Information
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#keyboard-section"></a>
 * </h3>
 * <table>
 * <thead>
 * <tr><td>Key</td><td>Action</td></tr>
 * </thead>
 * <tbody>
 * <tr><td>Up Arrow</td>             <td>Move focus to the item in the current column of the previous row.</td></tr>
 * <tr><td>Down Arrow</td>           <td>Move focus to the item in the current column of the next row.</td></tr>
 * <tr><td>Right Arrow</td>          <td>Move focus to the next item in the current row wrapping to the next row at the end.</td></tr>
 * <tr><td>Left Arrow</td>           <td>Move focus to the previous item in the current row wrapping to the previous row at the start.</td></tr>
 * <tr><td>Home</td>                 <td>Move focus to the first item.</td></tr>
 * <tr><td>End</td>                  <td>Move focus to the last item.</td></tr>
 * <tr><td>Space</td>                <td>Selects the focused item.</td></tr>
 * <tr><td>Enter</td>                <td>Activates the selected items.</td></tr>
 * <tr><td>printable characters</td> <td>Sets focus to the next item with a label that starts with the typed character(s).</td></tr>
 * <tbody>
 * <table>
 * <p>Typically when an item receives focus it is also selected. For a multiple selection iconList the Shift and Ctrl
 * modifier keys can be used in combination with the home, end, and arrow keys to affect the selection.
 * The Shift key extends the selection to include the items between the anchor item (the first single item selected)
 * and the current focused item. The Ctrl key moves the focus without affecting the selection.
 * The Space key can then be used to select the focused item or Ctrl+Space to toggle the item selection.</p>
 *
 * @desc Creates an iconList widget.
 *
 * @param {Object} options A map of option-value pairs to set on the widget.
 *
 * @example <caption>Create a simple iconList for selecting multiple items.</caption>
 * HTML:
 * <h3 id="iconsLabel">My Icons</h3>
 * <ul id="icons1" aria-labelledby="iconsLabel">
 *     <li data-value="b"><span class="fa fa-bus"></span><span class="label">Bus</span></li>
 *     <li class="is-selected" data-value="c"><span class="fa fa-car"></span><span class="label">Car</span></li>
 *     <li data-value="t"><span class="fa fa-taxi"></span><span class="label">Taxi</span></li>
 *     ...
 * </ul>
 * JavaScript:
 * $("#icons1").iconList({
 *     multiple: true
 * });
 *
 * @example <caption>This example creates an iconList for navigation. In this example #navList is the element that
 * becomes the iconList widget.</caption>
 * HTML:
 * <h2 id="mainNav">Main Site Navigation</h2>
 * <div role="navigation">
 *   <div id="navList" aria-labelledby="mainNav">
 *       <a href="...">...</a>
 *       ...
 *   </div>
 * </div>
 * JavaScript:
 * $("#navList").iconList({
 *     navigation: true
 * });
 */
 /*
 * Other use cases currently out of scope are:
 * - draggable items. This can be accomplished external to this widget
 * - tooltips. This can be accomplished external to this widget.
 * - add/remove/rename item functionality
 * - sortable items
 * - hidden or disabled items
 * - rubber band selection
 * - items with interactive content such as a input field
 *
 * Future:
 *  Consider above use cases
 *  Consider option to set number of columns
 *  Consider select by row, column. Consider get row, column for item
 *  Consider getValue(item$) method
 *
 * Depends:
 *    jquery.ui.core.js
 *    jquery.ui.widget.js
 *    apex/lang.js
 *    apex/debug.js
 *    apex/navigation.js (for navigation support)
 *    apex/widget.js
 *    (the following are for context menu integration)
 *    jquery.ui.position.js
 *    apex/widget.menu.js
 */
/*global apex*/
(function ( debug, clipboard, lang, util, $ ) {
    "use strict";

    var C_ICON_LIST = "a-IconList",
        C_LIST_ITEM = "a-IconList-item",
        SEL_LIST_ITEM = "." + C_LIST_ITEM,
        C_SELECTOR = "u-selector",
        C_SELECTOR_SINGLE = C_SELECTOR + " " + C_SELECTOR + "--single",
        SEL_SELECTOR = "." + C_SELECTOR,
        C_SELECTED = "is-selected",
        SEL_SELECTED = "." + C_SELECTED,
        SEL_SELECTED_ITEM = SEL_SELECTED + SEL_LIST_ITEM,
        C_FOCUSED = "is-focused",
        C_DISABLED = "is-disabled",
        ARIA_SELECTED = "aria-selected",
        ARIA_MULTI = "aria-multiselectable",
        ARIA_LABELLEDBY = "aria-labelledby",
        A_ROLE = "role",
        A_TABINDEX = "tabindex",
        C_RTL = "u-RTL";

    var keys = $.ui.keyCode,
        gIdCounter = 0;

    function domIndex( el$ ) {
        return el$.parent().children().index( el$ );
    }

    function getItemFocusable( item$ ) {
        var a$ = item$.find("a");
        if ( a$.length ) {
            return a$[0];
        }
        return item$[0];
    }

    // use debounce (timer) to make sure the focus happens first and also throttle rapid changes from keyboard navigation.
    var notify = function( iconList, event ) {
            iconList._trigger( "selectionChange", event );
        },
        notifyDelay = util.debounce( notify, 1 ),
        notifyLongDelay = util.debounce( notify, 350 );

    /*
     * todo doc this data transfer format writer interface when option dataTransferFormats is documented
     */
    var textFormatWriterPrototype = {
        begin: function( /*selection$*/ ) {
            this.text = "";
        },
        item: function( item$, index, text ) {
            if ( index > 0 ) {
                this.text += "\r\n";
            }
            this.text += text;
        },
        end: function() {
        },
        toString: function() {
            return this.text;
        }
    };
    var htmlFormatWriterPrototype = {
        begin: function( /*selection$*/ ) {
            this.text = "<ul>\r\n";
        },
        item: function( item$, index, text ) {
            this.text += "<li>" + util.escapeHTML( text ) + "</li>\r\n";
        },
        end: function() {
            this.text += "</ul>\r\n"
        },
        toString: function() {
            return this.text;
        }
    };

    $.widget( "apex.iconList", $.extend( true,
        /**
         * @lends iconList.prototype
         */
        {
        version: "18.1",
        widgetEventPrefix: "iconlist",
        options: {
            /**
             * <p>If true multiple items can be selected. If false at most one item can be selected.</p>
             * <p>Must be false when navigation option is true.</p>
             *
             * @memberof iconList
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example true
             */
            multiple: false,
            /**
             * <p>If true a selector control is added before the item icon and label. The selector is a checkbox
             * if multiple is true and a radio button if multiple is false. The iconList markup must include the
             * necessary markup for the checkbox selector if {@link iconList#addItemSelector} is false. See
             * {@link iconList#addItemSelector} for the needed markup.</p>
             *
             * @memberof iconList
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example true
             */
            itemSelector: false,
            /**
             * <p>If {@link iconList#itemSelector} option is true and the initial iconList markup does not include the markup
             * needed to show the selector then this option should be set to true so that the markup is automatically added.</p>
             * <p>This is ignored if {@link iconList#itemSelector} is false.</p>
             * <p>The markup to show the checkbox selector is:<br/>
             * <code class="prettyprint">&lt;span class="u-selector">&lt;/span></code><br/>
             * The markup to show the radio button selector (used when multiple is false) is:<br/>
             * <code class="prettyprint">&lt;span class="u-selector u-selector--single">&lt;/span></code><br/>
             * </p>
             *
             * @memberof iconList
             * @instance
             * @type {boolean}
             * @default true
             * @example false
             * @example false
             */
            addItemSelector: true, // only applies if itemSelector is true
            /**
             * <p>This option only applies to the type to select feature.
             * It is a jQuery selector for finding the label text of an item or true to use the text of the item
             * or false to disable type to search.</p>
             *
             * @memberof iconList
             * @instance
             * @type {boolean|string}
             * @default true
             * @example "myIconLabel"
             * @example false
             */
            label: true,
            /**
             * <p>When true changes the mode of widget to navigation otherwise the mode is selection.
             * This option can't be changed after create.</p>
             *
             * @memberof iconList
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example true
             */
            navigation: false,
            /**
             * <p>If true the selection can be copied to the clipboard using the browsers copy event.</p>
             *
             * @memberof iconList
             * @instance
             * @type {boolean}
             * @default true
             * @example false
             * @example false
             */
            allowCopy: true,

            /**
             * todo consider doc in future
             * @ignore
             */
            dataTransferFormats: [
                {
                    format: "text/plain",
                    writer: Object.create( textFormatWriterPrototype )
                },
                {
                    format: "text/html",
                    writer: Object.create( htmlFormatWriterPrototype )
                }
            ],

            // events:
            /**
             * Triggered when the selection state changes. It has no additional data.
             *
             * @event selectionchange
             * @memberof iconList
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             *
             * @example <caption>Initialize the iconList with the <code class="prettyprint">selectionChange</code> callback specified:</caption>
             * $( ".selector" ).iconList({
             *     selectionChange: function( event ) {}
             * });
             *
             * @example <caption>Bind an event listener to the <code class="prettyprint">iconlistselectionchange</code> event:</caption>
             * $( ".selector" ).on( "iconlistselectionchange", function( event ) {} );
             */
            selectionChange: null, // function( event )
            // This event is fired when ,
            /**
             * Triggered when item(s) are activated with Enter key or double click (single click in navigation mode).
             *
             * @event activate
             * @memberof iconList
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             * @property {object} data Additional data for the event.
             * @property {string[]} data.values An array of selected values. See {@link iconList#getSelectionValues}
             *
             * @example <caption>Initialize the iconList with the <code class="prettyprint">activate</code> callback specified:</caption>
             * $( ".selector" ).iconList({
             *     activate: function( event, data ) {}
             * });
             *
             * @example <caption>Bind an event listener to the <code class="prettyprint">iconlistactivate</code> event:</caption>
             * $( ".selector" ).on( "iconlistactivate", function( event, data ) {} );
             */
            activate: null
        },
        columns: 0,
        rows: 0,
        forwardKey: keys.RIGHT,
        backwardKey: keys.LEFT,
        searchString: "",
        searchTimerId: null,

        _create: function () {
            var id, label$,
                self = this,
                o = this.options,
                ctrl$ = this.element;

            if ( o.navigation ) {
                o.multiple = false;
            }

            ctrl$.addClass( C_ICON_LIST )
                .attr( A_ROLE, "listbox" );

            if ( o.multiple ) {
                ctrl$.attr( ARIA_MULTI, "true" );
            }
            if ( ctrl$.css( "direction" ) === "rtl" ) {
                ctrl$.addClass( C_RTL );
                this.forwardKey = keys.LEFT;
                this.backwardKey = keys.RIGHT;
            }

            if ( !ctrl$.attr( ARIA_LABELLEDBY ) ) {
                this.infoId = ( ctrl$.attr( "id" ) || "il" + (gIdCounter++) ) + "_info";
                ctrl$.before("<span id='" + this.infoId + "' class='u-VisuallyHidden'></span>");
                ctrl$.attr( ARIA_LABELLEDBY, this.infoId );
                this.addedLabel = true;
            } else {
                label$ = $("#" + ctrl$.attr( ARIA_LABELLEDBY ).split( " " ).join( ",#" ) ).last();
                this.infoId = label$.attr( "id" ) + "_info";
                label$.append("<span id='" + this.infoId + "' class='u-VisuallyHidden'></span>");
            }

            this._initContextMenu( C_LIST_ITEM, function( event ) {
                // no condition where context menu isn't allowed
                return false;
            }, function( event ) {
                var el = ( event.type === "keydown" && self.lastFocused ) ? self.lastFocused : event.target,
                    item$ = $( el ).closest( SEL_LIST_ITEM );

                if ( item$.length ) {
                    // if target not selected then select it
                    if ( !item$.hasClass( C_SELECTED ) ) {
                        return item$;
                    }
                    return true;
                }
                return false;
            } );

            this._on( this._eventHandlers );

            if ( o.allowCopy ) {
                clipboard.addHandler( ctrl$[0], function( dataTransfer ) {
                    self._copy( dataTransfer );
                    return true;
                });
            }

            this.refresh();
            if ( o.disabled ) {
                this._setOption( "disabled", o.disabled );
            }
        },

        _eventHandlers: {
            resize: function( event ) {
                if (event.target !== this.element[0]) {
                    return;
                }
                this._dim();
                event.stopPropagation();
            },
            click: function ( event ) {
                var item$,
                    o = this.options,
                    navigation = o.navigation,
                    target$ = $( event.target );

                // in navigation mode ignore shift and ctrl click on anchors to let the browser do its thing
                if ( navigation && target$.closest( "a" ).length > 0 && (event.shiftKey || event.ctrlKey) ) {
                    return;
                }

                item$ = target$.closest( SEL_LIST_ITEM );
                if ( item$.length ) {
                    if ( o.itemSelector && target$.closest( SEL_SELECTOR ).length > 0 ) {
                        // always behave like toggle
                        event.ctrlKey = true;
                        event.shiftKey = false;
                    }
                    this._select( item$, event, true, false );
                    if ( navigation ) {
                        this._activate( event );
                    }
                    event.preventDefault();
                }
            },
            dblclick: function ( event ) {
                var item$;
                if ( !this.options.navigation ) {
                    item$ = $( event.target ).closest( SEL_LIST_ITEM );
                    if ( item$.length ) {
                        this._activate( event );
                    }
                }
            },
            mousedown: function ( event ) {
                event.preventDefault(); // this prevents text selection
            },
            keydown: function ( event ) {
                var pos, items$, index,
                    ctrl$ = this.element,
                    next$ = null,
                    kc = event.which;

                if ( kc === keys.HOME ) {
                    next$ = ctrl$.children().first();
                } else if ( kc === keys.END ) {
                    next$ = ctrl$.children().last();
                } else if ( kc === keys.DOWN ) {
                    if ( this.lastFocused ) {
                        pos = this._index2RowCol( domIndex( $( this.lastFocused ).closest( SEL_LIST_ITEM ) ));
                        items$ = ctrl$.children();
                        if ( pos.row < Math.floor( ( items$.length - 1 ) / this.columns ) ) {
                            index = this._rowCol2Index( pos.row + 1, pos.column );
                            if ( index >= items$.length ) {
                                index = items$.length - 1;
                            }
                            next$ = items$.eq( index );
                        }
                    }
                } else if ( kc === keys.UP ) {
                    if ( this.lastFocused ) {
                        pos = this._index2RowCol( domIndex( $( this.lastFocused ).closest( SEL_LIST_ITEM ) ));
                        items$ = ctrl$.children();
                        index = this._rowCol2Index( pos.row - 1, pos.column );
                        if ( index >= 0 ) {
                            next$ = items$.eq( index );
                        }
                        event.stopPropagation(); // Don't let a containing tab or accordion act on Ctrl+Up
                    }
                } else if ( kc === this.backwardKey ) {
                    if ( this.lastFocused ) {
                        next$ = $( this.lastFocused ).closest( SEL_LIST_ITEM ).prev();
                        if ( next$.length === 0 ) {
                            next$ = $( this.lastFocused ).closest( SEL_LIST_ITEM );
                        }
                    }
                } else if ( kc === this.forwardKey ) {
                    if ( this.lastFocused ) {
                        next$ = $( this.lastFocused ).closest( SEL_LIST_ITEM ).next();
                        if ( next$.length === 0 ) {
                            next$ = $( this.lastFocused ).closest( SEL_LIST_ITEM );
                        }
                    }
                } else if ( kc === keys.SPACE ) {
                    if ( this.lastFocused && !this.searchTimerId ) {
                        next$ = $( this.lastFocused ).closest( SEL_LIST_ITEM );
                    }
                } else if ( kc === keys.ENTER ) {
                    // for anchors wait for click event
                    if (  event.target.nodeName !== "A" ) {
                        this._activate( event );
                    }
                }
                if ( next$ ) {
                    this._select( next$, event, true, true );
                    event.preventDefault();
                }
            },
            keypress: function ( event ) {
                var ch, next$,
                    self = this;

                if ( event.which === 0 || !this.options.label || event.altKey || event.ctrlKey ) {
                    return;
                }

                // todo consolidate keypress handling code with tree view
                ch = String.fromCharCode( event.which ).toLowerCase();
                if ( this.searchTimerId ) {
                    // a character was typed recently
                    // if it is the same character just look for the next item that starts with the letter
                    if ( ch !== this.searchString ) {
                        // otherwise add to the search string
                        this.searchString += ch;
                    }
                    clearTimeout( this.searchTimerId );
                    this.searchTimerId = null;
                } else {
                    // a character hasn't been typed in a while so search from the beginning
                    if ( ch === " " ) {
                        return;
                    }
                    this.searchString = ch;
                }
                this.searchTimerId = setTimeout( function () {
                    self.searchTimerId = null;
                }, 500 );

                next$ = this._findItem( this.searchString );
                if ( next$ ) {
                    this._select( next$, event, true, true );
                }
            },
            focusin: function ( event ) {
                var item$ = $( event.target ).closest( SEL_LIST_ITEM );
                if ( item$.length === 0 ) {
                    return;
                }
                item$.addClass( C_FOCUSED );
                this._setFocusable( event.target );
            },
            focusout: function ( event ) {
                var item$ = $( event.target ).closest( SEL_LIST_ITEM );
                item$.removeClass( C_FOCUSED );
            }
        },

        _destroy: function() {
            var ctrl$ = this.element,
                o = this.options;

            ctrl$.removeClass( C_ICON_LIST + " " + C_DISABLED + " " + C_RTL )
                .removeAttr( A_ROLE )
                .removeAttr( ARIA_MULTI )
                .children().removeClass( C_LIST_ITEM )
                    .removeAttr( A_ROLE )
                    .removeAttr( ARIA_SELECTED )
                    .removeAttr( A_TABINDEX);

            ctrl$.find("a").removeAttr( A_TABINDEX ).removeAttr( A_ROLE );
            if ( o.itemSelector && o.addItemSelector ) {
                ctrl$.find( SEL_SELECTOR ).remove();
            }

            clipboard.removeHandler( ctrl$[0] ); // no problem if had not been added

            this._destroyContextMenu();

            $( "#" + this.infoId ).remove();
            if ( this.addedLabel ) {
                ctrl$.removeAttr( ARIA_LABELLEDBY );
            }
        },

        _setOption: function ( key, value ) {
            var o = this.options,
                ctrl$ = this.element;

            this._checkContextMenuOptions( key, value );

            if ( key === "multiple" ) {
                if ( o.navigation ) {
                    value = false;
                }
            } else if ( key === "allowCopy" || key === "addItemSelector" || key === "navigation" ) {
                throw new Error( "IconList " + key + " option cannot be set" );
            }
            this._super( key, value );

            if ( key === "disabled" ) {
                ctrl$.toggleClass( C_DISABLED + " ui-state-disabled", value )
                    .attr( "aria-disabled", value );

                if ( this.lastFocused ) {
                    if ( value ) {
                        this.lastFocused.tabIndex = -1;
                    } else {
                        this._setFocusable( this.lastFocused );
                    }
                }
                if ( value ) {
                    // when enabling make sure it has the correct dimensions in case it was resized while disabled
                    this._dim();
                }
            } else if ( key === "multiple" ) {
                if ( value ) {
                    ctrl$.attr( ARIA_MULTI, "true" );
                } else {
                    ctrl$.removeAttr( ARIA_MULTI );
                }
            } else if ( key === "itemSelector" ) { // xxx does being able to change this make sense?
                this.refresh();
            }
        },

        /**
         * <p>Call refresh if the contents of the list changes or if the size of the container changes.</p>
         * @example <caption>Call the refresh method.</caption>
         * $( ".selector" ).iconList( "refresh" );
         */
        refresh: function() {
            var sel$, selector$, items$,
                o = this.options,
                ctrl$ = this.element;

            if ( o.multiple && !o.itemSelector && apex.userHasTouched() ) {
                // make multiple selection easier/possible on touch devices
                o.itemSelector = true;
                o.addItemSelector = true;
            }

            // the focusable items (the options) are either the child items themselves or an anchor if the item has an anchor
            ctrl$.find( "a" ).attr( A_TABINDEX, -1 ).attr( A_ROLE, "option" );

            items$ = ctrl$.children();
            items$.addClass( C_LIST_ITEM )
                // if the item has no anchor child then make it focusable and add the option role
                .filter( function() { return $( this ).find( "a" ).length === 0; } )
                    .attr( A_ROLE, "option" )
                    .attr( A_TABINDEX, -1 );

            if ( o.addItemSelector ) {
                // if want a selector (typically for multiple selection) and not already part of the markup add it.
                if ( o.itemSelector ) {
                    selector$ = $( "<span class='" + ( o.multiple ? C_SELECTOR : C_SELECTOR_SINGLE ) + "'></span>");
                    items$.filter( function() { return $( this ).find( SEL_SELECTOR ).length <= 0; } ).prepend( selector$ );
                } else {
                    // otherwise remove what may have been added
                    ctrl$.find( SEL_SELECTOR ).remove();
                }
            }

            this._dim();

            sel$ = ctrl$.find( SEL_SELECTED_ITEM );
            if ( sel$.length > 0 ) {
                this.setSelection(sel$, false);
            } else {
                if ( !this.lastFocused || !$( this.lastFocused ).is( ":visible" ) ) {
                    this.lastFocused = getItemFocusable( ctrl$.children().first() );
                }
                this.selectAnchor = this.lastFocused;
                if ( this.lastFocused && !o.disabled ) {
                    this._setFocusable( this.lastFocused );
                }
            }
        },

        /**
         * <p>This method must be called if the size of the container changes so that the rows and columns can
         * be recalculated.</p>
         * @example <caption>Call the resize method.</caption>
         * $( ".selector" ).iconList( "resize" );
         */
        resize: function() {
            this._dim();
        },

        /**
         * <p>Set focus to the iconList. The item that last had focus is focused or if no item had focus the
         * first item is focused.</p>
         * @example <caption>Focus the iconList.</caption>
         * $( ".selector" ).iconList( "focus" );
         */
        focus: function() {
            if ( this.lastFocused ) {
                this.lastFocused.focus();
            }
        },

        /**
         * <p>Returns the number of columns in the iconList.</p>
         * @returns {number} The number of columns.
         * @example <caption>Get the number of columns currently displayed by the iconList.</caption>
         * var columns = $( ".selector" ).iconList( "getColumns" );
         */
        getColumns: function() {
            return this.columns;
        },

        /**
         * <p>Returns the number of rows in the iconList.</p>
         * @returns {number} The number of rows.
         * @example <caption>Get the number of rows currently displayed by the iconList.</caption>
         * var rows = $( ".selector" ).iconList( "getRows" );
         */
        getRows: function() {
            return this.rows;
        },

        /**
         * <p>Returns the set of selected items. If there is no selection the empty set is returned.</p>
         *
         * @return {jQuery} jQuery object with the set of selected items.
         * @example <caption>Get the currently selected items.</caption>
         * var selection$ = $( ".selector" ).iconList( "getSelection" );
         */
        getSelection: function() {
            return this.element.find( SEL_SELECTED_ITEM );
        },

        /**
         * <p>Returns the values, from the data-value attributes, of all the selected items.
         * If there is no selection an empty array is returned.</p>
         *
         * @return {string[]} Array of selected values.
         * @example <caption>Get the currently selected values and convert them to a ":" separated string.</caption>
         * var values = $( ".selector" ).iconList( "getSelectionValues" ),
         *     result = values.join( ":" );
         */
        getSelectionValues: function() {
            var values = [];

            this.getSelection().each( function() {
                values.push( $( this ).attr( "data-value" ) );
            });
            return values;
        },

        /**
         * <p>Sets the iconList selection.</p>
         *
         * @param {jQuery} pItems$ A jQuery object with the items to select.
         *   An empty jQuery set will clear the selection.
         * @param {boolean} [pFocus] If true the first item in <code class="prettyprint">pItems$</code> will be focused.
         * @param {boolean} [pNoNotify] If true the selection change event will be suppressed.
         * @example <caption>This example selects the items with values "a", "b", and "c".</caption>
         * $( ".selector" ).iconList( "setSelection", $( "a:b:c".split( ":" ).map( function(v) {
         *     return "[data-value='" + v + "']";
         * } ).join( "," ) ) );
         */
        setSelection: function( pItems$, pFocus, pNoNotify ) {
            pFocus = !!pFocus;
            this._select( pItems$, null, pFocus, false, pNoNotify );
        },

        // todo consider setSelectionValues method

        _copy: function( pDataTransfer ) {
            var i, i$,
                selection$ = this.getSelection(),
                fmts = this.options.dataTransferFormats;

            if ( !selection$.length ) {
                return;
            }
            fmts.forEach(function( x ) {
                x.writer.begin( selection$ );
            } );
            for ( i = 0; i < selection$.length; i++ ) {
                i$ = selection$.eq(i);
                fmts.forEach(function( x ) {
                    x.writer.item( i$, i, i$.text() ); // todo consider if this should use the label option
                } );
            }
            fmts.forEach(function( x ) {
                x.writer.end();
                pDataTransfer.setData( x.format, x.writer.toString() );
            } );
        },

        _rowCol2Index: function( row, column ) {
            return row * this.columns + column;
        },

        _index2RowCol: function( index ) {
            var row = Math.floor( index / this.columns );
            return { row: Math.floor( index / this.columns ), column: index - ( row * this.columns ) };
        },

        _dim: function() {
            var y, label, itemWidth,
                self = this,
                ctrl$ = this.element,
                width = ctrl$.width(),
                items$ = ctrl$.children(),
                length = items$.length;

            if ( length ) {
                y = items$.first().position().top;
                itemWidth = items$.first().outerWidth();
            }

            this.columns = length;
            items$.each( function( index ) {
                var top = $( this ).position().top;
                if ( top > y ) {
                    y = top;
                    self.columns = index;
                    return false;
                }
            });
            if ( length > 0 ) {
                this.rows = Math.floor( ( length + this.columns - 1 ) / this.columns ) ;
            } else {
                this.rows = 0;
            }
            if ( this.rows === 1 ) {
                // it could be that there are more potential columns than items
                this.columns = Math.floor( width / itemWidth );
            }
            label = lang.formatMessage("APEX.ICON_LIST.GRID_DIM", this.columns, this.rows);
            $( "#" + this.infoId ).text( label );
        },

        _findItem: function( search ) {
            var text, next$, start$,
                ctrl$ = this.element,
                slen = search.length,
                labelSelector = this.options.label;

            next$ = start$ = $( this.lastFocused ).closest( SEL_LIST_ITEM );
            if ( slen === 1 ) {
                next$ = next$.next();
            }
            if ( next$.length === 0 ) {
                next$ = ctrl$.children().first();
            }
            while ( next$.length > 0 ) {
                if ( labelSelector === true ) {
                    text = next$.text();
                } else {
                    text = next$.find( labelSelector ).text();
                }
                if ( text.substring( 0, slen ).toLowerCase() === search ) {
                    return next$;
                }
                next$ = next$.next();
                if ( next$.length === 0 ) {
                    next$ = ctrl$.children().first();
                }
                if ( next$[0] === start$[0] ) {
                    break;
                }
            }
            return null;
        },

        _setFocusable: function ( el ) {
            if ( this.lastFocused && this.lastFocused !== el ) {
                this.lastFocused.tabIndex = -1;
            }
            el.tabIndex = 0;
            this.lastFocused = el;
        },

        _activate: function ( event ) {
            var sel$, href;

            this._trigger( "activate", event, { values: this.getSelectionValues() } );
            if ( this.options.navigation && !event.isDefaultPrevented() ) {

                sel$ = this.getSelection();
                href = sel$.attr( "href" ) || sel$.find( "a" ).attr( "href" );
                if ( href ) {
                    event.preventDefault();
                    apex.navigation.redirect( href );
                }
            }
        },

        _select: function ( items$, event, focus, delayTrigger, noNotify ) {
            var prevSelected, offset, sp, spOffset, glOffset, start, end, temp, toFocus,
                action = "set",
                self = this,
                ctrl$ = this.element,
                o = this.options,
                prevSel$ = ctrl$.find( SEL_SELECTED_ITEM );

            // can't select something that isn't visible
            items$ = items$.filter( ":visible" );

            if ( event && o.multiple ) {
                if ( event.type === "click" ) {
                    // control+click for Windows and command+click for Mac
                    if ( event.ctrlKey || event.metaKey ) {
                        action = "toggle";
                    } else if ( event.shiftKey ) {
                        action = "range";
                    }
                } else if ( event.type === "keydown" ) {
                    // Mac has no concept of toggle with the keyboard
                    if ( event.keyCode === $.ui.keyCode.SPACE ) {
                        if ( event.ctrlKey ) {
                            action = "toggle";
                        } else if ( event.shiftKey ) {
                            action = "range";
                        } else {
                            action = "add";
                        }
                    } else if ( event.ctrlKey ) {
                        action = "none";
                    } else if ( event.shiftKey ) {
                        action = "range";
                    }
                }
            }

            if ( action === "range" && !this.selectAnchor ) {
                action = "set"; // when there is no anchor turn range selection into set
            }

            // clear out previous selection if needed
            if ( action === "set" || action === "range" ) {
                prevSel$.removeClass( C_SELECTED ).removeAttr( ARIA_SELECTED )
                    .find( SEL_SELECTOR ).removeClass( C_SELECTED );
            }

            // perform selection action
            prevSelected = items$.hasClass( C_SELECTED );
            if ( action === "set" ||  action === "add" || (action === "toggle" && !prevSelected) ) {
                items$.addClass( C_SELECTED ).attr( ARIA_SELECTED, true )
                    .find( SEL_SELECTOR ).addClass( C_SELECTED );
                this.selectAnchor = items$[0];
            } else if ( action === "range" ) {
                ctrl$.children().removeClass( C_SELECTED ).removeAttr( ARIA_SELECTED )
                    .find( SEL_SELECTOR ).removeClass( C_SELECTED );
                start = domIndex( $( this.selectAnchor));
                end = domIndex( items$.last() );
                if ( start > end ) {
                    temp = end;
                    end = start;
                    start = temp;
                }
                ctrl$.children().filter(function(index) {
                    return index >= start && index <= end;
                } ).addClass( C_SELECTED ).attr( ARIA_SELECTED, true )
                    .find( SEL_SELECTOR ).addClass( C_SELECTED );
            } else if ( action === "toggle" && prevSelected ) {
                items$.removeClass( C_SELECTED ).removeAttr( ARIA_SELECTED )
                    .find( SEL_SELECTOR ).removeClass( C_SELECTED );
                this.selectAnchor = items$[0];
            }

            // focus if needed
            if ( items$.length > 0 ) {
                toFocus = getItemFocusable( items$.first() );
                if ( focus ) {
                    toFocus.tabIndex = 0;
                    toFocus.focus();
                } else {
                    this._setFocusable( toFocus );
                }
                // scroll into view if needed
                sp = ctrl$.scrollParent();
                if ( sp[0] === document ) {
                    spOffset = { left: 0, top: 0 };
                } else {
                    spOffset = sp.offset();
                }
                if ( spOffset ) {
                    glOffset = ctrl$.offset();
                    offset = items$.first().offset();
                    // Don't use scrollIntoView because it applies to all potentially scrollable ancestors, we only
                    // want to scroll within the immediate scroll parent.
                    // Chrome scrolls parents other than the immediate scroll parent even though it seems that it shouldn't
                    if ( ( offset.top < spOffset.top ) || ( offset.top > spOffset.top + sp[0].offsetHeight ) ) {
                        sp[0].scrollTop = offset.top - glOffset.top;
                    }
                    if ( ( offset.left + items$[0].offsetWidth < spOffset.left ) || ( offset.left > spOffset.left + sp[0].offsetWidth ) )  {
                        sp[0].scrollLeft = offset.left - glOffset.left;
                    }
                }
            }

            // don't fire selection change for click events when in navigation mode
            if ( noNotify || ( o.navigation && event && event.type === "click" ) ) {
                return;
            }

            // notify if needed
            if ( action === "toggle" ||
                (action === "range" && !prevSelected) ||
                (action === "add" && !prevSelected) ||
                (action === "set" && !util.arrayEqual( prevSel$, items$ ) ) ) {

                delayTrigger ? notifyLongDelay( self, event ) : notifyDelay( self, event );
            }
        }

    }, apex.widget.contextMenuMixin ) );

})( apex.debug, apex.clipboard, apex.lang, apex.util, apex.jQuery );
