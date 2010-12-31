function(doc) {
    if(doc.timestamp) {
        var item = {id: doc._id, user: doc.user, title: doc.title, description: doc.description,tags: doc.tags, url: doc.url };
        emit(doc.timestamp,item);
    }
}
