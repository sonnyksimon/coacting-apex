/* this file fixes an incompatibility between jqm 1.4.5 and jquery 2.2.3
*  this is the 1.4.5 code with comments removed and with the change marked */
(function($) {
$.mobile.Navigator.prototype.go = function( url, data, noEvents ) {
    var state, href, hash, popstateEvent,
        isPopStateEvent = $.event.special.navigate.isPushStateEnabled();
    var path = $.mobile.path;
    href = path.squash( url );
    hash = this.hash( url, href );
    if ( noEvents && hash !== path.stripHash(path.parseLocation().hash) ) {
        this.preventNextHashChange = noEvents;
    }
    this.preventHashAssignPopState = true;
    window.location.hash = hash;
    this.preventHashAssignPopState = false;
    state = $.extend({
        url: href,
        hash: hash,
        title: document.title
    }, data);
    if ( isPopStateEvent ) {
        popstateEvent = new $.Event( "popstate" );
        popstateEvent.originalEvent = new $.Event( "popstate", { state: null } ); // changed
        this.squash( url, state );
        if ( !noEvents ) {
            this.ignorePopState = true;
            $.mobile.window.trigger( popstateEvent );
        }
    }
    this.history.add( state.url, state );
};})(apex.jQuery);
