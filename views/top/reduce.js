function(key, values, re) {
    return {sum: sum( values.map(function(i){return i.n;} )),
            tags: values.map(function(i){return i.tags;})};
}
