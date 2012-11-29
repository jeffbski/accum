/*global suite:false test:false */
'use strict';

var chai = require('chai-stack');
var crypto = require('crypto');
var accum = require('..'); // require('accum');
var passStream = require('pass-stream');

var t = chai.assert;

suite('buffer');

test('accum.buffer(cb) with string data, results with concatenated Buffer to cb before end', function (done) {
  var DATA = new Buffer('abcdefghi');
  var stream = passStream();
  stream
    .pipe(accum.buffer(function (err, alldata) {
      if (err) return done(err);
      t.ok(Buffer.isBuffer(alldata));
      t.equal(alldata.length, DATA.length);
      var digest = crypto.createHash('sha1').update(alldata).digest('base64');
      var expectedDigest = crypto.createHash('sha1').update(DATA).digest('base64');
      t.equal(digest, expectedDigest);
      done();
    }));
  process.nextTick(function () {
    stream.write('abc');
    stream.write('def');
    stream.end('ghi');
  });
});

test('accum.buffer(cb) with Buffer data, results with concatenated Buffer to cb before end', function (done) {
  var DATA = new Buffer('abcdefghi');
  var stream = passStream();
  stream
    .pipe(accum.buffer(function (err, alldata) {
      if (err) return done(err);
      t.ok(Buffer.isBuffer(alldata));
      t.equal(alldata.length, DATA.length);
      var digest = crypto.createHash('sha1').update(alldata).digest('base64');
      var expectedDigest = crypto.createHash('sha1').update(DATA).digest('base64');
      t.equal(digest, expectedDigest);
      done();
    }));
  process.nextTick(function () {
    stream.write(new Buffer('abc'));
    stream.write(new Buffer('def'));
    stream.end(new Buffer('ghi'));
  });
});


test('accum.buffer(cb) with err, calls cb with err', function (done) {
  var stream = accum.buffer(function (err, alldata) {
    t.equal(err.message, 'my error');
    done();
  });
  process.nextTick(function () {
    stream.emit('error', new Error('my error'));
  });
});

// currently pipe does not forward error but I have put in
// pull request to fix node.js. Also pause-stream will have
// to be modified as well.
// test('accum.buffer(cb) with err piped, calls cb with err', function (done) {
//   var stream = passStream();
//   stream
//     .pipe(accum.buffer(function (err, alldata) {
//       t.equal(err.message, 'my error');
//       done();
//     }));
//   process.nextTick(function () {
//     stream.emit('error', new Error('my error'));
//   });
// });


test('accum.buffer() missing cb throws error', function () {
  function throwsErr() {
    var stream = accum.buffer();
  }
  t.throws(throwsErr, /accum requires a cb function/);
});

