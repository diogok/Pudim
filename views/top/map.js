function(doc) {
    emit(doc.url, {n:1, tags: doc.tags});
}
