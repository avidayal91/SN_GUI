var Iguana = (function(Iguana, $, undefined){
	"use strict";

	var URL = Iguana.server;

	Iguana.callRPC = function(request, callback){
		if(typeof(request) != 'object')
			request = JSON.parse(request);
		// console.log("Requesting..."+ request);

		if(!Iguana.validateRequest(request)){
			//show alert
			console.log();
		}
		else{
			$.support.cors = true;
			URL = getURLFromRequest(request);
			console.log("Calling.... "+URL + " with request "+ request);
			$.ajax({
				crossDomain: true,
				url: URL,
				dataType: "json",
				type: "POST",
				timeout: 30000,
				data: JSON.stringify(request)
			})
			.done(function(response){
				console.log("Request: "+ request+ " -> SuccessResponse: "+ response);
				if(response.error === undefined){
					if(callback){
						callback(request, response);
					}
				}
				else{
					console.log(response.error);
					alert(response.error);
				}
			})
			.fail(function(xhr, status, err){
				console.log("Request: "+ request+ " -> ErrorResponse: "+ err);
				// if(callback){
				// 	callback(request, err);
				// }
			});
		}
	}

	Iguana.validateRequest = function(request){
		if(typeof(request.method) == 'undefined'){
			console.log("Request method not specified.");
			return false;
		}
		return true;
	}

	function getURLFromRequest(request){
		var url = Iguana.server;
		url += request.agent + "/";
		url += request.method + "/";
		return url;
	}

	return Iguana;
	
}(Iguana || {}, jQuery));

