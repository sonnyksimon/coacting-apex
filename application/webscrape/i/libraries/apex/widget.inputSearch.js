/*!
 Input Search - APEX widget for autocomplete style text fields, based on Oracle JET Input Search form control
 Copyright (c) 2017, 2018, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @fileOverview
 * APEX widget for autocomplete style text fields, based on Oracle JET Input Search form control
 *
 * General To Do
 *  - Fuzzy search option
 *
 * Open Questions
 *
 * Documentation
 * The input search widget supports the following options:
 *  - ajaxIdentifier {string}:          The unique Ajax identifier provided by the server, and required by any Ajax calls made
 *                                      by the widget.
 *  - itemsToSubmit {string}:
 *  - dependingOnSelector {string}:
 *  - optimizeRefresh {boolean}:
 *  - matchCaseSensitive {boolean}:
 *  - matchContains {boolean}:
 *  - maxOptions {number}:
 *  - lazyLoad {boolean}:
 *  - lazyLoadCaching {boolean}:
 *  - minLength {number}:
 *  - placeholder {string}:
 *  - disabled {boolean}:
 *  - options {array}:
 *
 * Assumptions
 * - The element initialised as a inputSearch widget has an ID.
 *
 *
 * Depends:
 *    jquery.ui.core.js
 *    jquery.ui.widget.js
 *    todo add
 *
 */
/*global requirejs,$v,require,apex*/
( function( $, server, util, debug, widget, item ) {
    "use strict";

    var gCachedSearches = {};

    widget.inputSearch = function( pId, pData, pOptions ) {
        var i, lOriginalOptionList, lJetInput$, lSearchButton$, lDeferred, lInitialValue,
            lAPEXInput$ = $( "#" + util.escapeCSS( pId + "_HIDDEN" ), apex.gPageContext$ ),
            lLabel$ = $( "#" + util.escapeCSS( pId ) + "_LABEL", apex.gPageContext$ ),
            lGroup$ = $( "#" + util.escapeCSS( pId ), apex.gPageContext$ ),
            lWidgetOptions = $.extend( {
                // APEX options
                ajaxIdentifier: null,
                itemsToSubmit: "",
                dependingOnSelector: "",
                optimizeRefresh: true,
                matchCaseSensitive: false,
                matchContains: true,
                maxOptions: null,
                lazyLoad: false,
                cache: true,
                width: null,
                maxLength: null,
                elementAttributes: null,
                isEscaped: true,        //todo not currently doing anything (always escapes list values)

                // JET options
                minLength: 1,
                placeholder: "",
                title: ""
            }, pOptions ),
            keys = $.ui.keyCode;

        /* Server only sends array of values, but the widget needs an array of label / value objects. This function does
         * this transformation
         */
        function transformToObject( pValues ) {
            var i, lData = [];
            for ( i = 0; i < pValues.length; i++ ) {
                lData.push({
                    label: pValues[ i ],
                    value: pValues[ i ]
                });
            }
            return lData;
        }

        // Clears the existing value
        function refresh() {
            // trigger the before refresh event
            lAPEXInput$.trigger( "apexbeforerefresh" );

            // clear the auto complete select list
            gCachedSearches = {};

            // Clear the autocomplete field
            item( pId ).setValue( "" );

            // Todo: Consider removing. Is it necessary to recreate it?
            lAPEXInput$.ojInputSearch( lWidgetOptions );

            // trigger the after refresh event
            lAPEXInput$.trigger( "apexafterrefresh" );
        } // refresh


        if ( !lWidgetOptions.lazyLoad && pData ) {
            lWidgetOptions.options = transformToObject( pData );
        }

        // item.create call
        // Note delayLoading: true, so a deferred object is returned and page loading delayed until it is resolved
        lDeferred = item.create( pId, {
            enable: function() {
                lAPEXInput$.ojInputSearch({ disabled: false });
            },
            disable: function() {
                lAPEXInput$.ojInputSearch({ disabled: true });
            },
            getValue: function() {
                return lJetInput$.val();
            },
            setValue: function( pValue ) {
                lAPEXInput$.val( pValue );
                lJetInput$.val( pValue );
            },
            setFocusTo: function() {
                return lJetInput$;
            },
            getPopupSelector: function() {
                return ".oj-listbox-results";
            },
            reinit: function( pValue ) {

                // clear the auto complete select list, will get repopulated as soon as the user types something in
                gCachedSearches = {};

                // set value and suppress change event
                this.setValue( pValue, null, true );
            },
            delayLoading: true,
            isChanged: function() {
                return lInitialValue !== lJetInput$.val();
            },
            // Note: For setStyleTo, this needs to be a function returning the JET input (rather than just a reference
            // to the JET input), because otherwise it won't be initialized in time
            setStyleTo: function() {
                return lJetInput$;
            }
        });

        // Require call, pulling on required modules for JET inputSearch form control
        // Note: In a production environment, these will not be loaded by require, as we will have
        // already loaded them in one combined file on page load.
        require([ "ojs/ojcore", "ojs/ojselectcombobox" ], function( oj ) {
            var lAPEXClasses;

            lOriginalOptionList = lWidgetOptions.options;

            // Override the default options with the options callback where we can apply our own matching logic
            lWidgetOptions.options = function ( optionContext ) {
                return new Promise(function ( fulfill, reject ) {
                    var lCacheKey, i, lRE,
                        lREPattern = "",
                        lREFlags = "",
                        lNewOptions = [],
                        lTerm = util.escapeRegExp( optionContext.term );

                    // Prevents unwanted triggering on page load
                    if ( optionContext.term !== undefined ) {

                        if ( lWidgetOptions.lazyLoad ) {
                            if ( lWidgetOptions.cache ) {
                                lCacheKey = pId + "_" + lTerm;
                                if ( gCachedSearches[ lCacheKey ] ) {

                                    // Fulfill from cache, no need for server call
                                    fulfill ( gCachedSearches[ lCacheKey ] );
                                    return;
                                }
                            }

                            // Either caching not enabled, or caching enabled but this search is not yet cached;
                            // get the new options from the server
                            widget.util.cascadingLov (
                                lAPEXInput$,
                                lWidgetOptions.ajaxIdentifier,
                                {
                                    x01: lTerm,
                                    pageItems: $ ( lWidgetOptions.itemsToSubmit, apex.gPageContext$ )
                                },
                                {
                                    optimizeRefresh: lWidgetOptions.optimizeRefresh,
                                    dependingOn: $ ( lWidgetOptions.dependingOnSelector, apex.gPageContext$ ),
                                    success: function ( pData ) {
                                        var lData = transformToObject ( pData );

                                        // Add new search to cache, if caching enabled
                                        if ( lWidgetOptions.cache ) {
                                            gCachedSearches[ lCacheKey ] = lData;
                                        }

                                        // Fulfill from retrieved data
                                        fulfill ( lData );
                                    },
                                    target: lAPEXInput$
                                }
                            );
                        } else {

                            // Match contains or starts with. If starts with add "^" at beginning of regular expression
                            if ( !lWidgetOptions.matchContains ) {
                                lREPattern = "^";
                            }

                            // The search term now, has been reg exp escaped for any characters that have special reg exp meaning
                            lREPattern += lTerm;

                            // Match case sensitive or insensitive. If case-insensitive, add the "i" flag
                            if ( !lWidgetOptions.matchCaseSensitive ) {
                                lREFlags = "i";
                            }

                            // Create regular expression based on pattern and flags
                            lRE = new RegExp ( lREPattern, lREFlags );

                            // Loop through options and check for matches.
                            // Also respects max options if set
                            for ( i = 0; i < lOriginalOptionList.length && ( lWidgetOptions.maxOptions ? lNewOptions.length < lWidgetOptions.maxOptions : true ); i++ ) {

                                // Now execute regular expression, and if match found add to the new options array
                                if ( lOriginalOptionList[ i ].label.match ( lRE ) ) {
                                    lNewOptions.push ( lOriginalOptionList[ i ] );
                                }
                            }
                            fulfill ( lNewOptions );
                        }
                    }
                });
            };

            // Initialise the widget
            lAPEXInput$.ojInputSearch( lWidgetOptions );

            // Store original value, used by isChanged check
            lInitialValue = lAPEXInput$.val();

            // if it's a cascading select list we have to register change events for our masters
            if ( lWidgetOptions.dependingOnSelector ) {
                $( pOptions.dependingOnSelector, apex.gPageContext$ ).change( function() {
                    lAPEXInput$.trigger( "apexrefresh" );
                });
            }

            // Register the refresh event which is triggered by triggerRefresh or a manual refresh
            lAPEXInput$.on( "apexrefresh", refresh );

            // Get references to any specific elements JET creates
            lJetInput$ = $( lAPEXInput$.ojInputSearch( "getNodeBySubId", { subId: "oj-inputsearch-input" } ) );
            lSearchButton$ = $( lAPEXInput$.ojInputSearch( "getNodeBySubId", { subId: "oj-inputsearch-search" } ) );

            // We need to manually copy over any custom item markup defined
            if ( lWidgetOptions.width ) {
                lJetInput$.attr( "size", lWidgetOptions.width );
            }
            if ( lWidgetOptions.maxLength ) {
                lJetInput$.attr( "maxlength", lWidgetOptions.maxLength );
            }

            // For any element attributes, as these are sent by the server as a string of one or more attributes,
            // we use a temporary custom element to add them to, then from there add them to the JET input element.
            // This avoids removal of any existing attributes on the JET input element.
            if ( lWidgetOptions.elementAttributes ) {

                var out = util.htmlBuilder(),
                    lCustomAttrHolder$, lAttr, lAttributeNodeMap;

                // attribute markup
                out.markup( "<input " )
                    .attr( "id", "customAttrHolder" )
                    .attr( "class", "uVisuallyHidden" )
                    .markup( lWidgetOptions.elementAttributes )
                    .markup( " />" );

                $( "body" ).append( out.toString() );

                lCustomAttrHolder$ = $( "#customAttrHolder" );
                lAttributeNodeMap = lCustomAttrHolder$[ 0 ].attributes;

                for ( lAttr in lAttributeNodeMap ) {
                    if ( lAttributeNodeMap.hasOwnProperty( lAttr ) ) {

                        // If the attribute is not ID or CLASS, add it
                        if ( $.inArray( lAttributeNodeMap[ lAttr ].name, [ "id", "class" ] ) === -1 ) {
                            lJetInput$.attr( lAttributeNodeMap[ lAttr ].name, lAttributeNodeMap[ lAttr ].value );
                        }
                    }
                }
                lCustomAttrHolder$.remove();
            }

            // We need to get all the classes emitted from the original APEX input, and move them to the JET input
            // Note: Except the class JET has added 'oj-component-initcode', this should stay
            lAPEXInput$.removeClass( "oj-component-initnode" );
            lAPEXClasses = lAPEXInput$.attr( "class" );
            lAPEXInput$.attr( "class", "oj-component-initnode" );

            /* Modifications to the JET input:
             *   - Add APEX classes to the JET input to allow our native styling
             *   - Add other classes added to the original input element, these need to be moved to the JET element
             *   - Add aria-labelledby to associate the label with the JET input control. JET would do this automatically,
             *     however this does not happen because the server renders the APEX input with an ID that is not associated
             *     with the label.
             *   - Set the value in the JET input, otherwise existing values do not display
             */
            lJetInput$
                .addClass( "apex-item-text apex-item-auto-complete" )
                .addClass( lAPEXClasses )
                .attr( "aria-labelledby", util.escapeCSS( pId ) + "_LABEL" )
                .val( lInitialValue );

            // We need to make the list results DIV focusable. This allows the item.getPopupSelector logic to
            // work properly for Interactive Grid support
            lAPEXInput$.on( "ojbeforeexpand", function() {
                var lListResultsId = util.escapeCSS( lJetInput$.attr( "aria-owns" ));
                $( "#" + lListResultsId ).attr( "tabindex", "-1" );
            });

            // When the ENTER key is pressed, we need to avoid grid default behaviour of moving rows, when the result
            // list is open. The grid widget provides a class to avoid this, which we can toggle here based on that
            // state (bug #27766712).
            lJetInput$.on( "keydown", function( pEvent ) {
                if ( pEvent.which === keys.ENTER ) {
                    lGroup$.toggleClass( "js-uses-enter", lJetInput$.closest( ".oj-inputsearch" ).hasClass( "oj-listbox-dropdown-open" ) );
                }
            });

            // Default label click behaviour of focusing the field is broken because of the JET input, fix it
            lLabel$.on( "click", function() {
                lJetInput$.focus();
            });

            // Remove the search button; this currently is an anchor rendered with role='button' and with no behaviour
            lSearchButton$.remove();

            lGroup$.find( "span.apex-item-icon" ).insertAfter( lJetInput$ );

            // Now we're done, we need to resolve the deferred object returned by apex.item.create, to no longer delay loading
            lDeferred.resolve();

        });     //end require
    };      // end widget.inputSearch


})( apex.jQuery, apex.server, apex.util, apex.debug, apex.widget, apex.item );