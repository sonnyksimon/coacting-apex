/*!
 Copyright (c) 2013, 2018, Oracle and/or its affiliates. All rights reserved.
*/
/**
 * The {@link apex.widget}.ckeditor4 is used for the Rich Text Editor widget of Oracle Application Express.
 * Internally the CKEditor http://www.ckeditor.com is used.
 * See the CKEditor documentation for available options.
 **/
/*global apex,CKEDITOR,alert*/
(function( widget, $ ) {
"use strict";
/**
 * @param {String} pSelector  jQuery selector to identify APEX page item(s) for this widget.
 * @param {Object} [pOptions]
 *
 * @function ckeditor4
 * @memberOf apex.widget
 * */
widget.ckeditor4 = function( pSelector, pOptions, pPluginInitJavascript ) {

    // Based on our custom settings, add addition properties to the rich text editor options
    var lOptions  = apex.jQuery.extend( {
                        toolbar:                   "Basic",
                        toolbarStartupExpanded:    true,
                        disableNativeSpellChecker: false,
                        "menu_groups":             "clipboard,tablecell,tablecellproperties,tablerow,tablecolumn,table,anchor,link,image,flash"
                    }, pOptions ),
        lResizeFunction,
        lEditorPadding,
        lMinWidth              = 0,
        //
        C_SKIN_KAMA            = "kama",
        C_SKIN_MOONO           = "moono",
        C_SKIN_MOONOCOLOR      = "moonocolor",
        C_TOOLBAR_BASIC        = "Basic",
        C_TOOLBAR_INTERMEDIATE = "Intermediate",
        C_TOOLBAR_FULL         = "Full",
        //
        C_KEYCODE_F1           = 112;

    if ( lOptions.toolbar === C_TOOLBAR_BASIC ) {
        if ( lOptions.skin === C_SKIN_KAMA ) {
            lMinWidth = ( lOptions.toolbarStartupExpanded ? 185 : 305 );
        } else if ( lOptions.skin === C_SKIN_MOONO || lOptions.skin === C_SKIN_MOONOCOLOR ) {
            lMinWidth = ( lOptions.toolbarStartupExpanded ? 181 : 305 );
        } 
    } else if ( lOptions.toolbar === C_TOOLBAR_INTERMEDIATE ) {
        if ( lOptions.skin === C_SKIN_KAMA ) {
            lMinWidth = ( lOptions.toolbarStartupExpanded ? 240 : 515 );
        } else if ( lOptions.skin === C_SKIN_MOONO || lOptions.skin === C_SKIN_MOONOCOLOR ) {
            lMinWidth = ( lOptions.toolbarStartupExpanded ? 235 : 525 );
        } 
    } else if ( lOptions.toolbar === C_TOOLBAR_FULL ) {
        if (lOptions.skin === C_SKIN_KAMA) {
            lMinWidth = ( lOptions.toolbarStartupExpanded ? 530 : 615 );
        } else if ( lOptions.skin === C_SKIN_MOONO || lOptions.skin === C_SKIN_MOONOCOLOR ) {
            lMinWidth = ( lOptions.toolbarStartupExpanded ? 590 : 625 );
        } 
    }

    // Get editor padding
    lEditorPadding = ( lOptions.skin === C_SKIN_KAMA ? 25 : 20 );

    // We don't want to show all toolbar entries of basic and full
    if ( lOptions.toolbar === C_TOOLBAR_BASIC ) {
        lOptions.toolbar = [
            ['Bold', 'Italic', '-', 'RemoveFormat', '-', 'NumberedList', 'BulletedList', '-', 'Link', 'Unlink' , '-', 'Undo', 'Redo']
        ];
    } else if ( lOptions.toolbar === C_TOOLBAR_INTERMEDIATE ) {
        lOptions.toolbar = [
            ['Cut','Copy','Paste','-',
             'Bold', 'Italic','Underline', '-', 
             'RemoveFormat', '-', 
             'NumberedList', 'BulletedList','-',
             'Outdent','Indent', '-', 
             'Link', 'Unlink','Anchor' , '-', 
             'Undo', 'Redo'],
            '/',
            ['Format','Font','FontSize','TextColor','-',
             'JustifyLeft','JustifyCenter','JustifyRight']
        ];
    } else if ( lOptions.toolbar === C_TOOLBAR_FULL ) {
        lOptions.toolbar = [
            ['Cut','Copy','Paste','PasteText','PasteFromWord','-','Print','Preview' , '-', 'Undo', 'Redo'],
            ['Templates'],
            ['Link','Unlink','Anchor'],
            ['Image','Table','HorizontalRule','Smiley','SpecialChar','PageBreak'],
            '/',
            ['Bold','Italic','Underline','Strike','-','Subscript','Superscript','-', 'RemoveFormat'],
            ['NumberedList','BulletedList','-','Outdent','Indent','Blockquote'],
            ['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],
            ['TextColor','BGColor'],
            ['ShowBlocks'],
            '/',
            ['Styles','Format','Font','FontSize'],
            [/*'Maximize',*/ 'Source']
        ];
    }

    // No user will hide the toolbar if it's already displayed at startup
    lOptions.toolbarCanCollapse = !lOptions.toolbarStartupExpanded;

    //option to include resize in both directions.
    lOptions.resize_dir         = 'both';

    //option to remove HTML tag hirearchy
    lOptions.removePlugins      = 'elementspath,image';
    lOptions.extraPlugins       = 'image2';

    // Instantiate the CKeditor
    apex.jQuery( pSelector, apex.gPageContext$ ).each ( function() {
        var lFinalOptions = lOptions, 
            lChangedOptions, 
            lCurrentSnapshot,
            self = this;

        // calculate the editor size depending on the textarea settings
        lFinalOptions.height = ( this.rows * 15 ) + lEditorPadding;
        lFinalOptions.width  = ( this.cols * 9.5 < lMinWidth ) ? lMinWidth : this.cols * 9.5;

        lFinalOptions.resize_minHeight = lFinalOptions.height;
        lFinalOptions.resize_minWidth  = lFinalOptions.width;

        lFinalOptions.title            = apex.lang.formatMessage( "APEX.RICH_TEXT_EDITOR.ACCESSIBLE_LABEL", lOptions.label || "" );

        apex.jQuery( this ).wrap( "<div id='" + this.id + "_DISPLAY'></div>" );

        if ( apex.jQuery.isFunction( pPluginInitJavascript ) ) {
           lChangedOptions = pPluginInitJavascript( lFinalOptions );
           if ( lChangedOptions ) {
               lFinalOptions = lChangedOptions;
           }
        }

        CKEDITOR.replace( this.id, lFinalOptions );
        // For item help accessibility. See code in theme.js
        // Because ckeditor uses an iframe keyboard events don't pass up to this document
        // so handle the ckeditor key event and pass it on as a fake keydown event

        CKEDITOR.instances[ this.id ].on( "key", function ( event ) {
            if ( event.data.keyCode === CKEDITOR.ALT + C_KEYCODE_F1 ) { // Alt + F1
                // fake a keydown event so that item help keyboard accessibility will work
                apex.jQuery( "#" + self.id ).trigger( apex.jQuery.Event( "keydown", {
                    altKey:   true,
                    ctrlKey:  false,
                    shiftKey: false,
                    metaKey:  false,
                    isChar:   false,
                    which:    C_KEYCODE_F1,
                    keyCode:  C_KEYCODE_F1
                } ) );
            }
        } );

        // Use blur event handler to simulate change behaviour, so that DA's and JS code triggers on change successfully.
        // Note: There is native support for change with CKEditor (since 4.2), however this triggers too frequently for our
        // usage, on every change without the user leaving the editor. We want the change behaviour to be more similar to
        // standard change behaviour on a textarea, where it triggers when the user leaves the field, if the value has changed.
        CKEDITOR.instances[ this.id ].on( "focus", function () {
            lCurrentSnapshot = CKEDITOR.instances[self.id].getSnapshot(); } );

        CKEDITOR.instances[ this.id ].on( "blur", function () {
            if ( CKEDITOR.instances[ self.id ].getSnapshot() !== lCurrentSnapshot ) {
                apex.jQuery( "#" + self.id ).trigger( "change" ); } } );

        // Register apex.item callbacks
        widget.initPageItem(this.id, {
            enable      : function() {
                alert( 'Enable not supported.' );
            },
            disable     : function() {
                alert( 'Disable not supported.' );
            },
            setValue    : function(pValue) {
                var oEditor = CKEDITOR.instances[ self.id ];
                oEditor.setData( pValue );
            },
            getValue    : function() {
                var oEditor = CKEDITOR.instances[ self.id ];
                return oEditor.getData();
            },
            setFocusTo  : function() {
                var oEditor = CKEDITOR.instances[ self.id ];
                oEditor.focus();
                // return fake object with focus method to keep caller happy
                return { focus:function() {} };
            },
            isChanged   : function() {
                var oEditor = CKEDITOR.instances[ self.id ];
                return oEditor.checkDirty();
            }
        });

        if ( apex.jQuery( "#" + self.id + "_DISPLAY") && pOptions.fullWidth ) {
            lResizeFunction = function() {
                var lWidth  = apex.jQuery( "#" + self.id + "_DISPLAY" ).parent().width(),
                    lHeight;

                if ( CKEDITOR.instances[ self.id ].ui.space( 'contents' ) ) {
                    lHeight = CKEDITOR.instances[ self.id ].ui.space( 'contents' ).getStyle( 'height' );
                    CKEDITOR.instances[ self.id ].resize( lWidth, lHeight ); 
                } 
            };

            widget.util.onElementResize( 
                apex.jQuery( "#" + self.id ).parent(), 
                lResizeFunction );

            CKEDITOR.instances[self.id].on( "instanceReady", lResizeFunction );

            // for responsive editors, only allow vertical resizing
            CKEDITOR.instances[self.id].config.resize_dir = 'vertical';
                  
        }
    });

    // register focus handling, so when the non-displayed textarea of the CKEditor
    // receives focus, focus is moved to the editor.
    apex.jQuery( pSelector, apex.gPageContext$ ).focus( function() {
        var oEditor = CKEDITOR.instances[ this.id ];
        oEditor.focus();
    });

}; // ckeditor4
})( apex.widget, apex.jQuery );
