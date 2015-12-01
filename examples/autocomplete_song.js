var ugs = require('../lib/index');

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
