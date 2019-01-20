/*global apex,$v*/
/*!
 lang.js
 Copyright (c) 2015, 2018, Oracle and/or its affiliates. All rights reserved.
 */
/*
 * Depends on:
 * $v which needs item.js etc.
 * locale.js
 * server.js just for the setting jQuery.ajaxSettings.traditional = true;
*/

/**
 * <p>This namespace is used for text and message localization related functions of Oracle Application Express.
 * @namespace
 */
apex.lang = ( function( util, debug, $ ) {
    "use strict";

    // unsafe means that the arguments need to be escaped
    // set unsafe to false when the arguments are already escaped or the
    // resulting string will be escaped
    function formatMessage( pUnsafe, pPattern ) {
        var re = /%([0-9,%])/g,
            args, errorCase;
        if ( $.isArray( arguments[ 2 ])) {
            args = arguments[ 2 ];
        } else {
            args = Array.prototype.slice.call( arguments, 2 );
        }
        var count = 0;
        var result = pPattern.replace( re, function( m, p1 ) {
            var n, v;

            if ( p1 === "%" ) {
                return "%";
            }
            n = parseInt( p1, 10 );
            count++;
            if ( n >= args.length ) {
                v = "?";
            } else {
                v = args[n];
            }
            return pUnsafe ? util.escapeHTML( v + "" ) : v;
        });
        if ( count < args.length ) {
            errorCase = "many";
        } else if ( count > args.length ) {
            errorCase = "few";
        }
        if ( errorCase ) {
            debug.error( "Format('" + pPattern + "'): too " + errorCase + " arguments. Expecting " + count + ", got " + args.length );
        }
        return result;
    }

    /*
     * Localized text and message formatting support
     */
    var gMessages = {}; // mapping from message key to localized text

    /**
     * @lends apex.lang
     */
    var lang = {

    /**
     * <p>Add messages for use by {@link apex.lang.getMessage} and the format functions. Can be called multiple times.
     * Additional messages are merged. It is generally not necessary to call this function, because it is
     * automatically called with all the application text messages that have Used in JavaScript set to Yes.</p>
     *
     * @param {Object} pMessages An object whose properties are message keys, and the values are localized message text.
     * @example <caption>This example adds a message with key "APPLY_BUTTON_LABEL" and message text "Apply".</caption>
     * apex.lang.addMessages( {
     *     APPLY_BUTTON_LABEL: "Apply"
     * } );
     */
    addMessages: function( pMessages ) {
        $.extend( gMessages, pMessages );
    },

    /**
     * <p>Load additional messages from the server.</p>
     *
     * @ignore
     * @param {string[]} pMessageKeys an array of message keys to load.
     * @return {Promise} promise resolved (with no data) when messages are available, rejected (with no data) if if ajax request fails
     */
    loadMessages: function( pMessageKeys ) {
        var jqXHR, data,
            deferred = $.Deferred(),
            url = "wwv_flow.js_messages";

        data = {
            p_app_id: $v( "pFlowId" ),
            p_lang: apex.locale.getLanguage(),
            p_version: "1", // Use a dummy version number, because we don't have the real application version which could be used for better caching support
            p_names: pMessageKeys
        };
        jqXHR = $.get( url, data, null, "json" );
        jqXHR.done( function( resultData ) {
            lang.addMessages( resultData );
            deferred.resolve();
        } ).fail( function() {
            deferred.reject();
        });
        return deferred.promise();
    },

        /**
         * todo
         * @ignore
         * @param {string[]} pMessageKeys an array of message keys that are needed by pCallback.
         * @param pCallback A no argument function that is called when all the keys have been loaded.
         */
    loadMessagesIfNeeded: function( pMessageKeys, pCallback ) {
        var i,
            needed = [];

        for ( i = 0; i < pMessageKeys.length; i++ ) {
            if ( !this.hasMessage( pMessageKeys[i] ) ) {
                needed.push( pMessageKeys[ i ] );
            }
        }

        if ( needed.length > 0 ) {
            lang.loadMessages( needed ).done( function() {
                pCallback();
            });
        } else {
            pCallback();
        }
    },

    /**
     * <p>Remove all messages. This method is rarely needed. Many Oracle Application Express components rely on client-side
     * messages, so if you clear the messages you need to add any needed messages again.</p>
     *
     * @example <caption>This example removes all messages.</caption>
     * apex.lang.clearMessages();
     */
    clearMessages: function( ) {
        gMessages = {};
    },

    /**
     * <p>Return the message associated with the given key.
     * The key is looked up in the messages added with {@link apex.lang.addMessages}.</p>
     *
     * @param {string} pKey The message key.
     * @return {string} The localized message text. If the key is not found then the key is returned.
     * @example <caption>This example returns "OK" when the localized text for key OK_BTN_LABEL is "OK".</caption>
     * apex.lang.getMessage( "OK_BTN_LABEL" );
     */
    getMessage: function( pKey ) {
        var msg;

        msg = gMessages[ pKey ];
        return ( msg === null || msg === undefined ) ? pKey : msg;
    },

    /**
     * <p>Return true if pKey exists in the messages added with {@link apex.lang.addMessages}.</p>
     *
     * @param {string} pKey The message key.
     * @return {boolean} true if the given message exists and false otherwise.
     * @example <caption>This example checks for the existence of a message, "EXTRA_MESSAGE", before using it.</caption>
     * if ( apex.lang.hasMessage( "EXTRA_MESSAGE" ) ) {
     *     text += apex.lang.getMessage( "EXTRA_MESSAGE" );
     * }
     */
    hasMessage: function( pKey ) {
        var msg;

        msg = gMessages[ pKey ];
        return ( msg !== null && msg !== undefined );
    },

    /**
     * <p>Format a message. Parameters in the message, %0 to %9, are replaced with the corresponding function argument.
     * Use %% to include a single %. The replacement arguments are HTML escaped.
     *
     * @param {string} pKey The message key. The key is used to lookup the localized message text as if with getMessage.
     * @param {...*} pValues Any number of replacement values, one for each message parameter %0 to %9.
     *   Non string arguments are converted to strings.
     * @return {string} The localized and formatted message text. If the key is not found then the key is returned.
     * @example <caption>This example returns "Process 60% complete" when the PROCESS_STATUS message text is
     *   "Process %0%% complete" and the progress variable value is 60.</caption>
     *   apex.lang.formatMessage( "PROCESS_STATUS", progress );
     */
    formatMessage: function( pKey ) {
        var pattern = lang.getMessage( pKey ),
            args = [ pattern ].concat( Array.prototype.slice.call( arguments, 1 ));
        return lang.format.apply( this, args );
    },

    /**
     * <p>Formats a message.
     * Same as {@link apex.lang.formatMessage} except the message pattern is given directly.
     * It is already localized or isn't supposed to be.
     * It is not a key. The replacement arguments are HTML escaped.</p>
     *
     * @param {string} pPattern The message pattern.
     * @param {...*} pValues Any number of replacement values, one for each message parameter %0 to %9.
     *   Non string arguments are converted to strings.
     * @return {string} The formatted message text.
     * @example <caption>This example returns "Total cost: $34.00" assuming the orderTotal variable equals "34.00".</caption>
     * apex.lang.format( "Total cost: $%0", orderTotal );
     */
    format: function( pPattern ) {
        var args = Array.prototype.slice.call( arguments, 1 );
        return formatMessage( true, pPattern, args );
    },

    /**
     * <p>Same as {@link apex.lang.formatMessage} except the replacement arguments are not HTML escaped.
     * They must be known to be safe or will be used in a context that is safe.</p>
     *
     * @param {string} pKey The message key. The key is used to lookup the localized message text as if with getMessage.
     * @param {...*} pValues Any number of replacement values, one for each message parameter %0 to %9.
     *   Non string arguments are converted to strings.
     * @return {string} The localized and formatted message text. If the key is not found then the key is returned.
     * @example <caption>This example returns "You entered &lt;ok>" when the CONFIRM message text is "You entered %0"
     *   and the inputValue variable value is "&lt;ok>". Note this string must be used in a context where HTML escaping
     *   is done to avoid XSS vulnerabilities.</caption>
     * apex.lang.formatMessageNoEscape( "CONFIRM", inputValue );
     */
    formatMessageNoEscape: function(  pKey ) {
        var pattern = lang.getMessage( pKey ),
            args = [ pattern ].concat( Array.prototype.slice.call( arguments, 1 ));
        return lang.formatNoEscape.apply( this, args );
    },

    /**
     * <p>Same as {@link apex.lang.format}, except the replacement arguments are not HTML escaped.
     * They must be known to be safe or are used in a context that is safe.</p>
     *
     * @param {string} pPattern The message pattern.
     * @param {...*} pValues Any number of replacement values, one for each message parameter %0 to %9.
     *   Non string arguments are converted to strings.
     * @return {string} The formatted message text.
     * @example <caption>This example returns "You entered &lt;ok>" when the inputValue variable value is "&lt;ok>".
     *   Note this string must be used in a context where HTML escaping is done to avoid XSS vulnerabilities.</caption>
     * apex.lang.formatNoEscape( "You entered %0", inputValue );
     */
    formatNoEscape: function( pPattern ) {
        var args = Array.prototype.slice.call( arguments, 1 );
        return formatMessage( false, pPattern, args );
    }
    };
    return lang;
})( apex.util, apex.debug, apex.jQuery );
