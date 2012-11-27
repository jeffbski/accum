/*global suite:false test:false */
'use strict';

var chai = require('chai-stack');
var accum = require('..'); // require('accum');
var passStream = require('pass-stream');

var t = chai.assert;

suite('basic');

test('accum(cb) with string data, results with concatenated string to cb before end', function (done) {
  var stream = passStream();
  stream
    .pipe(accum(function (err, alldata) {
      if (err) return done(err);
      t.equal(alldata, 'abcdefghi');
      done();
    }));
  process.nextTick(function () {
    stream.write('abc');
    stream.write('def');
    stream.end('ghi');
  });
});

test('accum(cb) with Buffer data, results with concatenated Buffer to cb before end', function (done) {
  var stream = passStream();
  stream
    .pipe(accum(function (err, alldata) {
      if (err) return done(err);
      t.ok(Buffer.isBuffer(alldata));
      t.equal(alldata, new Buffer('abcdefghi'));
      done();
    }));
  process.nextTick(function () {
    stream.write(new Buffer('abc'));
    stream.write(new Buffer('def'));
    stream.end(new Buffer('ghi'));
  });
});

test('accum(cb) with number data, results with concatenated raw array to cb before end', function (done) {
  var stream = passStream();
  stream
    .pipe(accum(function (err, alldata) {
      if (err) return done(err);
      t.ok(Array.isArray(alldata));
      t.deepEqual(alldata, [1, 2, 3]);
      done();
    }));
  process.nextTick(function () {
    stream.write(1);
    stream.write(2);
    stream.end(3);
  });
});

test('accum(cb) with various types of data, results with concatenated raw array to cb before end', function (done) {
  var DATA = [
    1,
    true,
    false,
    'hello',
    null,
    undefined,
    [2, 3],
    { a: 1, b: 2 },
    new Buffer('buff'),
    'finished'
  ];
  var stream = passStream();
  stream
    .pipe(accum(function (err, alldata) {
      if (err) return done(err);
      t.ok(Array.isArray(alldata));
      t.deepEqual(alldata, DATA);
      done();
    }));
  process.nextTick(function () {
    DATA.forEach(function (x) {
      stream.write(x);
    });
    stream.end();
  });
});


test('missing cb throws error', function () {
  function throwsErr() {
    var stream = accum();
  }
  t.throws(throwsErr, /accum requires a cb function/);
});

