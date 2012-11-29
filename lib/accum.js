'use strict';

var passStream = require('pass-stream');

function accum(type, cb) {
  if (arguments.length === 1) { // type is optional
    cb = type;
    type = null;
  }
  if (typeof cb !== 'function') throw new Error('accum requires a cb function');
  if (type && (type !== 'buffer' && type !== 'string' && type !== 'array')) {
    throw new Error('if type is provided to accum, it must be one of [buffer, string, array]');
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

  var endConcatFns = {
    buffer: function (arrData, cb) { cb(null, Buffer.concat(arrData.map(ensureBuffer))); },
    string: function (arrData, cb) { cb(null, arrData.join('')); },
    array: function (arrData, cb) { cb(null, arrData); }
  };

  function endFn() {
    /*jshint validthis:true */
    if (!type) { // not provided need to detect
      var first = arrData[0];
      if (Buffer.isBuffer(first)) type = 'buffer';
      else if (typeof first === 'string') type = 'string';
      else type = 'array';
    }
    var fn = endConcatFns[type];
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

function buffer(cb) { return accum('buffer', cb); }

accum.buffer = buffer;
module.exports = accum;
