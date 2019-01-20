/*!
 Copyright (c) 2015, 2018, Oracle and/or its affiliates. All rights reserved.
*/
/*
 * There are two widgets in this file:
 *  tableModelViewBase - the base widget
 *  tableModelView - simple view for list or table rendering based on a template
 */
/**
 * @uiwidget tableModelViewBase
 * @abstract
 * @since 5.1
 *
 * <p>This is a base widget that supports pagination over a {@link model} as well as base support for model editing.
 * It is not intended to be used directly. The examples may use a specific derived widget such as grid or
 * a generic "derived-view". See the {@link grid} and {@link tableModelView} widgets.</p>
 *
 * <p>Any widget that uses column items to edit a model can benefit from the editing support in this base widget.
 * Even if this base widget isn't used similar logic should be implemented for initializing column items,
 * setting model values from the column items, setting column item values from the model, rendering read only
 * view of model field values, and triggering the {@link apex.event:apexbeginrecordedit} and
 * {@link apex.event:apexendrecordedit} events.</p>
 */
/* Todo:
 * - support persistSelection option from grid
 * - Control break rows don't count in the auto rows per page calculation and no way to know how many there will be so
 * end up with scroll bars. Consider if there is anyway to solve this. Meaning avoid nested scroll bars.
 *
 * Depends:
 *    jquery.ui.core.js
 *    jquery.ui.widget.js
 *    apex/util.js
 *    apex/lang.js
 *    apex/debug.js
 *    apex/model.js
 *    apex/item.js
 *    apex/widget.stickyWidget.js (only if stickyFooter is not false)
 */
/*global apex*/
(function ( util, model, debug, lang, item, $ ) {
    "use strict";

    // todo consider if class prefix should change for this base widget; change GV to ???, GRID to ???
    var C_GRID_NO_DATA = "a-GV-noDataMsg",
        C_GRID_MORE_DATA = "a-GV-moreDataMsg",
        C_GRID_ALT_MSG = "a-GV-altMessage",
        SEL_GRID_ALT_MSG = "." + C_GRID_ALT_MSG,
        C_GRID_ALT_MSG_TEXT = C_GRID_ALT_MSG + "-text",
        SEL_GRID_ALT_MSG_TEXT = "." + C_GRID_ALT_MSG_TEXT,
        C_GRID_ALT_MSG_ICON = C_GRID_ALT_MSG + "-icon",
        C_GRID_FOOTER = "a-GV-footer",
        C_GRID_HIDE_DELETED = "a-GV--hideDeleted",
        C_GRID_SCROLL_FILLER = "a-GV-scrollFiller",
        SEL_GRID_SCROLL_FILLER = "." + C_GRID_SCROLL_FILLER,
        C_DELETED = "is-deleted",
        SEL_DELETED = "." + C_DELETED,
        A_SELECTED = "aria-selected",
        C_ACTIVE = "is-active",
        C_SELECTED = "is-selected",
        C_EXPANDED = "is-expanded",
        SEL_SELECTED = "." + C_SELECTED,
        A_LBL_BY = "aria-labelledby",
        C_JS_TABBABLE = "js-tabbable",
        SEL_JS_TABBABLE = "." + C_JS_TABBABLE,
        SEL_TABBABLE = ":tabbable",
        DATA_START = "data-start",
        DATA_END = "data-end";

    var SCROLL_PAGE_CHECK = 300; // ms between check if paging needed

    /**
     * <p>This event is triggered when a {@link model} row/record is about to be edited (when a new row/record is
     * selected or enters edit mode).</p>
     *
     * @event apexbeginrecordedit
     * @memberof apex
     * @property {Event} event <code class="prettyprint">jQuery</code> event object.
     * @property {object} data Additional event data.
     * @property {model} data.model The {@link model} that is being edited.
     * @property {model.Record} data.record The record that is beginning to be edited.
     * @property {string} data.recordId The record id that is beginning to be edited.
     */
    /**
     * <p>This event is triggered when a {@link model} row/record is done being edited (when a new row/record is
     * selected or exits edit mode).</p>
     *
     * @event apexendrecordedit
     * @memberof apex
     * @property {Event} event <code class="prettyprint">jQuery</code> event object.
     * @property {object} data Additional event data.
     * @property {model} data.model The {@link model} that is being edited.
     * @property {model.Record} data.record The record that is done being edited.
     * @property {string} data.recordId The record id that is done being edited.
     */

    var EVENT_BEGIN_RECORD_EDIT = "apexbeginrecordedit",
        EVENT_END_RECORD_EDIT = "apexendrecordedit";

    // Because multiple widgets can share the same column items we use a cache to avoid having
    // to recreate the items multiple times. This assumes that item elements are not destroyed and recreated with the
    // same id. If they were the widgets using them would also need to be recreated.
    var gColumnItemCache = {};

    function getMessage( key ) {
        return lang.getMessage( "APEX.GV." + key );
    }

    function formatMessage( key ) {
        var args = Array.prototype.slice.call( arguments );
        args[0] = "APEX.GV." + key;
        return lang.formatMessage.apply( lang, args );
    }

    $.widget( "apex.tableModelViewBase",
        /**
         * @lends tableModelViewBase.prototype
         */
        {
        version: "18.1",
        widgetEventPrefix: "tableModelViewBase",
        options: {
            /**
             * <p>Name of model that this view widget will display data from. Can include an instance as well.
             * The model must already exist. This option is required. See {@link apex.model.create}
             * <code class="prettyprint">modelId</code> argument.</p>
             *
             * @memberof tableModelViewBase
             * @instance
             * @type {string}
             * @example [ "myModel", "1011" ]
             * @example "myModel"
             */
            modelName: null,
            /**
             * <p>Text to display when there is no data.</p>
             *
             * @memberof tableModelViewBase
             * @instance
             * @type {string}
             * @example "No employees found."
             * @example "No records found."
             */
            noDataMessage: null,
            /**
             * <p>Max records exceeded message to display if the server has more data than the configured maximum</p>
             * todo determine if this is needed and if so finish implementation
             * @ignore
             * @memberof tableModelViewBase
             * @instance
             * @type {string}
             */
            moreDataMessage: null,
            /**
             * <p>Determine if the view allows editing. If true the {@link model} must also allow editing but
             * if false the model could still allow editing.
             * If true the view data can be edited according to what the model allows. Only applies if the
             * view supports editing.</p>
             *
             * @memberof tableModelViewBase
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example true
             */
            editable: false,
            /**
             * <p>Specifies if a new record should be automatically added when the model doesn't contain any data.
             * If supported by the derived view a new record may be added when moving beyond the last record in the view
             * while editing.
             * Must only be true if the model and view are editable and the model allows adding records.</p>
             *
             * @memberof tableModelViewBase
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example true
             */
            autoAddRecord: false,
            /**
             * <p>This affects scrolling and how any header (if the view has a header) or footer position is handled.</p>
             *
             * <p>Set to true if the view is in a container that has a specific height defined. When hasSize is true
             * the record content will scroll within the bounds of the region.</p>
             * <p>Set to false if the view does not have a defined height. The view height will be as large as needed to
             * contain the view records as determined by pagination settings. The view may scroll within the browser
             * window. Other options may control if the header (if the view has a header) or footer sticks to the
             * window.
             * </p>
             * <p>The container width must always be defined.</p>
             *
             * @memberof tableModelViewBase
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             */
            // todo consider that this option should not be changed or if it is need to do a re-render refresh
            hasSize: false,
            /**
             * <p>Options object to pass to {@link apex.util.showSpinner}. The default depends on the
             * <code class="prettyprint">hasSize</code> option.</p>
             *
             * @memberof tableModelViewBase
             * @instance
             * @type {object}
             * @default { fixed: !options.hasSize }
             * @example null
             * @example null
             */
            progressOptions: null,
            /**
             * <p>Determine if the footer will stick to the bottom of the page. Only applies if
             * <code class="prettyprint">hasSize</code> is false and
             * <code class="prettyprint">footer</code> is true.
             * If false the footer will not stick to the bottom of the page.
             * If true the footer will stick to the bottom of the page.</p>
             *
             * @memberof tableModelViewBase
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example true
             */
            stickyFooter: false,
            /**
             * <p>Pagination settings.</p>
             *
             * @memberof tableModelViewBase
             * @instance
             * @type {object}
             * @property {boolean} scroll If true the scroll bar is used to page through the results a.k.a infinite
             *   scrolling or virtual paging. If false then next and previous buttons are shown. Default is false.
             * @property {boolean} loadMore If true show a load more button rather than auto paging.
             *   Only applies if <code class="prettyprint">scroll</code> is true and the model doesn't know the
             *   total rows. Default is false.
             * @property {boolean} showPageLinks If true show page links between buttons. Only applies if
             *   <code class="prettyprint">scroll</code> is false
             *   The model must know the total number of rows for this to be true. Default is false.
             * @property {number} maxLinks The maximum number of links to show when
             *   <code class="prettyprint">showPageLinks</code> is true. Default is 5.
             * @property {boolean} showPageSelector If true show a drop down page selector between the buttons.
             *   Only applies if <code class="prettyprint">scroll</code> is false.
             *   The model must know the total number of rows for this to be true. Default is false.
             * @property {boolean} showRange If true the range of rows/records is shown. It is shown between the
             *   buttons unless <code class="prettyprint">showPageLinks</code> or
             *   <code class="prettyprint">showPageSelector</code> is true. The range is shown as "X to Y" if the
             *   model doesn't know the total rows and "X to Y of Z" if the model does know the total number of rows.
             *   Default is true.
             * @property {boolean} firstAndLastButtons Only applies if <code class="prettyprint">scroll</code> is false.
             *   If true first and last buttons are included. For this to be true the model must know the total number of rows.
             * @example
             *     {
             *         scroll: false,
             *         showRange: true,
             *         showPageLinks: true,
             *         maxLinks: 6,
             *         firstAndLastButtons: true
             *     }
             *  @example {...}
             */
            pagination: {
                scroll: false,
                loadMore: false,
                showPageLinks: false,
                maxLinks: 5,
                showPageSelector: false,
                showRange: true,
                firstAndLastButtons: false
            },
            /**
             * <p>Defines highlight color information for the view. Only applies to views that support highlighting.
             * Style rules are injected into the document based on the highlight object.</p>
             * <p>The object is a mapping of highlight id to color definition.</p>
             *
             * @memberof tableModelViewBase
             * @instance
             * @type {object}
             * @property {object} * A highlight ID. A unique ID for the highlight rule. The object can contain
             *   any number of highlight rules. The {@link model} record or field <code class="prettyprint">highlight</code>
             *   metadata (see {@link model.RecordMetadata}) is used to associate the model data with the
             *   highlight rule. One of <code class="prettyprint">color</code> or
             *   <code class="prettyprint">background</code> must be given.
             * @property {number} *.seq A number that defines the order of the CSS rule that is added.
             * @property {boolean} *.row If true the highlight applies to the record/row.
             * @property {string?} *.color The foreground color. If given, must be a valid CSS color value.
             * @property {string?} *.background The background color. If given, must be a valid CSS color value.
             * @property {string?} *.cssClass The class name for the rule. This is the class used in the rule and
             *   given to the appropriate element in the view so that the desired highlight colors are applied.
             *   The cssClass defaults to the highlight id prefixed with "hlr_" if row is true and  "hlc_" otherwise.
             * @example
             *     {
             *         "hlid0001": {
             *             seq: 1,
             *             row: true,
             *             color: "#FF7755"
             *         },
             *         ...
             *     }
             * @example {...}
             */
            highlights: {},
            /**
             * <p>Determine how many rows to show in one page.
             * Only applies if <code class="prettyprint">pagination.scroll</code> is false,
             * otherwise this value is ignored. If null this value is determined by the viewport height
             * </p>
             *
             * @memberof tableModelViewBase
             * @instance
             * @type {number|null}
             * @default null
             * @example 50
             * @example 50
             */
            rowsPerPage: null,
            /**
             * <p>The text message key to use for showing the number of selected rows/records in the footer.
             * The message key must have exactly one parameter %0 which is replaced with the number of rows/records
             * selected.
             * </p>
             *
             * @memberof tableModelViewBase
             * @instance
             * @type {string}
             * @default "APEX.GV.SELECTION_COUNT"
             * @example "MY_SELECTION_MESSAGE"
             * @example "MY_SELECTION_MESSAGE"
             */
            selectionStatusMessageKey: "APEX.GV.SELECTION_COUNT",
            /**
             * <p>Determine if deleted rows (records) are removed from the view right away or shown with a visual effect
             * to indicate they are going to be deleted. If true (and the view is editable) deleted records will not be visible,
             * otherwise they are visible but have a visual indication that they are deleted. The actual records are not
             * deleted on the server until the model is saved. The visual effect is determined by CSS rules and is
             * typically strike through. See also {@link apex.model.create} <code class="prettyprint">onlyMarkForDelete</code> option.</p>
             *
             * @memberof tableModelViewBase
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example true
             */
            hideDeletedRows: false,
            /**
             * <p>Determine if the view will include a footer to show status and pagination controls and information.
             * If true a footer is shown at the bottom of the view. If false no footer is shown.</p>
             *
             * @memberof tableModelViewBase
             * @instance
             * @type {boolean}
             * @default true
             * @example false
             * @example false
             */
            footer: true,
            // todo useFixedRowHeight

            /**
             * Experimental; to be used for UT maximize region
             * Only applies if hasSize is false.
             * @ignore
             * @memberof tableModelViewBase
             * @instance
             * @type {Element}
             */
            scrollParentOverride: null
        },
        /*
         * Instance members added
         * model
         * modelName
         * modelViewId
         * pageOffset           starting record/row index of the current page
         * pageCount            number of records/rows in the current page
         * pageSize
         * noData               true when the view has no data because the model has no data, false otherwise
         * scrollPaging
         * footer$
         * pageRange$
         * pageSelector$
         * status$
         * stateIcons$
         * pageKey

         this.lastControlBreak = null;
         this.pageFirstOffset = "";
         this.pageLastOffset = "";
         controlBreakCollapsed
         renderInProgress
         *
         */

        //
        // Public pagination methods
        //

        /**
         * <p>Display the first page of records. If option <code class="prettyprint">pagination.scroll</code>
         * is true simply scrolls to the top of the viewport
         * and a new page of records is added if needed. If <code class="prettyprint">pagination.scroll</code>
         * is false and not already on the first page the view is refreshed and shows the first page.</p>
         *
         * @return {boolean} true for success, false if a page is currently being rendered.
         * @example <caption>This example goes to the first page.</caption>
         * $( ".selector" ).grid( "firstPage" );
         */
        firstPage: function() {
            var sp$;

            if ( this.renderInProgress ) {
                return false;
            } // else
            if ( this.options.pagination.scroll ) {
                sp$ = this.scrollParent$;
                sp$.scrollTop( this.scrollDelta );
            } else {
                if ( this.pageOffset > 0 ) {
                    this.pageOffset = 0;
                    this.refresh( false );
                }
            }
            return true;
        },

        /**
         * <p>Display the previous page of records. If <code class="prettyprint">pagination.scroll</code>
         * is true the viewport scrolls up one page and
         * records are added if needed. If <code class="prettyprint">pagination.scroll</code>
         * is false and not on the first page refresh the view to show the previous page.</p>
         *
         * @return {boolean} true for success, false if a page is currently being rendered.
         * @example <caption>This example goes to the previous page.</caption>
         * $( ".selector" ).grid( "previousPage" );
         */
        previousPage: function() {
            var sp$, st;

            if ( this.renderInProgress ) {
                return false;
            } // else
            if ( this.options.pagination.scroll ) {
                sp$ = this.scrollParent$;
                st = sp$.scrollTop() - this.scrollDelta - this.displayPageHeight;
                if ( st < 0 ) {
                    st = 0;
                }
                sp$.scrollTop( st + this.scrollDelta );
            } else {
                if ( this.pageOffset > 0 ) {
                    this.pageOffset -= this.pageSize;
                    if ( this.pageOffset < 0 ) {
                        this.pageOffset = 0;
                    }
                    this.refresh( false );
                }
            }
            return true;
        },

        /**
         * <p>Display the next page of records. If <code class="prettyprint">pagination.scroll</code>
         * is true the viewport scrolls down one page and
         * records are added if needed. If <code class="prettyprint">pagination.scroll</code>
         * is false and not on the last page refresh the view to show the next page.</p>
         *
         * @return {boolean} true for success, false if a page is currently being rendered.
         * @example <caption>This example goes to the next page.</caption>
         * $( ".selector" ).grid( "nextPage" );
         */
        nextPage: function() {
            var sp$, max, st, total;

            if ( this.renderInProgress ) {
                return false;
            } // else
            if ( this.options.pagination.scroll ) {
                sp$ = this.scrollParent$;
                max = this._getDataContainer().first().height() - this.displayPageHeight;
                st = sp$.scrollTop() - this.scrollDelta + this.displayPageHeight;
                if ( st > max ) {
                    st = max;
                }
                sp$.scrollTop( st + this.scrollDelta );
            } else {
                total = this.model.getTotalRecords();
                if ( total < 0 || this.pageOffset + this.pageCount < total ) {
                    this.pageOffset += this.pageSize;
                    this.refresh( false );
                }
            }
            return true;
        },

        /**
         * <p>Display the last page of records. If <code class="prettyprint">pagination.scroll</code>
         * is true simply scrolls to the bottom of the viewport
         * and a new page of records is added if needed. If <code class="prettyprint">pagination.scroll</code>
         * is false and not already on the last page the view is refreshed and shows the last page.
         * This method only works correctly if the model knows the total number of rows.</p>
         *
         * @return {boolean} true for success, false if a page is currently being rendered.
         * @example <caption>This example goes to the last page.</caption>
         * $( ".selector" ).grid( "lastPage" );
         */
        lastPage: function() {
            var totalPages, sp$, max, total;

            if ( this.renderInProgress ) {
                return false;
            } // else
            if ( this.options.pagination.scroll ) {
                sp$ = this.scrollParent$;
                max = this._getDataContainer().first().height() - this.displayPageHeight;
                sp$.scrollTop( max + this.scrollDelta );
            } else {
                total = this.model.getTotalRecords();
                if ( total > 0 ) {
                    totalPages = Math.ceil( total / this.pageSize );
                    this.pageOffset = ( totalPages - 1 ) * this.pageSize;
                    this.refresh( false );
                }
            }
            return true;
        },

        /**
         * <p>Load more records into the view. If <code class="prettyprint">pagination.scroll</code>
         * is true this adds a new page of records to the end.
         * If <code class="prettyprint">pagination.scroll</code> is false this is the same as <code class="prettyprint">nextPage</code>.
         * This is intended to be used when <code class="prettyprint">pagination.loadMore</code> is true.</p>
         *
         * @return {boolean} true for success, false if a page is currently being rendered.
         */
        loadMore: function() {
            var total = this.model.getTotalRecords();

            if ( this.renderInProgress ) {
                return false;
            } // else
            if ( this.options.pagination.scroll && !this.scrollPaging ) {
                if ( total < 0 || this.pageOffset + this.pageCount < total - 1 ) {
                    this.pageOffset += this.pageSize;
                    this._addPageOfRecords();
                }
            } else {
                this.nextPage();
            }
            return true;
        },

        /**
         * <p>Go to the specified page number. This should only be used when
         * <code class="prettyprint">pagination.scroll</code> is false and the model knows the total number of records.</p>
         *
         * @param pPageNumber zero based page number
         * @return {boolean} true for success, false if a page is currently being rendered.
         */
        gotoPage: function( pPageNumber ) {
            var totalPages,
                total = this.model.getTotalRecords();

            if ( this.renderInProgress ) {
                return false;
            } // else
            if ( total > 0 ) {
                totalPages = Math.ceil( total / this.pageSize );
                if ( pPageNumber >= 0 && pPageNumber < totalPages ) {
                    this.pageOffset = pPageNumber * this.pageSize;
                    this.refresh( false );
                }
            }
            return true;
        },

        //
        // Public methods
        //

        /**
         * <p>Returns the identity of the active record or null if there is no active record.
         * The active record is the one currently being edited.</p>
         *
         * @return {string} Active record id.
         */
        getActiveRecordId: function() {
            return this.activeRecordId;
        },

        /**
         * <p>Returns the active record or null if there is no active record.
         * The active record is the one currently being edited.</p>
         *
         * @return {model.Record} Active record.
         */
        getActiveRecord: function() {
            return this.activeRecord;
        },

        /**
         * <p>Use after a column item value is set without triggering a change event to update the model and grid view.
         * Has no effect if there is no active record.</p>
         * <p>When a dynamic action or other event handler on a change event updates the value of the same item that
         * triggered the change event, the change event from setting the value should be suppressed to avoid
         * an infinite loop. However the model is only updated from a change event. This method offers a solution
         * to the model not being updated if the value is set asynchronously.
         * Call this method anytime a column item is updated and the change event is suppressed.</p>
         * @param {string} pColumn The name of the column.
         * @example <caption>This example updates the "SALARY" column, which has static id "C_SALARY", in
         * interactive grid with static id "MyGrid", to add 10 to whatever the user enters.
         * <code class="prettyprint">setTimeout</code> is used to simulate an async value update.
         * The active row must be locked around the async update.</caption>
         * var salary = apex.item( "C_SALARY" );
         * $( salary.node ).change( function( event ) {
         *     // assume the current view is grid and not single row view.
         *     var grid$ = apex.region( "MyGrid" ).call( "getCurrentView" ).view$;
         *     grid$.grid("lockActive");
         *     setTimeout( function() {
         *         // suppress this change otherwise this handler will be triggered again
         *         salary.setValue( parseFloat( salary.getValue() ) + 10, null, true );
         *         // suppressing the value means the grid model is not updated so call setActiveRecordValue
         *         grid$.grid( "setActiveRecordValue", "SALARY" )
         *             .grid( "unlockActive" );
         *     }, 10 ):
         * } );
         */
        setActiveRecordValue: function( pColumn ) {
            var ci = this.columnItems[pColumn];

            if ( this.activeRecord && ci ) {
                this.ignoreItemChange = true;
                this._setModelValue( null, ci.item, this.activeRecord, pColumn, true );
                this.ignoreItemChange = false;
            }
        },

        /**
         * <p>Call to lock the active row while async processing is in progress.</p>
         *
         * <p>The view edits one row/record at a time. This is known as the active row. In edit mode as the user changes
         * the focused cell with the mouse, tab or enter keys if the new cell is on a different row the previous row
         * is deactivated and the new row is activated. Any dynamic actions or other code that manipulates Column items
         * are acting on the active row. If any actions are asynchronous such as using Ajax to set a column item value
         * then the row must not be deactivated while the async action is in progress otherwise the result would be applied
         * to the wrong row!</p>
         *
         * <p>So this method must be called before starting an async operation. It can be called multiple times if there are
         * multiple async operations. For each call to <code class="prettyprint">lockActive</code>
         * there must be exactly one call to <code class="prettyprint">unlockActive</code>. See also
         * See {@link tableModelViewBase#unlockActive}</p>
         *
         * <p>If the view is part of an APEX region plugin, that region should implement the
         * <code class="prettyprint">beforeAsync</code> and <code class="prettyprint">afterAsync</code>
         * functions on the object returned from {@link region#getSessionState} by calling
         * <code class="prettyprint">lockActive</code> and <code class="prettyprint">unlockActive</code>
         * respectively. Then if an appropriate target option is passed to {@Link apex.server.plugin} then the locking will
         * be done automatically. Dynamic Actions that act on column items pass the correct target option.
         * The bottom line is that for Dynamic Actions on columns of an Interactive Grid these lock/unlock methods are
         * called automatically.</p>
         * @example <caption>See {@link grid#setActiveRecordValue} for an example.</caption>
         */
        lockActive: function() {
            if ( this.activeRecord ) {
                this.activeLockCount += 1;
            }
        },

        /**
         * <p>Call to unlock the active row after async processing is complete.</p>
         * <p>Call after the async operation completes. See {@link tableModelViewBase#lockActive} for more information.
         * @example <caption>See {@link grid#setActiveRecordValue} for an example.</caption>
         */
        unlockActive: function() {
            if ( this.activeRecord ) {
                this.activeLockCount -= 1;
                // just in case don't let it go negative
                if ( this.activeLockCount < 0 ) {
                    this.activeLockCount = 0;
                }
                if ( this.activeLockCount === 0 && this.activeUnlockCallback ) {
                    this.activeUnlockCallback();
                    this.activeUnlockCallback = null;
                }
            }
        },

        addStateIcon: function( pStateName, pIconClass, pMessage ) {
            var out = util.htmlBuilder();

            this.stateIconMessages[pStateName] = pMessage;
            if ( this.stateIcons$.find( "[data-state='" + pStateName + "']" ).length === 0 ) {
                out.markup( "<span tabindex='0'" )
                    .attr( "class", pIconClass )
                    .attr( "data-state", pStateName )
                    .markup( "></span>");
                this.stateIcons$.append( out.toString() );
            }
        },

        removeStateIcon: function( pStateName ) {
            this.stateIcons$.find( "[data-state='" + pStateName + "']" ).remove();
            delete this.stateIconMessages[pStateName];
        },

        //
        // Methods for derived views to call
        //

        _create: function() {
            var o = this.options;

            if ( o.hideDeletedRows ) {
                this.element.addClass( C_GRID_HIDE_DELETED );
            }
            this.pageOffset = 0;
            this.pageCount = 0;
            this.pageSize = 10;
            this.noData = true;
            this.onLastPage = false;
            this.lastScrollLeft = null;
            this.lastScrollTop = null;
            this.stateIconMessages = {};
            this.reinitCallbacks = null;

            this.activeRecord = null;         // tracks the record currently being edited
            this.activeRecordId = null;       // tracks the record currently being edited
            this.activeLockCount = 0;          // managed by [un]lockActive; if there are async operations pending this is > 0
            this.activeUnlockCallback = null;  // function to call once lock count goes back to zero. Just one thing not a queue

            this.columnItems = null;        // map from field property to column item (element and item) that edits the field
            this.columnItemsContainer$ = null; // container of all the column items for this record view

            if ( !o.progressOptions ) {
                o.progressOptions = { fixed: !o.hasSize };
            }

            if ( o.pagination.scroll ) {
                o.rowsPerPage = null;
            }
            if ( o.rowsPerPage ) {
                this.pageSize = o.rowsPerPage;
            }
        },

        /**
         * Call from _destroy
         * @private
         */
        _tableModelViewDestroy: function() {
            this.footer$.remove();
            this.footer$ = null;
            this.pageRange$ = null;
            this.pageSelector$ = null;
            this.status$ = null;
            this.stateIcons$ = null;
            this.element.removeClass( C_GRID_HIDE_DELETED );
            if ( this._scrollHandler ) {
                this.scrollParent$.off( "scroll", this._scrollHandler );
            }
        },

        /**
         * Call to initialize the model. Typically done when the widget is created and anytime the modelName option
         * is changed. Also call with null for model name when the widget is destroyed or any other time the model is
         * no longer needed.
         *
         * @param modelName
         * @private
         */
        _initModel: function( modelName, altHandler ) {
            var markDeletes,
                o = this.options,
                self = this;

            function modelChangeHandler(type, change) {
                var i, rows, row, rec, id, oldId, meta, row$, inserted, records;

                if ( self.pendingRefresh ) {
                    // Ignore any changes that happen before the view is initialized. This can happen if view is initially invisible
                    return;
                }
                if ( type === "refresh" ) {
                    self.pageOffset = 0;
                    self.pageCount = 0;
                    self.refresh();
                } else if ( type === "refreshRecords" || type === "revert" ) {
                    rows = self._elementsFromRecordIds( change.recordIds );
                    for ( i = 0; i < rows.length; i++ ) {
                        row = rows[i];
                        if (!row) {
                            continue;
                        }
                        rec = change.records[i];
                        // for update after insert this is the previous (temp) id and newIds holds the new value
                        // for revert after identity field was changed this is the changed value and newIds holds the new original/reverted value
                        oldId = change.recordIds[i];
                        id = change.newIds[oldId] || oldId;
                        meta = self.model.getRecordMetadata( id );
                        self._replaceRecord( row, rec, oldId, id, meta );
                    }
                } else if ( type === "move" ) {
                    // TODO consider if/when move should be handled as a refresh?
                    records = change.records;
                    if ( change.insertAfterId ) {
                        rows = self._elementsFromRecordIds( [change.insertAfterId] );
                        row = rows.length > 0 ? rows[0] : null;
                    }
                    // remove each moved record then insert in new place
                    for ( i = records.length - 1; i >= 0; i-- ) {
                        rec = records[i];
                        id = self.model.getRecordId( rec );
                        meta = self.model.getRecordMetadata( id );

                        rows = self._elementsFromRecordIds( [id] );
                        if ( rows.length > 0 ) {
                            if ( rows[0] ) {
                                self._removeRecord( rows[0] );
                            }
                        }
                        row$ = self._insertRecord( row, rec, id, meta, row ? "after" : "before" );
                    }
                } else if ( type === "insert" || type === "copy" ) {
                    if ( type === "insert" ) {
                        records = [change.record];
                    } else { // else copy
                        records = change.records;
                    }
                    if ( change.insertAfterId ) {
                        rows = self._elementsFromRecordIds( [change.insertAfterId] );
                        row = rows.length > 0 ? rows[0] : null;
                    }
                    if ( self.noData ) {
                        // This insert happens during _addPageOfRecords completion processing due to model refresh event
                        // so make sure that has completed before refreshing again to pick up the newly inserted record.
                        setTimeout( function() {
                            self.refresh();
                            rows = self._elementsFromRecordIds( [self.model.getRecordId(records[0])] );
                            // make sure the row is found
                            if ( rows.length > 0 && rows[0] ) {
                                self._afterInsert( rows );
                            }
                        }, 1 );
                    } else {
                        // insert each added record
                        inserted = [];
                        for ( i = records.length - 1; i >= 0; i-- ) {
                            rec = records[i];
                            id = self.model.getRecordId( rec );
                            meta = self.model.getRecordMetadata( id );

                            row$ = self._insertRecord( row, rec, id, meta, row ? "after" : "before" );
                            inserted.push( row$ );
                        }
                        self._afterInsert( inserted );
                    }
                } else if ( type === "clearChanges") {
                    if ( markDeletes ) {
                        rows = self._elementsFromRecordIds( change.deletedIds );
                        for ( i = 0; i < rows.length; i++ ) {
                            if ( rows[i] ) {
                                self._removeRecord( rows[i] );
                            }
                        }
                        // todo any other adjustments needed like in the case below?
                    }
                    rows = self._elementsFromRecordIds( change.changedIds );
                    for ( i = 0; i < rows.length; i++ ) {
                        row = rows[i];
                        if ( row ) {
                            id = change.changedIds[i];
                            meta = self.model.getRecordMetadata( id );
                            rec = self.model.getRecord( id );
                            self._updateRecordState( row, id, rec, meta );
                        }
                    }
                } else if ( change.recordIds ) {
                    rows = self._elementsFromRecordIds( change.recordIds );
                    for ( i = 0; i < rows.length; i++ ) {
                        row = rows[i];
                        if ( !row ) {
                            continue;
                        }
                        id = change.recordIds[i];
                        meta = self.model.getRecordMetadata( id );
                        rec = change.records[i];

                        if ( type === "delete" ) {
                            // if record will be removed or if hideDeletedRows and the record is focused then need to
                            // select the next (or prev if at end) row only the derived view knows if the record is focused
                            if ( o.hideDeletedRows || !markDeletes ) {
                                self._removeFocus( row );
                            }
                            if ( !markDeletes || meta === null ) {
                                // when meta is null it means the record was really deleted from the model such as in the case of deleting an inserted record
                                self._removeRecord( row );
                            } else {
                                self._updateRecordState( row, id, rec,  meta );
                            }
                        } else {
                            self._updateRecordState( row, id, rec, meta );
                        }
                    }
                    if ( type === "delete" ) {
                        if ( self.model.getTotalRecords() === 0 ) {
                            self.refresh();
                        } else if ( o.hideDeletedRows ) {
                            // make sure none of the deleted rows are selected
                            self.element.find( SEL_DELETED ).removeClass( C_SELECTED ).removeAttr( A_SELECTED );
                            self._updateStatus();
                        }
                    }
                } else if ( type === "set" || type === "metaChange" ) {
                    // Ignore if change came from user editing cell in this widget
                    if ( !self.ignoreFieldChange ) {
                        rec = change.record;
                        id = self.model.getRecordId( rec );
                        if ( change.oldIdentity ) {
                            self._identityChanged( change.oldIdentity, id );
                        }
                        meta = self.model.getRecordMetadata( id );
                        rows = self._elementsFromRecordIds( [id] );
                        if ( rows.length > 0 && rows[0] ) {
                            if ( type === "set" ) {
                                self._updateRecordField( rows[0], rec, change.field, meta );
                            }
                            self._updateRecordState( rows[0], id, rec, meta );
                        }
                    }
                } else if ( type === "instanceRename" ) {
                    // update our name for the model so it can be released
                    if ( self.modelName[1] === change.oldInstance ) {
                        self.modelName[1] = change.newInstance;
                    }
                }
                self._updateTotalRecords();
            }

            if ( this.model ) {
                // if there was a model unbind our listener
                this.model.unSubscribe( this.modelViewId );
                // TODO THINK is the the best way to handle switching reports???
                // todo this test is incorrect when modelName is an array!
                if ( this.modelName !== modelName ) {
                    // and release the model
                    model.release( this.modelName );
                }
                this.model = null;
                this.modelName = null;
            }
            if ( modelName ) {
                this.modelName = modelName;
                this.model = model.get( modelName );
                if ( !this.model ) {
                    throw new Error( "Model not found: " + modelName );
                }
                this.modelViewId = this.model.subscribe( {
                    onChange: altHandler || modelChangeHandler,
                    progressView: this.element,
                    progressOptions: o.progressOptions
                } );
                markDeletes = this.model.getOption( "onlyMarkForDelete" );
            }
        },

        /**
         * Call to render a button.
         * @param out
         * @param cls
         * @param icon
         * @param label
         * @private
         */
        _renderButton: function( out, cls, icon, label ) {
            out.markup( "<button class='" + cls + "' type='button'" )
                .attr( "aria-label", label )
                .attr( "title", label )
                .markup( "><span aria-hidden='true' class='a-Icon " )
                .attr( icon )
                .markup( "'></span></button>" );
        },

        /**
         * Call to render the no data message area
         * @param out
         * @private
         */
        _renderAltDataMessages: function( out, baseId ) {

            function msg( cls, iconCls, text ) {
                out.markup( "<div class='" + cls + " " + C_GRID_ALT_MSG + "' style='display:none;'><div class='" + C_GRID_ALT_MSG_ICON + "'>")
                    .markup( "<span aria-hidden='true' class='a-Icon " + iconCls + "'></span>")
                    .markup( "</div><span class='" + C_GRID_ALT_MSG_TEXT + "'" )
                    .optionalAttr( "id", baseId ? baseId + "_msg" : null ) // an id is added to the message so it can be included in the widget's accessible label
                    .markup( ">" )
                    .markup( text ) // the message may contain markup just like IR
                    .markup( "</span></div>" );
            }
            msg( C_GRID_NO_DATA, "icon-irr-no-results", this.options.noDataMessage ); // todo change the icon-irr-no-results class
            msg( C_GRID_MORE_DATA, "icon-warning", this.options.moreDataMessage );
        },

        /**
         * Call during rendering of the widget after all the data but inside the scroll view port
         * @param out
         * @private
         */
        _renderLoadMore: function( out ) {
            var o = this.options;

            if ( o.pagination.scroll && o.pagination.loadMore && !this.scrollPaging ) {
                out.markup( "<div class='a-GV-loadMore'><button type='button' class='js-load a-GV-loadMoreButton'>")
                    .content( getMessage( "LOAD_MORE" ) )
                    .markup( "</button></div>" );
            }
        },

        /**
         * Call during rendering of the widget at the very end
         * @param out
         * @private
         */
        _renderFooter: function( out, baseId ) {
            var rangeAdded, modelHasTotal,
                o = this.options;

            function pageRange() {
                var label = getMessage( "PAGE_RANGE" );
                out.markup( "<span" )
                    .optionalAttr( "id", baseId ? baseId + "_pageRange" : null )
                    .attr( "title", label )
                    .markup( "><span class='u-vh'>" )
                    .content( label )
                    .markup( "</span><span class='a-GV-pageRange'></span></span>" );
            }

            if ( o.footer ) {
                out.markup( "<div class='" + C_GRID_FOOTER + "'><div class='a-GV-stateIcons'></div><div" )
                    .optionalAttr( "id", baseId ? baseId + "_status" : null )
                    .markup( " class='a-GV-status'></div><div class='a-GV-pagination'>" );

                if ( o.pagination ) {
                    rangeAdded = false;
                    modelHasTotal = this.model.getOption( "hasTotalRecords" );
                    if ( !o.pagination.scroll ) {
                        if ( modelHasTotal && o.pagination.firstAndLastButtons ) {
                            this._renderButton( out, "a-GV-pageButton a-GV-pageButton--nav js-pg-first", "icon-first",
                                getMessage( "FIRST_PAGE" ) );
                        }
                        // todo aria-controls="myreport" for all these buttons. get from this.element[0].id
                        this._renderButton( out, "a-GV-pageButton a-GV-pageButton--nav js-pg-prev", "icon-prev",
                            getMessage( "PREV_PAGE" ) );
                    }

                    if ( modelHasTotal && ( o.pagination.showPageLinks || o.pagination.showPageSelector ) ) {
                        out.markup( "<span class='a-GV-pageSelector'></span>" );
                    } else if ( o.pagination.showRange ) {
                        pageRange();
                        rangeAdded = true;
                    }

                    if ( !o.pagination.scroll ) {
                        this._renderButton( out, "a-GV-pageButton a-GV-pageButton--nav js-pg-next", "icon-next",
                            getMessage( "NEXT_PAGE" ) );
                        if ( modelHasTotal && o.pagination.firstAndLastButtons ) {
                            this._renderButton( out, "a-GV-pageButton a-GV-pageButton--nav js-pg-last", "icon-last",
                                getMessage( "LAST_PAGE" ) );
                        }
                    }

                    if ( !rangeAdded && o.pagination.showRange ) {
                        pageRange();
                    }

                }
                out.markup( "</div></div>" );
            }

        },

        /**
         * Call when the view is being refreshed before it is rendered.
         * @param scrollParent$
         * @private
         */
        _refreshPagination: function( scrollParent$ ) {
            var o = this.options;

            this.scrollPaging = o.pagination.scroll && ( this.model.getOption( "hasTotalRecords" ) || !o.pagination.loadMore );

            // preserve scroll offsets
            this.lastScrollTop = 0;
            this.lastScrollLeft = 0;
            if ( scrollParent$.length ) {
                if ( !o.hasSize ) {
                    scrollParent$ = o.scrollParentOverride ? $( o.scrollParentOverride ) : $( window );
                }
                this.lastScrollLeft = scrollParent$.scrollLeft();
                this.lastScrollTop = scrollParent$.scrollTop();
            }
//            console.log("xxx <<< remember scroll offset ", scrollParent$, this.lastScrollTop);

        },

        /**
         * Call after the footer (and the rest of the view) has been rendered and inserted into the DOM.
         * @private
         */
        _initPaginationFooter: function( scrollParent$ ) {
            var self = this,
                o = this.options,
                tooltipEdge = this.element.hasClass("u-RTL") ? "right" : "left";

            this.pageKey = null; // cause the pagination if any to get updated

            this.footer$ = this.element.find( "." + C_GRID_FOOTER );
            this.status$ = this.footer$.find( ".a-GV-status" );
            this.stateIcons$ = this.footer$.find( ".a-GV-stateIcons" );
            this.pageRange$ = this.footer$.find( ".a-GV-pageRange" );
            this.pageSelector$ = this.footer$.find( ".a-GV-pageSelector" );
            this.noData$ = this.element.find( "." + C_GRID_NO_DATA );
            this.moreData$ = this.element.find( "." + C_GRID_MORE_DATA );

            if ( $.ui.tooltip ) {
                this.stateIcons$.tooltip( {
                    content: function() {
                        var name = $( this ).attr( "data-state" );
                        return self.stateIconMessages[name];
                    },
                    items: "[data-state]",
                    show: apex.tooltipManager.defaultShowOption(),
                    tooltipClass: "a-GV-tooltip",
                    position: {
                        my: tooltipEdge + " bottom",
                        at: tooltipEdge + " top-10",
                        collision: "flipfit"
                    }
                });
            }

            if ( !o.hasSize ) {
                // if the widget has no fixed height then the scrollParent will never scroll and what is really
                // needed is to use the window as the scrollParent - scroll page when the window scrolls
                this._updateScrollHandler();
            } else {
                this.scrollParent$ = scrollParent$;
                if ( self.scrollPaging ) {
                    scrollParent$.scroll( function() {
                        self._scrollPage();
                    } );
                }
                this.scrollDelta = 0;
            }

            if ( o.pagination.scroll ) {
                this.pageOffset = 0;
                this.pageCount = 0;
//                console.log("xxx refresh after init grid ", this.scrollParent$, this.scrollParent$.scrollTop());
///xxx                this.scrollParent$.scrollTop( 0 ); // xxx why isn't this working?
            }

            // if the region has no defined height and the stickyWidget is available then stick the
            // column headers to the top of the page and/or the footer to the bottom of the page
            if ( !o.hasSize && o.footer && o.stickyFooter && $.apex.stickyWidget ) {
                this.footer$.stickyWidget( {
                    isFooter: true,
                    toggleWidth: true,
                    stickToEnd: true,
                    top: function() {
                        return self.element.offset().top + self._getHeaderHeight();
                    }
                });
            }

            if ( o.pagination.showPageLinks ) {
                this.pageSelector$.click( function( event ) {
                    var item$ = $( event.target ).parent();
                    if ( item$.length ) {
                        self.gotoPage( parseInt( item$.attr( "data-value" ), 10) );
                    }
                    event.preventDefault();
                });
            } else if ( o.pagination.showPageSelector ) {
                this.pageSelector$.change( function( event ) {
                    self.gotoPage( parseInt( $( event.target ).val(), 10 ) );
                });
            }

            this.footer$.find( ".js-pg-first" ).click( function() {
                self.firstPage();
            });
            this.footer$.find( ".js-pg-prev" ).click( function() {
                self.previousPage();
            });
            this.footer$.find( ".js-pg-next" ).click( function() {
                self.nextPage();
            });
            this.footer$.find( ".js-pg-last" ).click( function() {
                self.lastPage();
            });
            this.element.find( ".js-load" ).click( function() {
                self.loadMore();
            });
        },

        /**
         * Call during resizing or anytime you need to make adjustments for the footer height
         * @return {number}
         * @private
         */
        _footerHeight: function() {
            // TODO FIX HACK this check for not null footer is here because of a bug in stickyWidget where it may not clean up its handlers
            if ( this.footer$ ) {
                return this.footer$.outerHeight() || 0;
            }
            return 0;
        },

        /**
         * Call to add records from the model to the view
         * @private
         */
        _addPageOfRecords: function( callback ) {
            var count, currentBreak, pageSize, pageOffset, dataContainer$, data$,
                self = this,
                o = this.options,
                out = this._getDataRenderContext();

            function finish() {
                var filler$, outFiller, total, recPerRow, prevTotal,
                    frozenFiller$ = null,
                    rowHeight = self.displayPageHeight / self.displayPageSize;

                // check if empty
                self.pageCount = count;
                if ( self.pageOffset === 0 && count === 0) {
                    self.noData = true;
                    data$.hide();
                    self.moreData$.hide();
                    self.noData$.show();
                    if ( o.autoAddRecord && self.model.allowAdd() ) {
                        self._autoAddRecord();
                    }
                } else {
                    if ( count === 0 ) {
                        if ( !o.pagination.scroll ) {
                            // page offset is not zero and yet count is zero so somehow went off the end of the model xxx or there was an error
                            self.pageOffset -= self.pageSize; // go back one page
                            if ( self.pageOffset < 0 ) {
                                self.pageOffset = 0;
                            }
                            self._addPageOfRecords(); // and try again. todo consider loss of callback
                        }
                        return;
                    }
                    self.noData = false;
                    self.noData$.hide();
                    if ( self.model.getDataOverflow() && o.moreDataMessage ) {
                        self.moreData$.show();
                        // todo consider if want to show the data under the more data warning message
                        data$.hide();
                    } else {
                        self.moreData$.hide();
                        data$.show();
                    }
                    if ( self.scrollPaging && self.model.getOption( "hasTotalRecords" ) ) {
                        // The table consists of actual rows and filler rows. Filer rows have a height that represents
                        // the height of the not yet rendered rows.
                        // Find all the filler rows
                        filler$ = dataContainer$.last().find( SEL_GRID_SCROLL_FILLER );
                        total = self.model.getTotalRecords();
                        prevTotal = total;
                        if ( filler$.length === 0 ) {
                            // if there are none it must mean that the view is empty so add initial
                            // filler record that represents all the data
                            outFiller = self._getDataRenderContext();
                            self._renderFillerRecord( outFiller, C_GRID_SCROLL_FILLER );
                            filler$ = self._insertFiller( outFiller, null );
                            filler$.attr(DATA_START, 0);
                            filler$.attr(DATA_END, total);
                            filler$ = filler$.last();
                        } else if ( filler$.last().next().length === 0 ) {
                            // if there is a filler at the end then it has the previous total records
                            prevTotal = parseInt( filler$.last().attr(DATA_END), 10 );
                        }
                        if ( dataContainer$.length === 2 ) {
                            frozenFiller$ = dataContainer$.first().find( SEL_GRID_SCROLL_FILLER );
                        }
                        if ( total !== prevTotal ) {
                            filler$.last().attr(DATA_END, total);
                            if ( frozenFiller$ ) {
                                frozenFiller$.last().attr(DATA_END, total);
                            }
                        }
                        recPerRow = self._getRecordsPerRow();
                        // figure out where to insert the rendered data
                        filler$.each( function( i ) {
                            var h, newFiller$,
                                f$ = frozenFiller$ ?  $( [frozenFiller$[i], this] ) : $( this ),
                                match = false,
                                start = parseInt( f$.last().attr(DATA_START), 10 ),
                                end = parseInt( f$.last().attr(DATA_END), 10 );

                            if ( self.pageOffset <= start ) {
                                // insert just before the filler
                                match = true;
                                self._insertData( out, pageOffset, count, f$, "before" );
                                start = self.pageOffset + count;
                            } else if ( self.pageOffset + count <= end ) {
                                // the new rows go in the middle of the filler so split it by adding a new filler
                                // before this one and then insert the rows just before this filler
                                outFiller = self._getDataRenderContext();
                                self._renderFillerRecord( outFiller, C_GRID_SCROLL_FILLER );
                                newFiller$ = self._insertFiller( outFiller, f$ );
                                h = Math.floor( ( self.pageOffset - start ) / recPerRow ) * rowHeight;
                                newFiller$.attr( DATA_START, start );
                                newFiller$.attr( DATA_END, self.pageOffset - 1 );
                                newFiller$.css( "height", h );
                                self.scrollParent$.scrollTop( self.scrollParent$.scrollTop() - self.scrollParent$.height() );

                                match = true;
                                self._insertData( out, pageOffset, count, f$, "before" );
                                start = self.pageOffset + count;
                            } else if ( self.pageOffset + count === end + 1 || i === filler$.length - 1 ) {
                                // insert just after the filler
                                match = true;
                                self._insertData( out, pageOffset, count, f$, "after" );
                                end = self.pageOffset - 1;
                            }
                            if ( match ) {
                                if ( start >= end ) {
                                    // remove empty filler
                                    f$.remove();
                                } else {
                                    // adjust filler size
                                    f$.attr( DATA_START, start );
                                    f$.attr( DATA_END, end );
                                    h = Math.floor( ( end - start ) / recPerRow ) * rowHeight;
                                    f$.css( "height", h );
                                }
                                return false;
                            }
                        });
                    } else {
                        // for non scroll paging or (scroll paging when total records is unknown) just append the new
                        // records. In the first case the container is already empty. In the second case "load more" adds
                        // to the existing records.
                        self._insertData( out, pageOffset, count );
                    }
                }
                self._updateTotalRecords();
                if ( callback ) {
                    callback();
                }
            }

            if ( this.renderInProgress ) {
                return;
            }

            data$ = self.noData$.parent().children().not( SEL_GRID_ALT_MSG ); // this is all but the alternative message elements
            if ( this.noData || this.moreData$.is( ":visible" ) ) {
                // assume there will be data and show the data areas so the content can be sized correctly
                this.noData$.hide();
                this.moreData$.hide();
                data$.show();
                this.resize();
            }
            // need to know where the data is going to go to be able to search for filler and control break elements
            dataContainer$ = self._getDataContainer(); // could return one or two elements

            // when scrolling, new rows get appended and they are still potentially within the last control break
            if ( this.pageOffset === 0 || !o.pagination.scroll ) {
                this.lastControlBreak = null;
                this.pageFirstOffset = "";
                this.pageLastOffset = "";
            }

            this.controlBreakCollapsed = false;
            if ( o.pagination.scroll && this.pageLastOffset >= this.pageOffset ) {
                // if there is a control break find out if it is expanded or not
                dataContainer$.find( ".a-GV-controlBreak" ).last().each( function() { // todo
                    self.controlBreakCollapsed = !$( this ).hasClass( C_EXPANDED );
                });
            }

            // todo if the page size can change while scroll paging could get in a situation where we render
            // rows we already have!
            count = 0;
            pageSize = this.pageSize;
            pageOffset = this.pageOffset;
            this.renderInProgress = true;
            this.model.forEachInPage( this.pageOffset, pageSize, function( rowItem, index, id ) {
                var meta, expandControl, serverOffset;

                if ( !o.pagination.scroll && index >= 0 ) {
                    if ( index < this.pageOffset || index >= this.pageOffset + pageSize ) {
                        // this can happen when quickly change pages while model is fetching more data.
                        // unlikely now that the pagination methods like nextPage check that rendering is not in progress
                        // but just in case make sure not stuck with renderInProgress === true
                        count += 1;
                        if ( count === pageSize || !rowItem ) {
                            this.renderInProgress = false;
                            // self._addPageOfRecords(); // try again. todo consider loss of callback
                        }
                        return;
                    }
                }
                if ( rowItem ) {
                    if ( id ) {
                        meta = this.model.getRecordMetadata( id );
                    } else {
                        meta = {};
                    }

                    serverOffset = meta.serverOffset;
                    if ( this._hasControlBreaks() && !meta.agg ) {
                        expandControl = true;
                        currentBreak = this._controlBreakLabel( rowItem );
                        if ( this.lastControlBreak === null ) {
                            this.lastControlBreak = currentBreak;
                            this._renderBreakRecord( out, expandControl, currentBreak, serverOffset );
                            this.controlBreakCollapsed = false;
                        }
                        if ( meta.endControlBreak ) {
                            this.lastControlBreak = null;
                        }
                    }
                    this._renderRecord( out, rowItem, index, id, meta );
                    if ( serverOffset !== undefined ) {
                        serverOffset += 1;
                        if ( this.pageFirstOffset === "" ) {
                            this.pageFirstOffset = serverOffset;
                        }
                        this.pageLastOffset = serverOffset;
                    }
                    count += 1;
                }
                if ( count === pageSize || !rowItem ) {
                    this.renderInProgress = false;
                    finish();
                }
            }, this );
        },

        /**
         * Call when widget is created and anytime the size changes
         * @private
         */
        _initPageSize: function() {
            var rowHeight, scrollHeight, pageSize, top,
                o = this.options,
                sp = o.hasSize ? this.scrollParent$[0] : document;

            if ( !sp ) {
                sp = document;
            }
            rowHeight = this._getRecordHeight();
            if ( sp === document ) {
                scrollHeight = $( window ).height();
                // if there is a sticky header or footer (even if not currently stuck) subtract the height of each
                if ( this.footer$.hasClass( "js-stickyWidget-toggle") ) {
                    scrollHeight -= this._footerHeight();
                }
                top = this._getStickyTop();
                if ( top > 0 ) {
                    scrollHeight -= top + this._getHeaderHeight();
                }
            } else {
                scrollHeight = sp.offsetHeight; // doesn't include the scroll bar
            }
            // always leave room for possible horizontal scroll bar
            scrollHeight -= util.getScrollbarSize().height;
            if ( rowHeight <= 0 ) {
                // could be because grid not visible. must never let row height be 0 to avoid divide by 0
                rowHeight = 24;
            }
            pageSize = Math.floor( scrollHeight / rowHeight );
            if ( pageSize < 1 ) {
                pageSize = 1; // don't ever let page size be 0
            }
            this.displayPageSize = pageSize; // how many rows fit in the view port
            this.displayPageHeight = pageSize * rowHeight;

            // Note for a grid view rows per page really means records (or items) per page because multiple records fit on one row
            pageSize = pageSize * this._getRecordsPerRow();
            // if the user has specified how many rows make a page use it otherwise ...
            if ( !this.options.rowsPerPage ) {
                // if scroll paging want the page size to be a bigger than what is visible (keep in mind that when
                // scroll paging rowsPerPage is forced to null) otherwise the "auto" page size is just what fits
                // in the view
                this.pageSize = o.pagination.scroll ? Math.max( 40, 2 * pageSize ) : pageSize;
            }
//            console.log("xxx init table page size ", rowHeight, this.displayPageSize, this.pageSize, this.displayPageHeight );
        },

        /**
         * Call any time the selection state changes or the deleted state of any records may have changed or
         * the hideDeletedRows option changes, or any other case that could affect the status area of the footer.
         * @private
         */
        _updateStatus: function() {
            var deleteCount,
                selCount = this._selectedCount(),
                text = "";

            if ( this.options.hideDeletedRows ) {
                deleteCount = this._deletedCount();
            }
            if ( selCount > 0 ) {
                text += lang.format( this._selectedStatusMessage(), selCount );
            }
            if ( deleteCount > 0 ) {
                if ( text ) {
                    text += ", ";
                }
                text += formatMessage( "DELETED_COUNT", deleteCount ) + " ";
            }
            this.status$.text( text );
        },

        /**
         * Call to update the model with a new value from a column item
         * @param [element$] the active element (an ancestor of the column item element)
         * @param columnItem the column item
         * @param record the model record
         * @param property the model
         * @param {boolean} [notify]
         * @private
         */
        _setModelValue: function( element$, columnItem, record, property, notify ) {
            var result, value, prevValue, validity, id, prevId;

            if ( element$ ) {
                element$.removeClass( C_ACTIVE );
            }
            value = columnItem.getValue();
            if ( !notify ) {
                this.ignoreFieldChange = true; // ignore the update that this setValue *may* cause
            }
            prevId = this.model.getRecordId( record );
            prevValue = this.model.getValue( record, property );
            if ( prevValue !== null && typeof prevValue === "object" && prevValue.hasOwnProperty( "v" ) ) {
                value = {
                    v: value,
                    d: columnItem.displayValueFor( value )
                };
            }
            result = this.model.setValue( record, property, value );
            if ( result === "DUP" ) {
                this._setColumnItemValue( columnItem, record, property );
                apex.message.alert( getMessage( "DUP_REC_ID" ) );
            } else {
                validity = columnItem.getValidity();
                id = this.model.getRecordId( record );
                if ( !validity.valid ) {
                    this.model.setValidity( "error", id, property, columnItem.getValidationMessage() );
                } else {
                    this.model.setValidity( "valid", id, property );
                }
                if ( id !== prevId ) {
                    this._identityChanged( prevId, id );
                }
            }
            if ( !notify ) {
                this.ignoreFieldChange = false;
            }
        },

        _initColumnItems: function( fields ) {
            var i, column, curItem, eid, ci,
                allFromCache = true;

            this.columnItems = {};
            this.columnItemsContainer$ = null;

            for ( i = 0; i < fields.length; i++ ) {
                column = fields[i];
                eid = column.elementId;
                ci = null;
                if ( eid ) {
                    // Because multiple widgets can share the same column items we use a cache to avoid having
                    // to recreate the items multiple times.
                    // first check if in cache
                    if ( gColumnItemCache[eid] ) {
                        ci = this.columnItems[column.property] = gColumnItemCache[eid];
                        curItem = ci.item;
                    } else {
                        // if not create a column item and save in cache
                        curItem = item( eid );
                        if ( curItem.node ) { // make sure the item really exists
                            allFromCache = false;
                            gColumnItemCache[eid] = ci = this.columnItems[column.property] = {
                                element$: $( "#" + eid ).closest( ".a-GV-columnItem" ),
                                item: curItem
                            };
                        }
                    }
                    if ( ci && !this.columnItemsContainer$ ) {
                        this.columnItemsContainer$ = ci.element$.parent();
                    }
                }
            }
            if ( !this.columnItemsContainer$ ) {
                if ( this.editable ) {
                    debug.error( "An editable " + this.widgetName + " must have at least one column with a column item." );
                }
            } else {
                if ( !allFromCache ) {
                    // take the hidden off-screen column items out of the tab order
                    this.columnItemsContainer$.find( SEL_TABBABLE ).addClass( C_JS_TABBABLE ).attr( "tabindex", -1);
                }
            }
        },

        // must only be used on an editable widget
        _activateColumnItem: function( columnItem, labelId ) {
            var el$ = columnItem.element$;
            // deactivate marks the item's tabbable elements, this makes them tabbable again
            el$.find( SEL_JS_TABBABLE ).attr( "tabindex", 0 ).removeClass( C_JS_TABBABLE );
            el$.find( SEL_TABBABLE ).first()
                .attr( A_LBL_BY, labelId );
        },

        // must only be used on an editable widget
        _deactivateColumnItem: function( columnItem, labelId ) {
            var el$ = columnItem.element$,
                tabs$ = el$.find( SEL_TABBABLE );
            tabs$.first().removeAttr( A_LBL_BY );
            this.columnItemsContainer$.append( el$ ); // return it to the off screen container
            // take it out of the tab order: make the item's tabbable elements focusable (if it was visible) and remember them
            tabs$.addClass( C_JS_TABBABLE ).attr( "tabindex", -1);
        },

        /*
        * This supports the derived widget having these column fields
        * linkTargetColumn
        * linkText
        * linkAttributes
        * cellTemplate
        * escape
        * readonly (only for inserted records identity fields)
        * And the widget options supported are:
        * showNullAs
        */
        _renderFieldDataValue: function( out, col, rowItem, meta, cellMeta ) {
            var value, substOptions, columnItem,
                targetUrl = null,
                o = this.options;

            // check if the cell has a target url. It can come from cell metadata or linkTargetColumn; aggregate rows cannot have links
            if ( ( ( cellMeta && cellMeta.url ) || col.linkTargetColumn ) && !meta.agg ) {
                if ( col.linkTargetColumn ) {
                    targetUrl = this.model.getValue( rowItem, col.linkTargetColumn ) || null;
                } else {
                    targetUrl = cellMeta.url;
                }
            }

            value = this.model.getValue( rowItem, col.property );

            // don't show the internally generated primary key unless it is an editable inserted row
            if ( ( meta.agg || ( meta.inserted && col.readonly ) ) && this.model.isIdentityField( col.property ) ) {
                value = "";
            }

            if ( col.linkText || col.linkAttributes || col.cellTemplate ) {
                substOptions = {
                    model: this.model,
                    record: rowItem
                };
            }

            // the anchor wraps the whole cell value
            if ( targetUrl ) {
                out.markup( "<a")
                    .attr( "href", targetUrl );
                if ( col.linkAttributes ) {
                    out.markup( util.applyTemplate( col.linkAttributes, substOptions ) );
                }
                out.markup( " tabindex='-1'>" );
            }

            if ( targetUrl && col.linkText ) {
                out.markup( util.applyTemplate( col.linkText, substOptions ) );
            } else if ( col.cellTemplate ) {
                if ( meta.agg ) {
                    out.content("");
                } else {
                    out.markup( util.applyTemplate( col.cellTemplate, substOptions ) );
                }
            } else {
                if ( ( value === null || value === "" ) && ( o.showNullAs || meta.agg || targetUrl ) ) {
                    if ( meta.agg || meta.inserted || ( cellMeta && ( cellMeta.changed || cellMeta.error || cellMeta.warning ) ) ) {
                        value = "";
                    } else if ( targetUrl ) {
                        // strange to have a link with no text but also don't want to use showNulAs so default to the url
                        value = targetUrl;
                    } else {
                        value = o.showNullAs;
                    }
                    out.content( value );
                } else {
                    if ( value === null ) {
                        value = "";
                    }
                    // check to see if the model has a display value
                    if ( typeof value === "object" && value.hasOwnProperty( "d" ) ) {
                        value = value.d;
                    } else {
                        // otherwise if there is a column item it may have a display value
                        columnItem = this.columnItems[ col.property ];
                        if ( columnItem ) {
                            value = columnItem.item.displayValueFor( value );
                        }
                    }
                    // if escape is false then value can contain markup otherwise it is escaped as element content
                    // note that the === false test is so that anything else defaults to true.
                    out[ col.escape === false ? "markup" : "content" ]( value );
                }
            }
            if ( targetUrl ) {
                out.markup( "</a>" );
            }
        },

        _beginSetColumnItems: function() {
            this.reinitCallbacks = [];
        },

        _setColumnItemValue: function( columnItem, record, field, meta ) {
            var cb,
                display = null,
                value = this.model.getValue( record, field );

            if ( value !== null && typeof value === "object" && value.hasOwnProperty( "d" ) ) {
                display = value.d;
                value = value.v;
            }
            if ( this.reinitCallbacks ) {
                // reinit does not cause a change event and if needed returns a function
                // to call after all items have been set
                cb = columnItem.reinit( value, display );
                if ( cb ) {
                    this.reinitCallbacks.push( cb );
                }
            } else {
                // tree this as a normal set, which includes the change event
                columnItem.setValue( value, display );
            }
            // update item disabled state from model metadata if available
            if ( meta ) {
                if ( meta.fields && meta.fields[field] && meta.fields[field].disabled ) {
                    columnItem.disable();
                } else {
                    columnItem.enable();
                }
            }
        },

        _endSetColumnItems: function() {
            var i,
                cbList = this.reinitCallbacks;

            if ( cbList ) {
                for ( i = 0; i < cbList.length; i++ ) {
                    cbList[i]();
                }
            }
            this.reinitCallbacks = null;
        },

        _autoAddRecord: function( after ) {
            var newPK = this.model.insertNewRecord( null, after ); // this may cause a refresh
            this.model.getRecordMetadata( newPK ).autoInserted = true;
        },

        _triggerBeginEditing: function( record, recordId ) {
            this.element.trigger( EVENT_BEGIN_RECORD_EDIT, [{
                model: this.model,
                record: record,
                recordId: recordId
            }]);
        },

        _triggerEndEditing: function( record, recordId ) {
            this.element.trigger( EVENT_END_RECORD_EDIT, [{
                model: this.model,
                record: record,
                recordId: recordId
            }]);
        },

        _updateHighlights: function() {
            var i, h,
                o = this.options,
                sortedHighlights = [],
                styles = "";

            for ( i in o.highlights ) {
                if ( o.highlights.hasOwnProperty( i ) ) {
                    h = o.highlights[i];
                    h.id = i;
                    sortedHighlights.push(h);
                }
            }
            // highlight style rules must be added in reverse order
            sortedHighlights.sort( function( a, b ) {
                return b.seq - a.seq;
            } );

            for (i = 0; i < sortedHighlights.length; i++) {
                h = sortedHighlights[i];
                if ( !h.cssClass ) {
                    h.cssClass = ( h.row ? "hlr_" : "hlc_" ) + h.id;
                }
                if ( h.color || h.background ) {
                    if ( h.row ) {
                        styles += "." + h.cssClass + " td";
                    } else {
                        styles += "td." + h.cssClass;
                    }
                    styles += " { ";
                    if ( h.color ) {
                        styles += "color: " + h.color + " !important; ";
                    }
                    if ( h.background ) {
                        styles += "background-color: " + h.background + " !important; ";
                    }
                    styles += "}\n";
                }
            }
            if ( !this.gridStyles$ && styles ) {
                this.gridStyles$ = $( "<style type='text/css'></style>" );
                $( "head" ).append( this.gridStyles$ );
            }
            if ( this.gridStyles$ ) {
                this.gridStyles$ = this.gridStyles$.text( styles );
            }
        },

        /**
         * Internal
         * @private
         */

        _setOption: function ( key, value ) {
            var o = this.options;

            this._super( key, value );

            if ( key === "noDataMessage" ) {
                this.element.find( SEL_GRID_ALT_MSG + " > " + SEL_GRID_ALT_MSG_TEXT ).text( value );
            } else if ( key === "rowsPerPage" ) {
                if ( o.pagination.scroll ) {
                    // todo warn?
                    o.rowsPerPage = null;
                }
                if ( o.rowsPerPage ) {
                    this.pageSize = o.rowsPerPage;
                }
            } else if ( key === "hideDeletedRows" ) {
                this.element.toggleClass( C_GRID_HIDE_DELETED, value );
                if ( value === true ) {
                    // make sure none of the deleted rows are selected
                    this.element.find( SEL_DELETED ).removeClass( C_SELECTED ).removeAttr( A_SELECTED );
                    // todo may need to move last focused too
                }
                this._updateStatus();
            } else if ( key === "scrollParentOverride" ) {
                if ( o.hasSize ) {
                    debug.warn("Ignoring scrollParentOverride when hasSize is true.");
                } else {
                    this._updateScrollHandler();
                }
            }
        },

        _updateScrollHandler: function() {
            var self = this,
                prevScrollParent$ = this.scrollParent$,
                scrollParentOverride = this.options.scrollParentOverride;

            this.scrollParent$ = scrollParentOverride ? $( scrollParentOverride ) : $( window );
            if ( this.scrollPaging ) {
                if ( prevScrollParent$ && this._scrollHandler ) {
                    prevScrollParent$.off( "scroll", this._scrollHandler );
                } else {
                    this._scrollHandler = function () {
                        // only handle scroll paging if visible
                        if ( self.element[0].clientWidth > 0 ) {
                            self._scrollPage();
                        }
                    };
                }
                this.scrollParent$.on( "scroll", this._scrollHandler );
            }
            this.scrollDelta = this.element.offset().top - this._getStickyTop();
        },

        _scrollPage: function() {
            var self = this,
                autoLoadMore = !this.model.getOption( "hasTotalRecords" ),
                st = this.scrollParent$.scrollTop();

            function pageBoundary( offset ) {
                return Math.floor( offset / self.pageSize ) * self.pageSize;
            }

            // When user scrolls need to determine what range of data to render if any (pageOffset).
            // This is done by comparing the offset of the filler rows to the scroll view port
            // to see if any of the filler rows are in in or near the view port.

            // throttle how often we check the scroll offset for paging
            if ( st !== this.lastScrollTop ) {
                this.lastScrollTop = st;

                if ( !this.scrollPageTimer ) {
                    this.scrollPageTimer = setTimeout(function() {
                        var filler$, tbody$, st, h, prevOffset,
                            o = self.options,
                            rowHeight = self.displayPageHeight / self.displayPageSize,
                            vpHeight = self.scrollParent$.height(),
                            vpTop = 0 - ( vpHeight / 2 ), // widen the view port bounds to render more rows early to avoid blank spaces
                            vpBottom = vpTop + ( 2 * vpHeight );

                        self.scrollPageTimer = null;
                        vpHeight = vpHeight * 2; // because of widening the view port

                        // while rendering the start, end bounds of fillers are in flux so just wait for next
                        // scroll event
                        if ( self.renderInProgress ) {
                            // avoid dup scroll page checks
                            return;
                        }
                        if ( autoLoadMore ) {
                            tbody$ = self._getDataContainer().first();
                            h = tbody$.height();
                            if ( self.scrollParent$[0] === window ) { // hasSize must be false for the scroll parent to be window
                                st = tbody$.offset().top;
                            } else {
                                st = tbody$.position().top;
                            }
                            // when hasSize option is false then scroll parent is window or scrollParentOverride
                            if ( !o.hasSize ) {
                                st -= self.scrollParent$.scrollTop();
                            }
                            if ( 0 - st + ( vpHeight * 1.5 ) > h ) {
                                self.pageOffset += self.pageSize;
                                self._addPageOfRecords();
                            }
                        } else {
                            filler$ = self._getDataContainer().find( SEL_GRID_SCROLL_FILLER );
                            prevOffset = self.pageOffset;
                            filler$.each(function() {
                                var bottom, top,
                                    f$ = $( this ),
                                    fHeight = f$.height(),
                                    start = parseInt( f$.attr( DATA_START ), 10 ),
                                    end = parseInt( f$.attr( DATA_END ), 10 );

                                // empty filler rows should be removed but just in case
                                if ( start === end ) {
                                    return;
                                }
                                if ( self.scrollParent$[0] === window ) { // hasSize must be false for the scroll parent to be window
                                    top = f$.offset().top;
                                } else {
                                    top = f$.position().top;
                                }
                                // when hasSize option is false then scroll parent is window or scrollParentOverride
                                if ( !o.hasSize ) {
                                    top -= self.scrollParent$.scrollTop();
                                }
                                bottom = top + fHeight;

//                                console.log("xxx ", start, end, vpTop, vpBottom, vpHeight, top, bottom, fHeight);

                                if ( top <= vpBottom && bottom >= vpTop ) {
                                    // Figure out if adding to start, middle or end of filler based on where the filler is
                                    // within the view port.
                                    if ( fHeight < ( vpHeight * 3 ) ||  ( top + vpHeight ) > vpBottom  ) {
                                        self.pageOffset = start;
                                    } else if ( ( bottom - vpHeight ) <= vpBottom ) {
                                        self.pageOffset = pageBoundary( end );
                                    } else {
                                        self.pageOffset = pageBoundary( start + Math.floor( ( fHeight - bottom ) / rowHeight ) );
                                    }

                                    if (self.pageOffset !== prevOffset ) {
                                        // just in case don't add pages for offset already at
                                        // xxxx may need to constrain the count so it doesn't go off the end of the filler
                                        self._addPageOfRecords();
                                    }
                                    return false; // no need to check any more fillers
                                }

                            });
                        }

                    }, SCROLL_PAGE_CHECK );
                }
            }

        },

        /**
         * Internal
         * @private
         */
        _updateTotalRecords: function() {
            var i, start, end, range, pages, pageKey, hasTotalRecords,
                totalPages = null,
                currentPage = null,
                o = this.options,
                pagination = o.pagination,
                total = this.model.getTotalRecords(),
                serverTotal = this.model.getServerTotalRecords();

            if ( total >= 0 ) {
                totalPages = Math.ceil( total / this.pageSize );
                currentPage = Math.floor( this.pageOffset / this.pageSize );
            }

            // if data is added after _refreshPagination (as when being refreshed) preserve scroll offsets
            if ( this.lastScrollLeft !== null )  {
//                console.log("xxx >>> restore scroll offset ", this.scrollParent$, this.lastScrollTop);
                this.scrollParent$.scrollLeft( this.lastScrollLeft );
                this.scrollParent$.scrollTop( this.lastScrollTop );
                this.lastScrollLeft = null;
                this.lastScrollTop = null;
            }

            this.onLastPage = false;
            if ( this.pageCount === 0 && this.pageOffset === 0 ) {
                range = "";
                this.onLastPage = true;
                this.footer$.find( ".js-pg-prev,.js-pg-next,.js-pg-first,.js-pg-last" ).attr( "disabled", true );
            } else {
                this.footer$.find( ".js-pg-prev,.js-pg-next,.js-pg-first,.js-pg-last" ).attr( "disabled", false );
                this.element.find( ".js-load" ).attr( "disabled", false );
                if ( this.pageOffset === 0 ) {
                    // at the beginning disable prev and first
                    this.footer$.find( ".js-pg-prev,.js-pg-first" ).attr( "disabled", true );
                }
                if ( total > 0 && currentPage === totalPages - 1 ) {
                    this.onLastPage = true;
                    // at the end disable next and last and loadMore
                    this.footer$.find( ".js-pg-next,.js-pg-last" ).attr( "disabled", true );
                    this.element.find( ".js-load" ).attr( "disabled", true );
                }
                hasTotalRecords = this.model.getOption( "hasTotalRecords" );
                if ( this.scrollPaging && hasTotalRecords ) {
                    range = formatMessage( "TOTAL_PAGES", serverTotal );
                } else {
                    if ( hasTotalRecords ) {
                        range = formatMessage( "PAGE_RANGE_XYZ", this.pageFirstOffset, this.pageLastOffset, serverTotal );
                    } else {
                        range = formatMessage( "PAGE_RANGE_XY", this.pageFirstOffset, this.pageLastOffset );
                    }
                }
            }
            this.pageRange$.text( range );

            if ( totalPages > 0 ) {
                if ( pagination.showPageLinks ) {
                    // only update the page links if the total pages, page size changes, or the current page changes because the links need to slide
                    pageKey = total + "_" + this.pageSize + "_" + currentPage;
                    if ( this.pageKey !== pageKey ) {
                        this.pageKey = pageKey;

                        pages = "<ul class='a-GV-pageSelector-list'>";
                        // at most maxLinks links
                        start = currentPage - Math.floor( pagination.maxLinks / 2 );
                        if ( start < 0 ) {
                            start = 0;
                        }
                        end = start + pagination.maxLinks;
                        if ( end >= totalPages ) {
                            end = totalPages;
                            start = end - pagination.maxLinks;
                            if ( start < 0 ) {
                                start = 0;
                            }
                        }

                        if ( start > 0 ) {
                            pages += "<li class='a-GV-pageSelector-item'>&hellip;</li>";
                        }
                        for ( i = start; i < end; i++ ) {
                            pages += "<li class='a-GV-pageSelector-item' data-value='" +
                                i + "'><button class='a-GV-pageButton' type='button'>" + ( i + 1 ) + "</button></li>";
                        }
                        if ( end < totalPages ) {
                            pages += "<li class='a-GV-pageSelector-item'>&hellip;</li>";
                        }
                        pages += "</ul>";
                        this.pageSelector$.html( pages );
                    }
                    this.pageSelector$.find( SEL_SELECTED ).removeClass( C_SELECTED );
                    this.pageSelector$.find( "[data-value=" + currentPage + "]" ).addClass( C_SELECTED );
                } else if ( pagination.showPageSelector ) {
                    // only update the page selector if the total pages or page size changes
                    pageKey = total + "_" + this.pageSize;
                    if ( this.pageKey !== pageKey ) {
                        this.pageKey = pageKey;

                        pages = "<select class='a-GV-pageSelectlist' size='1'>";
                        for ( i = 0; i < totalPages; i++ ) {
                            pages += "<option value='" + i + "'>" + formatMessage( "SELECT_PAGE_N", i + 1 ) + "</option>";
                        }
                        pages += "</select>";
                        this.pageSelector$.html( pages );
                    }
                    this.pageSelector$.children( "select" ).val( currentPage );
                }
            } else {
                // no pages so need to clear out page selector if any.
                this.pageSelector$.empty();
                this.pageKey = null;
            }
        },

        //
        // Methods to implement/override
        //

        // refresh

        /**
         * Return the height of a widget header that should be considered when the footer is stuck.
         * Return 0 if there is no header.
         * @return {Number}
         * @private
         */
        _getHeaderHeight: function() {
            return 0;
        },

        /**
         * Return the height of the stickyTop of the header.
         * Return 0 if there is no sticky header.
         * @return {Number}
         * @private
         */
        _getStickyTop: function() {
            return 0;
        },

        /**
         * Return the number of records displayed on a row. Typically this is 1.
         * @return {Number}
         * @private
         */
        _getRecordsPerRow: function() {
            return 1;
        },

        /**
         * Return the height of a record in the view.
         * @return {Number}
         * @private
         */
//        _getRecordHeight: function() {
//            return 24;
//        },

        /**
         * Return a html builder rendering context to be passed to all the rendering functions.
         * Typically this is just a html builder but it can be an object including more context.
         * @return {*}
         * @private
         */
        _getDataRenderContext: function () {
            return util.htmlBuilder();
        },

        /**
         * Return a jQuery object for the element (or elements if there are frozen columns or something that scrolls in parallel)
         * that will contain all the records. It is the element that scrolls not the scroll view port.
         * @return {jQuery}
         * @private
         */
        _getDataContainer: function() {
            return $();
        },

        /**
         * Return the number of selected records.
         * @return {Number}
         * @private
         */
        _selectedCount: function() {
            return 0;
        },

        /**
         * Return a localized message string used to display the number things selected.
         * The string must contain the %0 parameter that will be replaced with the actual count.
         * @returns {string}
         * @private
         */
        _selectedStatusMessage: function() {
            return lang.getMessage( this.options.selectionStatusMessageKey ); // don't use the local getMessage function here
        },

        /**
         * Return the number of deleted records.
         * @return {Number}
         * @private
         */
        _deletedCount: function() {
            return 0;
        },

        _hasControlBreaks: function() {
            return false;
        },

        _elementsFromRecordIds: function( ids ) {
            return [];
        },

        _renderFillerRecord: function ( out, cssClass ) {
        },

        _insertFiller: function( out, curFiller$ ) {
            return $();
        },

        _insertData: function( out, offset, count, filler$, how ) {
        },

        _controlBreakLabel: function( record ) {
            return "";
        },

        _renderBreakRecord: function ( out, expandControl, breakLabel, serverOffset ) {
            out.markup( "<h3>" )
                .content( breakLabel )
                .markup( "</h3>" );
        },

        _renderRecord: function( out, record, index, id, meta ) {
        },

        _removeRecord: function( element ) {
        },

        _insertRecord: function( element, record, id, meta, where ) {
            return $();
        },

        _afterInsert: function( insertedElements ) {
        },

        _identityChanged: function( prevId, id ) {
        },

        _replaceRecord: function( element, record, oldId, id, meta ) {
        },

        _updateRecordField: function( element, record, field, meta ) {
        },

        _removeFocus: function( element ) {
        },

        _updateRecordState: function( element, id, record, meta ) {
        }
    });



    //
    // tableModelView
    //

    var C_TMV = "a-TMV",
        C_TMV_BODY = "a-TMV-body",
        C_TMV_WRAP_SCROLL = "a-TMV-w-scroll",
        SEL_TMV_WRAP_SCROLL = "." + C_TMV_WRAP_SCROLL,
        C_DISABLED = "is-disabled";

    /**
     * @uiwidget tableModelView
     * @since 5.1
     * @extends {tableModelViewBase}
     *
     * @classdesc
     * <p>Template driven view for a table {@link model} that supports pagination.
     * Derived from {@link tableModelViewBase}. Does not support editing.
     * Supports selection when using an {@link iconList} widget to handle the records.</p>
     *
     * <p>Note: Not all of the options and methods from the base widget apply to this widget. For example
     * options and methods related to editing do not apply.</p>
     *
     * <p>The expected markup is an empty element; typically a <code class="prettyprint">&lt;div></code>.</p>
     *
     * <p>There are two ways to define the markup for the view.
     * Configure with options {@link tableModelView#beforeTemplate}, {@link tableModelView#recordTemplate}, and
     * {@link tableModelView#afterTemplate} for complete control over the
     * markup. Or configure with options {@link tableModelView#iconClassColumn}, {@link tableModelView#imageURLColumn},
     * {@link tableModelView#imageAttributes}, {@link tableModelView#labelColumn}, {@link tableModelView#linkTarget},
     * {@link tableModelView#linkTargetColumn}, and {@link tableModelView#linkAttributes} for default list markup.</p>
     *
     * @desc Creates a tableModelView widget.
     *
     * @param {Object} options A map of option-value pairs to set on the widget.
     *
     * @example <caption>Create a tableModelView for name value paris displayed in a simple table.</caption>
     *   var fields = {
     *           PARTNO: {
     *               index: 0
     *           },
     *           PART_DESC: {
     *               index: 1
     *           }
     *       },
     *       data = [
     *           ["B-10091", "Spark plug"],
     *           ["A-12872", "Radiator hose"],
     *           ...
     *       ];
     *   apex.model.create("parts", {
     *           shape: "table",
     *           recordIsArray: true,
     *           fields: fields,
     *           paginationType: "progressive"
     *       }, data, data.length );
     *   $("#partsView").tableModelView( {
     *       modelName: "parts",
     *       beforeTemplate: '<table class="u-Report"><thead><tr><th>Part No</th><th>Description</th></tr></thead><tbody>',
     *       afterTemplate: '</tbody></table>',
     *       recordTemplate: '<tr><td>&PARTNO.</td><td>&PART_DESC.</td></tr>',
     *       pagination: {
     *           scroll: true
     *       }
     *   } );
     */
    $.widget( "apex.tableModelView", $.apex.tableModelViewBase,
        /**
         * @lends tableModelView.prototype
         */
        {
        version: "18.1",
        widgetEventPrefix: "tableModelView",
        options: {
            /**
             * <p>Markup to render before the record data. For example <code class="prettyprint">&lt;ul></code>.</p>
             *
             * @memberof tableModelView
             * @instance
             * @type {string}
             * @default "&lt;ul>"
             * @example "<ol>"
             * @example "<ol>"
             */
            beforeTemplate: "<ul>",
            /**
             * <p>Markup to render for each record. Can use substitution tokens from the
             * model using column names. In addition you use the following special substitution symbols:</p>
             * <ul>
             *     <li>APEX$ROW_ID - the record id</li>
             *     <li>APEX$ROW_INDEX - the record index</li>
             *     <li>APEX$ROW_URL - the record url</li>
             *     <li>APEX$ROW_STATE_CLASSES - various record states such as is-inserted or is-deleted</li>
             * </ul>
             * <p>At a minimum one of {@link tableModelView#labelColumn} or {@link tableModelView#recordTemplate} is required.</p>
             *
             * @memberof tableModelView
             * @instance
             * @type {string}
             * @default Markup depends on several other options.
             * @example "<li>&NAME. - &SALARY.</li>"
             * @example "<li>&NAME. - &SALARY.</li>"
             */
            recordTemplate: null,
            /**
             * <p>Markup to render after the record data. For example <code class="prettyprint">&lt;/ul></code>.</p>
             *
             * @memberof tableModelView
             * @instance
             * @type {string}
             * @default "&lt;/ul>"
             * @example "</ol>"
             * @example "</ol>"
             */
            afterTemplate: "</ul>",
            /**
             * <p>Extra CSS classes to add to the element that is the parent of the collection of records.</p>
             *
             * @memberof tableModelView
             * @instance
             * @type {string}
             * @default "a-TMV-defaultIconView" if {@link tableModelView#recordTemplate} is null and null otherwise.
             * @example "EmployeeList"
             * @example "EmployeeList"
             */
            collectionClasses: null,
            /**
             * <p>The CSS class column to use for the icon. At most one of <code class="prettyprint">iconClassColumn</code>
             * and <code class="prettyprint">imageURLColumn</code> should be given.</p>
             *
             * @memberof tableModelView
             * @instance
             * @type {string}
             * @default null
             * @example "PERSON_AVATAR"
             * @example "PERSON_AVATAR"
             */
            iconClassColumn: null,
            /**
             * <p>The URL column of image to use for the icon. At most one of <code class="prettyprint">iconClassColumn</code>
             * and <code class="prettyprint">imageURLColumn</code> should be given.</p>
             *
             * @memberof tableModelView
             * @instance
             * @type {string}
             * @default null
             * @example "PROD_IMAGE_URL"
             * @example "PROD_IMAGE_URL"
             */
            imageURLColumn: null,
            /**
             * <p>Attributes for the <code class="prettyprint">&lt;img></code> element.
             * Only used if {@link tableModelView#imageURLColumn} is specified.</p>
             *
             * @memberof tableModelView
             * @instance
             * @type {string}
             * @default null
             */
            imageAttributes: null,
            /**
             * <p>Name of the column that contains the label text.</p>
             * <p>At a minimum one of {@link tableModelView#labelColumn} or {@link tableModelView#recordTemplate} is required.</p>
             *
             * @memberof tableModelView
             * @instance
             * @type {string}
             * @default null
             * @example "EMP_NAME"
             * @example "EMP_NAME"
             */
            labelColumn: null,
            /**
             * <p>If true the record metadata should contain a <code class="prettyprint">url</code> property that contains the link target.</p>
             *
             * @memberof tableModelView
             * @instance
             * @type {boolean}
             * @default false
             * @example true
             * @example true
             */
            linkTarget: false,
            /**
             * <p>The name of the column that contains the anchor <code class="prettyprint">href</code>.
             * If not given the <code class="prettyprint">href</code> comes from the record field metadata
             * <code class="prettyprint">url</code> property. If there is no <code class="prettyprint">url</code>
             * property then this item has no link.</p>
             *
             * @memberof tableModelView
             * @instance
             * @type {string}
             * @example "PROD_TARGET"
             * @example "PROD_TARGET"
             */
            linkTargetColumn: null,
            /**
             * <p>Additional anchor attributes. Ignored unless a link is present.</p>
             *
             * @memberof tableModelView
             * @instance
             * @type {string}
             * @example "target='_blank'"
             * @example "target='_blank'"
             */
            linkAttributes: null,
            /**
             * <p>If true use the {@link iconList} widget to display the records.</p>
             *
             * @memberof tableModelView
             * @instance
             * @type {boolean}
             * @example true
             * @example true
             */
            useIconList: false,
            /**
             * <p>Additional options to pass to the {@link iconList} widget. See {@link iconList} for information about the
             * options it supports. Only applies if {@link tableModelView#useIconList} option is true.</p>
             *
             * @memberof tableModelView
             * @instance
             * @type {object}
             */
            iconListOptions: {},
            //
            // events:
            //

            /**
             * Triggered when the selection state changes. It has no additional data. Only tableModelViews with
             * {@link tableModelView#useIconList} true support selection.
             *
             * @event selectionchange
             * @memberof tableModelView
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             *
             * @example <caption>Initialize the tableModelView with the <code class="prettyprint">selectionChange</code> callback specified:</caption>
             * $( ".selector" ).tableModelView({
             *     selectionChange: function( event ) {}
             * });
             *
             * @example <caption>Bind an event listener to the <code class="prettyprint">tablemodelviewselectionchange</code> event:</caption>
             * $( ".selector" ).on( "tablemodelviewselectionchange", function( event ) {} );
             */
            selectionChange: null,
            /**
             * Triggered when there is a pagination event that results in new records being displayed.
             *
             * @event pagechange
             * @memberof tableModelView
             * @instance
             * @property {Event} event <code class="prettyprint">jQuery</code> event object.
             * @property {Object} data Additional data for the event.
             * @property {number} data.offset the offset of the first record in the page.
             * @property {number} data.count the number of records in the page that were added to the view.
             *
             * @example <caption>Initialize the tableModelView with the <code class="prettyprint">pageChange</code> callback specified:</caption>
             * $( ".selector" ).tableModelView({
             *     pageChange: function( event, data ) {}
             * });
             *
             * @example <caption>Bind an event listener to the <code class="prettyprint">tablemodelviewpagechange</code> event:</caption>
             * $( ".selector" ).on( "tablemodelviewpagechange", function( event, data ) {} );
             */
            pageChange: null
        },

        _create: function () {
            var template,
                o = this.options,
                ctrl$ = this.element;

            debug.info("TabelModelView '" + ctrl$[0].id + "' created. Model: " + o.modelName );

            ctrl$.addClass( C_TMV );

            this.rowHeight = null;
            this.recPerRow = null;

            this._super(); // init table model view base

            // get the model
            this._initModel( o.modelName );

            this._on( this._eventHandlers );

            this._initRecordTemplate();

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
                this.resize();
                event.stopPropagation();
            }
        },

        _destroy: function() {
            this._tableModelViewDestroy();
            this.element.removeClass( C_TMV + " " + C_DISABLED )
                .empty(); // this will destroy the iconList if any

            this.data$ = null;

            // disconnect from the model
            this._initModel( null ); // this will cleanup change listener
        },

        _setOption: function ( key, value ) {
            var o = this.options;

            debug.info("TabelModelView '" + this.element[0].id + "' set option '" + key + "' to: ", value );

            if ( key === "iconListOptions" ) {
                throw new Error( "TabelModelView " + key + " cannot be set. Set options directly on the iconList widget" );
            }

            this._super( key, value );

            if ( key === "disabled" ) {
                this.element.toggleClass( C_DISABLED, value );
                if ( this.options.useIconList ) {
                    return this.getIconList().option( key, value );
                }
                if ( value ) {
                    // when enabling do this just in case it was resized while disabled
                    this.resize();
                }
            } else if ( key === "modelName" ) {
                this._initModel( value );
                this.refresh( false );
            } else if ( key === "highlights" ) {
                this._updateHighlights();
            } else if ( key === "beforeTemplate" || key === "recordTemplate" || key === "afterTemplate" || key === "collectionClasses" ||
                        key === "iconClassColumn" || key === "imageURLColumn" || key === "imageAttributes" ||
                        key === "labelColumn" || key === "linkTarget" || key === "linkTargetColumn" || key === "linkAttributes") {
                this._initRecordTemplate();
                this.refresh();
            } else if ( key === "footer" || key === "useIconList" || key === "pagination" ) {
                this.refresh();
            }
        },

        /**
         * <p>Refresh the view. Typically no need to call this method because it is called automatically when
         * the model data is refreshed.</p>
         *
         * @param {boolean} [pFocus] if true put focus in the view, if false don't. If undefined/omitted maintain
         * focus if the view already has focus.
         */
        refresh: function( pFocus ) {
            var selection,
                ctrl$ = this.element;

            if ( pFocus === undefined ) {
                pFocus = $( document.activeElement ).closest( ctrl$ ).length > 0;
            }

            // preserve current selection
            if ( this.data$ ) {
                selection = this.getSelectedRecords();
            }

            this._refreshPagination( ctrl$.find( SEL_TMV_WRAP_SCROLL ) );

            // todo don't redraw everything unless needed
            this._initView();

            this._updateStatus();
            this.resize();
            this._addPageOfRecords( function() {
                // restore selection if any
                if ( selection && selection.length > 0 ) {
                    this.setSelectedRecords( selection, pFocus );
//xxx            } else {
//                if ( pModelChanged ) {
//                    self._trigger( EVENT_SELECTION_CHANGE, {} );
//                }
//                if ( pFocus ) {
//                    this.focus();
//                }
                }
            } );
        },

        /**
         * <p>This method must be called if the size of the container changes so that pagination state, footer position,
         * and nested {@link iconList} if any can be updated to reflect the new size.</p>
         */
        resize: function() {
            var w, h, recPerRow, rowHeight,
                ctrl$ = this.element,
                o = this.options,
                ctrlH = ctrl$.height(),
                body$ = ctrl$.children().first(),
                wrapper$ = ctrl$.find( SEL_TMV_WRAP_SCROLL );

            w = ctrl$.width();
            wrapper$.width( w );
            this.rowHeight = null;
            this.recPerRow = null;

            if ( o.hasSize ) {
                h = ctrlH - this._footerHeight();
                body$.height( h );
                wrapper$.height( h );
            }
            if ( o.useIconList ) {
                this.data$.iconList( "resize" );
                if ( this.scrollPaging ) {
                    // adjust the height of the filler items
                    // this is using some knowledge of the base class
                    recPerRow = this._getRecordsPerRow();
                    rowHeight = this._getRecordHeight();
                    this.data$.find( SEL_GRID_SCROLL_FILLER ).each( function() {
                        var h,
                            f$ = $( this ),
                            start = parseInt( f$.last().attr(DATA_START), 10 ),
                            end = parseInt( f$.last().attr(DATA_END), 10 );

                        h = Math.floor( ( end - start ) / recPerRow ) * rowHeight;
                        f$.css( "height", h );
                    } );
                }
            }
            this._initPageSize();
        },

        /**
         * <p>Return the currently selected elements.</p>
         *
         * <p>This is only applicable if the {@link tableModelView#useIconList} option is true.</p>
         *
         * @return {jQuery} The selected record elements. Returns null if not using an iconList.
         */
        getSelection: function() {
            if ( this.options.useIconList ) {
                return this.getIconList().getSelection();
            }
            return null;
        },

        /**
         * <p>Set the selected record elements.</p>
         *
         * <p>This is only applicable if the {@link iconList#useIconList} option is true.</p>
         *
         * @param {jQuery} pElements$ A jQuery object with record elements such as the return value of getSelection.
         * @param {boolean} [pFocus] If true the first element of the selection is given focus.
         * @param {boolean} [pNoNotify] If true the selection change event will be suppressed.
         */
        setSelection: function( pElements$, pFocus, pNoNotify ) {
            if ( this.options.useIconList ) {
                return this.getIconList().setSelection( pElements$, pFocus, pNoNotify );
            }
        },

        /**
         * <p>Given a jQuery object with one or more record elements return the corresponding model records.
         * For this to work the elements must have a data-id attribute with the value of the record id.</p>
         *
         * @param {jQuery} pElements$ A jQuery object of record elements such as returned by getSelection.
         * @return {model.Record[]} Array of records from the model corresponding to the record elements.
         */
        getRecords: function( pElements$ ) {
            var id, value,
                self = this,
                values = [];

            pElements$.each( function() {
                id = $(this).attr( "data-id" );
                if ( id ) {
                    value = self.model.getRecord( id );
                    if ( value ) {
                        values.push( value );
                    }
                }
            } );

            return values;
        },

        /**
         * <p>Return the underlying data model records corresponding to the current selection.</p>
         * <p>This is only applicable if the {@link tableModelView#useIconList} option is true. If it is false then null is returned.</p>
         *
         * @return {model.Record[]} Array of records from the model corresponding to the selected record elements.
         */
        getSelectedRecords: function() {
            if ( this.options.useIconList ) {
                return this.getRecords( this.getSelection() );
            } // else
            return null;
        },

        /**
         * <p>Select the elements that correspond to the given data model records.</p>
         *
         * <p>This is only applicable if the {@link tableModelView#useIconList} option is true.</p>
         *
         * @param {model.Record[]} pRecords Array of data model records to select.
         * @param {boolean} [pFocus] If true the first record of the selection is given focus.
         * @param {boolean} [pNoNotify] If true the selection change event will be suppressed.
         */
        setSelectedRecords: function( pRecords, pFocus, pNoNotify ) {
            var i,
                rows = [],
                keys = {};

            if ( this.options.useIconList ) {
                for ( i = 0; i < pRecords.length; i++ ) {
                    keys[this.model.getRecordId( pRecords[i] )] = true;
                }
                this.data$.children().each(function() {
                    var id = $( this ).attr( "data-id" );

                    if ( keys[id] ) {
                        rows.push( this );
                    }
                });
                this.setSelection( $( rows ), pFocus, pNoNotify );
            }
        },

        /**
         * <p>Return the iconList instance if option {@link tableModelView#useIconList} is true, and null otherwise.</p>
         * <p>Note: This returns the instance and not the jQuery object.</p>
         *
         * @return {object} iconList The {@link iconList} widget instance.
         * @example <caption>This example gets the iconList and calls the getColumns method.</caption>
         * $(".selector").tableModelView("getIconList").getColumns();
         */
        getIconList: function() {
            if ( this.options.useIconList ) {
                return this.data$.data("apex-iconList");
            }
            return null;
        },

        //
        // Internal methods
        //
        _initRecordTemplate: function() {
            var m, template, closeTag, href,
                startsWithTag = /^\s*<[\w]+[^>]*>/,
                o = this.options;

            if ( !o.recordTemplate ) {
                if ( !o.collectionClasses ) {
                    o.collectionClasses = "a-TMV-defaultIconView";
                }
                if ( !o.labelColumn ) {
                    throw new Error( "Option recordTemplate or labelColumn is required" );
                }

                o.beforeTemplate = "<ul>";
                o.afterTemplate = "</ul>";

                template = "<li data-id='&APEX$ROW_ID.' class='&APEX$ROW_STATE_CLASSES.'>";
                if ( o.linkTarget || o.linkTargetColumn ) {
                    if ( o.linkTargetColumn ) {
                        href = o.linkTargetColumn;
                    } else {
                        href = "APEX$ROW_URL";
                    }
                    template += "<a href='&" + href + ".' class='a-IconList-content'" + ( o.linkAttributes ? " " + o.linkAttributes + " " : "" ) + ">";
                    closeTag = "</a>";
                } else {
                    template += "<span class='a-IconList-content'>";
                    closeTag = "</span>";
                }
                if ( o.iconClassColumn || o.imageURLColumn ) {
                    template += "<span class='a-IconList-icon'>";
                    if ( o.iconClassColumn ) {
                        template += "<span class='&" + o.iconClassColumn + ".'></span>";
                    } else {
                        template += "<img src='&" + o.imageURLColumn + ".'" + ( o.imageAttributes ? " " + o.imageAttributes + " " : "" ) + "/>";
                    }
                    template += "</span>";
                }
                template += "<span class='a-IconList-label'>&" + o.labelColumn + ".</span>";
                template += closeTag + "</li>";
                o.recordTemplate = template;
            }

            m = startsWithTag.exec( o.recordTemplate );
            if ( !m ) {
                if ( o.beforeTemplate.toLowerCase().match( /<ul|<ol/ ) ) {
                    o.recordTemplate = "<li>" + o.recordTemplate + "</li>";
                } else {
                    o.recordTemplate = "<div>" + o.recordTemplate + "</div>";
                }
            }
        },

        _initView: function() {
            var self = this,
                o = this.options,
                out = this._getDataRenderContext();

            this.recordElement = $( o.recordTemplate )[0].nodeName.toLowerCase();

            out.markup( "<div" )
                .attr( "class", C_TMV_BODY )
                .markup( ">" );
            this._renderAltDataMessages( out );

            out.markup( "<div" )
                .attr( "class", C_TMV_WRAP_SCROLL )
                .markup( ">" )
                    .markup( o.beforeTemplate )
                        .markup( "<" + this.recordElement + " class='js-data-placeholder' style='display:none;'></" + this.recordElement + ">")
                    .markup( o.afterTemplate );
                this._renderLoadMore( out );
                out.markup( "</div></div>" );
            this._renderFooter( out );

            this.element.html( out.toString() );

            this.data$ = this.element.find( ".js-data-placeholder" ).parent();
            this.data$.empty().addClass( o.collectionClasses || "" );

            if ( o.useIconList ) {
                this.data$.iconList( o.iconListOptions );
                this.data$.on("iconlistselectionchange", function( event ) {
                    self._updateStatus();
                    self._trigger( "selectionChange", event );
                } );
            }

            this._initPaginationFooter( this.element.find( SEL_TMV_WRAP_SCROLL ) );
        },

        _initRecordMetrics: function() {
            var r$,
                o = this.options;

            this.recPerRow = 1;
            r$ = this.data$.children().filter( ":visible" ).first();
            if ( !r$.length ) {
                r$ = $( apex.util.applyTemplate( o.recordTemplate, {} ) );
                r$ = this.data$.append(r$);
                if ( o.useIconList ) {
                    // can't just resize because need fixup to list items that refresh does
                    this.getIconList().refresh();
                    this.recPerRow = this.getIconList().getColumns();
                }
                this.rowHeight = r$.outerHeight();
                this.data$.empty();
            } else {
                if ( o.useIconList ) {
                    this.recPerRow = this.getIconList().getColumns();
                }
                this.rowHeight = r$.outerHeight();
            }
        },

        //
        // Methods to override
        //

        // this assumes all records are the same height
        _getRecordHeight: function() {
            if ( !this.rowHeight ) {
                this._initRecordMetrics();
            }
            return this.rowHeight;
        },

        _getRecordsPerRow: function() {
            if ( !this.recPerRow ) {
                this._initRecordMetrics();
            }
            return this.recPerRow;
        },

        _getDataContainer: function() {
            return this.data$;
        },

        _selectedCount: function() {
            if ( this.options.useIconList ) {
                return this.getIconList().getSelection().length;
            } // else
            return 0;
        },

        _hasControlBreaks: function() {
            return false;
        },

        _elementsFromRecordIds: function( ids ) {
            var rows = [];
            // todo
            return [];
        },

        _renderFillerRecord: function ( out, cssClass ) {
            out.markup( "<" + this.recordElement + " class='" + cssClass + "'></" + this.recordElement + ">" );
        },

        _insertFiller: function( out, curFiller$ ) {
            var filler$ = $( out.toString() );
            if ( curFiller$ ) {
                curFiller$.before( filler$ );
            } else {
                this.data$.html( filler$ );
            }
            return filler$;
        },

        _insertData: function( out, offset, count, filler$, how ) {
            if ( !filler$ ) {
                this.data$.append( out.toString() );
            } else {
                // else must have filler$ and how must be before or after
                filler$[how]( out.toString() );
            }
            if ( this.options.useIconList ) {
                this.data$.iconList( "refresh" );
            }
            this._trigger( "pageChange", null, {
                offset: offset,
                count: count
            });
        },

        _controlBreakLabel: function( record ) {
            return "";
        },

        _renderBreakRecord: function ( out, expandControl, breakLabel, serverOffset ) {
            out.markup( "<h3>" )
                .content( breakLabel )
                .markup( "</h3>" );
        },

        _renderRecord: function( out, record, index, id, meta ) {
            var highlight,
                o = this.options,
                cls = "",
                data = {};

            // add special symbols
            data.APEX$ROW_ID = "" + id;
            data.APEX$ROW_INDEX = "" + ( index + 1 );
            if ( meta.url ) {
                data.APEX$ROW_URL = meta.url;
            }
            if ( meta.deleted ) {
                cls += " " + C_DELETED;
            } else {
                if ( meta.inserted ) {
                    cls += " is-inserted";
                } else if ( meta.updated ) {
                    cls += " is-updated";
                }
                if ( meta.error ) {
                    cls += " is-error";
                } else if ( meta.warning ) {
                    cls += " is-warning";
                }
                if ( meta.highlight ) {
                    highlight = o.highlights[meta.highlight];
                    if ( highlight && highlight.cssClass ) {
                        cls += " " + highlight.cssClass;
                    } else {
                        cls += " " + meta.highlight;
                    }
                }
//xxx                if ( meta.message && noTooltip ) {
//                    rowHeaderTitle = meta.message;
//                }
            }
            if ( cls ) {
                data.APEX$ROW_STATE_CLASSES = cls;
            }

            out.markup( apex.util.applyTemplate( this.options.recordTemplate, {
                extraSubstitutions: data,
                model: this.model,
                record: record
            } ) );
        },

        _removeRecord: function( element ) {
        },

        _insertRecord: function( element, record, id, meta, where ) {
            return $();
        },

        _afterInsert: function( insertedElements ) {
        },

        _identityChanged: function( prevId, id ) {
        },

        _replaceRecord: function( element, record, oldId, id, meta ) {
        },

        _updateRecordField: function( element, record, field, meta ) {
        },

        _removeFocus: function( element ) {
        },

        _updateRecordState: function( element, id, record, meta ) {
        }
    });

})( apex.util, apex.model, apex.debug, apex.lang, apex.item, apex.jQuery );
