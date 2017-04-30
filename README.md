# ultimate-guitar-scraper

[![npm version](https://badge.fury.io/js/ultimate-guitar-scraper.svg)](https://badge.fury.io/js/ultimate-guitar-scraper)
[![Dependency Status](https://gemnasium.com/masterT/ultimate-guitar-scraper.svg)](https://gemnasium.com/masterT/ultimate-guitar-scraper)
[![TravisCI Status](https://travis-ci.org/masterT/ultimate-guitar-scraper.svg)](https://travis-ci.org/masterT/ultimate-guitar-scraper)


It is a scraper that uses [ultimate-guitar.com](http://www.ultimate-guitar.com/) as a web service to extract [tablatures](https://en.wikipedia.org/wiki/Tablature), also called *TAB*.

There is also an `autocomplete` feature that find `artist` or `song`.


## Installation

`npm i ultimate-guitar-scraper --save`


## Usage

### search ( query, callback, [ requestOptions ] )

#### query
Type: Object

| Name     | Type            | Require | Default              |
|----------|-----------------|---------|----------------------|
| bandName | string          | yes     |                      |
| songName | string          | no      |                      |
| page     | number          | no      | `1`                  |
| type     | string or array | no      | `['tabs', 'chords']` |

**Available type**: `['video lessons', 'tabs', 'chords', 'bass tabs', 'guitar pro tabs', 'power tabs', 'drum tabs', 'ukulele chords']`

#### callback
Type: Function ( error, tabs, requestResponse, requestBody )

- **error**: the error message. `null` if no error.
- **tabs**: array of TAB (see TAB structure below) `null` if error.
- **requestResponse**: the original response returned by [request](https://www.npmjs.com/package/request)
- **requestBody**: the original body returned by [request](https://www.npmjs.com/package/request)


#### requestOptions
Type: Object. Options of the HTTP request, made with package [request](https://www.npmjs.com/package/request).


### Examples
Basic usage.

```js
var ugs = require('ultimate-guitar-scraper');
ugs.search({
  bandName: 'Pink Floyd',
  songName: 'Wish You Were Here',
  page: 1,
  type: ['tabs', 'chords', 'guitar pro tabs'],
}, function(error, tabs) {
  if (error) {
    console.log(error);
  } else {
    console.log(tabs);
  }
});
```

Using [request](https://www.npmjs.com/package/request) options to pass a custom header. It also use the original response in the callback to get the `server`.

```js
var ugs = require('ultimate-guitar-scraper');

var query = {
  bandName: 'Half Moon Run'
};

var callback = function(error, tabs, response, body) {
  if (error) {
    console.log(error);
  } else {
    console.log(tabs);
    console.log('Utlimate Guitar server: ' + response.headers['server']);
  }
};

var options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36'
  }
};

ugs.search(query, callback, options);
```

### TAB

A *TAB* object looks like this:
```js
{
  artist: 'Pink Floyd',
  name: 'Wish You Were Here Live',
  difficulty: 'intermediate',       // can be null
  rating: 5,                        // can be null
  numberRates: 2,                   // can be null
  type: 'tab'
  url: 'http://tabs.ultimate-guitar.com/p/pink_floyd/wish_you_were_here_live_tab.htm'
}
```


### autocomplete ( query, callback, [ requestOptions ] )

#### query
Type: Object

| Name   | Type   | Require               | Default    |
|--------|--------|-----------------------|------------|
| query  | string | yes                   |            |
| artist | string | only if type is 'tab' |            |
| type   | string | no                    | `'artist'` |


**Available type**: `['artist', 'tab']`


#### callback
Type: Function ( error, suggestions, requestResponse, requestBody )

- **error**: the error message. `null` if no error.
- **suggestions**: array of String that represent `'song'` or `'artist'`.
- **requestResponse**: the original response returned by [request](https://www.npmjs.com/package/request)
- **requestBody**: the original body returned by [request](https://www.npmjs.com/package/request)


#### requestOptions
Type: Object. Options of the HTTP request, made with package [request](https://www.npmjs.com/package/request).


### Examples

Searching for an `'artist'`.

```js
var ugs = require('ultimate-guitar-scraper');
ugs.autocomplete({
  query: 'Ozzy',
  type: 'artist'
}, function(error, suggestions) {
  if (error) {
    console.log(error);
  } else {
    console.log(suggestions);
  }
});
```

Searching for a `'song'`.

```js
var ugs = require('ultimate-guitar-scraper');
ugs.autocomplete({
  query: 'Crazy',
  artist: 'Ozzy Osbourne',
  type: 'tab'
}, function(error, suggestions) {
  if (error) {
    console.log(error);
  } else {
    console.log(suggestions);
  }
});
```


## Test

`npm test`


## Change Log

#### 0.3.0 (2015-11-30)
- add new feature `autocomplete`
- refactor `utils.js`
- add examples for `autocomplete`
- add/update specs

#### 0.2.0 (2015-11-24)
- extract code in `searchURL` that was formatting the query params in new method `formatQuery`
- better code in `parseTAB` so it parses more *TAB*
- rename `searchURL` for `generateURL`
- better doc

## Contributing

Contribution is welcome! Open an issue first.


## License

MIT.
