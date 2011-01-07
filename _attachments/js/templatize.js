
(function($){

    var defaultValues = $.languageData || {};
    var templates = {} ;

    var getTemplate = function(name) {
        if(templates[name]) return templates[name];
        $.ajax({url:"templates/"+name+".html",
                async: false,
                success: function(template) { 
                    var html = $(template) ;
                    if($.translate) {
                        $("*",html).each(function(i,el) {
                                if(el.tagName.toLowerCase() == "input" || el.tagName.toLowerCase() == "textarea" ) return ;
                                var tag = $(el);
                                if(tag.html() != tag.text()) return ;
                                var tmp = tag.children().remove();
                                tag.html($.translate(tag.text())).append(tmp);
                            });
                    }
                    templates[name] = $("<div />").html(html).html().replace(/\%7B/g,"{") .replace(/\%7D/g,"}");
                }});
        return templates[name];
    }

    var templatize = function(name,data) {
        var info = data || defaultValues;
        return $.mustache(getTemplate(name),info);
    }

    $.templates = templates ;
    $.templatize = templatize ;
})(jQuery);
