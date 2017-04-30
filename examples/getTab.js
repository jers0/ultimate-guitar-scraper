var ugs = require('../lib/index');

// chords
// TABUrl = "https://tabs.ultimate-guitar.com/n/nirvana/smells_like_teen_spirit_ver4_crd.htm";

// video
TABUrl = "https://tabs.ultimate-guitar.com/n/nirvana/smells_like_teen_spirit_ver3_video_lesson.htm";

// guitar pro tabs
// TABUrl = "https://tabs.ultimate-guitar.com/n/nirvana/smells_like_teen_spirit_ver2_guitar_pro.htm";

// tab
// TABUrl = "https://tabs.ultimate-guitar.com/n/nirvana/smells_like_teen_spirit_ver3_tab.htm";

// bass tab
// TABUrl = "https://tabs.ultimate-guitar.com/n/nirvana/smells_like_teen_spirit_ver3_btab.htm";

// drum tab
// TABUrl = "https://tabs.ultimate-guitar.com/n/nirvana/smells_like_teen_spirit_drum_tab.htm";

// Ukulele Chords
// TABUrl = "https://tabs.ultimate-guitar.com/n/nirvana/smells_like_teen_spirit_ukulele_crd.htm";

// Power Tab
// TABUrl = "https://tabs.ultimate-guitar.com/n/nirvana/smells_like_teen_spirit_power_tab.htm";

ugs.get(TABUrl, function(error, tab) {
  if (error) {
    console.log(error);
  } else {
    console.log(tab);
  }
});
