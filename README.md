# accum

Simple pass-through stream (RW) which accumulates or collects the data from a stream. Pipe your stream into this to get all the data as buffer, string, or raw array.

[![Build Status](https://secure.travis-ci.org/jeffbski/accum.png?branch=master)](http://travis-ci.org/jeffbski/accum)

## Installation


```bash
npm install accum
```

## Usage

`accum` provides several factory methods for use:

 - The default automatic method - `accum(cb)` constructs a pass-through stream which checks if the first chunk is a Buffer and if so returns a concatenated Buffer of all the data, otherwise if it is a string then returns a concatenated string, otherwise returns a raw array. The `cb` signature is `function(err, alldata)`. The `cb` is called after all the data is received just prior to the `end` event being emitted.

```javascript
var accum = require('accum');
rstream
  .pipe(accum(function (err, alldata) {
    if (err) return yourHandleErrFn(err); // handle the error
    // use the accumulated data - alldata will be Buffer, string, or []
  }));
```

For a more deterministic result use one of the following:

 - `accum.buffer(cb)` - constructs a pass-through stream which converts everything into a Buffer, concatenates, and calls the `cb` with the buffer. The `cb` signature is `function(err, buffer)`. The `cb` is called after all the data is received just prior to the `end` event being emitted.

```javascript
var accum = require('accum');
rstream
  .pipe(accum.buffer(function (err, buffer) {
    if (err) return yourHandleErrFn(err); // handle the error
    // use the accumulated data - buffer which is a Buffer
  }));
```

 - `accum.string([optEncoding], cb)` - constructs a pass-through stream which concatenates everything into a string. Buffer data is converted to string using the optional encoding `optEncoding` which defaults to 'utf8'. Other data is simply converted using `.toString()`. The `cb` signature is `function(err, string)`. The `cb` is called after all the data is received just prior to the `end` event being emitted.

```javascript
var accum = require('accum');
rstream
  .pipe(accum.string('utf8', function (err, string) {
    if (err) return yourHandleErrFn(err); // handle the error
    // use the accumulated data - string which is a utf8 string
  }));
```

 - `accum.array(cb)` - constructs a pass-through stream which concatenates everything into an array without any conversion, which the `cb` receives the accumulated data on end. The `cb` signature is `function(err, arr)`. The `cb` is called after all the data is received just prior to the `end` event being emitted.

```javascript
var accum = require('accum');
rstream
  .pipe(accum.array(function (err, array) {
    if (err) return yourHandleErrFn(err); // handle the error
    // use the accumulated data - array which is a raw unconverted array of data chunks
  }));
```

## Goals

 - Easy to use pass-through stream which accumulates the data from a stream
 - Builds on pass-stream to have all the normal pass-through functionality for a spec compliant stream
 - Ability to automatically adapt to type of first data packet or coerce the data to a particular format
 - Ability to receive just the raw array of data chunks
 - Tested with binary data

## Why

Rather than manually accumulating streams, put all the best practices into this one module. There are subtle errors that can occur if utf8 strings happen to be split in the middle of a character, so conversion and concatenation needs to be done properly.

There were several existing projects that also accumululate in slightly different ways:

 - https://github.com/polotek/data-collector-stream
 - https://github.com/Weltschmerz/Accumulate

## Get involved

If you have input or ideas or would like to get involved, you may:

 - contact me via twitter @jeffbski  - <http://twitter.com/jeffbski>
 - open an issue on github to begin a discussion - <https://github.com/jeffbski/accum/issues>
 - fork the repo and send a pull request (ideally with tests) - <https://github.com/jeffbski/accum>

## License

 - [MIT license](http://github.com/jeffbski/accum/raw/master/LICENSE)

