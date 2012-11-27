/*global suite:false test:false */
'use strict';

var chai = require('chai-stack');
var spec = require('stream-spec');
var tester = require('stream-tester');
var accum = require('..'); // require('accum');

var t = chai.assert;

suite('stream-spec');

test('spec random pausing string stream', function (done) {
  var result;
  var ds = accum(function (err, alldata) {
    result = alldata;
  });
  spec(ds)
    .through({strict: false})
    .validateOnExit();

  var master = tester.createConsistentStream();

  function gen() {
    return 'abc';
  }

  var manualAccum = [];
  tester.createRandomStream(gen, 1000) //1k 3char strings
    .pipe(master)
    .pipe(tester.createUnpauseStream())
    .pipe(ds)
    .pipe(tester.createPauseStream())
    .pipe(master.createSlave())
    .on('error', function (err) { done(err); })
    .on('data', function (data) { manualAccum.push(data); })
    .on('end', function () {
      t.equal(result.length, 3000);
      t.equal(result, manualAccum.join(''));
      done();
    });
});

test('spec random pausing string stream', function (done) {
  var result;
  var ds = accum(function (err, alldata) {
    result = alldata;
  });
  spec(ds)
    .through({strict: false})
    .validateOnExit();

  var master = tester.createConsistentStream();

  function gen() {
    return new Buffer('abc');
  }

  var manualAccum = [];
  tester.createRandomStream(gen, 1000) //1k 3char strings
    .pipe(master)
    .pipe(tester.createUnpauseStream())
    .pipe(ds)
    .pipe(tester.createPauseStream())
    .pipe(master.createSlave())
    .on('error', function (err) { done(err); })
    .on('data', function (data) { manualAccum.push(data); })
    .on('end', function () {
      t.equal(result.length, 3000);
      t.equal(result, Buffer.concat(manualAccum));
      done();
    });
});

