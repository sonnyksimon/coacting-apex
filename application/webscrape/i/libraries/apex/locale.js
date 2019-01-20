/*global apex*/
/*!
 locale.js
 Copyright (c) 2015, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @fileOverview
 * The {@link apex}.locale namespace is used for locale related functions of Oracle Application Express.
 **/

/**
 * @namespace
 **/
apex.locale = {};

( function( locale ) {
    "use strict";

    var gOptions  = {   // locale depending settings
            language: "en",
            separators: {
                group:   ",",
                decimal: "."
            },
            calendar: {
                abbrMonthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                abbrDayNames:   ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
            }
        };

    /**
     * init is used to set the language and territory depending settings like the used separator for numbers.
     * It is generally not necessary to call this function, because it is automatically called by APEX.
     *
     * @param  {Object} pOptions   An object whose properties are used as language/territory depending settings.
     *
     * @function init
     * @memberOf apex.locale
     */
    locale.init = function( pOptions ) {
        gOptions = pOptions;
    };


    /**
     * Return the territory specific group separator for numeric values.
     *
     * @return {String}  The group separator. For example "," (US) or "." (Germany).
     *
     * @function getGroupSeparator
     * @memberOf apex.locale
     */
    locale.getGroupSeparator = function() {
        return gOptions.separators.group;
    };

    /**
     * Return the territory specific decimal separator for numeric values.
     *
     * @return {String}  The decimal separator. For example "." (US) or "," (Germany).
     *
     * @function getDecimalSeparator
     * @memberOf apex.locale
     */
    locale.getDecimalSeparator = function() {
        return gOptions.separators.decimal;
    };

    /**
     * Return the database abbreviated month names as an Array
     *
     * @return {Array} Array of abbreviated month names. For example ["Jan","Feb","Mar", ..., "Dec"]
     *
     * @function getAbbrevMonthNames
     * @memberOf apex.locale
     */
    locale.getAbbrevMonthNames = function() {
        return gOptions.calendar.abbrMonthNames;
    };

    /**
     * Return the database abbreviated day names as an Array. First Element of the array is the
     * first day of the week in the current locale. 
     *
     * @return {Array} Array of abbreviated day names. For example ["Sun","Mon","Tue","Wed",...,"Sat"]
     *
     * @function getAbbrevMonthNames
     * @memberOf apex.locale
     */
    locale.getAbbrevDayNames = function() {
        return gOptions.calendar.abbrDayNames;
    };

    /**
     * Return the current language
     *
     * @return {String} current language. For example "en", "de", "en-US", ...
     *
     * @function getLanguage
     * @memberOf apex.locale
     */
    locale.getLanguage = function() {
        return gOptions.language;
    };
    
})( apex.locale );
