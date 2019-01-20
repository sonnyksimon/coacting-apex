/*!
 Copyright (c) 2012, 2018 Oracle and/or its affiliates. All rights reserved.
*/
/*global apex,$v,apex_img_dir*/
/**
 * <p>The apex.util namespace contains general utility functions of Oracle Application Express.</p>
 *
 * @namespace
 */
apex.util = (function( $ ) {
    "use strict";

    function escapeRegExp( pValue ) {
        var lReturn = "";
        if ( pValue ) {
            return pValue.replace(/([\.\$\*\+\-\?\(\)\{\}\|\^\[\]\\])/g,'\\$1');
        }
        return lReturn;
    } // escapeRegExp

    function escapeHTML( pValue ) {
        return pValue.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#x27;")
            .replace(/\//g, "&#x2F;");
    } // escapeHTML

    // for now escaping attributes and content is handled the same
    var escapeHTMLAttr = function( s ) {
            s = "" + s; // make sure s is a string
            return escapeHTML( s );
        },
        escapeHTMLContent = escapeHTMLAttr;

    var
        /*
         *CSS meta-characters (based on list at http://api.jquery.com/category/selectors/)
         *Define a closure to just do the escaping once
         */
        CSS_META_CHARS_REGEXP = new RegExp( "([" + escapeRegExp( " !#$%&'()*+,./:;<=>?@[\\]^`{|}~" + '"' ) + "])", "g" ),
        gScrollbarSize = null,
        gPageTemplateData = null,
        /*
         * Cache the top most APEX object. The top most APEX object is
         * the one in the window object closest to the top that we have access to.
         */
        gTopApex = null;

    /*
     * todo think should this be smarter about numeric attribute values?
     * todo consider an attrs method that takes a plain object
     */
    /**
     * <p>The htmlBuilder interface is used create HTML markup. It makes it easy to generate markup that is
     * well formed and properly escaped. It is simpler and safer than using string concatenation and doesn't
     * require the overhead of using a template library. For simple templates see {@link apex.util.applyTemplate}</p>
     *
     * @interface htmlBuilder
     * @example <caption>This example creates an HTML string consisting of a label and text input and inserts it
     *     into the DOM. Data to be mixed into the markup is in an options object. The options values will be
     *     properly escaped to avoid cross site scripting security issues. With an options object
     *     <code class="prettyprint">{ id: "nameInput", label: "Name", size: 10, maxChars: 15 }</code>
     *     the resulting markup will be:<br>
     *     <code>&lt;label for='nameInput'>Name&lt;/label>&lt;input type='text' id='nameInput' class='specialInput' size='10' maxlength='15' value='' /></code></caption>
     * var out = apex.util.htmlBuilder();
     * out.markup( "<label" )
     *     .attr( "for", options.id )
     *     .markup( ">" )
     *     .content( option.label )
     *     .markup( "</label><input type='text'" )
     *     .attr( "id", options.id )
     *     .attr( "class", "specialInput" )
     *     .optionalAttr( "title", options.title )
     *     .attr( "size", options.size )
     *     .attr( "maxlength",  options.maxChars )
     *     .attr( "value", "" )
     *     .markup( " />" );
     * $( "#myContainer", out.toString() );
     */
    /**
     * @lends htmlBuilder.prototype
     */
    var htmlBuilderPrototype = {
        /**
         * <p>Add markup.</p>
         * @param {string} pMarkup The markup to add. No escaping is done.
         * @return {this} This htmlBuilder instance for method chaining.
         */
        markup: function( pMarkup ) {
            this.html += pMarkup;
            return this;
        },
        /**
         * <p>Add an attribute.<p>
         * @param {string} [pName] Attribute name. A leading space and trailing = is added and the value is quoted.
         *     If not given just the value is added without being quoted.
         * @param {string} pValue Attribute value. This will be escaped.
         * @return {this} This htmlBuilder instance for method chaining.
         */
        attr: function( pName, pValue ) {
            if (arguments.length === 1) { // name is optional
                pValue = pName;
                pName = null;
            }
            if (pName) {
                this.html += " " + pName + "='";
            }
            this.html += escapeHTMLAttr(pValue);
            if (pName) {
                this.html += "'";
            }
            return this;
        },
        /**
         * <p>Add an optional attribute. The attribute and its value is only added if the value is a non-empty
         * string or a non-zero number or true.</p>
         * @param {string} pName Attribute name. A leading space and trailing = is added and the value is quoted.
         * @param {string} pValue Attribute value. This will be escaped.
         * @return {this} This htmlBuilder instance for method chaining.
         */
        optionalAttr: function( pName, pValue ) {
            if (pValue && typeof pValue !== "object") {
                this.html += " " + pName + "='" + escapeHTMLAttr(pValue) + "'";
            }
            return this;
        },
        /**
         * <p>Add an optional Boolean attribute. The attribute is added only if the value is true.</p>
         * @param {string} pName Attribute name. A leading space is added.
         * @param {boolean} pValue If true the attribute is added. If false the attribute is not added.
         * @return {this} This htmlBuilder instance for method chaining.
         */
        optionalBoolAttr: function( pName, pValue ) {
            // must be boolean and must be true - not just truthy
            if (pValue === true) {
                this.html += " " + pName;
            }
            return this;
        },
        /**
         * <p>Add element content. The content is escaped.<p>
         * @param {string} pContent The content to add between an element open and closing tags.
         * @return {this} This htmlBuilder instance for method chaining.
         */
        content: function( pContent ) {
            this.html += escapeHTMLContent(pContent);
            return this;
        },
        /**
         * <p>Remove all markup from this builder interface instance. Use this when you want to reuse the builder
         * instance for new markup.</p>
         */
        clear: function() {
            this.html = "";
        },
        /**
         * <p>Return the HTML markup.</p>
         * @return {string} The markup that has been built so far.
         */
        toString: function() {
            return this.html;
        }
    };

    /**
     * @lends apex.util
     */
    var util = {

    /**
     * <p>Returns a new function that calls <code class="prettyprint">pFunction</code> but not until
     * <code class="prettyprint">pDelay</code> milliseconds after the last time the returned function is called.</p>
     *
     * @param {function} pFunction The function to call.
     * @param {number} pDelay The time to wait before calling the function in milliseconds.
     * @return {function} The debounced version of <code class="prettyprint">pFunction</code>.
     * @example <caption>This example calls the function formatValue in response to the user typing characters but only
     * after the user pauses typing. In a case like this formatValue would also be called from the blur event on the same item.</caption>
     * function formatValue() {
     *     var value = $v("P1_PHONE_NUMBER");
     *     // code to format value as a phone number
     *     $s("P1_PHONE_NUMBER_DISPLAY", value);
     * }
     * apex.jQuery( "#P1_PHONE_NUMBER" ).on( "keypress", apex.util.debounce( formatValue, 100 ) );
     */
    debounce: function( pFunction, pDelay ) {
        var timer;
        return function() {
            var args = arguments,
                context = this;

            clearTimeout( timer );
            timer = setTimeout( function() {
                timer = null;
                pFunction.apply( context, args );
            }, pDelay );
        }
    }, // debounce

    // todo consider if it would be nice if a = [1,2,3]; a === apex.util.toArray(a) // nice if true but currently not
    /**
     * <p>Function that returns an array based on the value passed in <code class="prettyprint">pValue</code>.</p>
     *
     * @param {string|*} pValue If this is a string, then the string will be split into an array using the
     *                          <code class="prettyprint">pSeparator</code> parameter.
     *                          If it's not a string, then we try to convert the value with
     *                          <code class="prettyprint">apex.jQuery.makeArray</code> to an array.
     * @param {string} [pSeparator=":"] Separator used to split a string passed in <code class="prettyprint">pValue</code>,
     *   defaults to colon if not specified. Only needed when <code class="prettyprint">pValue</code> is a string.
     *   It is ignored otherwise.
     * @return {Array}
     *
     * @example <caption>This example splits the string into an array with 3 items:
     * <code class="prettyprint">["Bags","Shoes","Shirts"]</code>.</caption>
     * lProducts = apex.util.toArray( "Bags:Shoes:Shirts" );
     * @example <caption>This example splits the string into an array just like in the previous example. The only
     * difference is the separator character is ",".</caption>
     * lProducts = apex.util.toArray( "Bags,Shoes,Shirts", "," );
     * @example <caption>This example returns the jQuery object as an array.</caption>
     * lTextFields = apex.util.toArray( jQuery("input[type=text]") );
     */
    toArray: function( pValue, pSeparator ) {
        var lSeparator,
            lReturn = [];

        // If pValue is a string, we have to split the string with the separator
        if ( typeof pValue === "string" ) {

            // Default separator to a colon, if not supplied
            if ( pSeparator === undefined ) {
                lSeparator = ":";
            } else {
                lSeparator = pSeparator;
            }

            // Split into an array, using the defined separator
            lReturn = pValue.split( lSeparator );

            // If it's not a string, we try to convert pValue to an array and return it
        } else {
            lReturn = $.makeArray( pValue );
        }
        return lReturn;
    }, // toArray

    /**
     * <p>Compare two arrays and return true if they have the same number of elements and
     * each element of the arrays is strictly equal to each other. Returns false otherwise.
     * This is a shallow comparison.</p>
     *
     * @param {Array} pArray1 The first array.
     * @param {Array} pArray2 The second array.
     * @return {boolean} true if a shallow comparison of the array items are equal
     * @example <caption>This example returns true.</caption>
     * apex.util.arrayEqual( [1,"two",3], [1, "two", 3] );
     * @example <caption>This example returns false.</caption>
     * apex.util.arrayEqual( [1,"two",3], [1, "two", "3"] );
     */
    arrayEqual: function(pArray1, pArray2) {
        var i,
            len = pArray1.length;
        if ( len !== pArray2.length ) {
            return false;
        }
        for ( i = 0; i < len; i++ ) {
            if (pArray1[i] !== pArray2[i] ) {
                return false;
            }
        }
        return true;
    }, // arrayEqual

    /**
     * <p>Returns string <code class="prettyprint">pValue</code> with any special HTML characters (&<>"'/)
     * escaped to prevent cross site scripting (XSS) attacks.
     * It provides the same functionality as <code class="prettyprint">sys.htf.escape_sc</code> in PL/SQL.</p>
     *
     * <p>This function should always be used when inserting untrusted data into the DOM.</p>
     *
     * @function
     * @param {string} pValue The string that may contain HTML characters to be escaped.
     * @return {string} The escaped string.
     *
     * @example <caption>This example appends text to a DOM element where the text comes from a page item called
     *     P1_UNTRUSTED_NAME. Data entered by the user cannot be trusted to not contain malicious markup.</caption>
     * apex.jQuery( "#show_user" ).append( apex.util.escapeHTML( $v("P1_UNTRUSTED_NAME") ) );
     */
    escapeHTML: escapeHTML,

    /**
     * Function that returns a string where Regular Expression special characters (\.^$*+-?()[]{}|) are escaped which can
     * change the context in a regular expression. It has to be used to secure user input.
     *
     * @ignore
     * @param {string} pValue   String which should be escaped.
     * @return {string} The escaped string, or an empty string if pValue is null or undefined
     *
     * @example
     * searchValue = new RegExp( "^[-!]?" + apex.util.escapeRegExp( pInputText ) + "$" );
     *
     * @function escapeRegExp
     */
    escapeRegExp:  escapeRegExp,

    /**
     * <p>Returns string <code class="prettyprint">pValue</code> with any CSS meta-characters escaped.
     * Use this function when the value is used in a CSS selector.
     * Whenever possible if a value is going to be used as a selector, constrain the value so
     * that it cannot contain CSS meta-characters making it unnecessary to use this function.</p>
     *
     * @param {string} pValue The string that may contain CSS meta-characters to be escaped.
     * @return {string} The escaped string, or an empty string if pValue is null or undefined.
     * @example <caption>This example escapes an element id that contains a (.) period character so that it finds the
     *     element with id = "my.id". Without using this function the selector would have a completely
     *     different meaning.</caption>
     * apex.jQuery( "#" + apex.util.escapeCSS( "my.id" ) );
     */
    escapeCSS: function( pValue ) {
        var lReturn = "";
        if ( pValue ) {
            // Escape any meta-characters (based on list at http://api.jquery.com/category/selectors/)
            return pValue.replace( CSS_META_CHARS_REGEXP, "\\$1" );
        }
        return lReturn;
    }, // escapeCSS

    /**
     * <p>Return an {@link htmlBuilder} interface.</p>
     * @return {htmlBuilder}
     */
    htmlBuilder: function() {
        var that = Object.create( htmlBuilderPrototype );
        that.clear();
        return that;
    },

    // todo consider adding to doc needs unit tests
    /**
     * Creates a URL to an APEX application page from properties given in pArgs and information on the current page
     * pArgs is an object containing any of the following optional properties
     * - appId the application id (flow id). If undefined or falsey the value is taken from the current page
     * - pageId the page id (flow step id). If undefined or falsey the value is taken from the current page
     * - session the session (instance). If undefined or falsey the value is taken from the current page
     * - request a request string used for button processing. If undefined or falsey the value is taken from the current page
     * - debug YES, NO, LEVEL<n> sets the debug level. If undefined or falsey the value is taken from the current page
     * - clearCache a comma separated list of pages RP, APP, SESSION. The default is empty string
     * - itemNames an array of item names to set in session state
     * - itemValues an array of values corresponding to each item name in the itemNames array.
     * - todo consider a map alternative for items
     * - printerFriendly Yes or empty string. Default is empty string.
     *
     * @ignore
     * @param pArgs
     * @return {string}
     */
    makeApplicationUrl: function ( pArgs ) {
        var i,
            lUrl = "f?p=";

        lUrl += pArgs.appId || $v( "pFlowId" );
        lUrl += ":";
        lUrl += pArgs.pageId || $v( "pFlowStepId" );
        lUrl += ":";
        lUrl += pArgs.session || $v( "pInstance" );
        lUrl += ":";
        lUrl += pArgs.request || $v( "pRequest" );
        lUrl += ":";
        lUrl += pArgs.debug || $v( "pdebug" ) || "";
        lUrl += ":";
        lUrl += pArgs.clearCache || "";
        lUrl += ":";
        if ( pArgs.itemNames ) {
            lUrl += pArgs.itemNames.join( "," );
        }
        lUrl += ":";
        if (pArgs.itemValues) {
            for ( i = 0; i < pArgs.itemValues.length; i++ ) {
                if ( i > 0 ) {
                    lUrl += ",";
                }
                lUrl += encodeURIComponent( pArgs.itemValues[ i ] );
            }
        }
        lUrl += ":";
        lUrl += pArgs.printerFriendly || "";

        return lUrl;
    },

    // xxx need unit tests
    /**
     * Function that renders a spinning alert to show the user that processing is taking place. Note that the alert is
     * defined as an ARIA alert so that assistive technologies such as screen readers are alerted to the processing status.</p>
     *
     * @param {string|jQuery|Element} [pContainer] Optional jQuery selector, jQuery, or DOM element identifying the
     *     container within which you want to center the spinner. If not passed, the spinner will be centered on
     *     the whole page. The default is $("body").
     * @param {Object} [pOptions] Optional object with the following properties:
     * @param {string} [pOptions.alert] Alert text visually hidden, but available to Assistive Technologies.
     *     Defaults to "Processing".
     * @param {string} [pOptions.spinnerClass] Adds a custom class to the outer SPAN for custom styling.
     * @param {boolean} [pOptions.fixed] if true the spinner will be fixed and will not scroll.
     * @return {jQuery} A jQuery object for the spinner. Use the jQuery remove method when processing is complete.
     * @example <caption>To show the spinner when processing starts.</caption>
     * var lSpinner$ = apex.util.showSpinner( $( "#container_id" ) );
     * @example <caption>To remove the spinner when processing ends.</caption>
     * lSpinner$.remove();
     */
    showSpinner: function( pContainer, pOptions ) {
        var lSpinner$, lLeft, lTop, lBottom, lYPosition, lYOffset,
            out         = util.htmlBuilder(),
            lOptions    = $.extend ({
                alert:          apex.lang.getMessage( "APEX.PROCESSING" ),
                spinnerClass:    ""
            }, pOptions ),
            lContainer$ = ( pContainer && !lOptions.fixed ) ? $( pContainer ) : $( "body" ),
            lWindow$    = $( window ),
            lContainer  = lContainer$.offset(),
            lViewport   = {
                top:  lWindow$.scrollTop(),
                left: lWindow$.scrollLeft()
            };

        // The spinner markup
        out.markup( "<span" )
            .attr( "class", "u-Processing" + ( lOptions.spinnerClass ? " " + lOptions.spinnerClass : "" ) )
            .attr( "role", "alert" )
            .markup( ">" )
            .markup( "<span" )
            .attr( "class", "u-Processing-spinner" )
            .markup( ">" )
            .markup( "</span>" )
            .markup( "<span" )
            .attr( "class", "u-VisuallyHidden" )
            .markup( ">" )
            .content( lOptions.alert )
            .markup( "</span>" )
            .markup( "</span>" );

        // And render and position the spinner and overlay
        lSpinner$ = $( out.toString() );
        lSpinner$.appendTo( lContainer$ );

        if ( lOptions.fixed ) {
            lTop = ( lWindow$.height() - lSpinner$.height() ) / 2;
            lLeft = ( lWindow$.width() - lSpinner$.width() ) / 2;
            lSpinner$.css( {
                position: "fixed",
                top:  lTop + "px",
                left: lLeft +  "px"
            } );
        } else {
            // Calculate viewport bottom and right
            lViewport.bottom = lViewport.top + lWindow$.height();
            lViewport.right = lViewport.left + lWindow$.width();

            // Calculate container bottom and right
            lContainer.bottom = lContainer.top + lContainer$.outerHeight();
            lContainer.right = lContainer.left + lContainer$.outerWidth();

            // If top of container is visible, use that as the top, otherwise use viewport top
            if ( lContainer.top > lViewport.top ) {
                lTop = lContainer.top;
            } else {
                lTop = lViewport.top;
            }

            // If bottom of container is visible, use that as the bottom, otherwise use viewport bottom
            if ( lContainer.bottom < lViewport.bottom ) {
                lBottom = lContainer.bottom;
            } else {
                lBottom = lViewport.bottom;
            }
            lYPosition = ( lBottom - lTop ) / 2;

            // If top of container is not visible, Y position needs to add an offset equal hidden container height,
            // this is required because we are positioning in the container element
            lYOffset = lViewport.top - lContainer.top;
            if ( lYOffset > 0 ) {
                lYPosition = lYPosition + lYOffset;
            }

            lSpinner$.position({
                my:         "center",
                at:         "left+50% top+" + lYPosition + "px",
                of:         lContainer$,
                collision:  "fit"
            });
        }

        return lSpinner$;
    },

    /**
     * <p>The delayLinger namespace solves the problem of flashing progress indicators (such as spinners).</p>
     *
     * <p>For processes such as an Ajax request (and subsequent user interface updates) that may take a while
     * it is important to let the user know that something is happening.
     * The problem is that if an async process is quick there is no need for a progress indicator. The user
     * experiences the UI update as instantaneous. Showing and hiding a progress indicator around an async
     * process that lasts a very short time causes a flash of content that the user may not have time to fully perceive.
     * At best this can be a distraction and at worse the user wonders if something is wrong or if they missed something
     * important. Simply delaying the progress indicator doesn't solve the problem because the process
     * could finish a short time after the indicator is shown. The indicator must be shown for at least a short but
     * perceivable amount of time even if the request is already finished.</p>
     *
     * <p>You can use this namespace to help manage the duration of a progress indication such as
     * {@link apex.util.showSpinner} or with any other progress implementation. Many of the Oracle
     * Application Express asynchronous functions such as the ones in the {@link apex.server} namespace
     * already use delayLinger internally so you only need this API for your own custom long running
     * asynchronous processing.</p>
     *
     * @namespace apex.util.delayLinger
     * @example <caption>This example shows using {@link apex.util.delayLinger.start} and
     *     {@link apex.util.delayLinger.finish} along with {@link apex.util.showSpinner} to show a
     *     progress spinner, only when needed and for long enough to be seen, around a long running asynchronus process
     *     started in function doLongProcess.</caption>
     * var lSpinner$, lPromise;
     * lPromise = doLongProcess();
     * apex.util.delayLinger.start( "main", function() {
     *     lSpinner$ = apex.util.showSpinner( $( "#container_id" ) );
     * } );
     * lPromise.always( function() {
     *     apex.util.delayLinger.finish( "main", function() {
     *         lSpinner$.remove();
     *     } );
     * } );
     */
    delayLinger: (function() {
        var scopes = {},
            busyDelay = 200,
            busyLinger = 1000; // visible for min 800ms

        function getScope( scopeName ) {
            var s = scopes[scopeName];
            if ( !s ) {
                s = {
                    count: 0,
                    timer: null
                };
                scopes[scopeName] = s;
            }
            return s;
        }

        function removeScope( scopeName ) {
            delete scopes[scopeName];
        }

        /**
         * @lends apex.util.delayLinger
         */
        var ns = {
            /**
             * <p>Call this function when a potentially long running async process starts. For each call to start with
             * a given pScopeName a corresponding call to finish with the same <code class="prettyprint">pScopeName</code> must be made.
             * Calls with different <code class="prettyprint">pScopeName</code> arguments will not interfere with each other.</p>
             *
             * <p>Multiple calls to start for the same <code class="prettyprint">pScopeName</code> before any calls to
             * finish is allowed but only the <code class="prettyprint">pAction</code> from the first call is called at most once.</p>
             *
             * @param {string} pScopeName A unique name for each unique progress indicator.
             * @param {function} pAction A no argument function to call to display the progress indicator.
             *     This function may or may not be called depending on how quickly finish is called.
             */
            start: function( pScopeName, pAction ) {
                var s = getScope( pScopeName );
                s.count += 1;
                if ( s.count === 1 && s.timer === null && !s.showing ) {
                    s.start = (new Date()).getTime();
                    s.timer = setTimeout( function() {
                        s.timer = null;
                        s.showing = true;
                        pAction();
                    }, busyDelay );
                }
            },

            /**
             * <p>Call this function when the potentially long running async process finishes. For each call to start with
             * a given <code class="prettyprint">pScopeName</code> a corresponding call to finish with
             * the same <code class="prettyprint">pScopeName</code> must be made.
             * The <code class="prettyprint">pAction</code> is called exactly once if and only if the corresponding
             * start <code class="prettyprint">pAction</code> was called.
             * If there are multiple calls to finish the <code class="prettyprint">pAction</code> from the last one is called.</p>
             *
             * @param {string} pScopeName A unique name for each unique progress indicator.
             * @param {function} pAction A no argument function to call to hide and/or remove the progress indicator.
             *     This function is only called if the action passed to start was called.
             */
            finish: function( pScopeName, pAction ) {
                var elapsed,
                    s = getScope( pScopeName );

                if ( s.count === 0 ) {
                    throw new Error( "delayLinger.finish called before start for scope " + pScopeName );
                }
                elapsed = (new Date()).getTime() - s.start;
                s.count -= 1;

                if ( s.count === 0 ) {
                    if ( s.timer === null) {
                        // the indicator is showing so don't flash it
                        if ( elapsed < busyLinger ) {
                            setTimeout(function() {
                                // during linger another start for this scope could have happened
                                if ( s.count === 0 ) {
                                    s.showing = false;
                                    pAction();
                                    removeScope( pScopeName );
                                }
                            }, busyLinger - elapsed);
                        } else {
                            s.showing = false;
                            pAction();
                            removeScope( pScopeName );
                        }
                    } else {
                        // the request(s) went quick no need for spinner
                        clearTimeout( s.timer );
                        s.timer = null;
                        removeScope( pScopeName );
                    }
                }
            }
        };
        return ns;
    })(),

    /**
     * @ignore
     * @param $e
     * @param h
     */
    setOuterHeight: function ( $e, h ) {
        $.each( ["borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom", "marginTop", "marginBottom"], function( i, p ) {
            var v = parseInt( $e.css( p ), 10 );
            if ( !isNaN( v ) ) {
                h -= v;
            }
        });
        $e.height( h );
    },

    /**
     * @ignore
     * @param $e
     * @param w
     */
    setOuterWidth: function ( $e, w ) {
        $.each( ["borderLeftWidth", "borderRightWidth", "paddingLeft", "paddingRight", "marginLeft", "marginRight"], function( i, p ) {
            var v = parseInt( $e.css( p ), 10 );
            if ( !isNaN( v ) ) {
                w -= v;
            }
        });
        $e.width( w );
    },

    /**
     * Get a JavaScript Date object corresponding to the input date string which must be in simplified ISO 8601 format.
     * In the future Date.parse could be used but currently there are browsers we support that don't yet support the ISO 8601 format.
     * This implementation is a little stricter about what parts of the date and time can be defaulted. The year, month, and day are
     * always required. The whole time including the T can be omitted but if there is a time it must contain at least the hours
     * and minutes. The only supported time zone is "Z".
     *
     * This function is useful for turning the date strings returned by the
     * <code class="prettyprint">APEX_JSON.STRINGIFY</code> and <code class="prettyprint">APEX_JSON.WRITE</code>
     * procedures that take a DATE value into Date objects that the client can use.
     *
     * @param {string} pDateStr String representation of a date in simplified ISO 8601 format
     * @return {Date} Date object corresponding to the input date string.
     * @example <caption>This example returns a date object from the date string in result.dateString. For example
     * "1987-01-23T13:05:09.040Z"</caption>
     * var date1 getDateFromISO8601String( result.dateString );
     */
    getDateFromISO8601String: function( pDateStr ) {
        var date, year, month, day,
            hr = 0,
            min = 0,
            sec = 0,
            ms = 0,
            m = /^(\d\d\d\d)-(\d\d)-(\d\d)(T(\d\d):(\d\d)(:(\d\d)(.(\d\d\d))?)?Z?)?$/.exec( pDateStr );

        if ( !m ) {
            throw new Error( "Invalid date format" );
        }

        year = parseInt( m[1], 10 );
        month = parseInt( m[2], 10 ) - 1;
        day = parseInt( m[3], 10 );
        if ( m[5] ) {
            hr = parseInt( m[5], 10 );
            min = parseInt( m[6], 10 );
            if ( m[8] ) {
                sec = parseInt( m[8], 10 );
                if ( m[10] ) {
                    ms = parseInt( m[10], 10 );
                }
            }
        }
        date = new Date( Date.UTC( year, month, day, hr, min, sec, ms ) );
        return date;
    },

    // todo consider documenting this. People use it. needs unit tests
    /*
     * Return the apex object from the top most APEX window.
     * This is only needed in rare special cases involving iframes
     * Not for public use
     * @ignore
     */
    getTopApex: function() {
        var curWindow, lastApex;

        function get(w) {
            var a;
            try {
                a = w.apex || null;
            } catch( ex ) {
                a = null;
            }
            return a;
        }

        // return cached answer if any
        if ( gTopApex !== null ) {
            return gTopApex;
        }

        // try for the very top
        gTopApex = get( top );
        if ( gTopApex !== null ) {
            return gTopApex;
        }

        // stat at the current window and go up the parent chain until there is no apex that we can access
        curWindow = window;
        for (;;) {
            lastApex = get( curWindow );
            if ( lastApex === null || !curWindow.parent || curWindow.parent === curWindow ) {
                break;
            }
            gTopApex = lastApex;
            curWindow = curWindow.parent;
        }
        return gTopApex;
    },

    /**
     * <p>Gets the system scrollbar size for cases in which the addition or subtraction of a scrollbar
     * height or width would effect the layout of elements on the page. The page need not have a scrollbar on it
     * at the time of this call.</p>
     *
     * @returns An object with height and width properties that describe any scrollbar on the page.
     * @example <caption>The following example returns an object such as <code class="prettyprint">{ width: 17, height: 17 }</code>. Note
     * the actual height and width depends on the Operating System and its various display settings.</caption>
     * var size = apex.util.getScrollbarSize();
     */
    getScrollbarSize: function() {
        var scrollbarMeasure$;
        // Store the scrollbar size, because it will not change during page run time, thus there is no
        // need to manipulate the dom every time this function is called.
        if ( gScrollbarSize === null ) {
            // To figure out how wide a scroll bar is, we need to create a fake element
            // and then measure the difference
            // between its offset width and the clientwidth.
            scrollbarMeasure$ = $( "<div>" ).css({
                "width": "100px",
                "height": "100px",
                "overflow": "scroll",
                "position": "absolute",
                "top": "-9999px"
            }).appendTo( "body" );
            gScrollbarSize = {
                width: scrollbarMeasure$[0].offsetWidth - scrollbarMeasure$[0].clientWidth,
                height: scrollbarMeasure$[0].offsetHeight - scrollbarMeasure$[0].clientHeight
            };
            scrollbarMeasure$.remove();
        }
        return gScrollbarSize;
    },

    // todo consider if these are needed given our current browser support. Also they have very bad names
    /**
     * <p>Wrapper around requestAnimationFrame that can fallback to <code class="prettyprint">setTimeout</code>.
     * Calls the given function before next browser paint. See also {@link apex.util.cancelInvokeAfterPaint}.</p>
     * <p>See HTML documentation for <code class="prettyprint">window.requestAnimationFrame</code> for details.</p>
     *
     * @function
     * @param {function} pFunction function to call after paint
     * @returns {*} id An id that can be passed to {@link apex.util.cancelInvokeAfterPaint}
     * @example <caption>This example will call the function myAnimationFunction before the next browser repaint.</caption>
     * var id = apex.util.invokeAfterPaint( myAnimationFunction );
     * // ... if needed it can be canceled
     * apex.util.cancelInvokeAfterPaint( id );
     */
    invokeAfterPaint: ( window.requestAnimationFrame || window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            function( pFunction ) {
                return window.setTimeout( pFunction, 0 );
            }
        ).bind( window ),

    /**
     * <p>Wrapper around cancelAnimationFrame that can fallback to <code class="prettyprint">clearTimeout</code>.
     * Cancels the callback using the id returned from {@link apex.util.invokeAfterPaint}.</p>
     *
     * @function
     * @param pId The id returned from {@link apex.util.invokeAfterPaint}.
     * @example <caption>See example for function {@link apex.util.invokeAfterPaint}</caption>
     */
    cancelInvokeAfterPaint: ( window.cancelAnimationFrame || window.mozCancelAnimationFrame ||
            window.webkitCancelAnimationFrame ||
            function( pId ) {
                return window.clearTimeout( pId );
            }
        ).bind( window ),

    /**
     * <p>Returns string <code class="prettyprint">pText</code> with all HTML tags removed.</p>
     *
     * @param {string} pText The string that may contain HTML markup that you want removed.
     * @return {string} The input string with all HTML tags removed.
     * @example <caption>This example removes HTML tags from a text string.</caption>
     * apex.util.stripHTML( "Please <a href='www.example.com/ad'>click here</a>" );
     * // result: "Please click here"
     */
    stripHTML: function( pText ) {
        var tagRE = /<[^<>]+>/;

        while ( tagRE.exec( pText ) ) {
            pText = pText.replace( tagRE, "" );
        }
        return pText;
    },

    /**
     * <p>This function applies data to a template. It processes the template string given in
     * <code class="prettyprint">pTemplate</code> by substituting
     * values according to the options in <code class="prettyprint">pOptions</code>.
     * The template supports Application Express server style placeholder and item substitution syntax.</p>
     *
     * <p>This function is intended to process Application Express style templates in the browser.
     * However it doesn't have access to all the data that the server has. When substituting page items and column
     * items it uses the current value stored in the browser not what is in session state on the server.
     * It does not support the old non-exact substitutions (with no trailing dot e.g. &ITEM). It does not support
     * the old column reference syntax that uses #COLUMN_NAME#. It cannot call
     * <code class="prettyprint">PREPARE_URL</code> (this must be done on the server).
     * Using a template to insert JavaScript into the DOM is not supported.
     * After processing the template all script tags are removed.</p>
     *
     * <p>The format of a template string is any text intermixed with any number of replacement tokens.
     * Two kinds of replacement tokens are supported: placeholders and substitutions.
     * Placeholders are processed first.</p>
     *
     * <p>Placeholder syntax is:</p>
     * <pre class="prettyprint"><code>#&lt;placeholder-name>#
     * </code></pre>
     * <p>The &lt;placeholder-name> is an uppercase alpha numeric plus "_", and "$" string that must be a property
     * name in option object <code class="prettyprint">placeholders</code> that gets replaced with the property value.
     * Any placeholder tokens that don't match anything in the placeholders object are left as is (searching for the
     * next placeholder begins with the trailing # character).</p>
     *
     * <p>Substitution syntax is (any of):</p>
     * <pre class="prettyprint"><code>&&lt;item-name>.
     * &&lt;item-name>!&lt;escape-filter>.
     * &"&lt;quoted-item-name>".
     * &"&lt;quoted-item-name>"!&lt;escape-filter>.
     * &APP_TEXT$&lt;message-key>.
     * &APP_TEXT$&lt;message-key>!&lt;escape-filter>.
     * &"APP_TEXT$&lt;message-key>".
     * &"APP_TEXT$&lt;message-key>"!&lt;escape-filter>.
     * </code></pre>
     *
     * <p>The &lt;item-name> is an uppercase alpha numeric plus "_", "$", and "#" string. The &lt;quoted-item-name>
     * is a string of any characters except "&", carriage return, line feed, and double quote.
     * In both cases the item name is the name of a page item (unless option includePageItems is false),
     * a column item (if model and record options are given), a built-in substitution
     * (unless option includeBuiltinSubstitutions is false), or an extra substitution if option extraSubstitutions
     * is given.</p>
     *
     * <p>The &lt;message-key> is a message key suitable for use in {@link apex.lang.getMessage} and
     * is replaced with the localized message text for the given key. The message must already be loaded on the
     * client by setting the Text Message attribute Used in JavaScript to Yes or otherwise adding it such as with
     * {@link apex.lang.addMessages}.
     * If no replacement for a substitution can be found it is replaced with the message key. The language specifier
     * that is supported for server side message substitutions is not supported by the client and will be ignored
     * if present.</p>
     *
     * <p>When substituting a column item the given record of the given model is used to find a matching column name.
     * If not found and if the model has a parent model then the parent model's columns are checked.
     * This continues as long as there is a parent model. The order to resolve an item name is: page item,
     * column item, column item from ancestor models, built-in substitutions, and finally extra substitutions.
     * Column items support the "_LABEL" suffix to access the defined column label. For example if there is a
     * column item named NOTE the substitution &NOTE_LABEL. will return the label string for column NOTE.</p>
     *
     * <p>The built-in substitution names are:</p>
     * <ul>
     * <li>&APP_ID.</li>
     * <li>&APP_PAGE_ID.</li>
     * <li>&APP_SESSION.</li>
     * <li>&REQUEST.</li>
     * <li>&DEBUG.</li>
     * <li>&IMAGE_PREFIX.</li>
     * </ul>
     *
     * <p>The escape-filter controls how the replacement value is escaped or filtered. It can be one of the following
     * values:</p>
     * <ul>
     * <li>HTML the value will have HTML characters escaped using {@link apex.util.escapeHTML}.</li>
     * <li>ATTR the value will be escaped for an HTML attribute context (currently the same as HTML)</li>
     * <li>RAW does not change the value at all.</li>
     * <li>STRIPHTML the value will have HTML tags removed and HTML characters escaped.</li>
     * </ul>
     * <p>This will override any default escape filter set with option <code class="prettyprint">defaultEscapeFilter</code>
     * or from the column definition <code class="prettyprint">escape</code> property.</p>
     *
     * @param {string} pTemplate A template string with any number of replacement tokens as described above.
     * @param {Object} [pOptions] An options object with the following properties that specifies how the template
     *     is to be processed:
     * @param {Object} [pOptions.placeholders] An object map of placeholder names to values.  The default is null.
     * @param {string} [pOptions.defaultEscapeFilter] One of the above escape-filter values. The default is HTML.
     *    This is the escaping/filtering that is done if the substitution token doesn't
     *    specify an escape-filter. If a model column definition has an <code class="prettyprint">escape</code> property
     *    then it will override the default escaping.
     * @param {boolean} [pOptions.includePageItems] If true the current value of page items are substituted.
     *     The default is true.
     * @param {model} [pOptions.model] The model interface used to get column item values. The default is null.
     * @param {model.Record} [pOptions.record] The record in the model to get column item values from.
     *     Option <code class="prettyprint">model</code> must also be provided. The default is null.
     * @param {Object} [pOptions.extraSubstitutions] An object map of extra substitutions. The default is null.
     * @param {boolean} [pOptions.includeBuiltinSubstitutions] If true built-in substitutions such as APP_ID are done.
     *     The default is true.
     * @return {string} The template string with replacement tokens substituted with data values.
     *
     * @example <caption>This example inserts an image tag where the path to the image comes from the built-in
     * IMAGE_PREFIX substitution and a page item called P1_PROFILE_IMAGE_FILE.</caption>
     * apex.jQuery( "#photo" ).html(
     *     apex.util.applyTemplate(
     *         "<img src='&IMAGE_PREFIX.people/&P1_PROFILE_IMAGE_FILE.'>" ) );
     *
     * @example <caption>This example inserts a div with a message where the message text comes from a
     *     placeholder called MESSAGE.</caption>
     * var options = { placeholders: { MESSAGE: "All is well." } };
     * apex.jQuery( "#notification" ).html( apex.util.applyTemplate( "<div>#MESSAGE#</div>", options ) );
     */
    // todo consider if item-name should allow lowercase letters
    // todo consider if filter ATTR should change currently the same as escapeHTML any need to change this and should it affect htmlBuilder?
    applyTemplate: function( pTemplate, pOptions ) {
        var result, src, pos, ph, value,
            colLabelRE = /^(.+)_LABEL$/,
            placeholderRE = /#([_$A-Z0-9]+)#/,
            substRE = /&(([A-Z0-9_$#]+)|"([^"&\r\n]+)")(!([A-Z]+))?\./g,
            scriptRE = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi,
            langRE = /\$[^$]*$/,
            apexModel = apex.model,
            apexItem = apex.item;

        function substitute( fragment ) {
            return fragment.replace( substRE, function( m, _1, itemName, itemQName, _2, escFilter ) {
                var i, item, model, rec, parentM, parentID, models, fields, match, labelName, messageKey, lang,
                    elementId = null,
                    defaultEscape = pOptions.defaultEscapeFilter,
                    value = null;

                if ( itemQName ) {
                    itemName = itemQName;
                }
                if ( itemName ) {
                    // check for a message key
                    if ( itemName.indexOf( "APP_TEXT$" ) === 0 ) {
                        messageKey = itemName.substr(9);
                        lang = langRE.exec( messageKey );
                        if ( lang ) {
                            // Remove language from message key. It is used by server symbol substitution but not supported by client
                            // Allow a lone trailing $ to support message keys that include $ in them.
                            if ( lang[0].length > 1 ) {
                                apex.debug.warn("applyTemplate message text substitution " + lang[0] + " language ignored.");
                            }
                            messageKey = messageKey.replace( langRE, "" );
                        }
                        if ( messageKey ) {
                            value = apex.lang.getMessage( messageKey );
                        }
                    }
                    // if still no value check for a page item
                    if ( value === null && pOptions.includePageItems ) {
                        item = apexItem( itemName );
                        if ( item.node ) {
                            value = item.getValue();
                            value = item.displayValueFor( value );
                        }
                    }
                    // if still no value found then check for a model record
                    if ( value === null && pOptions.model && pOptions.record ) {
                        model = pOptions.model;
                        rec = pOptions.record;
                        models = [];
                        while ( value === null && rec && model ) {
                            value = model.getValue( rec, itemName ) || null;
                            rec = null;
                            if ( value === null ) {
                                // try <col>_LABEL to get the column heading label
                                match = colLabelRE.exec( itemName );
                                if ( match ) {
                                    labelName = match[1];
                                    fields = model.getOption( "fields" );
                                    if ( fields.hasOwnProperty( labelName ) ) {
                                        value = fields[labelName].label || fields[labelName].heading || null;
                                    }
                                }
                                // next try a parent model if any
                                if ( value === null ) {
                                    parentM = model.getOption( "parentModel" );
                                    parentID = model.getOption( "parentRecordId" );
                                    if ( parentM && parentID ) {
                                        model = apexModel.get( parentM );
                                        if ( model ) {
                                            models.push( parentM );
                                            rec = model.getRecord( parentID );
                                        }
                                    }
                                }
                            } else {
                                fields = model.getOption( "fields" );
                                if ( fields[itemName].hasOwnProperty( "escape" ) ) {
                                    defaultEscape = fields[itemName].escape ? "HTML" : "RAW";
                                }
                                if ( fields[itemName].hasOwnProperty( "elementId" ) ) {
                                    elementId = fields[itemName].elementId;
                                }
                            }
                        }
                        for ( i = 0; i < models.length; i++ ) {
                            apexModel.release( models[i] );
                        }
                    }
                    // if still no value found then check built-in substitutions
                    if ( value === null && pOptions.includeBuiltinSubstitutions ) {
                        value = gPageTemplateData[itemName] || null;
                    }
                    // if still no value found then check built-in substitutions
                    if ( value === null && pOptions.extraSubstitutions ) {
                        value = pOptions.extraSubstitutions[itemName] || null;
                    }
                    if ( value === null ) {
                        value = "";
                    } else {
                        if ( typeof value === "object" && value.hasOwnProperty( "d" ) ) {
                            value = value.d;
                        } else if ( elementId ) {
                            item = apexItem( elementId );
                            if ( item.node ) {
                                value = item.displayValueFor( value );
                            }
                        }
                        if ( !escFilter ) {
                            escFilter = defaultEscape;
                        }
                        if ( escFilter === "HTML" ) {
                            value = escapeHTML( value );
                        } else if ( escFilter === "ATTR" ) {
                            value = escapeHTMLAttr( value );
                        } else if ( escFilter === "STRIPHTML" ) {
                            value = escapeHTML( util.stripHTML( value.replace( "&nbsp;", "" ) ) );
                        } else if ( escFilter !== "RAW" && escFilter ) {
                            throw new Error("Invalid template filter: " + escFilter );
                        }
                    }
                } else {
                    value = "";
                }
                return value;
            });
        }

        pOptions = $.extend( {
            placeholders: null,
            defaultEscapeFilter: "HTML",
            includePageItems: true,
            model: null,
            record: null,
            extraSubstitutions: null,
            includeBuiltinSubstitutions: true
        }, pOptions || {} );

        // initialize page substitution tokens just once when needed
        if ( !gPageTemplateData && pOptions.includeBuiltinSubstitutions ) {
            gPageTemplateData = {
                "APP_ID": $v( "pFlowId" ),
                "APP_PAGE_ID": $v( "pFlowStepId" ),
                "APP_SESSION": $v( "pInstance" ),
                "REQUEST": $v( "pRequest" ),
                "DEBUG": $v( "pdebug" ),
                "IMAGE_PREFIX": window.apex_img_dir || ""
            };
        }

        if ( pOptions.placeholders ) {
            result = "";
            src = pTemplate;
            pos = src.search( placeholderRE );
            while ( pos >= 0 ) {
                ph = src.match( placeholderRE )[1];
                value = pOptions.placeholders[ph];
                if ( value ) {
                    result += substitute( src.substring( 0, pos ) ) + value;
                    src = src.substring( pos + ph.length + 2 );
                } else {
                    result += substitute( src.substring( 0, pos + ph.length + 1 ) );
                    src = src.substring( pos + ph.length + 1 );
                }
                pos = src.search( placeholderRE );
            }
            result += substitute( src );
        } else {
            result = substitute( pTemplate );
        }

        // Templates are trusted. They should only come from the developer. However in no case should script
        // tags be allowed. There is just no reasonable use case for this. Scripts should be added to the page
        // in other ways and generally by the server.
        while ( scriptRE.test( result ) ) {
            result = result.replace( scriptRE, "" );
        }
        return result;
    }
    };

    util.escapeHTMLContent = escapeHTMLContent;
    util.escapeHTMLAttr = escapeHTMLAttr;

    return util;

})( apex.jQuery );
