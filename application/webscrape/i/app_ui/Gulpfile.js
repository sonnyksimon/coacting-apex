'use strict';
(function() {
    var gulp = require('gulp');
    require('../../internal_utilities/apex_node_build/build.js')(gulp, require('./config.json'));
})();
