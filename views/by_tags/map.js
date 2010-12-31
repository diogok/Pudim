function(doc) {
    if(doc.tags) {
        var item = {id: doc._id, user: doc.user, title: doc.title, description: doc.description,tags: doc.tags };
        for(var i in doc.tags) {
            emit(doc.tags[i],item);
        }
    }
}
