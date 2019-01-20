/*!
 Copyright (c) 2012, 2017, Oracle and/or its affiliates. All rights reserved.
*/
/*
 * The {@link apex.widget}.datepicker is used for the Date Picker widget of Oracle Application Express.
 **/
/*global apex, $s*/
(function( widget, util, $ ) {

    /**
     * Allows to pick date from the selector for any date-based items. Internally uses the jQuery datepicker plug-in.
     * See the plug-in documentation for available options.
     *
     * @param {String} pSelector jQuery selector to identify APEX page item(s) for this widget.
     * @param {Object} [pOptions]
     * @param {String} pFormat
     * @param {String} pLocale
     *
     * @function datepicker
     * @memberOf apex.widget
     **/
    widget.datepicker = function(pSelector, pOptions, pFormat, pLocale) {
        // initialize the Date Picker plug-in

        var lOptions,
            lOnSelectCallBack = null,
            lLocale = $.datepicker.regional[pLocale];

        var DISABLED = "apex_disabled",
            DATA_INITIAL_VALUE = "apexInitialValue";

        /*xxx why is this needed?
         if (!pOptions.showTime || (pOptions.showTime && pOptions.showOn === 'inline')) { //sathikum added for inline with time
         lOnSelectCallBack = function(dateText, inst) {
         if (inst.inline) {
         var altField = inst.settings.altField;
         if (altField) {
         // can't use $s because the altField from the perspective of the datepicker *is* the page item
         $(altField ).val( dateText );
         }
         } else {
         $s(inst.id, dateText);
         }
         };
         }
         xxx*/

        lOptions = $.extend( {}, lLocale, {
            dateFormat: pFormat,
            duration: '',
            constrainInput: false,
            onSelect: lOnSelectCallBack,
            locale: pLocale
        }, pOptions );

        // Note this affects all date pickers
        // popups need to be focusable to work well in the grid view
        $( ".ui-datepicker" ).prop( "tabindex", -1 );

        // Register apex.item callbacks
        $( pSelector, apex.gPageContext$ ).each( function() {
            var lDatePicker$, lInitialValue,
                lId = util.escapeCSS( this.id ),
                lIdSelector = "#" + lId,
                lItem$ = $( lIdSelector, apex.gPageContext$ ),
                lDatePickerSel = lIdSelector;

            if ( lOptions.showOn === 'inline' ) {
                lDatePickerSel += "_INLINE";
            }
            if ( lItem$.css( "direction" ) === "rtl" ) {
                lOptions.isRTL = true;
            }
            lDatePicker$ = $( lDatePickerSel ).datepicker( lOptions );
            // datepicker widget puts the button on the wrong side
            if ( lItem$.css( "direction" ) === "rtl" ) {
                lItem$.parent().find( ".ui-datepicker-trigger" ).insertAfter( lItem$ );
            }
            lInitialValue =  $( lIdSelector ).val();
            if ( lOptions.showOn === 'inline' && lOptions.altField ) {
                lDatePicker$.datepicker( "setDate", lInitialValue );
            }
            // close if escape while focus is in the popup
            if ( lOptions.showOn !== 'inline' ) {
                lDatePicker$.data( "datepicker" ).dpDiv.on( "keydown", function(event) {
                    var key = event.which;
                    if ( key === 27 ) { // escape
                        lDatePicker$.datepicker( "hide" );
                    }
                } );
            }
            $( lDatePicker$ ).data( DATA_INITIAL_VALUE, lInitialValue );
            widget.initPageItem( lId, {
                // the default getValue always works because date picker always updates the associated input or altField
                // but it doesn't watch the altField for changes so for inline date pickers must explicitly update the widget
                setValue: function( pValue ) {
                    $( this.node, apex.gPageContext$ ).val( pValue );
                    if ( lOptions.showOn === 'inline' && lOptions.altField ) {
                        lDatePicker$.datepicker( "setDate", pValue );
                    }
                },
                isChanged: function( ) {
                    // hidden inputs never appear as changed and inline pickers use a hidden so track changes using a jQuery data attribute
                    return $( lIdSelector ).val() !== lDatePicker$.data( DATA_INITIAL_VALUE );
                },
                enable: function() {
                    lDatePicker$.datepicker( 'enable' )    // call native jQuery UI enable
                        .removeClass( DISABLED );          // remove disabled class
                },
                disable: function() {
                    lDatePicker$.datepicker( 'disable' )  // call native jQuery UI disable
                        .addClass( DISABLED);             // add disabled class to ensure value is not POSTed
                },
                isDisabled: function() {
                    return lDatePicker$.datepicker( 'isDisabled' );
                },
                show: function() {
                    lItem$.parent().children().show();
                },
                hide      : function() {
                    lItem$.parent().children().hide();
                },
                getPopupSelector: function() {
                    return ".ui-datepicker";
                },
                loadingIndicator: function( pLoadingIndicator$ ) {
                    return pLoadingIndicator$.appendTo( lItem$.parent() );
                }
            });
        });

    }; // datepicker

})( apex.widget, apex.util, apex.jQuery );
