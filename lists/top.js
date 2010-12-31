function(head, req) {
    var n = req.query.n || 25 ;
    var row, tops = {}; 

    while(row = getRow()) {
        var tags = [];
        for(var g in row.value.tags) {
            for(var t in row.value.tags[g]) {
                tags.push(row.value.tags[g][t]);
            }
        }
        tops["t" + row.value.sum + row.key] = {url: row.key, tags: tags.slice(0,15) } ;
    }

    var result = [];
    start({"headers":{"Content-Type":"application/json"}});
    var i = 0 ;
    for(var k in tops) {
        result[i] = tops[k];
        i++
    }

    return toJSON(result.reverse().slice(0,n));

}
