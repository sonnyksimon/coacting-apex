/*!
 Copyright (c) 2012, 2017, Oracle and/or its affiliates. All rights reserved.
*/
/*
 * The {@link apex.widget}.colorpicker allows to use a color picker dialog to pick a color.
 * Internally uses the jQuery colorpicker plug-in http://www.eyecon.ro/colorpicker/
 **/
/*global apex, $s*/
(function( widget, $ ) {

/**
 * @param {String} pSelector  jQuery selector to identify APEX page item(s) for this widget.
 * @param {Object} [pOptions]
 *
 * @function colorpicker
 * @memberOf apex.widget
 * */
widget.colorpicker = function(pSelector, pOptions) {
  var lPreviewSelector, lCircleSize, lPreviewHtml, lInputWidth, lInputElem;
  
  $(pSelector, apex.gPageContext$).each(function() {
    lInputElem = this;     

    if ( pOptions && pOptions.preview ) {
      if ( pOptions.preview.type === "modern" ) {
        // circle size should be equivalent to input field font size    
        lCircleSize = $(this).css( "font-size" );
        lInputWidth = $(this).innerWidth();  

        
        lPreviewHtml = $( "<span id='" + $( this ).attr( "id" )+ "_color_preview'></span>" );
        lPreviewHtml.css( { "height": lCircleSize, "width": lCircleSize } );

        lPreviewMargin = Math.round( ( $(this).outerHeight(true) - lPreviewHtml.outerHeight(true) ) / 2);

        lPreviewHtml.css( { "border-radius":  "100%", 
                            "display":        "block",
                            "position":       "absolute",
                            "margin":         lPreviewMargin + "px",
                            "pointer-events": "none",
                            "box-shadow":     "0 0 0 1px rgba(0, 0, 0, 0.1) inset" } );

        $(this).before( lPreviewHtml );

        if ( $(this).css( "direction" ) === "rtl" ) {
            $(this).css( { "padding-right": lPreviewHtml.outerWidth( true ) + "px" } );
        } else {  
            $(this).css( { "padding-left": lPreviewHtml.outerWidth( true ) + "px" } );
        }
        if ( !( $(this).parent().hasClass( "a-GV-columnItem" ) ) ) {  
          $(this).css( { "width": ( lInputWidth + 2 ) + "px" } );
        }

        lPreviewSelector = "#" + $(this).attr("id") + "_color_preview";
        if ( pOptions.preview && pOptions.preview.defaultValue ) {
            $( lPreviewSelector ).css( "background-color", pOptions.preview.defaultValue );
        }
      } else if ( pOptions.preview.type === "classic" ){
        lPreviewSelector = "#" + this.id + "_PREVIEW";
      } else {
        lPreviewSelector = "";
      }
    } 

    var lColorPicker = $(this).ColorPicker({
                         eventName:    "xxx", // don't fire on the default click event, we have our own icon
                         onSubmit:     function(pHsb, pHex, pRgb, pElement) {
                                         $s(pElement, '#'+pHex.toUpperCase());
                                         $(pElement).ColorPickerHide();
                                       },
                         onBeforeShow: function() {
                                         $(this).ColorPickerSetColor(this.value);
                                       },
                         onShow:       function(pElement) {
                                         $(pElement).fadeIn("fast");
                                         return false;
                                       },
                         onHide:       function(pElement) {
                                         $(pElement).fadeOut("fast");
                                         return false;
                                       }
                         }),
        lColorPickerFieldset = $('#'+this.id+'_fieldset', apex.gPageContext$);

    // popups need to be focusable to work well in the grid view
    $( ".colorpicker" ).prop( "tabindex", -1 )
        // this should be a button but it isn't so make it work like a button
        .find( ".colorpicker_submit" ).keydown(function( event ) {
            if ( event.which === 13 || event.which === 32 ) {
                $( this ).trigger( "click" );
                event.preventDefault();
            }
        } ).prop( "tabindex", 0 );

    lColorPicker
      .on('keyup',  function(){lColorPicker.ColorPickerSetColor(this.value);})
      .on('blur',   function(){lColorPicker.ColorPickerHide();})
      .on('focus',  function(){
                        if ( lPreviewSelector && $( lPreviewSelector ).length > 0 ) {
                          $( lPreviewSelector, apex.gPageContext$ ).css( "background-color", this.value );
                        }
                      })
      .on('change', function(){
                        this.value = this.value.toUpperCase();
                        if ( lPreviewSelector && $( lPreviewSelector ).length > 0 ) {
                          $( lPreviewSelector, apex.gPageContext$ ).css( "background-color", this.value );
                        }
                      });

    // todo this should be a button
    // clicking on our color picker icon should open the dialog
    $('#'+this.id+'_PICKER', apex.gPageContext$).click(function(pEvent){
      lColorPicker.ColorPickerShow();
      pEvent.preventDefault(); // otherwise the browser would jump to the top of the document because of the #
    });

    // show the current entered color in our preview icon
    $("#"+this.id+'_PREVIEW', apex.gPageContext$).css("background", this.value);

    // register item callbacks
    widget.initPageItem(this.id, {
      enable    : function() {
        if (lColorPicker.prop('disabled') === true) {
          lColorPicker
            .prop('disabled', false)
            .removeClass('apex_disabled');
          // enable color picker icons
          // bind click event handler to popup icon
          $('#'+this.id+'_PICKER', apex.gPageContext$).click(function(pEvent){
            lColorPicker.ColorPickerShow();
            pEvent.preventDefault(); // otherwise the browser would jump to the top of the document because of the #
          });
          // do other enabling on icons
          widget.util.enableIcon(lColorPickerFieldset, '#');
        }
      },
      disable   : function() {
        if (lColorPicker.prop('disabled') === false) {
          lColorPicker
            .prop('disabled', true)
            .addClass('apex_disabled');
          // disable color picker icons
          widget.util.disableIcon(lColorPickerFieldset);
        }
      },
      show      : function() {
        lColorPickerFieldset.show();
      },
      hide      : function() {
        lColorPickerFieldset.hide();
      },
      getPopupSelector: function() {
        return ".colorpicker";
      }
    });
  });
}; // colorpicker

})( apex.widget, apex.jQuery );
