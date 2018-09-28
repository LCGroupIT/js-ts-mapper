require('es6-shim');
require('reflect-metadata');
require('ts-helpers');
require('core-js/es6/symbol');
// Prevent Karma from running prematurely.
__karma__.loaded = function() { return; };
Promise.resolve(require.context('./tests/', true, /index\.spec\.ts/))
    .then(function(context) { return context.keys().map(context); })
    .then(__karma__.start, __karma__.error);