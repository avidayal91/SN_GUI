var Iguana = (function(Iguana, $, undefined){
	Iguana.constants = {
		"RAW_ADDRESS_LENGTH" : 35,
        "ADDRESS_PREFIX": "IG",
        "INITIAL_NONCE": 0,
        "MAINNET_ADDRESS_REGEXP": /^[a-zA-Z0-9]{35}$/

	}
	
	return Iguana;
	
}(Iguana || {}, jQuery));