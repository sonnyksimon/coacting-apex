/*!
 Copyright (c) 2017, 2018, Oracle and/or its affiliates. All rights reserved.
*/
/* Forked from jQuery Mobile version 1.4.5 listview.js */
/*!
 * jQuery Mobile listview.js
 * Copyright 2010, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
/*!
 * jQuery Mobile nestedlists plugin
 * The MIT License (MIT)
 * Copyright (c) 2013 Alexander Schmitz
 */
/*global apex*/
/*
JQM compatibility changes
- theme options removed
- first/last classes removed
- some markup and class changes
- nested lists do not use JQM pages so page, header, content options removed
- _beforeListviewRefresh, _afterListviewRefresh removed/not called

Mappings from old to new classes
Don't change these
 ui-li-icon      list view when image is type icon*
 ui-li-aside     list view for supplemental info (on a p tag)
 ui-li-count     list view for count (on a span tag)

 ui-listview        a-ListView
 ui-screen-hidden   u-hidden
 ui-li-divider      a-ListView-divider
 ui-li-static       a-ListView-item
 ui-listview-inset
 ui-corner-all
 ui-shadow
 ui-li-has-icon     has-icon
 ui-li-has-thumb    has-thumb
 ui-li-has-alt      has-alt
 ui-li-has-count    has-count
 ui-bar-*           - tbd
 ui-body-*          - tbd
 ui-btn             - leave as is for now
 ui-btn-icon-notext - remove
 ui-icon-*          - remove and replace with APEX icon spans
 ui-btn-icon-right  - remove
*/
(function( apexWidget, $ ) {
var S_LIST = "ul,ol",
    M_A_SUBLIST = "<a class='ui-btn js-sublist-nav' href='#'>",
    M_A_CLOSE = "</a>";

var uiScreenHiddenRegex = /\bu-hidden\b/,
    rdivider = /(^|\s)a-ListView-divider($|\s)/,
    rhidden = /(^|\s)u-hidden($|\s)/;

var getAttr = apexWidget.getAttribute;

function makeIconSpan( icon ) {
    var iconClass = icon;

    if ( iconClass.indexOf( "fa-" ) === 0 ) {
        iconClass = "fa " + iconClass;
    }
    return "<span class='" + iconClass + "' aria-hidden='true'></span>";
}

function defaultAutodividersSelector( elt ) {
    // look for the text in the given element
    var text = $.trim( elt.text() ) || null;

    if ( !text ) {
        return null;
    }

    // create the text for the divider (first uppercased letter)
    text = text.slice( 0, 1 ).toUpperCase();

    return text;
}

// jqm added this as a jQuery plugin
// note that this helper doesn't attempt to handle the callback
// or setting of an html element's text, its only purpose is
// to return the html encoded version of the text in all cases. (thus the name)
function getEncodedText( el ) {
    return $( "<a>" ).text( el.text() ).html();
}

function handleListItemClick( event ) {
    var childListId, newList$, curList$, a$, li$;

    a$ = $( event.target ).closest( "a.js-sublist-nav" );
    if ( !a$.length ) {
        return;
    }
    li$ = a$.closest( "li" );
    childListId = li$.attr( "data-list-id" );
    if ( !childListId ) {
        return;
    }

    curList$ = li$.parent();
    if ( curList$.attr( "data-parent-id" ) ) {
        curList$ = curList$.parent();
    }
    newList$ = $( "#" + childListId );

    curList$.hide(); // xxx animation?
    newList$
        .show()
        .find(":focusable").eq(0).focus();

    event.preventDefault();
}

function handleBackClick( event ) {
    var btn$ = $( event.target ).closest( "button" ),
        curList$ = btn$.closest( ".a-ListView-nestedList" ),
        parentId = curList$.find( S_LIST ).attr( "data-parent-id" );

    curList$.hide(); // xxx animation?
    $( "#" + parentId )
        .show()
        .find(":focusable").eq(0).focus();
}


$.widget( "apex.listview", {
    version: "18.1",
    widgetEventPrefix: "listview",
    options: {
        icon: "fa-angle-right",
        splitIcon: "fa-angle-right",
        inset: false,
        corners: true,
        shadow: true,
        backButtonText: "Back",  // Should be set with a localized label
        autodividers: false,
        autodividersSelector: defaultAutodividersSelector,
        hideDividers: true,
        childPages: false // if true allow nested lists
    },

    _create: function() {
        var o = this.options,
            listviewClasses = "a-ListView";

        listviewClasses += o.inset ? " ui-listview-inset" : "";

        if ( o.inset ) {
            listviewClasses += o.corners ? " ui-corner-all" : "";
            listviewClasses += o.shadow ? " ui-shadow" : "";
        }

        // create listview markup
        this.element.addClass( listviewClasses );

        this.refresh( true );

        if ( o.childPages ) {
            this._on( {
                "click": handleListItemClick
            } );
        }
    },

    _getCreateOptions: apexWidget._getCreateOptions,

    _destroy: function() {
        this.element.removeClass( "a-ListView ui-listview-inset ui-corner-all ui-shadow" );
        // todo there are more classes that could be cleaned up
        if ( this.nestedLists && this.nestedLists.length ) {
            this.nestedLists.remove();
        }
    },

    // TODO: Remove in 1.5
    _findFirstElementByTagName: function( ele, nextProp, lcName, ucName ) {
        var dict = {};
        dict[lcName] = dict[ucName] = true;
        while ( ele ) {
            if ( dict[ele.nodeName] ) {
                return ele;
            }
            ele = ele[nextProp];
        }
        return null;
    },
    // TODO: Remove in 1.5
    _addThumbClasses: function( containers ) {
        var i, img, len = containers.length;
        for ( i = 0; i < len; i++ ) {
            img = $( this._findFirstElementByTagName( containers[i].firstChild, "nextSibling", "img", "IMG" ) );
            if ( img.length ) {
                $( this._findFirstElementByTagName( img[0].parentNode, "parentNode", "li", "LI" ) ).addClass( img.hasClass( "ui-li-icon" ) ? "has-icon" : "has-thumb" );
            }
        }
    },

    _getChildrenByTagName: function( ele, lcName, ucName ) {
        var results = [],
            dict = {};
        dict[lcName] = dict[ucName] = true;
        ele = ele.firstChild;
        while ( ele ) {
            if ( dict[ele.nodeName] ) {
                results.push( ele );
            }
            ele = ele.nextSibling;
        }
        return $( results );
    },

    _replaceDividers: function() {
        var i, lis, li, dividerText,
            lastDividerText = null,
            list$ = this.element,
            divider;

        list$.children( "li[data-role='list-divider']" ).remove();

        lis = list$.children( "li" );

        for ( i = 0; i < lis.length; i++ ) {
            li = lis[i];
            dividerText = this.options.autodividersSelector( $( li ) );

            if ( dividerText && lastDividerText !== dividerText ) {
                divider = document.createElement( "li" );
                divider.appendChild( document.createTextNode( dividerText ) );
                divider.setAttribute( "data-role", "list-divider" );
                li.parentNode.insertBefore( divider, li );
            }

            lastDividerText = dividerText;
        }
    },

    _hideDividers: function() {
        var items, idx, item, hideDivider = true;

        items = this._getChildrenByTagName( this.element[0], "li", "LI" );
        for ( idx = items.length - 1; idx > -1; idx-- ) {
            item = items[idx];
            if ( item.className.match( rdivider ) ) {
                if ( hideDivider ) {
                    item.className = item.className + " u-hidden";
                }
                hideDivider = true;
            } else {
                if ( !item.className.match( rhidden ) ) {
                    hideDivider = false;
                }
            }
        }
    },

    refresh: function( create ) {
        var startCount,
            self = this,
            o = this.options,
            list$ = this.element,
            ol = !!$.nodeName( list$[0], "ol" ),
            start = list$.attr( "start" ),
            itemClassDict = {},
            countBubbles = list$.find( ".ui-li-count" );

        function initList( list ) {
            var buttonClass, pos, numli, item, itemClass, itemTheme, itemIcon, icon, a,
                isDivider, newStartCount, value, last, splittheme, splitThemeClass, spliticon,
                altButtonClass, dividerTheme, li;

            li = self._getChildrenByTagName( list, "li", "LI" );

            for ( pos = 0, numli = li.length; pos < numli; pos++ ) {
                item = li.eq( pos );
                itemClass = "";

                if ( create || item[0].className.search( /\ba-ListView-item\b|\ba-ListView-divider\b/ ) < 0 ) {
                    a = self._getChildrenByTagName( item[0], "a", "A" );
                    isDivider = ( getAttr( item[0], "role" ) === "list-divider" );
                    value = item.attr( "value" );
                    itemTheme = getAttr( item[0], "theme" ); // xxx

                    if ( a.length && a[0].className.search( /\bui-btn\b/ ) < 0 && !isDivider ) {
                        itemIcon = getAttr( item[0], "icon" );
                        icon = ( itemIcon === false ) ? false : ( itemIcon || o.icon );

                        buttonClass = "ui-btn";
                        itemClass = "a-ListView-item has-link";

                        if ( a.length > 1 ) {
                            itemClass += " has-alt";

                            last = a.last();
                            splittheme = getAttr( last[0], "theme" ) || getAttr( item[0], "theme", true ); // xxx
                            splitThemeClass = splittheme ? " ui-btn-" + splittheme : "";
                            spliticon = getAttr( last[0], "icon" ) || getAttr( item[0], "icon" ) || o.splitIcon;
                            altButtonClass = "ui-btn" + splitThemeClass;

                            last
                                .attr( "title", $.trim( getEncodedText( last ) ) )
                                .addClass( altButtonClass )
                                .empty();
                            if ( spliticon ) {
                                last.append( makeIconSpan( spliticon ) );
                            }

                            // Reduce to the first anchor, because only the first gets the buttonClass
                            a = a.first();
                        }

                        // Apply buttonClass to the (first) anchor
                        a.addClass( buttonClass );
                        if ( icon ) {
                            a.append( makeIconSpan( icon ) );
                        }
                    } else if ( isDivider ) {
                        dividerTheme = getAttr( item[0], "theme" ); // xxx

                        itemClass = "a-ListView-divider ui-bar-" + ( dividerTheme ? dividerTheme : "inherit" );

                        item.attr( "role", "heading" );
                    } else if ( a.length <= 0 ) {
                        itemClass = "a-ListView-item ui-body-" + ( itemTheme ? itemTheme : "inherit" );
                    }
                    if ( ol && value ) {
                        newStartCount = parseInt( value, 10 ) - 1;

                        item.css( "counter-reset", "listnumbering " + newStartCount );
                    }
                    // init list items for any nested lists
                    item.children( S_LIST ).each( function() {
                        initList( this );
                    } );
                }

                // Instead of setting item class directly on the list item
                // at this point in time, push the item into a dictionary
                // that tells us what class to set on it so we can do this after this
                // processing loop is finished.

                if ( !itemClassDict[itemClass] ) {
                    itemClassDict[itemClass] = [];
                }

                itemClassDict[itemClass].push( item[0] );
            }

            // Deprecated in 1.4. From 1.5 you have to add class ui-li-has-thumb or ui-li-has-icon to the LI.
            self._addThumbClasses( li );
            self._addThumbClasses( li.find( ".ui-btn" ) );
        }

        list$.show(); // just in case refresh happens while showing a nested sub list

        // Check if a start attribute has been set while taking a value of 0 into account
        if ( ol && ( start || start === 0 ) ) {
            startCount = parseInt( start, 10 ) - 1;
            list$.css( "counter-reset", "listnumbering " + startCount );
        }

        if ( o.autodividers ) {
            this._replaceDividers();
        }

        initList( list$[0] );

        // Set the appropriate listview item classes on each list item.
        // The main reason we didn't do this
        // in the for-loop above is because we can eliminate per-item function overhead
        // by calling addClass() and children() once or twice afterwards. This
        // can give us a significant boost on platforms like WP7.5.

        for ( itemClass in itemClassDict ) {
            $( itemClassDict[itemClass] ).addClass( itemClass );
        }

        countBubbles.each( function() {
            $( this ).closest( "li" ).addClass( "has-count" );
        } );

        if ( o.hideDividers ) {
            this._hideDividers();
        }

        if ( o.childPages ) {
            this._setupChildren();
        }
    },

    _setupChildren: function() {
        var baseId,
            idIndex = 1,
            subLists = [],
            self = this,
            list$ = this.element,
            classes = list$.attr( "class" ),
            subLists$ = list$.find( S_LIST );

        if ( this.nestedLists && this.nestedLists.length ) {
            this.nestedLists.remove();
        }

        baseId = list$.attr( "id" );
        if ( !baseId ) {
            baseId = this.widgetName + this.uuid;
            list$.attr( "id", baseId );
        }
        // set up ids to link parent li to child ul and ul to parent ul
        subLists$.each( function() {
            var id = baseId + "_" + idIndex,
                ul$ = $( this );

            ul$.attr( "id", id )
                .attr( "data-parent-id", ul$.parent().parent().attr( "id" ) )
                .attr( "class", classes )
                .parent() // move to the li in parent list
                .attr( "data-list-id", id );

            idIndex += 1;
        } );

        // now flatten the nested lists
        subLists$.each( function() {
            var pageName, nl$,
                o = self.options,
                ul$ = $( this ),
                li$ = ul$.parent(),
                li = li$[0],
                id = ul$.attr( "id" ),
                hdrCls = "a-ListView-header",
                backBtnText = o.backButtonText;

            // this is the way the nested list plugin worked to find the list label
            // todo improve this once we have freedom to change the list markup
            pageName = ( $( li.childNodes[0] ).text().replace(/^\s+|\s+$/g, '').length > 0 ) ?
                $( li.childNodes[0] ).text() : $( li.childNodes[1] ).text();

            if ( o.inset ) {
                hdrCls += " ui-listview-inset";
            }
            ul$.removeAttr( "id" )
                .click( handleListItemClick );
            nl$ = $( "<div id='" + id + "' class='a-ListView-nestedList' style='display:none;'>" +
                "<div class='" + hdrCls + "'><button type='button' class='a-Button js-back' title='" +
                backBtnText +
                "' aria-label='" +
                backBtnText +
                "'>" + makeIconSpan( "fa-angle-left" ) + "</button><h3>" + pageName + "</h3></div></div>" )
                .insertAfter( list$ );
            nl$.append( ul$ )
                .find( ".js-back" ).click( handleBackClick );

            // do this after the UL has been moved
            if ( !li$.hasClass( "has-link" ) ) {
                // if there is no link add one
                li$.html( M_A_SUBLIST + li$.html() + M_A_CLOSE );
                li$.addClass( "has-link" )
                    .children() // should be just one child
                    .append( makeIconSpan( o.icon ) );
            } else if ( !li$.hasClass( "has-alt" ) ) {
                // if there is a link and no alt (split button) link then add one that does the nested link navigation
                li$.append( M_A_SUBLIST + makeIconSpan( o.splitIcon ) + M_A_CLOSE ).addClass( "has-alt" );
            } else {
                // else the split button will do the nested link navigation
                li$.children( "a" ).last().addClass( "js-sublist-nav" );
            }

            subLists.push( nl$[0] );
        } );

        // keep track of sub lists to remove if refresh or destroy
        this.nestedLists = $( subLists );
    }

} );

$( function() {
    $( "[data-role='listview']" ).listview();
} );

})( apex.widget, apex.jQuery );
