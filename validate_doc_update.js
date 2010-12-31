function(newDoc, oldDoc, userCtx) {
    function forbidden(message) {
        throw({forbidden: message});
    };
    function unauthorized(message) {
        throw({unauthorized: message});
    };
    function validate(required, optional) {
        for(var field in required) {
            if(!newDoc[field]) forbidden("The field "+ field + " is required.");
            if(typeof( newDoc[field] ) != required[field]) forbidden("The field "+ field +" must be a(n) "+ required[field]);
        }
        for(var property in newDoc) {
            var allowed = false;
            if(required[property] || optional[property]) allowed = true ;
            if(optional[property] && optional[property] != typeof(newDoc[property])) {
                forbidden("The field "+ property +" must be a(n) "+ optional[property]);
            }
            if(allowed == false) forbidden("The field "+ property +" is not allowed.");
        }
    };

    if(!userCtx.name) {
        unauthorized("Login first.");
    }

    if ( oldDoc && newDoc._deleted && oldDoc.user == userCtx.name) return;

    if(oldDoc && oldDoc.user != userCtx.name) {
        unauthorized("Not your bookmark.");
    }

    if(oldDoc && oldDoc.user != newDoc.user) {
        forbidden("Can not change bookmark owner.");
    }

    if(userCtx.name != newDoc.user) {
        unauthorized("Not your bookmark.");
    }

    if(oldDoc && oldDoc.timestamp ){
        newDoc.timestamp = oldDoc.timestamp;
    }

    validate({
                title: 'string',
                user: 'string',
                url: 'string',
                timestamp: 'number'
               },
               {
                   _id: 'string',
                   _revisions: 'object',
                   _rev: 'string',
                   _deleted: 'boolean',
                   description: 'string',
                   tags: 'object'
               });

   for(var key in newDoc.tags) {
       if(typeof(newDoc.tags[key]) != 'string') {
           forbidden('Malformed tags property.');
       }
   }

}
