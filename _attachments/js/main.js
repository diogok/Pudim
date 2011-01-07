$(function(){

  // If come to add a bookmark
  var urlToAdd  = null;
  if(window.location.hash.substring(0,9) == "#/add/url") {
      urlToAdd = window.location.hash.substring(10);
  }

  // Load database
  var db = $.couch.db("pudim");
  var next = null ;
  var currentUser = null ;
  var currentBookmark = null;

  $('body').append($.templatize('header'));
  $('body').append($.templatize('tabs'));
  $('body').append($.templatize('side'));
  $('body').append("<div id='boxes'></div>");
  $('body').append("<div id='mask'></div>");
  $('#boxes').append($.templatize('login'));
  $('#boxes').append($.templatize('bookmark'));

  // Tab navigation
  $('div.tabs section > h3').click(function(){
      $.pathbinder.go("/" + $(this).parent().attr("id"));
  });

  // #Recent path binding
  $('div.tabs section#recent').bind('recent', function() {
      $('div.tabs section').removeClass('current');
      db.view("pudim/recent",{limit: 25, descending: true, success: 
          function(result) {
              if(result.rows.length < 1) {
                  $('#recent div div').html($.translate("No bookmarks for now."));
                  return; 
              }
              var docs = result.rows.map(function(row){return row.value;});
              for(var i in docs) {
                  docs[i].tags = docs[i].tags.map(function(tag){return {tag: tag};});
              }
              $('#recent div div').html($.templatize('bookmarkRow',{rows: docs , no_filter: true}));
          }}); $(this).closest('section').addClass('current');
      });
  $('div.tabs section#recent').pathbinder("recent","/recent");

  // #Top path binding
  $('div.tabs section#top').bind('top', function() {
      $('div.tabs section').removeClass('current');
      $(this).closest('section').addClass('current');
      db.list("pudim/top","top",{group: true, success: 
          function(docs) {
              if(docs.length < 1) {
                  $('#top div div').html($.translate( "No bookmarks for now.") );
                  return; 
              }
              for(var i in docs) {
                  docs[i].tags = docs[i].tags.map(function(tag){return {tag: tag};});
                  docs[i].title = docs[i].url.replace("http://","").replace("https://","");
              }
              $('#top div div').html($.templatize('bookmarkRow',{rows: docs, no_filter: true }));
          }});

  });
  $('div.tabs section#top').pathbinder("top","/top");

  // #Tag search binding
  $('div.tabs section#tag').bind('tag', function(e, params) {
        var tag = params.tag || $("#tag #tagged").html() ||  "-";
        $("#tagged").html(tag);
        $('div.tabs section').removeClass('current');
        $(this).closest('section').addClass('current');
        if(tag == "-") {
            $('#tag div div').html($.translate( "No bookmarks for now.") );
        } else {
            $("#tag div div").html("Loading...");
            db.view("pudim/by_tags",{limit: 25, key: tag, success: 
              function(result) {
                  if(result.rows.length < 1) $('#tag div div').html($.translate( "No bookmarks for now." ));
                  var docs = result.rows.map(function(row){return row.value;});
                  for(var i in docs) {
                      docs[i].tags = docs[i].tags.map(function(tag){return {tag: tag};});
                  }
                  $('#tag div div').html($.templatize('bookmarkRow',{rows: docs , no_filter: true}));
              }});
        }
  });
  $('div.tabs section#tag').pathbinder("tag","/tag/:tag");
  $('div.tabs section#tag').pathbinder("tag","/tag");
  
  // #User search binding
  $('div.tabs section#user').bind('user', function(e, params) {
        var user = params.user || $("#user #userid").html() ||  "-";
        $("#userid").html(user);
        $('div.tabs section').removeClass('current');
        $(this).closest('section').addClass('current');
        if(user == "-") {
            $('#user div div').html($.translate( "No bookmarks for now.") );
        } else {
            $("#user div div").html($.translate( "Loading...") );
            var url ;
            var key ;
            if(params.tag) {
                url = "pudim/by_user_tags";
                key = [user,params.tag];
            } else {
                url = "pudim/by_user";
                key = user ;
            }
            db.view(url,{limit: 25, key: key, success: 
              function(result) {
                  if(result.rows.length < 1) $('#user div div').html($.translate( "No bookmarks for now.") );
                  var docs = result.rows.map(function(row){return row.value;});
                  for(var i in docs) {
                      docs[i].tags = docs[i].tags.map(function(tag){return {tag: tag};});
                  }
                  $('#user div div').html($.templatize('bookmarkRow',{rows: docs, user_filter: user }));
              }});
        }
  });
  $('div.tabs section#user').pathbinder("user","/user/:user");
  $('div.tabs section#user').pathbinder("user","/user/:user/:tag");
  $('div.tabs section#user').pathbinder("user","/user");

  // #Signup points to #Your stuff
  $('#signup').click(function(){
      $.pathbinder.go("/your");
  });

  // #Your section path binding, retrieve your bookmarks or login/signup page
  $('div.tabs section#your').bind('your', function() {
        $('div.tabs section').removeClass('current');
        $(this).closest('section').addClass('current');
        $('#your div div').html($.translate( "Loading..." ));
        if(currentUser == null) {
            mask('#loginDialog');
            $('#logoutBt').hide();
        } else {
            $('#logoutBt').show();
            db.view("pudim/by_user",{key: currentUser, descending: true, success: function(result) {
              if(result.rows.length < 1) {
                  $('#your div div').html($.translate( "No bookmarks for now." ));
                  return; 
              }
              var docs = result.rows.map(function(row){return row.value;});
              for(var i in docs) {
                  docs[i].tags = docs[i].tags.map(function(tag){return {tag: tag};});
              }
              $('#your div div').html($.templatize('bookmarkRow',{rows: docs, user_filter: currentUser }));
            }});
        }
  });
  $('div.tabs section#your').pathbinder("your","/your");

  // Add a bookmark
  $('#addBt').click(function() {
          $.pathbinder.go("/add");
      });
  $('#addBt').bind("add",function(e, params) {
      unmask() ;
      if(currentUser == null) {
          next = window.location.hash.substring(1);
          if(next.substring(0,8) == "/add/url") {
              next = "/add/url/" + encodeURIComponent(next.substring(9));
          }
          $.pathbinder.go("/your");
          return ;
      }
      $("#url").val("");
      $("#title").val("");
      $("#description").val("");
      $("#tags").val("");
      $('#deleteBt').hide();
      currentBookmark = null;
      if(params.id) {
          mask("#loading");
          db.openDoc(params.id,{success: function(doc) {
                      unmask();
                      currentBookmark = doc ;
                      mask("#bookmarkDialog");
                      $("#url").val(doc.url);
                      $("#title").val(doc.title);
                      $("#description").val(doc.description);
                      $("#tags").val(doc.tags.join(" , "));
                      if(doc.user == currentUser) {
                          $('#deleteBt').show();
                      } else {
                          $('#deleteBt').hide();
                      }
                  },error: function(a,b,c) {
                      unmask();
                      alert($.translate( "Unable to load bookmark: " )+ $.translate( c ));
                  } });
      } else if(params.url) {
          mask('#bookmarkDialog');
          currentBookmark = null ;
          $("#url").val(params.url);
          $('#deleteBt').hide();
      } else {
          mask('#bookmarkDialog');
          currentBookmark = null ;
          $('#deleteBt').hide();
      }
  });
  $('#addBt').pathbinder("add","/add");
  $('#addBt').pathbinder("add","/add/url/:url");
  $('#addBt').pathbinder("add","/add/id/:id");

  $('#saveBt').click(function() {
          mask("#loading");
          if(currentBookmark && currentBookmark.user != currentUser) {
              currentBookmark = {};
          }
          currentBookmark  = currentBookmark || {};
          currentBookmark.url = $("#url").val();
          currentBookmark.title = $("#title").val();
          currentBookmark.description = $("#description").val();
          currentBookmark.tags = $("#tags").val().split(",").map(function(tag) {return tag.trim(); });
          currentBookmark.timestamp = new Date().getTime();
          currentBookmark.user = currentUser ;
          db.saveDoc(currentBookmark, {success: function() {
                      unmask();
                      currentBookmark = null;
                      $.pathbinder.go("/your");
                  }, error: function(a,b,c) {
                      unmask();
                      alert($.translate( "Could not save bookmark: " )+ $.translate( c  ));
                      $.pathbinder.go("/your");
                  }});
      });

  $('#deleteBt').click(function() {
          if(confirm($.translate( "Are you sure you want to delete " )+ currentBookmark.url +"?")){
          mask("#Loading");
          db.removeDoc(currentBookmark, {success: function() {
                      unmask();
                      $.pathbinder.go("/your");
                  }, error: function(a,b,c) {
                      unmask();
                      alert($.translate( "Could not delete bookmark: " )+ $.translate( c ));
                      $.pathbinder.go("/your");
                  }});
          }
      });

  // perform signup
  $('#signupBt').click(function() {
          unmask();
          mask("loadingDialog");
          var username = $("#username").val();
          var password = $("#password").val();
          $.couch.signup({name: username}, password, { success: function() {
                      unmask();
                      currentUser = username;
                      $.couch.login({name: username, password: password, error: function(){}});
                      $.pathbinder.go(next || "/your");
                  },
                  error: function(a,b,c) {
                      unmask();
                      currentUser = null;
                      alert($.translate( "Failed signup: " )+ $.translate( c ));
                      $.pathbinder.go("/recent");
                  }});
      });

  // perform login
  $('#loginBt').click(function() {
          unmask();
          mask("loadingDialog");
          var username = $("#username").val();
          var password = $("#password").val();
          $.couch.login({name: username, password: password, success: function() {
                      unmask();
                      currentUser = username;
                      $.pathbinder.go(next || "/your");
                  },
                  error: function(a,b,c) {
                      unmask();
                      currentUser = null;
                      alert($.translate( "Failed login: " )+ $.translate( c ));
                      $.pathbinder.go("/recent");
                  }});
      });


  $('#logoutBt').click(function() {
          unmask();
          mask("loadingDialog");
          $.couch.logout({success: function() {
                      unmask();
                      currentUser = null;
                      $('#logoutBt').hide();
                      $.pathbinder.go("/recent");
                  }});
      });

  // FIX this
  var addUrl = "javascript:window.location='http://"+ window.location.host + window.location.pathname +"#/add/url/'+ encodeURIComponent(window.location.protocol + '//'+ window.location.host + window.location.pathname )";

  $("#addBook").attr("href",addUrl);

  // Start user session, check login
  $.couch.session( {success: function(resp) {
          currentUser = resp.userCtx.name ;
          unmask();
          $('#mask').click(function () {  
              $(this).hide();  
              $('.window').hide();  
          }); 
          if(urlToAdd == null) {
              $.pathbinder.go( window.location.hash.substring(1) || "/recent");
          } else {
              var toGo = "/add/url/"+ encodeURIComponent(urlToAdd);
              $.pathbinder.go(toGo);
          }
      }});

  $('.window .close').click(function() { unmask(); });

});

