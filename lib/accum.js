'use strict';

var passStream = require('pass-stream');

function accum(cb) {
  if (typeof cb !== 'function') throw new Error('accum requires a cb function');

  function writeFn(data) {
    /*jshint validthis:true */
    this.queueWrite(data);
  }
  function endFn() {
    /*jshint validthis:true */
    this.queueEnd();
  }
  var stream = passStream(writeFn, endFn);
  return stream;
}

module.exports = accum;