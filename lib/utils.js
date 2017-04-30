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
* Return the TAB from a HTML <tr></tr> tag.
*/
var searchExtractTab = function ($, tr) {
  var tds = $(tr).children('td').toArray();
  var tab = {};
  // Ultimate guitar add an extra <td> tag at the beginning of the first <tr>,
  // to prevent scraping.
  if (tds.length == 5) {
    tds.shift();
  }
  // Artist.
  var $td1 = $(tds[0]);
  if ($td1.find('a').length == 1) {
    tab['artist'] = removeShit($td1.text());
  }
  var $td2 = $(tds[1]);
  var $link = $td2.find('a').first();
  if ($link && $link.attr('href')) {
    // Url.
    var href = $link.attr('href');
    tab['url'] = url.resolve('http://tabs.ultimate-guitar.com/', href);
    // Name.
    tab['name'] = removeShit($link.text());
  }
  // Difficulty.
  var $dn = $td2.find('.dn').first();
  if ($dn) {
    var difficulty = $dn.text().replace(/\+?\s?difficulty:?/i, '').trim();
    if (difficulty.length > 0) {
      tab['difficulty'] = difficulty;
    }
  }
  // Rating.
  var $td3 = $(tds[2]);
  var $rating = $td3.find('.rating');
  if ($rating) {
    if ($rating.find('span').length == 5) {
      tab['rating'] = $rating.find('span').length;
    }
  }
  // Number of rates.
  var $ratdig = $td3.find('.ratdig');
  if ($ratdig) {
    var numberRates = parseInt($ratdig.text());
      tab['numberRates'] = numberRates;
  }
  // Rating and numberRates should be present.
  if (tab.hasOwnProperty('rating') || tab.hasOwnProperty('numberRates')) {
    delete tab['rating'];
    delete tab['numberRates'];
  }
  // Type.
  var $td4 = $(tds[3]);
  var type = removeShit($td4.text().trim());
  if (type.length > 0) {
    tab['type'] = type;
  }
  return tab;
}


/**
* Return TABs from the response body.
*/
function parseListTABs(body) {
  var $ = cheerio.load(body);
  var artist;
  return $('.tresults tr').toArray().reduce(function (tabs, tr) {
    var tab = searchExtractTab($, tr);
    if (tab && tab.name && tab.url && tab.type) {
      // Only the first TAB has the artist name.
      // Only the first TAB is type 'tab pro', which we skip.
      if (tab.artist) {
        artist = tab.artist;
      } else if (artist) {
        tab.artist = artist;
        tabs.push(tab);
      }
    }
    return tabs;
  }, []);
  return tabs.toArray();
}


var parseSingleTAB = function (html) {
  var tab = {};
  var $ = cheerio.load(html);

  var page = $('.page_bcg');
  if (!page) {
    return null;
  }

  var $titleElement = $('.page_bcg .t_header .t_title h1');
  if (!$titleElement) {
    return null;
  }
  var title = $titleElement.text();
  var match = /(.*)\s(power tab|power|drums|drum tab|guitar pro|video lesson|video|bass|ukulele|ukulele chords|chords|tab)$/i.exec(title);
  if (match == null || match.length != 3) {
    return null;
  }
  // name
  tab.name = match[1];
  // type
  var type = match[2].toLowerCase();
  switch (type) {
    case "power":
    case "power tab":
      tab.type = "power tabs";
      break;
    case "drum tab":
      tab.type = "drum tabs";
      break;
    case "bass":
    case "bass tab":
      tab.type = "bass tabs";
      break;
    case "tab":
      tab.type = "tabs";
      break;
    case "video":
    case "video lesson":
      tab.type = "video lessons";
      break;
    case "guitar pro":
      tab.type = "guitar pro tabs";
      break;
    case "chords":
      tab.type = "chords";
      break;
    case "ukulele chords":
    case "ukulele":
      tab.type = "ukulele chords";
      break;
    default:
      return null;
  }
  // artist
  var $bandLink = $('.page_bcg .t_header .t_title .t_autor a');
  if (!$bandLink) {
    return null;
  }
  tab.artist = $bandLink.text().split('\n')[0];
  // rating
  var $ratingElement = $('.page_bcg .t_header .raiting');
  tab.rating = $ratingElement.find('.voting a.cur').length || null;
  tab.numberRates = null;
  var $numberRatesElement = $ratingElement.find('.v_c');
  if ($numberRatesElement) {
    tab.numberRates = parseInt($numberRatesElement.text().trim().replace(/\D/, '')) || null;
  }
  // difficulty
  tab.difficulty = null;
  var $infoKeysElement = $('.page_bcg .t_b .t_dt');
  var $infoValuesElement = $('.page_bcg .t_b .t_dtd .t_dtde');
  if ($infoKeysElement && $infoValuesElement) {
    var infoKeys = $infoKeysElement.html().split(/<br\/?>/).map(function (text) {
      return text.trim();
    });
    for (var i = 0; i < infoKeys.length; i++) {
      if (infoKeys[i].toLowerCase() == 'difficulty' && i < $infoValuesElement.length) {
        tab.difficulty = $($infoValuesElement[i]).text().trim();
        break;
      }
    }
  }
  // content
  switch (tab.type) {
    case "tabs":
    case "chords":
    case "ukulele chords":
    case "drum tabs":
    case "bass tabs":
      var $contentElement = $('.page_bcg .t_b pre').last();
      if ($contentElement.length == 0) {
        return null;
      }
      tab.content = $contentElement.text();
      break;
    case  "power tabs":
    case  "guitar pro tabs":
      var $downloadId = $('.page_bcg .tab_download_box input#tab_id');
      if ($downloadId.length == 0) {
        return null;
      }
      tab.downloadUrl = "https://tabs.ultimate-guitar.com/tabs/download?id=" + $downloadId.val();
      break;
    case "video lessons":
      var $iframe = $('.page_bcg .t_b iframe');
      if ($iframe.length == 0) {
        return null;
      }
      tab.contentUrl = $iframe.attr('src').replace('//', '');
      break;
  }
  return tab;
};


/**
* Validate the query params and set the default params for the 'search'
*
* @param {Object} query params
* @return {Object} formatted query params
*/
var formatSearchQuery = function (query) {
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
* Validate the query params and set the default params for the 'autocomplete'
*
* @param {Object} query params
* @return {Object} formatted query params
*/
var formatAutocompleteQuery = function (query) {
  var params = {};
  var acceptedParams = ['query', 'type', 'artist'];
  var requiredParams = ['query'];
  var defaults = {
    type: 'artist',
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
  // conditions
  var autocompleteTypes = 'tab artist'.split(' ');
  if (autocompleteTypes.indexOf(params.type) == -1) {
    throw new Error("Unknown value '" + params.type + "' for param 'type'. Accepted values are '" + autocompleteTypes.join("', '") + "'");
  }
  if (params.type == 'tab') {
    if (!params.hasOwnProperty('artist')) {
      throw new Error("Query requires param 'artist' when param 'type' is 'tab'");
    }
  }

  // rename params
  if (params.hasOwnProperty('query')) {
    params.q = params.query;
    delete params.query;
  }

  return params;
}


/**
* Encode the query params
*
* @param {Object} query params
* @return {String} encoded query params
*/
var encodeParams = function (params) {
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
  return encodedParams;
};


module.exports = {
  encodeParams: encodeParams,
  parseListTABs: parseListTABs,
  parseSingleTAB: parseSingleTAB,
  formatSearchQuery: formatSearchQuery,
  formatAutocompleteQuery: formatAutocompleteQuery
};
