var url = require('url'),
    cheerio = require('cheerio');

/**
* TAB types
* @type {Hash}
*/
var types = {
  "video lessons": 100,
  "tabs": 200,
  "chords": 300,
  "bass tabs": 400,
  "guitar pro tabs": 500,
  "power tabs": 600,
  "drum tabs": 700,
  "ukulele chords": 800
};

/**
* Trim and remove new line, carriage return and tab characters.
* @param {String} text
* @return {String} cleaned text
*/
var removeShit = function (text) {
  return text.trim().replace(/[\n\r\t]/g, '');
}

/**
* Change a string with camelCase to snake_case
* @param {String} camelCase string
* @return {String} snake_case string
*/
var underscore = function (string) {
  var underscored = string[0].toLowerCase();
  return underscored + string.slice(1, string.length).replace(/([A-Z])/g, function(match) {
    return '_' + match.toLowerCase();
  });
}

/**
* Take the name of a TAB type and return its value.
* @param {String} type name
* @return {Number} type value
*/
var typeFromString = function (type) {
  var type = String(type);
  if (types.hasOwnProperty(type)) {
    return types[type];
  } else {
    throw new Error("Unknown type '" + type + "'. Accepted type are: '" + Object.keys(types).join("', '") + "'");
  }
}

/**
* Parse an HTML element to a TAB.
*
* @param {Object} $
* @param {Object} element
* @return {Object} TAB or null if TAB could not be parse from Element.
*/
var parseTAB = function ($, element) {
  var $element = $(element);
  var tds = $element.children('td');
  var tab = {
    'artist': null,
    'url': null,
    'name': null,
    'difficulty': null,
    'rating': null,
    'numberRates': null,
    'type': null
  };
  // the first TAB element has malformed HTML,
  //  it is the only TAB with type 'Tab Pro'. It also have no rating info nor difficulty
  if (tds.length == 2) {
    tab['type'] = 'tab pro';
    tab['rating'] = null;
    tab['numberRates'] = null;
    tab['difficulty'] = null;
  } else if (tds.length != 4) {
    return null;
  }
  // #1
  // artist link or blank text
  var $td1 = $(tds[0]);
  if ($td1.children('a.search_art').length == 1) {
    tab['artist'] = removeShit($td1.text());
  } else if (!$td1.children().length == 0) {
    return null;
  }
  // #2
  // TAB link
  var $td2 = $(tds[1]);
  if ($td2.children('a.song').length == 1) {
    var $link = $td2.children('a.song').first();
    // url
    var urlTAB = $link.attr('href');
    tab['url'] = url.resolve('http://tabs.ultimate-guitar.com/', urlTAB);
    // name
    tab['name'] = removeShit($link.text());
    // difficulty
    var $dn = $td2.find('.dn').first();
    if ($dn) {
      var difficulty = $dn.text().replace(/\+?\s?difficulty:?/i, '').trim();
      if (difficulty.length > 0) {
        tab['difficulty'] = difficulty;
      }
    }
  } else {
    return null;
  }
  // #3
  // rating and number of rates
  var $td3 = $(tds[2]);
  var spans = $td3.children('span');
  if (spans.length == 2) {
    // rating
    var ratingClass = $td3.find('span.rating span').attr('class');
    if (ratingClass) {
      try {
        tab['rating'] = parseInt(ratingClass.replace('r_', '')) || null;
      } catch (e) { }
    }
    // number of rates
    var numberRatesText = $td3.find('span .ratdig').text();
    try {
      tab['numberRates'] = parseInt(numberRatesText) || null;
    } catch (e) { }
    // if rating or numberRates is null then both should be null
    if (tab['rating'] == null || tab['numberRates'] == null) {
      tab['rating'] = null;
      tab['numberRates'] = null;
    }
  }
  // #4
  // TAB type
  var $td4 = $(tds[3]);
  var type = removeShit($td4.text().trim());
  if (type.length > 0) {
    tab['type'] = type;
  }

  return tab;
}


/**
* Parse HTML to a TABs.
*
* @param {String} html
* @return {Array} TABs
*/
var parseTABs = function (html) {
  var artist;
  var $ = cheerio.load(html);
  // Can't get the <tr> through <table class='results'> because the HTML is malformed
  var tabs = $('.content tr').map(function (index, tr) {
    var tab = parseTAB($, tr);
    if (tab) {
      // only the first TAB element has the artist info
      if (tab.artist) {
        artist = tab.artist;
      } else if (artist) {
        tab.artist = artist;
      }
      return tab;
    }
  });
  return tabs.toArray();
}


/**
* Validate the query params and set the default params.
*
* @param {Object} query params
* @return {Object} formatted query params
*/
var formatQuery = function (query) {
  var params = {};
  var acceptedParams = ['band_name', 'song_name', 'type', 'page'];
  var requiredParams = ['band_name'];
  var defaults = {
    type: ['chords', 'tabs'],
    page: 1
  };
  // accepted params only
  for (param in query) {
    var underscored = underscore(param);
    if (acceptedParams.indexOf(underscored) != -1) {
      params[underscored] = query[param];
    } else {
      throw new Error("Unknown param '" + underscored + "'. Accepted params are: '" + acceptedParams.join("', '") + "'.");
    }
  }
  // required params
  for (var i = 0; i < requiredParams.length; i++) {
    if (Object.keys(params).indexOf(requiredParams[i]) == -1) {
      throw new Error("Query requires param '" + requiredParams[i] + "'.")
    }
  };
  // default params
  for (param in defaults) {
    if (!params.hasOwnProperty(param)) {
      params[param] = defaults[param];
    }
  }
  // param 'type' can be a string or an array of string
  if (Array.isArray(params.type)) {
    for (var i = 0; i < params.type.length; i++) {
      params.type[i] = typeFromString(params.type[i]);
    };
  } else {
    params.type = typeFromString(params.type);
  }
  // to not evoke suspicion, we try to make the same request as in the ultimate guitar web application
  params.view_state = 'advanced';
  params.tab_type_group = 'text';
  params.app_name = 'ugt';
  params.order = 'myweight';
  params.version_la = '';

  return params;
};


/**
* Generate an URL to search TABs.
*
* @param {Object} query params
* @return {String} url
*/
var generateURL = function (query) {
  params = formatQuery(query);
  // encode everything
  var encodedParams = Object.keys(params).map(function(key) {
    // is an array ?
    var encodedParam;
    if (Array.isArray(params[key])) {
      encodedParam = params[key].map(function(value) {
        return encodeURIComponent(key + "[]") + "=" + encodeURIComponent(value);
      }).join("&");
    } else {
      encodedParam = key + "=" + encodeURIComponent(params[key]);
    }
    return encodedParam.replace(/%20/g, '+');
  }).join("&");

  return "http://www.ultimate-guitar.com/search.php?" + encodedParams;
};


module.exports = {
  generateURL: generateURL,
  parseTABs: parseTABs,
  formatQuery: formatQuery
};
