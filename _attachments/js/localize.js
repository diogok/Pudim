
var language = navigator.language ? navigator.language : navigator.userLanguage ;
language = language.replace(/_/, '-').toLowerCase();
if (language.length > 3) {
   language = language.substring(0, 3) + language.substring(3).toUpperCase();
}

var strings = {};
$.ajax({ url: "locales/"+ language +".json",
       dataType: "json", async: false,
       success: function(data) { $.extend(strings,data); } });

function lang(s) {
if(strings && strings[s]) return strings[s];
else return s ;
}

