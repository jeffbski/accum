'use strict';

var passStream = require('pass-stream');

function accum(cb) {
  if (typeof cb !== 'function') throw new Error('accum requires a cb function');

  var arrData = [];

  function writeFn(data) {
    /*jshint validthis:true */
    arrData.push(data);
    this.queueWrite(data);
  }

  function ensureBuffer(data) {
    return (Buffer.isBuffer(data)) ? data : new Buffer(data);
  }

  function endFn() {
    /*jshint validthis:true */
    var first = arrData[0];
    if (Buffer.isBuffer(first)) {
      cb(null, Buffer.concat(arrData.map(ensureBuffer)));
    } else if (typeof first === 'string') {
      cb(null, arrData.join(''));
    } else {
      cb(null, arrData);
    }
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

module.exports = accum;