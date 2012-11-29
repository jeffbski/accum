'use strict';

var passStream = require('pass-stream');

function accum(options, cb) {
  if (arguments.length === 1) { // options is optional
    cb = options;
    options = {};
  }
  options = options || {};
  options.encoding = options.encoding || 'utf8';
  if (typeof cb !== 'function') throw new Error('accum requires a cb function');
  if (options.type &&
      (options.type !== 'buffer' && options.type !== 'string' && options.type !== 'array')) {
    throw new Error('if options.type is provided to accum, it must be one of [buffer, string, array]');
  }

  var arrData = [];

  function writeFn(data) {
    /*jshint validthis:true */
    arrData.push(data);
    this.queueWrite(data);
  }

  function ensureBuffer(data) {
    return (Buffer.isBuffer(data)) ? data : new Buffer(data);
  }

  function ensureString(data) {
    return (typeof data === 'string') ? data :
      Buffer.isBuffer(data) ? data.toString(options.encoding) :
      data.toString();
  }

  var endConcatFns = {
    buffer: function (arrData, cb) { cb(null, Buffer.concat(arrData.map(ensureBuffer))); },
    string: function (arrData, cb) { cb(null, arrData.map(ensureString).join('')); },
    array: function (arrData, cb) { cb(null, arrData); }
  };

  function endFn() {
    /*jshint validthis:true */
    if (!options.type) { // not provided need to detect
      var first = arrData[0];
      if (Buffer.isBuffer(first)) options.type = 'buffer';
      else if (typeof first === 'string') options.type = 'string';
      else options.type = 'array';
    }
    var fn = endConcatFns[options.type];
    fn(arrData, cb);
    this.queueEnd();
  }
  var stream = passStream(writeFn, endFn);

  function errored(err) {
    cb(err);
    stream.destroy();
  }
  stream.on('error', errored);

  var origDestroy = stream.destroy;
  stream.destroy = function () {
    stream.removeListener('error', errored);
    origDestroy.call(stream);
  };
  return stream;
}

function buffer(cb) { return accum({ type: 'buffer'}, cb); }
function string(optEncoding, cb) {
  if (arguments.length === 1) {  // optEncoding not provided, shift
    cb = optEncoding;
    optEncoding = null;
  }
  optEncoding = optEncoding || 'utf8';
  return accum({ type: 'string', encoding: optEncoding }, cb);
}
function array(cb) { return accum({ type: 'array' }, cb); }

accum.buffer = buffer;
accum.string = string;
accum.array = array;
module.exports = accum;
