/*global suite:false test:false */
'use strict';

var chai = require('chai-stack');
var crypto = require('crypto');
var accum = require('..'); // require('accum');
var passStream = require('pass-stream');

var t = chai.assert;

suite('string');

test('accum.string(cb) with string data, results with concatenated string to cb before end', function (done) {
  var DATA = 'abcdefghi';
  var stream = passStream();
  stream
    .pipe(accum.string(function (err, alldata) {
      if (err) return done(err);
      t.typeOf(alldata, 'string');
      t.equal(alldata.length, DATA.length);
      t.equal(alldata, DATA);
      done();
    }));
  process.nextTick(function () {
    stream.write('abc');
    stream.write('def');
    stream.end('ghi');
  });
});

test('accum.string(cb) with Buffer data, results with concatenated string to cb before end', function (done) {
  var DATA = 'abcdefghi';
  var stream = passStream();
  stream
    .pipe(accum.string(function (err, alldata) {
      if (err) return done(err);
      t.typeOf(alldata, 'string');
      t.equal(alldata.length, DATA.length);
      t.equal(alldata, DATA);
      done();
    }));
  process.nextTick(function () {
    stream.write(new Buffer('abc'));
    stream.write(new Buffer('def'));
    stream.end(new Buffer('ghi'));
  });
});

test('accum.string("utf8", cb) with Buffer data, results with concatenated string to cb before end', function (done) {
  var DATA = 'abcdefghi';
  var stream = passStream();
  stream
    .pipe(accum.string('utf8', function (err, alldata) {
      if (err) return done(err);
      t.typeOf(alldata, 'string');
      t.equal(alldata.length, DATA.length);
      t.equal(alldata, DATA);
      done();
    }));
  process.nextTick(function () {
    stream.write(new Buffer('abc'));
    stream.write(new Buffer('def'));
    stream.end(new Buffer('ghi'));
  });
});


test('accum.string(cb) with err, calls cb with err', function (done) {
  var stream = accum.string(function (err, alldata) {
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
// test('accum.string(cb) with err piped, calls cb with err', function (done) {
//   var stream = passStream();
//   stream
//     .pipe(accum.string(function (err, alldata) {
//       t.equal(err.message, 'my error');
//       done();
//     }));
//   process.nextTick(function () {
//     stream.emit('error', new Error('my error'));
//   });
// });


test('accum.string() missing cb throws error', function () {
  function throwsErr() {
    var stream = accum.string();
  }
  t.throws(throwsErr, /accum requires a cb function/);
});

