var Iguana = (function(Iguana, $, undefined){
	"use strict";

	var URL = Iguana.server;

	Iguana.callRPC = function(request, callback){
		request = JSON.parse(request);
		console.log("Requesting..."+ request);

		if(!validateRequest(request)){
			//show alert
		}
		else{
			$.ajax({
				url: URL,
				method: "POST",
				data: request
			})
			.done(function(response){
				console.log("Request: "+ request+ " -> SuccessResponse: "+ response);
				if(callback){
					callback(request, response);
				}
			})
			.fail(function(xhr, status, err){
				console.log("Request: "+ request+ " -> SuccessResponse: "+ response);
				if(callback){
					callback(request, response);
				}
			});
		}
	}

	Iguana.validateRequest function(request){
		if(typeof(request.method) == 'undefined'){
			console.log("Request method not specified.");
			return false;
		}
		return true;
	}


	return Iguana;
	
}(Iguana || {}, jQuery));

