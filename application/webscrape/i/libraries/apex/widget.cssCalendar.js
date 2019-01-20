/*!
 Copyright (c) 2015, 2018 Oracle and/or its affiliates. All rights reserved.
*/

/**
 * CSS Calendar Widget
 * @fileOverview
 * The {@link apex.widget}.cssCalendar is used for the CSS Calendar widget of Oracle Application Express.
 **/

/*global apex,window,moment*/

(function (widget, util, server, $) {

    /**
     * @param {String} pRegionId  Region ID to identify APEX region for this widget.
     * @param {Object} [pOptions]
     * @param {String} [pLocale]
     * @param {String} [pPluginInitJavascript]
     *
     * @function cssCalendar
     * @memberOf apex.widget
     * */


    widget.cssCalendar = function (pRegionId, pOptions, pLocale, pPluginInitJavascript) {

        // *****************************************************************************
        // C A L E N D A R - I N I T I A L I Z A T I O N
        // *****************************************************************************

        var C_MONTH                 = "month",
            C_LIST_MONTH            = "listMonth",
            C_WEEK_VIEW             = "agendaWeek",
            C_DAY_VIEW              = "agendaDay",
            C_DAYS                  = "days",
            C_DAY                   = "day",
            C_WEEK                  = "week",
            C_LIST                  = "list",
            C_MINUTES               = "minutes",
            C_MINUTE                = "minute",
            C_LISTMONTH             = "listMonth",
            C_LISTWEEK              = "listWeek",
            C_LISTDAY               = "listDay",
            //
            C_BROWSE_MODE_EVENTS    = "EVENTS",
            C_BROWSE_MODE_CALENDAR  = "CALENDAR",
            //
            C_CSS_FC                = "fc-",
            C_CSS_FC_HELPER         = C_CSS_FC + "helper",
            C_CSS_FC_HIGHLIGHT      = C_CSS_FC + "highlight",
            C_CSS_FC_DAY            = C_CSS_FC + "day",
            C_CSS_FC_EVENT          = C_CSS_FC + "event",
            C_CSS_FC_POPOVER        = C_CSS_FC + "popover",
            C_CSS_FC_APXLISTBUTTON  = C_CSS_FC + "apexListButton-button",
            C_CSS_FC_VIEW           = C_CSS_FC + "view",
            C_CSS_FC_VIEW_CONT      = C_CSS_FC_VIEW + "-container",
            //
            C_CAL_ATTR_DATA_DATE    = "data-date",
            //
            C_STYLE_BUTTON_MARGIN   = "10px",
            C_STYLE_HIGHL_BGCOLOR   = "#bce8f1",
            //
            C_DA_EVT_PREFIX         = "apexcalendar",
            C_DA_EVT_DATESELECT     = C_DA_EVT_PREFIX + "dateselect",
            C_DA_EVT_VIEWCHANGE     = C_DA_EVT_PREFIX + "viewchange",
            C_DA_EVT_EVTSELECT      = C_DA_EVT_PREFIX + "eventselect",
            C_DA_EVT_DRAGDROP_STRT  = C_DA_EVT_PREFIX + "dragdropstart",
            C_DA_EVT_DRAGDROP_DONE  = C_DA_EVT_PREFIX + "dragdropfinish",
            C_DA_EVT_DRAGDROP_ERR   = C_DA_EVT_PREFIX + "dragdroperror",
            //
            C_CAL_CMD_GOTODATE      = "gotoDate",
            C_CAL_CMD_CHANGEVIEW    = "changeView",
            C_CAL_CMD_OPTION        = "option",
            C_CAL_CMD_RERENDER_EV   = "rerenderEvents",
            C_CAL_CMD_REFETCH_EV    = "refetchEvents",
            C_CAL_CMD_GET_VIEW      = "getView",
            C_CAL_CMD_UNSELECT      = "unselect",
            C_CAL_CMD_RENDER        = "render",
            C_CAL_CMD_CLIENT_EV     = "clientEvents",
            C_CAL_CMD_REMOVE_EV     = "removeEvents",
            C_CAL_CMD_UPDATE_EV     = "updateEvent",
            C_CAL_CMD_RENDER_EV     = "renderEvent",
            //
            C_FORMAT_YYYYMMDD       = "YYYY-MM-DD",
            C_FORMAT_HHMMSS         = "HH:mm:ss",
            //
            C_LOCALSTORAGE_LASTVIEW = "lastview",
            C_GENERATED_ID_PREFIX   = "apex.widget.cssCalendar.Id_",
            //
            //
            FC                      = $.fullCalendar,
            gOptions,
            gRegion$,
            gCalendar$,
            gLocale,
            gAllDay,
            gCalStorage,
            gLastView,
            gDayNamesShort,
            gLastViewResponsive = false,
            gEventId            = 0,
            // this object holds state information for keyboard support
            keyBoardInfo = {
                keyboardActive : false,
                focusEvents    : false,
                selectorEvent  : false,
                browseMode     : C_BROWSE_MODE_CALENDAR,
                dayEvents      : [],
                activeDayEvent : false,
                SELECTORID     : "com_oracle_apex_selectorevent$",
                cssClass       : C_CSS_FC_HELPER,
                KEY_PREV       : 37,
                KEY_NEXT       : 39,
                MONTH_VIEW     : C_MONTH,
                WEEK_VIEW      : C_WEEK_VIEW,
                DAY_VIEW       : C_DAY_VIEW,
                LIST_VIEW      : C_LISTMONTH,
                viewChangeByKey: false };


        // *****************************************************************************
        // H E L P E R - F U N C T I O N S
        // *****************************************************************************
        //
        function eventEscaping( pEvent ) {
            return ( !(pEvent.source && pEvent.apexEventSource === 'SQL') );
        }
        function getNextId() {
            return C_GENERATED_ID_PREFIX + ( ++gEventId );
        }

        function getMoreLink( pDate ) {
            var lDateCell$ = $("div.fc-content-skeleton td[" + C_CAL_ATTR_DATA_DATE + "=" + pDate + "]"),
                lDateIndex = lDateCell$.index(),
                lOffsets = [],
                lSkips   = [],
                lMoreLink$,
                lStopSearch = false;
        
            function incrementOffset( idx ) {
                if ( lOffsets[ idx ] ) {
                    (lOffsets[ idx ])++;
                } else {
                    lOffsets[ idx ] = 1;
                }
            }
        
            function getOffset( idx ) {
                return lOffsets[ idx ] || 0;
            }
        
            lDateCell$.closest( "table" ).find( "tbody > tr" ).each( function( pRowIndex ) {
                var lthisRowOffset = getOffset( pRowIndex ),
                    lthisColNumber = -1,
                    i, j, k;
        
                apex.debug.trace( "Row Number:" + pRowIndex );
        
                if ( lStopSearch === false ) {
                    $( this ).children().each( function( pColIndex ) {
                        var lAttrRowspan = $( this ).attr( "rowspan" ),
                            lAttrColspan = $( this ).attr( "colspan" ) || 1,
                            lCol    = this;
        
                        apex.debug.trace( "Row Number:" + pColIndex );
        
                        for ( i = 0; i < lAttrColspan; i++) {
                            if ( $( lCol ).css( "display" ) !== "none" ) {
                                lthisColNumber++;
                                apex.debug.trace( "Col Number:" + lthisColNumber + " - Offset:" + lthisRowOffset );
        
                                if ( lthisColNumber + lthisRowOffset >= lDateIndex ) {
                                    if ( lSkips [ pRowIndex ] ) { return false; }
        
                                    if ( $( lCol ).find( "a.fc-more" ).length > 0 ) {
                                        apex.debug.trace( "found the link." );
                                        lMoreLink$ = $( lCol ).find( "a.fc-more" );
                                        lStopSearch = true;
                                    }
        
                                    if ( lAttrRowspan > 1 ) {
                                        for ( j = 1; j < lAttrRowspan; j++ ) {
                                            lSkips[ pRowIndex + j ] = true;
                                        }
                                    }
        
                                    return false;
                                }
        
                                if ( lAttrRowspan > 1 ) {
                                    for ( k = 1; k < lAttrRowspan; k++ ) {
                                        incrementOffset( pRowIndex + k );
                                    }
                                }
                            }
                        }
                    } );
                } 
            });
        
            return lMoreLink$;
        }
        
        function formatYYYYMMDD( pMoment ) {
            return ("0000" +   pMoment.year ( )       ).substr( -4 ) +
                   ("00"   + ( pMoment.month( ) + 1 ) ).substr( -2 ) +
                   ("00"   +   pMoment.date ( )       ).substr( -2 );
        }

        function formatYYYYMMDDhhmmss( pMoment ) {
            return formatYYYYMMDD( pMoment ) +
                   ("00"   + pMoment.hour  ( ) ).substr( -2 ) +
                   ("00"   + pMoment.minute( ) ).substr( -2 ) +
                   ("00"   + pMoment.second( ) ).substr( -2 );
        }

        function subtractDayIfRequired( pEvent ) {
            var lEvent;

            if ( pEvent.end !== null && pEvent.allDay && !gOptions.endDateExclusive ) {
                lEvent = pEvent.end.clone().subtract( 1, C_DAYS );
            } else {
                lEvent = pEvent.end;
            }
            return lEvent;
        }

        function adjustAllDayForJsonEvents( pEventArray ) {
            var i;
            if ( !gOptions.showTime ) {
                for ( i = 0; i < pEventArray.length; i++ ) {
                    pEventArray[ i ].allDay = true;
                }
            }
            return pEventArray;
        }

        function makeEndDateInclusive( pEventArray ) {
            var i;
            if ( !gOptions.endDateExclusive ) {
                for ( i = 0; i < pEventArray.length; i++ ) {
                    if ( pEventArray[ i ].end ) {
                        pEventArray[ i ].end = moment( pEventArray[ i ].end, C_FORMAT_YYYYMMDD + "[T]" + C_FORMAT_HHMMSS ).add( ( pEventArray[ i ].allDay ? "1" : "0" ), C_DAYS ).format( C_FORMAT_YYYYMMDD + "[T]" + C_FORMAT_HHMMSS );
                    }
                }
            }
            return pEventArray;
        }

        function _calcAspectRatio( ) {
            var wWidth         = $( window ).width( )  ,
                wHeight        = $( window ).height( ) ,
                rWidth         = gRegion$.width( )     ,
                rHeight        = gRegion$.height( )    ,
                rAspectRatio   = Math.round( ( rWidth / rHeight ) * 10 ) / 10,
                wAspectRatio   = Math.round( ( wWidth / wHeight ) * 10 ) / 10,
                theAspectRatio = rAspectRatio;


            if ( wAspectRatio < 1 && rAspectRatio > 1 ) { theAspectRatio = wAspectRatio; }
            else if ( wAspectRatio > 1 && rAspectRatio < 1 ) { theAspectRatio = 1; }

            if ( theAspectRatio < 1 ) { theAspectRatio = 1; }
            else if ( theAspectRatio > 2.6 ) { theAspectRatio = 2.6; }

            return theAspectRatio;
        }

        function lPadTime( pTime ) {
            return ( pTime <= 9 ? ( "0" + pTime + ":00:00" ) : ( "" + pTime + ":00:00" ) );
        }


        function getUrlAndRedirectAjax( pStart, pEnd ) {
            server.plugin( gOptions.ajaxIdentifier, {
                x01: "PREPARE_URL", /* action */
                x02: formatYYYYMMDDhhmmss( pStart ),
                x03: formatYYYYMMDDhhmmss( pEnd ),
                x06: gOptions.createLink
            }, {
                success: function ( pData ) {
                    if ( pData.url ) {
                        apex.navigation.redirect( pData.url );
                    } else {
                        apex.debug( pData );
                    }
                }
            } );
        }

       function getDayMinTime( pMoment ) {
            var dayMinTime;
            if ( gOptions.minTime ) {
                dayMinTime = moment( pMoment.format( C_FORMAT_YYYYMMDD ) + "T" + gOptions.minTime + "Z");
            } else {
                dayMinTime = moment( pMoment.format( C_FORMAT_YYYYMMDD ) + "T00:00:00Z" );
            }
            return dayMinTime;
        }

        function getDayMaxTime( pMoment ) {
            var dayMaxTime;
            if ( gOptions.maxTime ) {
                dayMaxTime = moment( pMoment.format( C_FORMAT_YYYYMMDD ) + "T" + gOptions.maxTime + "Z" );
            } else {
                dayMaxTime = moment( pMoment.format( C_FORMAT_YYYYMMDD ) + "T00:00:00Z" ).add( 1, C_DAYS );
            }
            return dayMaxTime;
        }

        function scrollToHour( hour ) {
            var hourOffset, weekGrid, hourRow,
                hourRowOffset,hourRowHeight,weekGridOffset,weekGridHeight,scrollDiff;

            if ( gOptions.minTime ) {
                hourOffset = parseInt( gOptions.minTime.substr( 0, 2 ), 10 );
                hourOffset = (hourOffset < 0 ? 0 : hourOffset);
            } else {
                hourOffset = 0;
            }
            weekGrid = gCalendar$.find( ".fc-time-grid-container" );
            hourRow  = gCalendar$.find( ".fc-time-grid-container .fc-axis:odd:eq(" + (hour - hourOffset) + ")" );

            if ( hourRow.length ) {
                hourRowOffset  = hourRow.position().top;
                hourRowHeight  = hourRow.height() * 2;
                weekGridOffset = weekGrid.scrollTop();
                weekGridHeight = weekGrid.height();
                scrollDiff     = (hourRowOffset + hourRowHeight) - (weekGridOffset + weekGridHeight);

                if ( hourRowOffset < weekGridOffset ) {
                    weekGrid.animate( { scrollTop: hourRowOffset }, 10 );
                }
                if ( hourRowOffset + hourRowHeight > weekGridOffset + weekGridHeight ) {
                    weekGrid.animate( { scrollTop: weekGridOffset + Math.max( hourRowHeight, scrollDiff ) }, 10 );
                }
            }
        }

        function pWidth( pDivId ) {
            return apex.jQuery( pDivId ).parent().width();
        }

        function tDivs( pContainer, pDivId ) {
            return apex.jQuery( pContainer + " div[id=\"" + pDivId + "\"]" ).length;
        }

        function lPos( pContainer, pDivId ) {
            return apex.jQuery( pContainer + " div[id=\"" + pDivId + "\"]:first" ).parent().position().left;
        }

        function positionObjects( pContainer, pDivId, pInitPos, pWidth ) {
            var lthisPos = pInitPos;
            apex.jQuery( pContainer + "div[id=\"" + pDivId + "\"]" ).each( function ( index ) {
                apex.jQuery( this ).width( pWidth );
                apex.jQuery( this ).css( 'left', lthisPos );
                lthisPos = lthisPos + pWidth;
            } );
        }

        function setHeight() {
            var lScroller   = apex.jQuery( 'div[id="cal_scroll_div"]' ),
                lViewHeight = Math.round( apex.jQuery( 'div[id="cal_main"]' ).width() / 1.35 ),
                headHeight, allDayHeight, bodyHeight, lHeight, lBody;

            lBody = apex.jQuery( 'table[id="cal_main_table"]' ).find( 'tbody' );
            if ( apex.jQuery( lBody ).length === 1 ) {
                headHeight   = apex.jQuery( lBody ).position().top;
                allDayHeight = apex.jQuery( lScroller ).position().top;
                bodyHeight   = Math.min( // when no scrollbars. +1 for bottom border
                                         lViewHeight - headHeight,
                                         apex.jQuery( 'div[id="cal_days"]' ).height() + allDayHeight + 1
                );
                lHeight      = ( ( bodyHeight - allDayHeight - 1 ) < 500 ? 500 : ( bodyHeight - allDayHeight - 1) );

                lScroller.height( lHeight );
                apex.jQuery( 'div[id="cal_div_filler"]' ).height( lHeight + 50 );
            }
        }

        function setWidth() {
            var lDwidth    = apex.jQuery( "td.m-Calendar-Day.priority1:first" ).width(),
                lHourwidth = apex.jQuery( "th.m-Calendar-HourTitle:first" ).width(),
                lScrollDiv, lSWidth, lIWidth;

            lScrollDiv = apex.jQuery( 'div[id="cal_scroll_div"]' );

            if ( apex.jQuery( lScrollDiv ).length === 1 ) {
                lSWidth = apex.jQuery( lScrollDiv ).get( 0 ).clientWidth;
                lIWidth = apex.jQuery( lScrollDiv ).width();

                if ( !( lIWidth - lSWidth ) ) {
                    apex.jQuery( "td.m-Calendar-DivFiller" ).hide();
                    apex.jQuery( "th.m-Calendar-DivFiller" ).hide();
                } else {
                    apex.jQuery( "td.m-Calendar-DivFiller" ).show();
                    apex.jQuery( "th.m-Calendar-DivFiller" ).show();
                }
                apex.jQuery( "th.m-Calendar-DayOfWeek" ).each( function ( index ) {
                    apex.jQuery( this ).width( lDwidth );
                } );
                apex.jQuery( "td.m-Calendar-AllDay" ).each( function ( index ) {
                    apex.jQuery( this ).width( lDwidth );
                } );

                apex.jQuery( "th.m-Calendar-AlldayTitle" ).each( function ( index ) {
                    apex.jQuery( this ).width( lHourwidth + 1 );
                } );

                //setting the filler width
                apex.jQuery( "th.m-Calendar-HeadFiller" ).width( lHourwidth + Math.round( lHourwidth / 3 ) );
                apex.jQuery( "th.m-Calendar-DayOfWeek:first" ).css( "left", apex.jQuery( "td.m-Calendar-Day.priority1:first" ).position().left
                );
            }
        }

        // *****************************************************************************
        // K E Y B O A R D - S U P P O R T
        // *****************************************************************************

        function openMoreEvents( pDayYYYYMMDD ) {
            var lMoreLink$ = getMoreLink( pDayYYYYMMDD );

            if ( lMoreLink$ ) {
                lMoreLink$.click();
            }
        }

        function closeMoreEvents( ) {
            $( gCalendar$.find( "span.fc-close.ui-icon.ui-icon-closethick" ) ).click();
        }

        function unhighlightEvent() {
            apex.jQuery( "." + C_CSS_FC_DAY + "." + C_CSS_FC_HIGHLIGHT ).css("background-color", "" );
            apex.jQuery( "." + C_CSS_FC_DAY + "." + C_CSS_FC_HIGHLIGHT ).removeClass( C_CSS_FC_HIGHLIGHT );
        }

        function highlightEvent( pEvent ) {
            var lStart = pEvent.start.clone().startOf( C_DAY ),
                lEnd   = pEvent.end.clone().subtract( 1, "second" ).startOf( C_DAY ),
                lCurrentDay, lCurrentDayId;
            
            lCurrentDay = lStart;

            while ( lCurrentDay.isSameOrBefore( lEnd ) ) {
                lCurrentDayId = lCurrentDay.format( C_FORMAT_YYYYMMDD );

                apex.jQuery( "." + C_CSS_FC_DAY + "[" + C_CAL_ATTR_DATA_DATE + "=" + lCurrentDayId + "]" ).addClass( C_CSS_FC_HIGHLIGHT );
                apex.jQuery( "." + C_CSS_FC_DAY + "[" + C_CAL_ATTR_DATA_DATE + "=" + lCurrentDayId + "]" ).css("background-color", C_STYLE_HIGHL_BGCOLOR );
                lCurrentDay.add( 1, C_DAY );
            }
        }

        function unrenderSelectorEvent() {
            var view     = gCalendar$.fullCalendar( C_CAL_CMD_GET_VIEW ),
                selector = gCalendar$.fullCalendar( C_CAL_CMD_CLIENT_EV, keyBoardInfo.SELECTORID );

            if ( view.name === C_MONTH ) {
                unhighlightEvent();
            } else {
                if ( selector.length > 0 ) {
                    try {
                        gCalendar$.fullCalendar( C_CAL_CMD_REMOVE_EV, keyBoardInfo.SELECTORID );
                    } catch ( ignore ) { }
                }
            }
        }

        function renderSelectorEvent( pUpdateOnly ) {
            var view = gCalendar$.fullCalendar( C_CAL_CMD_GET_VIEW ),
                calEvent;

            if ( keyBoardInfo.selectorEvent ) {
           
                if ( view.name === C_MONTH ) {
                    unhighlightEvent();
                    highlightEvent( keyBoardInfo.selectorEvent );
                } else {
                    // get the event object from FullCalendar ...
                    calEvent = gCalendar$.fullCalendar( C_CAL_CMD_CLIENT_EV, keyBoardInfo.SELECTORID )[ 0 ];
                    if ( pUpdateOnly && calEvent ) {
                        // adjust start and end timestamps
                        calEvent.start = FC.moment( keyBoardInfo.selectorEvent.start.format( C_FORMAT_YYYYMMDD + "[T]" + C_FORMAT_HHMMSS ) );
                        calEvent.end   = FC.moment( keyBoardInfo.selectorEvent.end.format( C_FORMAT_YYYYMMDD + "[T]" + C_FORMAT_HHMMSS ) );
                        // pass event object back to FullCalendar
                        gCalendar$.fullCalendar( C_CAL_CMD_UPDATE_EV, calEvent );
                    } else {
                        try {
                            gCalendar$.fullCalendar( C_CAL_CMD_REMOVE_EV, keyBoardInfo.SELECTORID );
                        } catch ( ignore ) {
                        }
    
                        // create the event object to be passed to FullCalendar
                        calEvent = {
                            id              : keyBoardInfo.selectorEvent.id,
                            title           : keyBoardInfo.selectorEvent.title,
                            allDay          : keyBoardInfo.selectorEvent.allDay,
                            editable        : keyBoardInfo.selectorEvent.editable,
                            durationEditable: keyBoardInfo.selectorEvent.durationEditable,
                            className       : keyBoardInfo.selectorEvent.className,
                            start           : FC.moment( keyBoardInfo.selectorEvent.start.format( C_FORMAT_YYYYMMDD + "[T]" + C_FORMAT_HHMMSS ) ),
                            end             : FC.moment( keyBoardInfo.selectorEvent.end.format( C_FORMAT_YYYYMMDD + "[T]" + C_FORMAT_HHMMSS ) ),
                            overlap         : keyBoardInfo.selectorEvent.overlap
                        };
                        // pass event object to FullCalendar
                        gCalendar$.fullCalendar( C_CAL_CMD_RENDER_EV, calEvent );
                    }
                }
            }
        }

        function leaveEventSelection() {
            keyBoardInfo.browseMode     = C_BROWSE_MODE_CALENDAR;
            keyBoardInfo.activeDayEvent = false;
            closeMoreEvents();
            $( "." + C_CSS_FC_EVENT, gCalendar$ ).removeClass( C_CSS_FC_HELPER );
            $( "div." + C_CSS_FC_VIEW, gCalendar$ ).focus();
            renderSelectorEvent();
        }

        function focusEvent( pView, pEventId ) {
            var focusEvent$;

            focusEvent$ = $( "." + C_CSS_FC_EVENT + "[data-id='" + 
                             util.escapeHTML( pEventId ) + 
                             "']", gCalendar$ );

            focusEvent$.addClass( C_CSS_FC_HELPER );
            if ( focusEvent$ ) { 
                if ( pView.name === keyBoardInfo.MONTH_VIEW ) {
                    if ( focusEvent$.length === 1 ) {
                        focusEvent$.focus(); 
                    } else {
                        focusEvent$.each( function ( i, o ) { if ( $( o ).closest( "." + C_CSS_FC_POPOVER ) ) { $( o ).focus(); } } );
                    }
                } else {
                    focusEvent$.first().focus();
                }
            }
        }

        function startEventSelection( view ) {
            var allEvents = gCalendar$.fullCalendar( C_CAL_CMD_CLIENT_EV ), i;

            keyBoardInfo.dayEvents = [];
            for ( i = 0; i < allEvents.length; i++ ) {
                if ( !(
                        (  allEvents[ i ].start.isAfter( view.end.clone().subtract( 1, C_MINUTE ) ) ) ||
                        (  allEvents[ i ].end && allEvents[ i ].end.isBefore( view.start ) ) ||
                        ( !allEvents[ i ].end && allEvents[ i ].start.isBefore( view.start ) ) ||
                        (  allEvents[ i ].id === keyBoardInfo.SELECTORID )
                    ) ) {
                    keyBoardInfo.dayEvents.push( allEvents[ i ] );
                }
            }

            keyBoardInfo.dayEvents.sort( function ( a, b ) {
                var dateA, dateB, lResult;

                function getString( a ) {
                    var r;

                    if ( a.end ) { 
                        r = formatYYYYMMDDhhmmss( a.start ) + 
                            ( 9999999999 - ( ( a.end - a.start ) / 60000 ) ).toString() +
                            a.title;
                    } else {
                        r = formatYYYYMMDDhhmmss( a.start ) + 
                            "9999999999" +
                            a.title;
                    }
                    return r;
                }
                dateA = getString( a );
                dateB = getString( b );

                if ( dateA < dateB ) {
                    lResult = -1;
                } else if ( dateA > dateB ) {
                    lResult = 1;
                } else {
                    lResult = 0;
                }

                return lResult;
            } );

            if ( keyBoardInfo.dayEvents.length > 0 ) {
                unrenderSelectorEvent();
                keyBoardInfo.browseMode     = C_BROWSE_MODE_EVENTS;
                keyBoardInfo.activeDayEvent = 0;
                if ( view.name === C_MONTH ) {
                    openMoreEvents( keyBoardInfo.dayEvents[ keyBoardInfo.activeDayEvent ].start.format( C_FORMAT_YYYYMMDD ) );
                }

                focusEvent( view, keyBoardInfo.dayEvents[ keyBoardInfo.activeDayEvent ].id );
            }
            return (keyBoardInfo.dayEvents.length > 0);
        }

        function initKeyboardMode( view ) {
            var cursorStart, cursorEnd;

            if ( view.name !== keyBoardInfo.LIST_VIEW ) {
                if ( view.name === keyBoardInfo.MONTH_VIEW ) {
                    cursorStart = view.start.clone().add( 15, C_DAYS ).startOf( C_MONTH );
                    if ( view.validRange && view.validRange.start && cursorStart.isBefore( view.validRange.start ) ) {
                        cursorStart = FC.moment( view.validRange.start );
                    }
                    cursorEnd   = cursorStart.clone().add( 1, C_DAYS);
                } else {
                    cursorStart = view.start.clone().hour( gOptions.startingHour );
                    cursorEnd   = view.start.clone().hour( gOptions.startingHour ).add( 60, C_MINUTES );
                }


                keyBoardInfo.selectorEvent = {
                    id              : keyBoardInfo.SELECTORID,
                    title           : "",
                    allDay          : ( view.name === keyBoardInfo.MONTH_VIEW ),
                    editable        : false,
                    durationEditable: false,
                    className       : keyBoardInfo.cssClass,
                    start           : cursorStart,
                    end             : cursorEnd,
                    overlap         : true
                };

                // prevent mouse actions while keyboard mode is active
                view.options.selectable = false;
                keyBoardInfo.keyboardActive = true;
                if ( !startEventSelection( view ) ) {
                    leaveEventSelection();
                }
            }
        }

        function leaveKeyboardMode() {
            if ( keyBoardInfo.browseMode === C_BROWSE_MODE_EVENTS ) {
                leaveEventSelection();
            }
            unrenderSelectorEvent();
            keyBoardInfo.keyboardActive                             = false;
            gCalendar$.fullCalendar( C_CAL_CMD_GET_VIEW ).options.selectable = true;
        }

        // Called by the APEX refresh event to refetch events
        function _refresh() {
            if ( !gOptions.isMobile) {
                gCalendar$.fullCalendar( C_CAL_CMD_REFETCH_EV );
                if ( keyBoardInfo.keyboardActive === true && keyBoardInfo.browseMode === C_BROWSE_MODE_EVENTS ) {
                    leaveKeyboardMode();
                }
            } else {
                apex.widget.cssCalendar.refreshMobileCalendar();
            }
        }

        function _calSelect( pStart, pEnd, allDay ) {
            var lFormat;

            if ( gCalendar$.fullCalendar( C_CAL_CMD_GET_VIEW ).name === C_MONTH ) {
                pEnd.subtract(1, C_MINUTES);
                lFormat = formatYYYYMMDD;
            } else {
                lFormat = formatYYYYMMDDhhmmss;
            }
            if ( gOptions.createLink && gOptions.createLink !== "" ) {
                // For the CREATE LINK we add the selected START and END dates in JS code
                // if page checksum is enabled we need the server to recalculate the URL checksum
                getUrlAndRedirectAjax( pStart, pEnd );
            } else {
                // when no edit link is defined, fire event
                apex.event.trigger(
                    gRegion$,
                    C_DA_EVT_DATESELECT,
                    {
                        "newStartDate": lFormat( pStart ),
                        "newEndDate"  : lFormat( pEnd )
                    }
                );
            }

            // this is necessary once we have dialogs, because we wont leave the current page 
            gCalendar$.fullCalendar( C_CAL_CMD_UNSELECT );
            gCalendar$.fullCalendar( C_CAL_CMD_RERENDER_EV );
        }

        function _eventClick( pEvent, pJsEvent, pView ) {
            var lEvent;

            if ( gCalendar$.fullCalendar( C_CAL_CMD_GET_VIEW ).name.indexOf( C_LIST ) === 0 ) {
                if ( $( pJsEvent.target ).parents().hasClass( "fc-list-item-description" ) && $( pJsEvent.target ).prop("tagName" ) === "A" ) {
                    return true;
                }
            }

            if ( pEvent.id === keyBoardInfo.SELECTORID ) {
                _calSelect( keyBoardInfo.selectorEvent.start.clone(), keyBoardInfo.selectorEvent.end.clone(), gAllDay );
            } else {
                if ( pEvent.url ) {
                    apex.navigation.redirect( pEvent.url );
                } else {
                    lEvent = $.extend( true, {}, pEvent );
                    lEvent.end = ( lEvent.end !== null ? subtractDayIfRequired( lEvent ) : null );

                    apex.event.trigger(
                        gRegion$,
                        C_DA_EVT_EVTSELECT,
                        {
                            "event": lEvent
                        }
                    );
                }
            }
            return false;
        }

        function checkValidity( pView, pDirection, pAmount, pUnit ) {
            var lStart, lEnd;

            if ( !pView.options.validRange ) {
                return true;
            }
            if ( ( pDirection ===  1 && !pView.options.validRange.end ) ||
                 ( pDirection === -1 && !pView.options.validRange.start ) ) {
                return true;
            }

            if ( pView.options.validRange.start ) {
                if ( pView.name === C_MONTH ) {
                    lStart = FC.moment( pView.options.validRange.start ).startOf( C_DAY );
                } else {
                    lStart = FC.moment( pView.options.validRange.start );
                }
            }
            if ( pView.options.validRange.end ) {
                if ( pView.name === C_MONTH ) {
                    lEnd   = FC.moment( pView.options.validRange.end   ).endOf( C_DAY );
                } else {
                    lEnd   = FC.moment( pView.options.validRange.end );
                }
            }

            if ( pDirection === 1 ) {
                if ( !pView.options.validRange.end ) {
                    return true;
                } else if ( keyBoardInfo.selectorEvent.end.clone().add( pAmount, pUnit ).isSameOrBefore( lEnd ) ) {
                    return true;
                } else {
                    return false;
                }
            } else {
                if ( !pView.options.validRange.start ) {
                    return true;
                } else if ( keyBoardInfo.selectorEvent.start.clone().subtract( pAmount, pUnit ).isSameOrAfter( lStart ) ) {
                    return true;
                } else {
                    return false;
                }
            } 
        }

        // This function moves the new event selection forward or backwards
        function moveSelection( pView, pDirection, pAmount, pUnit ) {
            var changeView = false,
                isAllowed  = false,
                startOfMonth, endOfMonth;

            if ( !checkValidity( pView, pDirection, pAmount, pUnit ) ) {
                return;
            }

            switch ( pView.name ) {
                case keyBoardInfo.MONTH_VIEW:
                    isAllowed = true;
                    if ( pUnit === C_DAYS ) {
                        startOfMonth = keyBoardInfo.selectorEvent.start.clone().startOf( C_MONTH );
                        endOfMonth   = keyBoardInfo.selectorEvent.start.clone().endOf( C_MONTH );
                        while ( !gOptions.weekEnds && startOfMonth.format( "E" ) > 5 ) {
                            startOfMonth.add( 1, pUnit );
                        }
                        while ( !gOptions.weekEnds && endOfMonth.format( "E" ) > 5 ) {
                            endOfMonth.subtract( 1, pUnit );
                        }
                        if (
                            ( pDirection === 1 &&
                              ( !keyBoardInfo.selectorEvent.start.clone().add( pAmount, pUnit ).isBefore( endOfMonth ) )
                            ) ||
                            ( pDirection === -1 &&
                              ( keyBoardInfo.selectorEvent.start.clone().subtract( pAmount, pUnit ).isBefore( startOfMonth ) )
                            )
                        ) {
                            changeView = true;
                        }
                    }
                    break;
                case keyBoardInfo.WEEK_VIEW:
                    if ( pUnit === C_DAYS ) {
                        isAllowed = true;
                        if (
                            ( pDirection === 1 &&
                              ( !keyBoardInfo.selectorEvent.start.clone().add( pAmount, pUnit ).isBefore( pView.end ) )
                            ) ||
                            ( pDirection === -1 &&
                              ( keyBoardInfo.selectorEvent.start.clone().subtract( pAmount, pUnit ).isBefore( pView.start ) )
                            )
                        ) {
                            changeView = true;
                        }
                    } else { // minutes
                        if (
                            ( pDirection === 1 &&
                              ( !(keyBoardInfo.selectorEvent.end.clone().add( pAmount, pUnit ).isAfter( getDayMaxTime( keyBoardInfo.selectorEvent.end.clone().subtract( 1, C_MINUTE ) ) )) )
                            ) ||
                            ( pDirection === -1 &&
                              ( !(keyBoardInfo.selectorEvent.start.clone().subtract( pAmount, pUnit ).isBefore( getDayMinTime( keyBoardInfo.selectorEvent.start ) )) )
                            )
                        ) {
                            isAllowed = true;
                        }
                    }
                    break;
                case keyBoardInfo.DAY_VIEW:
                    if ( pUnit === C_DAYS ) {
                        changeView = true;
                        isAllowed  = true;
                    } else {
                        if (
                            ( pDirection === 1 &&
                              ( !(keyBoardInfo.selectorEvent.end.clone().add( pAmount, pUnit ).isAfter( getDayMaxTime( pView.start ) )) )
                            ) ||
                            ( pDirection === -1 &&
                              ( !(keyBoardInfo.selectorEvent.start.clone().subtract( pAmount, pUnit ).isBefore( getDayMinTime( pView.start ) )) )
                            )
                        ) {
                            isAllowed = true;
                        }
                    }
                    break;
            }

            if ( isAllowed ) {
                keyBoardInfo.selectorEvent.start.add( pAmount * pDirection, pUnit );
                keyBoardInfo.selectorEvent.end.add( pAmount * pDirection, pUnit );

                if ( pUnit === C_DAYS ) {
                    while ( !gOptions.weekEnds && keyBoardInfo.selectorEvent.start.format( "E" ) > 5 ) {
                        keyBoardInfo.selectorEvent.start.add( pDirection, pUnit );
                        keyBoardInfo.selectorEvent.end.add( pDirection, pUnit );
                    }
                }

                if ( changeView ) {
                    keyBoardInfo.viewChangeByKey = true;
                    gCalendar$.fullCalendar( C_CAL_CMD_GOTODATE, keyBoardInfo.selectorEvent.start );
                    renderSelectorEvent( false );

                    if ( pView.name === keyBoardInfo.WEEK_VIEW || pView.name === keyBoardInfo.DAY_VIEW ) {
                        scrollToHour( keyBoardInfo.selectorEvent.start.hour() );
                    }
                } else {
                    renderSelectorEvent( true );
                }

                if ( pView.name === keyBoardInfo.WEEK_VIEW || pView.name === keyBoardInfo.DAY_VIEW ) {
                    scrollToHour( keyBoardInfo.selectorEvent.start.hour() );
                }

            }
        }

        function extendSelection( pView, pDirection, pAmount, pUnit ) {
            var isAllowed = false;

            if ( pDirection === -1 ) {
                if ( keyBoardInfo.selectorEvent.end.clone().subtract( pAmount, pUnit ).isAfter( keyBoardInfo.selectorEvent.start ) ) {
                    isAllowed = true;
                }
            } else {
                switch ( pView.name ) {
                    case keyBoardInfo.MONTH_VIEW:
                        if ( pUnit === C_DAYS ) {
                            if ( keyBoardInfo.selectorEvent.end.clone().add( pAmount, pUnit ).subtract( 1, C_MINUTES ).isBefore( pView.end ) ) {
                                isAllowed = true;
                            }
                        }
                        break;
                    case keyBoardInfo.WEEK_VIEW:
                        if ( pUnit === C_DAYS) {
                            if ( keyBoardInfo.selectorEvent.end.clone().add( pAmount, pUnit ).subtract( 1, C_MINUTE ).isBefore( pView.end ) ) {
                                isAllowed = true;
                            }
                        } else {
                            if ( !(keyBoardInfo.selectorEvent.end.clone().add( pAmount, pUnit ).isAfter( getDayMaxTime( keyBoardInfo.selectorEvent.end.clone().subtract( 1, C_MINUTE ) ) )) ) {
                                isAllowed = true;
                            }
                        }
                        break;
                    case keyBoardInfo.DAY_VIEW:
                        if ( pUnit === C_MINUTES ) {
                            if ( !(keyBoardInfo.selectorEvent.end.clone().add( 30, C_MINUTES ).isAfter( getDayMaxTime( pView.start ) )) ) {
                                isAllowed = true;
                            }
                        }
                        break;
                }
            }
            if ( isAllowed ) {
                keyBoardInfo.selectorEvent.end.add( pAmount * pDirection, pUnit );
                if ( pUnit === C_DAYS ) {
                    while ( !gOptions.weekEnds && keyBoardInfo.selectorEvent.end.clone().subtract( 1, C_MINUTE ).format( "E" ) > 5 ) {
                        keyBoardInfo.selectorEvent.end.add( pDirection, C_DAYS );
                    }
                }
                renderSelectorEvent( true );
            }
            if ( pView.name === keyBoardInfo.DAY_VIEW || pView.name === keyBoardInfo.WEEK_VIEW ) {
                scrollToHour( keyBoardInfo.selectorEvent.end.clone().subtract( 1, C_MINUTES ).hour() );
            }
        }

        // This function moves the event selection forward or backwards.
        function gotoEvent( pView, pDirection ) {
            $( "." + C_CSS_FC_EVENT, gCalendar$ ).removeClass( C_CSS_FC_HELPER );
 
            if ( pDirection === -1 ) {
                if ( keyBoardInfo.activeDayEvent > 0 ) {
                    keyBoardInfo.activeDayEvent--;
                } else {
                    keyBoardInfo.activeDayEvent = keyBoardInfo.dayEvents.length - 1;
                }
            } else {
                if ( keyBoardInfo.activeDayEvent < keyBoardInfo.dayEvents.length - 1 ) {
                    keyBoardInfo.activeDayEvent++;
                } else {
                    keyBoardInfo.activeDayEvent = 0;
                }
            }
            if ( pView.name === keyBoardInfo.MONTH_VIEW ) {
                closeMoreEvents( );
            }

            if ( pView.name === keyBoardInfo.MONTH_VIEW ) {
                if ( keyBoardInfo.dayEvents[ keyBoardInfo.activeDayEvent ].start.isBefore( pView.start ) ) {
                    openMoreEvents( pView.start.format( C_FORMAT_YYYYMMDD ) );
                } else {
                    openMoreEvents( keyBoardInfo.dayEvents[ keyBoardInfo.activeDayEvent ].start.format( C_FORMAT_YYYYMMDD ) );
                }
            }

            focusEvent( pView, keyBoardInfo.dayEvents[ keyBoardInfo.activeDayEvent ].id );
        }

        function processKeyEvents( view, e ) {
            switch ( e.which ) {
                case 27:
                    if ( keyBoardInfo.browseMode === C_BROWSE_MODE_CALENDAR ) {
                        if ( !startEventSelection( view ) ) {
                            leaveKeyboardMode();
                        }
                    } else {
                        leaveKeyboardMode();
                    }
                    e.preventDefault();
                    break;

                case 78:
                    if ( e.shiftKey && keyBoardInfo.browseMode === C_BROWSE_MODE_EVENTS ) {
                        leaveEventSelection();
                    }
                    e.preventDefault();
                    break;

                case 13:
                case 32:
                    if ( keyBoardInfo.browseMode === C_BROWSE_MODE_CALENDAR ) {
                        _calSelect( keyBoardInfo.selectorEvent.start.clone(), keyBoardInfo.selectorEvent.end.clone(), gAllDay );
                    } else {
                        _eventClick( keyBoardInfo.dayEvents[ keyBoardInfo.activeDayEvent ] );
                    }
                    e.preventDefault();
                    break;

                case 38:
                    if ( keyBoardInfo.browseMode === C_BROWSE_MODE_EVENTS ) {
                        gotoEvent( view, -1 );
                    } else {
                        if ( view.name === keyBoardInfo.WEEK_VIEW || view.name === keyBoardInfo.DAY_VIEW ) {
                            if ( e.shiftKey ) {
                                extendSelection( view, -1, 30, C_MINUTES );
                            } else {
                                moveSelection( view, -1, 30, C_MINUTES );
                            }
                        } else {
                            if ( e.shiftKey ) {
                                extendSelection( view, -1, 7, C_DAYS );
                            } else {
                                moveSelection( view, -1, 7, C_DAYS );
                            }
                        }
                    }
                    e.preventDefault();
                    break;
                case 9:
                    leaveKeyboardMode();
                    break;
                case 40:
                    if ( keyBoardInfo.browseMode === C_BROWSE_MODE_EVENTS ) {
                        gotoEvent( view, 1 );
                    } else {
                        if ( view.name === keyBoardInfo.WEEK_VIEW || view.name === keyBoardInfo.DAY_VIEW ) {
                            if ( e.shiftKey ) {
                                extendSelection( view, 1, 30, C_MINUTES );
                            } else {
                                moveSelection( view, 1, 30, C_MINUTES );
                            }
                        } else {
                            if ( e.shiftKey ) {
                                extendSelection( view, 1, 7, C_DAYS );
                            } else {
                                moveSelection( view, 1, 7, C_DAYS );
                            }
                        }
                    }
                    e.preventDefault();
                    break;
                case keyBoardInfo.KEY_NEXT:
                    if ( keyBoardInfo.browseMode === C_BROWSE_MODE_CALENDAR ) {
                        if ( !e.shiftKey ) {
                            moveSelection( view, 1, 1, C_DAYS );
                        } else {
                            extendSelection( view, 1, 1, C_DAYS );
                        }
                    }
                    e.preventDefault();
                    break;
                case keyBoardInfo.KEY_PREV:
                    if ( keyBoardInfo.browseMode === C_BROWSE_MODE_CALENDAR ) {
                        if ( !e.shiftKey ) {
                            moveSelection( view, -1, 1, C_DAYS );
                        } else {
                            extendSelection( view, -1, 1, C_DAYS );
                        }
                    }
                    e.preventDefault();
                    break;
                case 33:  // PGUP
                    if ( keyBoardInfo.browseMode === C_BROWSE_MODE_CALENDAR ) {
                        switch ( view.name ) {
                            case keyBoardInfo.WEEK_VIEW:
                                moveSelection( view, -1, 7, C_DAYS );
                                break;
                            case keyBoardInfo.DAY_VIEW:
                                moveSelection( view, -1, 1, C_DAYS );
                                break;
                            case keyBoardInfo.MONTH_VIEW:
                                moveSelection( view, -1, view.start.clone().subtract( 15, C_DAYS ).endOf( C_MONTH ).date(), C_DAYS );
                                break;
                        }
                    }
                    e.preventDefault();
                    break;
                case 34:  // PGDOWN
                    if ( keyBoardInfo.browseMode === C_BROWSE_MODE_CALENDAR ) {
                        switch ( view.name ) {
                            case keyBoardInfo.WEEK_VIEW:
                                moveSelection( view, 1, 7, C_DAYS );
                                break;
                            case keyBoardInfo.DAY_VIEW:
                                moveSelection( view, 1, 1, C_DAYS );
                                break;
                            case keyBoardInfo.MONTH_VIEW:
                                moveSelection( view, 1, view.start.clone().add( 15, C_DAYS ).endOf( C_MONTH ).date(), C_DAYS );
                                break;
                        }
                    }
                    e.preventDefault();
                    break;

            }
        }

        // *****************************************************************************
        // A J A X - C A L L S
        // *****************************************************************************

        function _setTooltip( element, pEvent ) {
            var dateDisplay, tooltip, timeFormatMask;
            if ( gOptions.timeFormatType === "24" ) { timeFormatMask = "ll HH:mm";}
            else if ( gOptions.timeFormatType === "12" ) { timeFormatMask = "ll hh:mm A";}
            else { timeFormatMask = "lll";}

            if ( pEvent.id !== keyBoardInfo.SELECTORID && pEvent.title && pEvent.start ) {
                if ( pEvent.end ) {
                    if ( pEvent.allDay ) {
                        if ( pEvent.end.clone().subtract( 1, C_DAYS ).isBefore( pEvent.start ) ) {
                            dateDisplay = $.fullCalendar.formatRange( pEvent.start, pEvent.end.clone(), 'll' );
                        } else {
                            dateDisplay = $.fullCalendar.formatRange( pEvent.start, subtractDayIfRequired( pEvent ), 'll' );
                        }
                    } else {
                        dateDisplay = $.fullCalendar.formatRange( pEvent.start, pEvent.end, timeFormatMask );
                    }
                } else {
                    if ( pEvent.allDay ) {
                        dateDisplay = pEvent.start.format( 'll' );
                    } else {
                        dateDisplay = pEvent.start.format( timeFormatMask );
                    }
                }

                tooltip =
                    '<span class="tt-title">' +
                    ( eventEscaping( pEvent ) ? apex.util.escapeHTML( pEvent.title ) : pEvent.title ) +
                    '</span><br>';
                tooltip = tooltip + dateDisplay + "<br><br>";

                if ( pEvent.description ) {
                    tooltip = tooltip +
                              ( eventEscaping( pEvent ) ? apex.util.escapeHTML( pEvent.description ) : pEvent.description );
                }
                $( element ).tooltip( {
                                          show        : apex.tooltipManager.defaultShowOption(),
                                          items       : "a." + C_CSS_FC_EVENT,
                                          position    : { my: "left top+15", at: "left center", collision: "flipfit" },
                                          content     : tooltip,
                                          classes     : { "ui-tooltip": "ui-widget-content ui-corner-all ui-widget ui-tooltip" }
                                      } );
            }
        }

        function _eventRender( event, element ) {
            if ( !event.id || event.id === "" ) {
                event.id = getNextId();
            }
            element.attr( "data-id", event.id );
            if ( event.source ) {
                if ( event.apexEventSource === "SQL" ) {
                    element.find( 'span.fc-title' ).html( element.find( 'span.fc-title' ).text() );
                    element.find( 'div.fc-title' ).html( element.find( 'div.fc-title' ).text() );
                    element.find( 'td.fc-list-item-title>a' ).html( element.find( 'td.fc-list-item-title>a' ).text() );
                }
            }
            if ( gCalendar$.fullCalendar( C_CAL_CMD_GET_VIEW ).name.indexOf( C_LIST ) === 0 ) {
                // add a tabindex for allow tabbing through the list
                element.find( 'td.fc-list-item-title' ).attr( "tabindex", "0" );
                element.find( 'td.fc-list-item-title' ).wrapInner("<div></div>");
                // remove <a> tag, when href attribute is empty
                element.find( 'td.fc-list-item-title a:not([href])' ).contents().unwrap();

                // add tooltip contents as we did in our own list view in earlier releases
                if ( event.description ) {
                    element.find( 'td.fc-list-item-title' ).append( "<div class=\"fc-list-item-description\">" + event.description + "</div>");
                }
            }

            if ( gOptions.mouseHoverOver ) {
                _setTooltip( element, event );
            }
        }

        function _windowResize( view ) {
            var lWidth = $( window ).width();
            if ( view.name === C_MONTH || view.name === C_WEEK_VIEW ) {
                if ( $( window ).width() < 700 ) {
                    gLastViewResponsive = view.name;
                    gCalendar$.fullCalendar( C_CAL_CMD_CHANGEVIEW, ( view.name === C_MONTH ? C_LISTMONTH : C_LISTWEEK ) );
                    gCalendar$.fullCalendar( C_CAL_CMD_OPTION, "aspectRatio", _calcAspectRatio( ) );
                }
            } else if ( view.name.indexOf( C_LIST ) === 0 ) {
                if ( lWidth > 700 && gLastViewResponsive ) {
                    gCalendar$.fullCalendar( C_CAL_CMD_CHANGEVIEW, gLastViewResponsive );
                    gCalendar$.fullCalendar( C_CAL_CMD_OPTION, "aspectRatio", _calcAspectRatio( ) );
                    gLastViewResponsive = false;
                }
            }
        }

        // Issues an AJAX call to update the event on the server in case a user dragged or resized it
        function _changeEvent( pEvent, pDurationDelta, pRevertFunction ) {
            if ( pEvent.apexEventSource === "SQL" ) {
                server.plugin(
                    gOptions.ajaxIdentifier,
                    {
                        x01      : "CHANGE",
                        x02      : formatYYYYMMDDhhmmss( pEvent.start ),
                        x03      : ((pEvent.end !== null) ? formatYYYYMMDDhhmmss( subtractDayIfRequired( pEvent ) ) : null ),
                        x04      : pEvent.id,
                        x05      : pEvent.checksum,
                        pageItems: gOptions.pageItems
                    },
                    {
                        refreshObject: gRegion$,
                        success      : function ( data ) {
                            apex.event.trigger(
                                gRegion$,
                                C_DA_EVT_DRAGDROP_DONE,
                                data
                            );
                        },
                        error        : function ( pjqXHR, pTextStatus, pErrorThrown ) {
                            // Revert drag and drop or resize operation if an error occurred on the backend
                            apex.event.trigger(
                                gRegion$,
                                C_DA_EVT_DRAGDROP_ERR,
                                pErrorThrown
                            );
                            pRevertFunction();
                        }
                    }
                );
            } else {
                pRevertFunction();
            }
        }

        function _eventDrop( pEvent, pDurationDelta, pRevertFunction ) {
            if ( !apex.event.gCancelFlag ) {
                _changeEvent( pEvent, pDurationDelta, pRevertFunction );
            } else {
                pRevertFunction();
            }
        }

        function _eventDrag( pEvent ) {
            apex.event.trigger(
                gRegion$,
                C_DA_EVT_DRAGDROP_STRT,
                pEvent
            );
        }

        // Issues an AJAX call to update the event on the server in case a user changed the end date of an event
        function _eventResize( pEvent, pDurationDelta, pRevertFunction ) {
            _changeEvent( pEvent, pDurationDelta, pRevertFunction );
        }

        // Populates the FullCalendar with new events by issuing an AJAX request to the server
        function _getEvents( pStart, pEnd, pTimezone, pCallback ) {
            // make ajax call, to get events objects
            server.plugin( gOptions.ajaxIdentifier,
                           {
                               x01      : "GET", /* action */
                               x02      : formatYYYYMMDDhhmmss( pStart ),
                               x03      : formatYYYYMMDDhhmmss( pEnd ),
                               pageItems: gOptions.pageItems
                           }, {
                               refreshObject: gRegion$,
                               success      : function ( pData ) {
                                   var theData, changedData, i;
                                   theData = makeEndDateInclusive( pData );
                                   for ( i = 0; i < theData.length; i++ ) {
                                       theData[ i ].apexEventSource = "SQL";
                                   }
                                   if ( $.isFunction( gOptions.dataFilter ) ) {
                                       changedData = gOptions.dataFilter( theData );
                                       if ( changedData ) {
                                           theData = changedData;
                                       }
                                   }
                                   pCallback( theData );
                               }
                           } );
        }

        // Populates the Fullcalendar with new events from apex webservice if used
        function _getWebserviceEvents( pStart, pEnd, pTimezone, pCallback ) {
            if ( gOptions.apexWebLink ) {
                $.ajax( {
                            url     : gOptions.apexWebLink,
                            dataType: 'json',
                            jsonp   : false,
                            success : function ( data ) {
                                var theData, changedData;
                                theData = makeEndDateInclusive( adjustAllDayForJsonEvents (data.items ) );
                                if ( $.isFunction( gOptions.dataFilter ) ) {
                                    changedData = gOptions.dataFilter( theData );
                                    if ( changedData ) {
                                        theData = changedData;
                                    }
                                }
                                pCallback( theData );
                            }
                        } );
            } else {
                pCallback( {} );
            }
        }

        function viewEventHandler( e ) {
            var view = gCalendar$.fullCalendar( C_CAL_CMD_GET_VIEW );
            if ( keyBoardInfo.keyboardActive ) {
                switch ( view.name ) {
                    case C_MONTH:
                    case C_WEEK_VIEW:
                    case C_DAY_VIEW:
                        processKeyEvents( view, e );
                        break;
                }
            } else {
                if ( !view.name.indexOf( C_LIST ) === 0 && ( 
                    $( "." + C_CSS_FC_VIEW, gCalendar$ ).is( ":focus" ) || 
                    $( "." + C_CSS_FC_POPOVER, gCalendar$ ).is( ":focus" )  
                ) && (
                    e.which === 37 ||
                    e.which === 39 ||
                    e.which === 40 ||
                    e.which === 38 ||
                    e.which === 13 ||
                    e.which === 34 ||
                    e.which === 33 ||
                    e.which === 32)
                ) {
                    e.preventDefault();
                    initKeyboardMode( view );
                } 
                if ( apex.clipboard.isSupported && 
                     $( "." + C_CSS_FC_VIEW, gCalendar$ ).is( ":focus" ) && ( 
                        ( ( e.metaKey || e.ctrlKey ) && e.which === 67 ) || // 67=C (OSX uses meta Windows uses ctrl)
                        ( e.shiftKey && e.which === 121 ) 
                    ) 
                ) {
                    apex.clipboard.copy();
                    e.preventDefault();
                } 
            }
        }

        function _init() {
            // setup options to initialize FullCalendar object
            var currentDate = FC.moment(),   //the date we want calendar to start from
                changedCalOptions,
                calOptions;

            gRegion$   = $( "#" + pRegionId, apex.gPageContext$ );
            gCalendar$ = $( "#" + pRegionId + "_calendar", apex.gPageContext$ );

            // if there is no region container, add one on the fly. It's necessary for our refresh mechanism
            if ( gRegion$.length === 0 ) {
                gRegion$ = gCalendar$.wrap(
                    apex.util.htmlBuilder().markup( "<div" ).attr( "id", pRegionId ).markup( "></div>" ).toString()
                );
            }

            gLocale  = $.fullCalendar.defaults;
            gOptions = $.extend( {
                                     enableDragAndDrop: false,
                                     pageItems        : ""
                                 },
                                 pOptions );

            gOptions = $.extend( gOptions, gLocale );

            gOptions.timeFormat = {
                month : "",
                agenda: ""
            };

            // user will choose own settings 12 or 24

            if ( gOptions.timeFormatType === "24" ) {
                gOptions.slotLabelFormat = "H:mm";
                gOptions.timeFormat = "H:mm";
                gOptions.views      = {
                    month : {
                        timeFormat: "HH",
                        columnFormat: "dddd"
                    },
                    agenda: {
                        timeFormat: "H:mm",
                        columnFormat: "ll"
                    },
                    list: {
                        displayEventTime: true,
                        displayEventEnd: true,
                        listDayFormat: "dddd",
                        listDayAltFormat: "LL",
                        timeFormat: "H:mm",
                        eventTimeFormat: "H:mm"
                    }
                };
            } else if ( gOptions.timeFormatType === "12" ) {
                gOptions.slotLabelFormat = "h(:mm)a";
                gOptions.timeFormat = "h:mm a";
                gOptions.views      = {
                    month : {
                        timeFormat: "ha",
                        columnFormat: "dddd"
                    },
                    agenda: {
                        timeFormat: "h:mm a",
                        columnFormat: "ll"
                    },
                    list: {
                        displayEventTime: true,
                        displayEventEnd: true,
                        listDayFormat: "dddd",
                        listDayAltFormat: "LL",
                        eventTimeFormat: "h:mm a",
                        timeFormat: "h:mm a"
                    }
                };
            } else {
                gOptions.slotLabelFormat = "";
                gOptions.timeFormat = "";
                gOptions.views      = {
                    month : {
                        timeFormat: "",
                        columnFormat: ""
                    },
                    agenda: {
                        timeFormat: "",
                        columnFormat: ""
                    },
                    list: {
                        displayEventTime: true,
                        displayEventEnd: true,
                        timeFormat: "",
                        listDayFormat: "dddd",
                        listDayAltFormat: "LL",
                        eventTimeFormat: ""
                    }
                };
            }
            gOptions.listDayFormat = "dddd";
            gOptions.listDayAltFormat = "LL";

            // check if we need all-day slot
            gAllDay             = !!(gOptions.apexWebLink || gOptions.googleId);
            gOptions.allDayText = "all-day"; // english text; other langs will be translated.

            // make some updates from the defaults values

            //make sure if no drag&drop, it is totally disabled
            if ( gOptions.enableDragAndDrop ) {
                // adjust the resize depending on drag and drop and end column
                if ( gOptions.enableResizing ) {
                    gOptions.eventStartEditable    = true;
                    gOptions.eventDurationEditable = true;
                    gOptions.editable              = true;
                } else {
                    gOptions.editable              = true;
                    gOptions.eventStartEditable    = true;
                    gOptions.eventDurationEditable = false;
                }
            } else {
                gOptions.eventStartEditable    = false;
                gOptions.eventDurationEditable = false;
                gOptions.editable              = false;
            }

            gOptions.keyBoardSupport = true;

            // The session storage to keep track of the calendar view, date changes
            gCalStorage = apex.storage.getScopedSessionStorage( {
                                                                    prefix   : "ORA_WWV_apex.Calendar",
                                                                    useAppId : true,
                                                                    usePageId: true,
                                                                    regionId : pRegionId
                                                                } );

            //if the item already exists, make sure we know where the user was (view and date)
            gLastView = gCalStorage.getItem( C_LOCALSTORAGE_LASTVIEW );

            //if item lastview exists then try to parse it
            if ( gLastView ) {
                try {
                    gLastView = JSON.parse( gLastView );
                    // is this a good json object ? then check if it has the correct moment objects
                    if ( gLastView !== null ) {
                        if ( moment( gLastView.viewStartDate ).isValid() ) {
                            currentDate = gLastView.viewStartDate;
                        }
                    }
                } catch ( ex ) {
                    currentDate = FC.moment();     //make sure the start date is today
                    gLastView = null;         //make sure this is set to null
                }
            }

            // previous and next keys are different in RTL
            if ( gOptions.isRTL ) {
                keyBoardInfo.KEY_PREV = 39;
                keyBoardInfo.KEY_NEXT = 37;
            }

            // adjust abbrev. months array to locale
            if ( FC.moment( "2016-03-13" ).format( "e" ) === "0" ) { // en
                gDayNamesShort = apex.locale.getAbbrevDayNames().slice( 0 );
            } else {
                gDayNamesShort = apex.locale.getAbbrevDayNames().slice( 0, 6 );
                gDayNamesShort.unshift( apex.locale.getAbbrevDayNames().slice( 6 ) );
            }

            calOptions = {
                customButtons            : {
                                                apexListButton: {
                                                    text: ( ( FC.locales[ pLocale ] && FC.locales[ pLocale ].buttonText ) ? FC.locales[ pLocale ].buttonText[C_LIST] : C_LIST ),
                                                    click: function () { 
                                                                           if ( !gOptions.viewRange || gOptions.viewRange === C_MONTH ) {
                                                                               gCalendar$.fullCalendar( C_CAL_CMD_CHANGEVIEW, C_LISTMONTH );
                                                                           } else if ( gOptions.viewRange === C_WEEK_VIEW ) {
                                                                               gCalendar$.fullCalendar( C_CAL_CMD_CHANGEVIEW, C_LISTWEEK );
                                                                           } else if ( gOptions.viewRange === C_DAY_VIEW ) {
                                                                               gCalendar$.fullCalendar( C_CAL_CMD_CHANGEVIEW, C_LISTDAY );
                                                                           }
                                                                       } 
                                                }
                                           },
                theme                    : true,
                lang                     : pLocale,
                header                   : JSON.parse( gOptions.calendarHeader ),
                monthNames               : gOptions.monthNames,
                monthNamesShort          : apex.locale.getAbbrevMonthNames(),
                dayNames                 : gOptions.dayNames,
                dayNamesShort            : gDayNamesShort,
                buttonText               : gOptions.buttonText,
                timeFormat               : gOptions.timeFormat,
                views                    : gOptions.views,
                displayEventTime         : false,
                columnFormat             : gOptions.columnFormat,
                defaultView              : gOptions.defaultView,
                titleFormat              : gOptions.titleFormat,
                slotLabelFormat          : gOptions.slotLabelFormat,
                firstDay                 : gOptions.firstDayOfWeek,
                isRTL                    : gOptions.isRTL,
                editable                 : gOptions.editable,
                eventStartEditable       : gOptions.eventStartEditable,
                eventDurationEditable    : gOptions.eventDurationEditable,
                nextDayThreshold         : '00:00:00',
                weekends                 : gOptions.weekEnds,
                eventLimit               : ( parseInt( gOptions.eventLimit, 10 ) < 2 ? 2 : parseInt( gOptions.eventLimit, 10 ) ),
                defaultTimedEventDuration: '01:00:00',
                aspectRatio              : _calcAspectRatio(),
                scrollTime               : lPadTime( gOptions.startingHour ),
                minTime                  : gOptions.minTime || "00:00:00",
                maxTime                  : gOptions.maxTime || "23:59:59",
                allDaySlot               : gAllDay,
                allDayDefault            : gAllDay,
                googleCalendarApiKey     : gOptions.googleApiKey,
                defaultDate              : currentDate,
                eventSources             : [ {
                    events          : _getEvents,
                    editable        : gOptions.editable,
                    startEditable   : gOptions.eventStartEditable,
                    durationEditable: gOptions.eventDurationEditable
                }, {
                    googleCalendarId: gOptions.googleId,
                    className       : "fc-apex-events-gcal"
                }, {
                    events         : _getWebserviceEvents,
                    editable       : false,
                    className      : "fc-apex-events-webservice"
                } ],
                eventResize              : _eventResize,
                eventDrop                : _eventDrop,
                eventDragStart           : _eventDrag,
                eventClick               : _eventClick,
                windowResize             : _windowResize,
                select                   : _calSelect,
                slotEventOverlap         : false,
                defaultEventMinutes      : 60,
                selectable               : true,
                selectHelper             : true,
                fixedWeekCount           : false,
                eventRender              : _eventRender,
                viewRender               : function ( view, element ) {
                    // when there's no "last view", deactivate Keyboard Mode
                    if ( !gCalStorage || !gCalStorage.getItem( C_LOCALSTORAGE_LASTVIEW ) ||
                         JSON.parse( gCalStorage.getItem( C_LOCALSTORAGE_LASTVIEW ) ).viewType !== view.name ) {
                        leaveKeyboardMode();
                    }

                    if ( !gOptions.viewRange ) {
                        if ( gCalStorage && gCalStorage.getItem( C_LOCALSTORAGE_LASTVIEW ) ) {
                            gOptions.viewRange = JSON.parse( gCalStorage.getItem( C_LOCALSTORAGE_LASTVIEW ) ).viewType;
                        } else {
                            gOptions.viewRange = C_MONTH;
                        }
                    }

                    if ( view.name === C_LIST ) {
                        if ( !gOptions.viewRange || gOptions.viewRange === C_MONTH ) {
                            gCalendar$.fullCalendar( C_CAL_CMD_CHANGEVIEW, C_LISTMONTH );
                        } else if ( gOptions.viewRange === C_WEEK_VIEW ) {
                            gCalendar$.fullCalendar( C_CAL_CMD_CHANGEVIEW, C_LISTWEEK );
                        } else if ( gOptions.viewRange === C_DAY_VIEW ) {
                            gCalendar$.fullCalendar( C_CAL_CMD_CHANGEVIEW, C_LISTDAY );
                        }
                    }

                    if ( view.name.indexOf( C_LIST ) === 0 ) {
                        apex.jQuery( "." + C_CSS_FC_APXLISTBUTTON ).addClass( "fc-state-disabled" );
                        apex.jQuery( "." + C_CSS_FC_APXLISTBUTTON ).prop( "disabled", true );
                    } else {
                        apex.jQuery( "." + C_CSS_FC_APXLISTBUTTON ).removeClass( "fc-state-disabled" );
                        apex.jQuery( "." + C_CSS_FC_APXLISTBUTTON ).prop( "disabled", false );
                    }

                    try {
                        gCalendar$.fullCalendar( C_CAL_CMD_REMOVE_EV, keyBoardInfo.SELECTORID );
                    } catch ( ignore ) { }

                    gOptions.viewRange = view.name;

                    // when view changed by clicking a button, deactivate Keyboard Mode
                    if ( !keyBoardInfo.viewChangeByKey ) {
                        leaveKeyboardMode();
                    } else {
                        keyBoardInfo.viewChangeByKey = false;
                    }
                    // Responsive View change can only be towards "list" view
                    if ( !view.name.indexOf( C_LIST ) === 0 ) {
                        gLastViewResponsive = false;
                    }

                    // set new view in local storage
                    gCalStorage.setItem( C_LOCALSTORAGE_LASTVIEW, JSON.stringify( {
                                                                         viewType        : view.name,
                                                                         viewStartDate   : view.intervalStart,
                                                                         viewEndDate     : view.intervalEnd,
                                                                         viewIntervalUnit: view.intervalUnit
                                                                     } ) );

                    // fire event for dynamic action
                    apex.event.trigger(
                        gRegion$,
                        C_DA_EVT_VIEWCHANGE,
                        {
                            "viewType" : view.name,
                            "startDate": formatYYYYMMDDhhmmss( view.intervalStart ),
                            "endDate"  : formatYYYYMMDDhhmmss( view.intervalEnd.clone().subtract( 1, "second" ) )
                        }
                    );

                    // patch jQuery fullcalendar markup to be consumable by screenreaders 
                    //

                    if ( view.name === C_MONTH || view.name === C_WEEK_VIEW || view.name === C_DAY_VIEW ) {
                        $( "." + C_CSS_FC_VIEW + " > table", gCalendar$ ).attr( "role", "presentation" );
                        $( "." + C_CSS_FC_VIEW + " > table > tbody.fc-body table", gCalendar$ ).attr( "role", "presentation" );
                        $( "." + C_CSS_FC_VIEW + " > table > thead.fc-head table", gCalendar$ ).attr( "role", "presentation" );
                        $( "." + C_CSS_FC_VIEW + " > table > thead.fc-head table > thead > tr > th ", gCalendar$ ).attr( "scope", "col" );
                    }

                    if ( view.name === C_WEEK_VIEW || view.name === C_MONTH ) {
                        $( "." + C_CSS_FC_VIEW + " > table > thead.fc-head table", gCalendar$ ).each( function( i, o ) {
                            $( o ).attr( 
                                "summary", 
                                $( "thead th:not(.fc-axis)", $( o ) ).first().text() +  
                                    " - " + 
                                    $( "thead th:last-child()", $( o ) ).text() 
                            ); 
                        } );
                    }
                    if ( view.name === C_DAY_VIEW ) {
                        $( "." + C_CSS_FC_VIEW + " > table > thead.fc-head table", gCalendar$ ).each( function( i, o ) {
                            $( o ).attr( 
                                "summary", 
                                $( "thead th:not(.fc-axis)", $( o ) ).first().text()  
                            ); 
                        } );
                    }

                    if ( view.name === C_MONTH ) {
                        $( "." + C_CSS_FC_VIEW + " > table > tbody.fc-body table", gCalendar$ ).each( function ( i, o ) {
                            $( o ).attr( 
                                "summary", 
                                $( "thead td:nth-child(1)", $( o ) ).attr( C_CAL_ATTR_DATA_DATE ) + 
                                    " - " + 
                                    $( "thead td:last-child()", $( o ) ).attr( C_CAL_ATTR_DATA_DATE ) 
                            );
                        } );
                    }

                    if ( !gOptions.isMobile ) {
                        if ( gOptions.keyBoardSupport ) {
                            $( "." + C_CSS_FC_VIEW + ",." + C_CSS_FC_POPOVER, gCalendar$ ).off( "keydown", viewEventHandler );
                            $( "." + C_CSS_FC_VIEW + ",." + C_CSS_FC_POPOVER, gCalendar$ ).on( "keydown", viewEventHandler );
                        }
                    }
                },
                eventAfterAllRender      : function ( view ) {
                    $( ".fc-prev-button", gCalendar$ ).attr( "title", apex.lang.getMessage( "APEX.GV.PREV_PAGE" ) );
                    $( ".fc-prev-button", gCalendar$ ).attr( "aria-label", apex.lang.getMessage( "APEX.GV.PREV_PAGE" ) );
                    $( ".fc-next-button", gCalendar$ ).attr( "title", apex.lang.getMessage( "APEX.GV.NEXT_PAGE" ) );
                    $( ".fc-next-button", gCalendar$ ).attr( "aria-label", apex.lang.getMessage( "APEX.GV.NEXT_PAGE" ) );
                    $( "div." + C_CSS_FC_VIEW_CONT + " div." + C_CSS_FC_VIEW, gCalendar$ ).attr( "tabindex", "0" );
                    if ( !view.name.indexOf( C_LIST ) === 0 ) {
                        $( "div." + C_CSS_FC_VIEW_CONT + " div." + C_CSS_FC_VIEW + " ." + C_CSS_FC_EVENT, gCalendar$ ).attr( "tabindex", "-1" );
                    }
                    if ( gOptions.isRTL ) {
                        $( "button." + C_CSS_FC_APXLISTBUTTON, gCalendar$ ).css( "margin-right", C_STYLE_BUTTON_MARGIN );
                    } else {
                        $( "button." + C_CSS_FC_APXLISTBUTTON, gCalendar$ ).css( "margin-left", C_STYLE_BUTTON_MARGIN );
                    }

                    if ( view.name.indexOf( C_LIST ) === 0 ) {
                        $( "table.fc-list-table", gCalendar$ ).attr( "role", "presentation" );
                        $( "tr.fc-list-heading > td" ).attr( "role", "heading" );
                        $( "tr.fc-list-heading > td" ).attr( "aria-level", "3" );
                    }

                    if ( apex.clipboard.isSupported ) {
                        apex.clipboard.addHandler( 
                            $( "." + C_CSS_FC_VIEW, gCalendar$ ), 
                            function ( pDtWrapper ) { 
                                var lText = "",
                                    lEventList, i, lDateFormat;

                                lEventList  = gCalendar$.fullCalendar( C_CAL_CMD_CLIENT_EV );
                                lDateFormat = ( ( view.name === C_MONTH || view.name === C_LIST_MONTH ) ? "LL" : "LLL" );

                                lText = lText + apex.lang.getMessage( "APEX.CALENDAR.EVENT_START" )       + "\t" +
                                                apex.lang.getMessage( "APEX.CALENDAR.EVENT_END" )         + "\t" +
                                                apex.lang.getMessage( "APEX.CALENDAR.EVENT_TITLE" )       + "\t" +
                                                apex.lang.getMessage( "APEX.CALENDAR.EVENT_DESCRIPTION" ) + "\t" +
                                                apex.lang.getMessage( "APEX.CALENDAR.EVENT_ID" )          + "\r\n";

                                for ( i = 0; i < lEventList.length; i++ ) {
                                    if ( lEventList[ i ].start.isSameOrAfter( view.start ) && (
                                         !lEventList[ i ].end ||
                                         lEventList[ i ].end.isSameOrBefore( view.end ) ) ) {
                                
                                        lText = lText + lEventList[ i ].start.format( lDateFormat ) + "\t";
                                        if ( lEventList[ i ].end ) {
                                            lText = lText + lEventList[ i ].end.format( lDateFormat );
                                        } 

                                        lText = lText + "\t" + apex.util.stripHTML( lEventList[ i ].title ) + "\t";
                                        if ( lEventList[ i ].description ) {
                                            lText = lText + apex.util.stripHTML( lEventList[ i ].description );
                                        }
                                        if ( lEventList[ i ].id ) {
                                            lText = lText + "\t";
                                            if ( lEventList[ i ].id.indexOf( C_GENERATED_ID_PREFIX ) === 0 ) {
                                                lText = lText + lEventList[ i ].id.substr( C_GENERATED_ID_PREFIX.length );
                                            } else {
                                                lText = lText + apex.util.stripHTML( lEventList[ i ].id );
                                            }
                                        }
                                        lText = lText + "\r\n";
                                    }
                                }

                                pDtWrapper.setData( "text", lText ); 
                                return pDtWrapper; } );
                    }
                }
            };

            if ( calOptions.defaultView === C_WEEK ) { calOptions.defaultView = C_WEEK_VIEW; }
            if ( calOptions.defaultView === C_DAY ) { calOptions.defaultView = C_DAY_VIEW; }

            if ( $.isFunction( pPluginInitJavascript ) ) {
                changedCalOptions = pPluginInitJavascript( calOptions );
                if ( changedCalOptions ) {
                    if ( changedCalOptions.dataFilter && $.isFunction( changedCalOptions.dataFilter ) ) {
                        gOptions.dataFilter       = changedCalOptions.dataFilter;
                    }
                    if ( changedCalOptions.endDateExclusive ) {
                        gOptions.endDateExclusive = true;
                    }
                    if ( changedCalOptions.disableKeyboardSupport ) {
                        gOptions.keyBoardSupport  = false;
                    }
                    if ( changedCalOptions.listViewAlwaysShowMonth ) {
                        gOptions.listViewAlwaysShowMonth = changedCalOptions.listViewAlwaysShowMonth;
                    }
                    calOptions = changedCalOptions;
                }
            }

            if ( !gOptions.isMobile ) {
                gCalendar$.fullCalendar( calOptions );
            } else {
                server.plugin( gOptions.ajaxIdentifier, {
                    x01      : gOptions.defaultView, /* action */
                    x02      : gOptions.startDate, /* start date */
                    x03      : gOptions.endDate, /* end date */
                    x09      : gOptions.curDate, /* current date or Today's date */
                    pageItems: gOptions.pageItems
                }, {
                   dataType     : "html",
                   refreshObject: gRegion$,
                   success      : function ( pData ) {
                       apex.jQuery( gRegion$, apex.gPageContext$ ).html( pData ).trigger( "create" );
                   }
               } );

            }

            if ( !gOptions.isMobile ) {
                if ( gOptions.keyBoardSupport ) {
                    $( "." + C_CSS_FC_VIEW + ",." + C_CSS_FC_POPOVER, gCalendar$ ).off( "keydown", viewEventHandler );
                    $( "." + C_CSS_FC_VIEW + ",." + C_CSS_FC_POPOVER, gCalendar$ ).on( "keydown", viewEventHandler );
                }
            }

            widget.util.onVisibilityChange( gRegion$[0], function( show ) {
                if ( show ) {
                    gCalendar$.fullCalendar( C_CAL_CMD_RENDER );
                    gCalendar$.fullCalendar( C_CAL_CMD_RERENDER_EV );
                }
            } );

            gRegion$.on( "apexrefresh", function () {
                _refresh();
            } );

            gCalendar$.on( "apexafterclosedialog", function () {
                // refresh your calendar region, do you have a refresh method, if so...
                _refresh();
            } );

            // -----------------------------------------------------------------
            // Register the Calendar with the region interface (feature #1794)
            //
            if ( !gOptions.isMobile ) {
                apex.region.create( pRegionId, {
                    type: "CssCalendar",
                    refresh: function() {
                        _refresh();
                    },
                    focus: function() {
                        gCalendar$.find("div." + C_CSS_FC_VIEW).focus();
                    },
                    widget: function() {
                        return gCalendar$;
                    }
                });
            } else {
                apex.region.create( pRegionId, {
                    type: "CssCalendar",
                    refresh: function() {
                        _refresh();
                    },
                    focus: function() {
                        gRegion$.focus();
                    }
                });
            }

            // make sure the user goes back to his previous view
            if ( gLastView !== null ) {
                if ( moment( gLastView.viewStartDate ).isValid() ) {
                    if ( gLastView.viewType === C_MONTH ||
                         ( gLastView.viewType === C_WEEK_VIEW && gOptions.showTime ) ||
                         ( gLastView.viewType === C_DAY_VIEW && gOptions.showTime ) ||
                         gLastView.viewType.indexOf( C_LIST ) === 0
                    ) {
                        gCalendar$.fullCalendar( C_CAL_CMD_CHANGEVIEW, gLastView.viewType );
                    }
                }
            }
        }

        _init();


        // *****************************************************************************
        // E X P O S E D   F U N C T I O N S
        // *****************************************************************************

        widget.cssCalendar.download = function ( pFormat ) {

            var lView, lUrl, lWindows;

            lView = gCalendar$.fullCalendar( C_CAL_CMD_GET_VIEW );
            lUrl  = server.pluginUrl( 
                gOptions.ajaxIdentifier, 
                {
                    x01      : "DOWNLOAD",
                    x02      : formatYYYYMMDDhhmmss( lView.start ),
                    x03      : formatYYYYMMDDhhmmss( lView.end ),
                    x06      : lView.name,
                    x07      : lView.title,
                    x10      : pFormat,
                    pageItems: gOptions.pageItems 
                } 
            );

            lWindows = window.open( lUrl );
            lWindows.focus();
        };

        /* function to show the day specific calendar event on Tap */
        widget.cssCalendar.mobileDayTap = function ( pRegionId, pThis ) {
            var lDate     = apex.jQuery( pThis ).data( "date" ),
                lDetails$ = apex.jQuery( "#calendar_day_details_" + pRegionId, apex.gPageContext$ );

            apex.jQuery( ".m-Calendar-day" ).removeClass( "is-active" );
            apex.jQuery( pThis ).addClass( "is-active" );
            apex.widget.cssCalendar.getDayData( pRegionId, lDate, {
                clear  : function () {
                    lDetails$.empty();
                },
                success: function ( pData ) {
                    lDetails$.html( pData );
                    apex.event.trigger(
                        gRegion$,
                        C_DA_EVT_DATESELECT,
                        { 
                            "newStartDate": lDate,
                            "newEndDate": lDate
                        }
                    );
                }
            } );
        };

        /* function to load the current date's data after the calendar loads */
        widget.cssCalendar.mobileMonthLoad = function ( pRegionId, pDate ) {
            var lDetails$    = apex.jQuery( "#calendar_day_details_" + pRegionId, apex.gPageContext$ );
            gOptions.curDate = pDate;
            apex.widget.cssCalendar.getDayData( pRegionId, pDate, {
                clear  : function () { lDetails$.empty();},
                success: function ( pData ) {lDetails$.html( pData );}
            } );
        };

        widget.cssCalendar.executeMobileCreateLink = function ( pRegionId, pStart, pEnd ) {
            if ( gOptions.createLink && gOptions.createLink !== "" ) {
                // For the CREATE LINK we add the selected START and END dates in JS code
                // if page checksum is enabled we need the server to recalculate the URL checksum
                server.plugin( gOptions.ajaxIdentifier, {
                    x01: "PREPARE_URL", /* action */
                    x02: pStart,
                    x03: pEnd,
                    x06: gOptions.createLink
                }, {
                    success: function ( pData ) {
                        if ( pData.url ) {
                            window.location.href = pData.url;
                        }
                    }
                } );
            } else {
                if ( pRegionId ) {
                    // when no edit link is defined, fire event
                    apex.event.trigger(
                        $( "#" + pRegionId ),
                        C_DA_EVT_DATESELECT,
                        { "newStartDate": pStart, "newEndDate": pEnd }
                    );
                }
            }
        };


        /* function to get the data of the date which is tapped or clicked */
        widget.cssCalendar.getDayData = function ( pRegionId, pDate ) {
            gOptions.curDate = pDate;
            server.plugin( gOptions.ajaxIdentifier,
                           {
                               x01      : "GETDATA", /* action */
                               x09      : pDate,
                               x10      : pRegionId,
                               pageItems: gOptions.pageItems
                           }, {
                               dataType     : "html",
                               refreshObject: gRegion$,
                               success      : function ( pData ) {
                                   apex.jQuery( '#calendar_day_details_' + pRegionId, apex.gPageContext$ ).html( pData ).trigger( "create" );
                               }
                           } );

        }; //getDayData

        widget.cssCalendar.refreshMobileCalendar = function () {
            server.plugin( gOptions.ajaxIdentifier, {
                x01      : gOptions.mobileCurType,
                x02      : gOptions.mobileCurStartDate,
                x03      : gOptions.mobileCurEndDate,
                x09      : gOptions.mobileCurStartDate,
                pageItems: gOptions.pageItems
            }, {
                dataType     : "html",
                refreshObject: gRegion$,
                success      : function ( pData ) {
                    apex.jQuery( gRegion$, apex.gPageContext$ ).html( pData ).trigger( "create" );
                }
            } );
        };

        /* main function to display the mobile calendar */
        widget.cssCalendar.getMobileCalendar = function ( pTypeAction, pStart, pEnd, pCurrent, pCallback ) {
            gOptions.startDate = pStart;
            gOptions.endDate   = pEnd;
            gOptions.curDate   = pCurrent;

            server.plugin( gOptions.ajaxIdentifier, {
                x01      : pTypeAction,
                x02      : gOptions.startDate,
                x03      : gOptions.endDate,
                x09      : gOptions.curDate,
                pageItems: gOptions.pageItems
            }, {
                dataType     : "html",
                refreshObject: gRegion$,
                success      : function ( pData ) {
                    apex.jQuery( gRegion$, apex.gPageContext$ ).html( pData ).trigger( "create" );
                }
            } );
        };

        widget.cssCalendar.fireViewChangeEvent = function ( pRegionId, pType, pStart, pEnd ) {
            gOptions.mobileCurStartDate = pStart;
            gOptions.mobileCurEndDate   = pEnd;
            gOptions.mobileCurType      = pType;

            apex.event.trigger(
                $( "#" + pRegionId ),
                C_DA_EVT_VIEWCHANGE,
                {
                    "viewType" : pType,
                    "startDate": pStart ,
                    "endDate"  : pEnd
                }
            );
        };

        widget.cssCalendar.arrangeObjects = function ( pContainer, pCount ) {
            var lWidth, lParentwidth, i;
            setHeight();
            setWidth();
            for ( i = 1; i <= pCount; i++ ) {
                lParentwidth = pWidth( pContainer + 'div[id=day' + i + ']' );
                lWidth       = Math.round( (lParentwidth - Math.round( lParentwidth / 20 )) / tDivs( pContainer, C_DAY + i ) );
                positionObjects( pContainer, C_DAY + i, lPos( pContainer, C_DAY + i ), lWidth );
            }
        };

        widget.cssCalendar.orientationchange = function ( pCaltype, pEvent ) {
            if ( pEvent.orientation === 'landscape' ) {
                if ( apex.jQuery( window ).width() <= 480 ) { //devices with width similar to iPhone
                    if ( pCaltype === 'WEK' ) {
                        apex.widget.cssCalendar.getMobileCalendar( 'WKS_SAME', gOptions.startDate, gOptions.endDate, gOptions.curDate, '' );
                    }
                }
            } else {
                if ( apex.jQuery( window ).width() <= 480 && ( pCaltype === 'WEK' || pCaltype === 'WKS') ) {
                    apex.widget.cssCalendar.getMobileCalendar( 'LST_SAME', gOptions.startDate, gOptions.endDate, gOptions.curDate, '' );
                }
            }
        };

    }; // cssCalendar

})( apex.widget, apex.util, apex.server, apex.jQuery );
