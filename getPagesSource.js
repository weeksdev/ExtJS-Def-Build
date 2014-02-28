var getData = function () {
    try {
        var innerText = document.body.innerText;
        //figure out if callback was specified and needs to be parsed from the response.
        var callback = RegExp(/\?.*callback=(.*)/).exec(document.URL)[1];
        //figure out the callback name.
        if (callback) {
            //determine if there is other params in the response to ignore
            if (callback.indexOf('&') != -1) {
                var loc1 = callback.indexOf('&');
                callback = callback.substring(0, loc1);
            }
            innerText = innerText.replace(callback + '(', '');
            innerText = innerText.substring(0, innerText.length - 2);
        }

        var obj = JSON.parse(innerText);
        return obj;
    }
    catch (ex) {
        return { hadError: true, exception: ex };
    }
}

function getJsonFromUrl() {
    var query = location.search.substr(1);
    var data = query.split("&");
    var result = {};
    for (var i = 0; i < data.length; i++) {
        var item = data[i].split("=");
        if(item[0]!='callback')
            result[item[0]] = decodeURIComponent(item[1]);
    }
    return result;
}

function isJsonP() {
    var callback = RegExp(/\?.*callback=(.*)/).exec(document.URL)[1];
    //figure out the callback name.
    if (callback) {
        //determine if there is other params in the response to ignore
        if (callback.indexOf('&') != -1) {
            var loc1 = callback.indexOf('&');
            callback = callback.substring(0, loc1);
        }
    }

    if (callback == '')
        return false;
    else
        return true;
}

chrome.extension.sendMessage({
    action: "getSource",
    source: getData(),
    extraParams: getJsonFromUrl(),
    isJsonP:isJsonP()
});
