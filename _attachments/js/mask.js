 function mask(id) {
    var maskHeight = $(document).height();  
    var maskWidth = $(window).width();  
    var winH = $(window).height();  
    var winW = $(window).width();  
              
    $('#mask').css({'width':maskWidth,'height':maskHeight});  
    $('#mask').fadeTo("fast",0.8);
    $(id).css('top',  winH/2-$(id).height()/2);  
    $(id).css('left', winW/2-$(id).width()/2);  
    $(id).show();
 };  
     
 function unmask() {
     $('#mask').hide(); $('.window').hide();  
 };       
