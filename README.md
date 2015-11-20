# ultimate-guitar-scraper

[![Dependency Status](https://gemnasium.com/masterT/ultimate-guitar-scraper.svg)](https://gemnasium.com/masterT/ultimate-guitar-scraper)
[![Codeship Status for masterT/ultimate-guitar-scraper](https://codeship.com/projects/1ba523b0-71e4-0133-047d-66d99a32fdb3/status?branch=master)](https://codeship.com/projects/117063)

It is a scraper for [ultimate-guitar.com](http://www.ultimate-guitar.com/). It means that it uses the Ultimate Guitar's website as an web service to retrieve data. To achieve it, it makes HTTP request, like your browser, and parse the response, which is HTML.


## Installation

`npm install ultimate-guitar-scraper`


## Usage

### Search

Search [tablatures](https://en.wikipedia.org/wiki/Tablature), also called TAB.

#### Query Params

- **bandName**: String (required)
- **songName**: String
- **page**: Number (default: `1`)
- **type**: Array (values: `['video lessons', 'tabs', 'chords', 'bass tabs', 'guitar pro tabs', 'power tabs', 'drum tabs', 'ukulele chords']`, default: `['chords', 'tabs']`)

#### Results

An Array of TAB object with this shape:
```js
{
  artist: 'Pink Floyd',             // String
  name: 'Wish You Were Here Live',  // String
  difficulty: 'intermediate',       // String or null
  rating: 5,                        // Number or null
  numberRates: 2,                   // Number or null
  type: 'tab'                       // String
  url: 'http://tabs.ultimate-guitar.com/p/pink_floyd/wish_you_were_here_live_tab.htm'                      // String
}
```

#### Examples
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

Using [request](https://www.npmjs.com/package/request) options, such as custom header.

```js
var ugs = require('ultimate-guitar-scraper');

var query = {
  bandName: 'Hall Moon Run'
};

var callback = function(error, tabs) {
  if (error) {
    console.log(error);
  } else {
    console.log(tabs);
  }
};

var options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36'
  }
};

ugs.search(query, callback, options);
```


## Test

`npm test`


## Contributing

Contribution is welcome! Open an issue first.


## License

MIT.
