var cheerio = require('cheerio');

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

function removeShit(text) {
  return text.trim().replace(/[\n\r\t]/g, '');
}

var typeFromString = function(type) {
  if (types.hasOwnProperty(type)) {
    return types[type];
  } else {
    throw new Error("Unknown type '"+ type +"', accepted type are: '" + Object.keys(types).join("', '") + "'");
  }
}

var underscore = function(string) {
  var underscored = string[0].toLowerCase();
  return underscored + string.slice(1, string.length).replace(/([A-Z])/g, function(match) {
    return '_' + match.toLowerCase();
  });
}

function parseTAB(html) {
  var $ = cheerio.load(html);
  var trs = $('.tresults tr');
  var artist;
  var tabs = trs.map(function (index, tr) {
    // first one is used as table header
    if (index > 0) {
      var tds = $(tr).children('td');
      // artist is only specified in the first 'tr'
      if (index == 1) {
        artist = $(tds[0]).text();
      }
      // name
      var name = $(tds[1]).find('.song').text();
      name = removeShit(name);
      // difficulty
      var difficulty = $(tds[1]).find('.dn').text().replace(/\+?\s?difficulty:?/i, '');
      difficulty = removeShit(difficulty) || null;
      // rating
      var rating = null;
      var ratingClass = $(tds[2]).find('.rating span').attr('class');
      if (ratingClass) {
        try {
          rating = parseInt(ratingClass.replace('r_', ''));
        } catch (e) { }
      }
      // number of rates
      var numberRates = rating != null ? 0 : null;
      var numberRatesText = $(tds[2]).find('.ratdig').text();
      if (numberRatesText.length > 0) {
        try {
          numberRates = parseInt(numberRatesText) || null;
        } catch (e) { }
      }
      // type
      var type = removeShit($(tds[3]).text());

      return {
        artist: artist,
        name: name,
        difficulty: difficulty,
        rating: rating,
        numberRates: numberRates,
        type: type
      };
    }
  });
  return tabs.toArray();
}

var searchURL = function(query) {
  var acceptedParams = ['band_name', 'song_name', 'type', 'page'];
  var requiredParams = ['band_name'];
  var params = {};
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
      throw new Error("Unknown param '" + underscored + "', accepted params are: " + acceptedParams.join(", "));
    }
  }
  // required params
  for (var i = 0; i < requiredParams.length; i++) {
    if (Object.keys(params).indexOf(requiredParams[i]) == -1) {
      throw new Error("Required param '" + requiredParams[i] + "' in your query")
    }
  };
  // default params
  for (param in defaults) {
    if (!params.hasOwnProperty(param)) {
      params[param] = defaults[param];
    }
  }
  // constraints
  for (var i = 0; i < params.type.length; i++) {
    if (typeof params.type[i] == "string") {
      params.type[i] = typeFromString(params.type[i]);
    }
  };
  // try to make the same request as the browser
  params.view_state = 'advanced';
  params.tab_type_group = 'text';
  params.app_name = 'ugt';
  params.order = 'myweight';
  params.version_la = '';

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
  searchURL: searchURL,
  parseTAB: parseTAB
};
