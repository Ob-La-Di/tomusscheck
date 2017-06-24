var request  = require('request-promise');
var cheerio = require('cheerio');
var parseString = require('xml2js').parseString;
var notifier = require('node-notifier');
var prompt = require('prompt');
var Promise = require('bluebird');

prompt = Promise.promisify(prompt.get);
parseString = Promise.promisify(parseString);

var url;

var isInArray = function(arrayI, i) {
    for(var ii in arrayI){
        if(arrayI[ii].title[0] == i.title[0]){
            return true;
        }
    }
    return false;
};

var checkXML = function(items, url) {
    console.log('check');
    request.get(url).then((res) => {
        return parseString(res);
        
    }).then(function(result){
        let newItems = result.rss.channel[0].item;
        for(var i in newItems){
            if(!isInArray(items, newItems[i])){
                console.log(newItems[i].title[0]);
                notifier.notify({
                    title: newItems[i].title[0]
                });
            }
        }
    });
};

Promise.resolve(process.argv[2]).then(function(url){
    if(!url) {
        return prompt('url : ');
    }
    return url;
}).then(function(rssUrl){
    url = rssUrl;
    return request.get(rssUrl);
}).then(function(res) {
    return parseString(res);
}).then(function(items){
    setInterval(
        checkXML.bind(null, items.rss.channel[0].item, url), 
        60000
    );
}).catch(function(e){
    console.error('boloss', e);
});