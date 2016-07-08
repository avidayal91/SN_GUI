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

			$.each(accounts.accounts, function(accountKey, accountDetails){
				var accountName = "";
				if(accountDetails.name != undefined){
					accountName = accountDetails.name;
				}

				try {
					// var accountAddress = Iguana.Addressing.fromRawAddress(accountDetails.address_btc).getDisplayAddress();
					var accountAddress = accountDetails.address_btc;
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

	           if(userAccounts !== null) {
	                
	                var accounts;
	                if(Iguana.hasLocalStorage) {
	                    accounts = JSON.parse(userAccounts);
	                } else {
	                    accounts = userAccounts;
	                }
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
							var decryptPassword = Iguana.decryptWalletSeed(accountDetails.cipher, password, accountDetails.checksum);
							if(decryptPassword) {
								accountDetails.passphrase = decryptPassword;
								var publicKey = Iguana.getPublicKey(decryptPassword);
								var privateKey = Iguana.getPrivateKey(decryptPassword);
								accountDetails.publicKey = publicKey;
								accountDetails.privateKey = privateKey;

								Iguana.Login(accountDetails);

								$("#errorPasswordLogin").html('');
							}
							else {
								$.growl.error({ message: "Wrong password! Please try again." });
							}
						}
					});
					$(".submitLoginAccount").on("click", function() {

						var password = $("#loginPassword").val();

						var decryptPassword = Iguana.decryptWalletSeed(accountDetails.cipher, password, accountDetails.checksum);

						if(decryptPassword) {
							accountDetails.passphrase = decryptPassword;

							var publicKey = Iguana.getPublicKey(decryptPassword);
							var privateKey = Iguana.getPrivateKey(decryptPassword);
							accountDetails.publicKey = publicKey;
							accountDetails.privateKey = privateKey;
							Iguana.Login(accountDetails);
							$("#errorPasswordLogin").html('');
						} else {
							$.growl.error({ message: "Wrong password! Please try again." });
						}

					});
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

	Iguana.Login = function(accountDetails) {
		Iguana.passphrase = accountDetails.passphrase;
		Iguana.password = accountDetails.password;
		Iguana.handle = accountDetails.username;
		Iguana.address_btc = accountDetails.address_btc;
		Iguana.address_btcd = accountDetails.address_btcd;

        $("#wavesAccountAddress").html('<span class="clipSpan" id="wavesAccountAddressClip" data-clipboard-text="'+
            Iguana.address_btc+'" style="cursor: pointer; cursor: hand;">'+Iguana.address_btc+'</span>');

		var req = {
			"agent": "SuperNET", 
			"method": "login", 
			"handle": Iguana.handle, 
			"password": Iguana.password, 
			"passphrase": Iguana.passphrase
		};

		Iguana.callRPC(req, function(req, res){
			console.log(res);
			Iguana.handle = res.handle;
			Iguana.btc = res.BTC;
			Iguana.btcd = res.BTCD;
			// Iguana.btc_addr = [res.data.BTCD];
			// Iguana.contacts = [];

            $("#lockscreen").fadeOut(500);
            $("#lockscreenTable").fadeOut(500);
            $("#wrapper").fadeIn(1300);

		});
	}

    Iguana.logout = function () {
        Iguana = '';
        window.location.href = window.location.pathname;
    }

	return Iguana;

}(Iguana || {}, jQuery));