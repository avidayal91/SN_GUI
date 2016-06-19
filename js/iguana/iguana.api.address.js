var Iguana = (function(Iguana, $, undefined){
	"use strict";

	function IguanaAddress(rawAddress) {
		if (rawAddress === undefined)
			throw new Error("Address must be defined");
		
		this.rawAddress = rawAddress;
		
		this.getRawAddress = function () { return rawAddress; }
			
		this.getDisplayAddress = function() { return Iguana.constants.ADDRESS_PREFIX + rawAddress; }
	}

	Iguana.Addressing = {
		fromDisplayToRaw: function(displayAddress) {
			var address = displayAddress;
			if (address.length > Iguana.constants.RAW_ADDRESS_LENGTH || address.startsWith(Iguana.constants.ADDRESS_PREFIX))
				address = address.substr(Iguana.constants.ADDRESS_PREFIX.length, address.length - Iguana.constants.ADDRESS_PREFIX.length);

			return address;
		},
		validateRawAddress: function(rawAddress) {
			return Iguana.constants.MAINNET_ADDRESS_REGEXP.test(rawAddress);
		},
		validateDisplayAddress: function(displayAddress) {
			var address = this.fromDisplayToRaw(displayAddress);

			return this.validateRawAddress(address);
		},
		fromRawAddress: function(rawAddress) {
			if (!this.validateRawAddress(rawAddress))
				throw new Error("Raw address is malformed");

			return new IguanaAddress(rawAddress);
		},
		fromDisplayAddress: function(displayAddress) {
			if (!this.validateDisplayAddress(displayAddress))
				throw new Error("Display address is malformed");

			return new IguanaAddress(this.fromDisplayToRaw(displayAddress));
		}
	};

}(Iguana || {}, jQuery));