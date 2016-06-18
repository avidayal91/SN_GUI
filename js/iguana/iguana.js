var Iguana = (function(Iguana, $, undefined){
	"use strict";
	//configurations data here
	Iguana.server = "127.0.0.1:7778";
	Iguana.hasLocalStorage = _checkDOMenabled();
    Iguana.network = "iguana-key";

	return Iguana;
})(Iguana || {}, jQuery);


function _checkDOMenabled() {
    var storage;
    var fail;
    var uid;
    try {
        uid = String(new Date());
        (storage = window.localStorage).setItem(uid, uid);
        fail = storage.getItem(uid) != uid;
        storage.removeItem(uid);
        fail && (storage = false);
    } 
    catch (exception) { }
    return storage;
}