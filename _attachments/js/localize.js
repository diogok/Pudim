
(function($) {
    var strings = {};
    var defaultLanguage = function() {
        var lang = navigator.language ? navigator.language : navigator.userLanguage ;
        lang = lang.replace(/_/, '-').toLowerCase();
        if (lang.length > 3) {
           lang = lang.substring(0, 3) + lang.substring(3).toUpperCase();
        }
        return lang ;
    }

    var loadLang = function(lang) {
        $.ajax({ url: "locales/"+ lang +".json",
               dataType: "json", async: false,
               success: function(data) { $.extend(strings,data); } ,
               error: function(a,b,c) { loadLang("en-US"); }});
    }


    var translate = function(s) {
        if(strings && strings[s]) return strings[s];
        else return s ;
    }


    $.language     = defaultLanguage() ;
    $.translate    = translate ;
    $.languageData = strings ;

    loadLang($.language) ;
})(jQuery);

