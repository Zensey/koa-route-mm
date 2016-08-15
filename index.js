
'use strict';

/**
 * Module dependencies.
 */

const pathToRegexp = require('path-to-regexp');
const debug = require('debug')('koa-route');
const methods = require('methods');
const compose = require('koa-compose');

methods.forEach(function(method){
  module.exports[method] = create(method);
});

module.exports.del = module.exports.delete;
module.exports.all = create();

function create(method) {
  if (method) method = method.toUpperCase();

  return function(path, middleware){
    var re = pathToRegexp(path);
    middleware = Array.prototype.slice.call(arguments, 1);
    debug('%s %s -> %s', method || 'ALL', path, re);

    return function *(next){
      var m;

      // method
      if (!matches(this, method)) return yield* next;

      // path
      if (m = re.exec(this.path)) {
        var args = m.slice(1).map(decode);
        debug('%s %s matches %s %j', this.method, path, this.path, args);
        args.push(next);
        yield* compose(middleware).apply(this, args);
        return;
      }

      // miss
      return yield* next;
    }
  }
}

/**
 * Decode value.
 */

function decode(val) {
  if (val) return decodeURIComponent(val);
}

/**
 * Check request method.
 */

function matches(ctx, method) {
  if (!method) return true;
  if (ctx.method === method) return true;
  if (method === 'GET' && ctx.method === 'HEAD') return true;
  return false;
}
