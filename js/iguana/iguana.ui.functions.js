var Iguana = (function(Iguana, $, undefined){
	"use strict";

	Iguana.setInitApp = function(userAccounts){
		$(".testnet").addClass('noDisp');
		$(".mainnet").removeClass('noDisp');

		if(userAccounts != null && userAccounts != undefined){
			var accounts;
			if(Iguana.hasLocalStorage){
				accounts = JSON.parse(userAccounts);
			}

			$each(accounts.accounts, function(accountKey, accountDetails){
				var accountName = "";
				if(accountDetails.name != undefined){
					accountName = accountDetails.name;
				}

                try {
                    var accountAddress = Iguana.Addressing.fromRawAddress(accountDetails.address).getDisplayAddress();
                    $("#iguanaAccounts").append('<p class="loginAccountDiv"><span class="loginAccount tooltip-1 fade" title="Log into this account." data-id="' + accountKey + '"> <br/> <b>' + accountName + '</b> <span class="divider-1"></span> <small>' + accountAddress + '</small></span><span class="clipSpan tooltip-1" title="Copy this address to the clipboard." data-clipboard-text="' + accountAddress + '"></span> <span class="divider-1"></span> <button class="removeAccount wButtonAlt fade tooltip-1" title="Remove this account from the list." data-id="' + accountKey + '"><span class="wButton-icon"><img src="img/wIcon_x.svg"></span>REMOVE</button></p> ');
                }
                catch (e) {
                    console.log('Skipping account: ' + accountName);
                }

			});
		}
	}

	Iguana.initApp = function() {
        if (!_checkDOMenabled()) {
            Iguana.hasLocalStorage = false;
        }
        else {
            Iguana.hasLocalStorage = true;
       	}

        $("#wrapper").hide();
        $("#lockscreen").fadeIn('1000');
        $("#lockscreenTable").fadeIn('1000');

        if(Iguana.hasLocalStorage) {
           var userAccounts = localStorage.getItem('Iguana'+Iguana.network);
           Iguana.setInitApp(userAccounts);
        }
        // else {
        //     Iguana.getAccounts(function(userAccounts) {
        //         Iguana.setInitApp(userAccounts['IguanaAccounts']);
        //     });
        // }

    }

    // Iguana.getAccounts = function(){

    // }

	return Iguana;
}(Iguana || {}, jQuery));