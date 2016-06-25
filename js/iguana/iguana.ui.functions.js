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

		   $(".loginAccount").on("click", function(e) {
				e.preventDefault();

				$("#import_account").hide();
				$("#create_account").hide();
				var accountId = $(this).data('id');
				$('.loginAccountDiv').hide();
				$(this).parent().show();
				$("#register").css("display", "none");

				var accountDetails = accounts.accounts[accountId];

				$("#loginAccountDiv").remove();

				var submitButton = '<button class="submitLoginAccount wButton fade">SUBMIT</button>';
				var backButton = '<button class="goBack wButton fade tooltip-1" title="Return to the previous step.">BACK</button>';
				var divider2 = '<span class="divider-2"></span>';

			   	$(this).parent().after("<div id='loginAccountDiv'>PASSWORD<br/><input type='password' id='loginPassword' class='wInput' autofocus><br/>"+submitButton+""+divider2+""+backButton+"<br/><div id='errorPasswordLogin' style='display: none;'></div></div>");
			  	$(".goBack").on("click", function(e) {
					e.preventDefault();
					location.reload();
			   	});

				$("#loginPassword").on("keyup", function(e) {
					if(Iguana.isEnterKey(e.keyCode)){
				        var password = $("#loginPassword").val();
				        // var decryptPassword = Waves.decryptWalletSeed(accountDetails.cipher, password, accountDetails.checksum);
				        Iguana.Login();
					}
				});
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

	Iguana.Login = function(accountDetails) {
		Iguana.passphrase = accountDetails.passphrase;
		Iguana.password = accountDetails.password;
		Iguana.handle = accountDetails.username;
		var req = {
			"agent": "SuperNET", 
			"method": "login", 
			"handle": Iguana.handle, 
			"password": Iguana.password, 
			"passphrase": Iguana.passphrase
		};

		Iguana.callRPC(req, function(req, res){
			console.log(res);
			Iguana.handle = res.data.handle;
			Iguana.btc = res.data.BTC;
			Iguana.btcd = res.data.BTCD;
			Iguana.btc_addr = [res.data.BTCD];
			Iguana.contacts = [];
		});
	}

	Iguana.register = function(passPhrase, password){
		var account = createNewAccount(passPhrase, password);
		if(storeAccount(account)){
			Iguana.Login(account);
		}
	};

	Iguana.createNewAccount = function(passPhrase, password){
		var accountData = {};
		accountData["passPhrase"] = passphrase;
		accountData["publicKey"] = converters.byteArrayToHexString(getPublicKey(accountData["passPhrase"]));
		accountData["accountRS"] = getAccountIdFromPublicKey(accountData["publicKey"], true);
		accountData["key"] = key;
        accountData["cipher"] = encryptSecretPhrase(accountData["passPhrase"], key).toString();
        accountData["checksum"] = converters.byteArrayToHexString(simpleHash(converters.stringToByteArray(accountData["passPhrase"])));
        return accountData;
	}

    function getAccountIdFromPublicKey(publicKey, RSFormat) {
        var hex = converters.hexStringToByteArray(publicKey);

        _hash.init();
        _hash.update(hex);

        var account = _hash.getBytes();

        account = converters.byteArrayToHexString(account);

        var slice = (converters.hexStringToByteArray(account)).slice(0, 8);

        var accountId = byteArrayToBigInteger(slice).toString();

        if (RSFormat) {
            var address = new NxtAddress();

            if (address.set(accountId)) {
                return address.toString();
            } else {
                return "";
            }
        } else {
            return accountId;
        }
    }

    function encryptSecretPhrase(phrase, key) {
        var rkey = prepKey(key);
        return CryptoJS.AES.encrypt(phrase, rkey);
    }

    function decryptSecretPhrase(cipher, key, checksum) {
        var rkey = prepKey(key);
        var data = CryptoJS.AES.decrypt(cipher, rkey);

        if (converters.byteArrayToHexString(simpleHash(converters.hexStringToByteArray(data.toString()))) == checksum)
            return converters.hexStringToString(data.toString());
        else return false;
    }

    function prepKey(key) {
        var rounds = 1000;
        var digest = key;
        for (var i = 0; i < rounds; i++) {
            digest = converters.byteArrayToHexString(simpleHash(digest));
        }
        return digest;
    }

    function storeAccount(account) {
        var sto = [];
        var value = true;
        var accKey = "Iguana"+ Iguana.network;
        if (localStorage[accKey]) {
            sto = JSON.parse(localStorage[accKey]);

            var result = $.grep(sto, function(e){ return e.accountRS == account.accountRS; });

            if (result.length > 0) {
                $.growl("You already have that account listed.", {
                    "type": "danger",
                    "offset": 10
                });
                value = false;
            }
        }
        var acc = {};
        acc["accountRS"] = account["accountRS"];
        acc["publicKey"] = account["publicKey"];
        acc["cipher"] = account["cipher"];
        acc["checksum"] = account["checksum"];
        sto.push(acc);

        if(value) {
            localStorage[accKey] = JSON.stringify(sto);
        }
        return value;
    }

	return Iguana;

}(Iguana || {}, jQuery));