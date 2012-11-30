'use strict';

var passStream = require('pass-stream');

function accum(options, listenerFn) {
  if (arguments.length === 1) { // options is optional
    listenerFn = options;
    options = {};
  }
  options = options || {};
  options.encoding = options.encoding || 'utf8';
  if (typeof listenerFn !== 'function') throw new Error('accum requires a listenerFn function');
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
    buffer: function (arrData, listenerFn) { listenerFn(Buffer.concat(arrData.map(ensureBuffer))); },
    string: function (arrData, listenerFn) { listenerFn(arrData.map(ensureString).join('')); },
    array: function (arrData, listenerFn) { listenerFn(arrData); }
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
    fn(arrData, listenerFn);
    this.queueEnd();
  }
  var stream = passStream(writeFn, endFn);

  return stream;
}

function buffer(listenerFn) { return accum({ type: 'buffer'}, listenerFn); }
function string(optEncoding, listenerFn) {
  if (arguments.length === 1) {  // optEncoding not provided, shift
    listenerFn = optEncoding;
    optEncoding = null;
  }
  optEncoding = optEncoding || 'utf8';
  return accum({ type: 'string', encoding: optEncoding }, listenerFn);
}
function array(listenerFn) { return accum({ type: 'array' }, listenerFn); }

accum.buffer = buffer;
accum.string = string;
accum.array = array;
module.exports = accum;
