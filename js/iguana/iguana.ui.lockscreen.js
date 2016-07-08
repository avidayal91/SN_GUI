var Iguana = (function(Iguana, $, undefined) {
	"use strict";

	if (Iguana.UI === undefined)
		Iguana.UI = {};

	Iguana.UI.registerForm = {
		id: 'register-form',
		validator: undefined,
		getForm : function() {
			return $('#' + Iguana.UI.registerForm.id);
		},
		setupValidation: function() {
			Iguana.UI.registerForm.validator = Iguana.UI.registerForm.getForm().validate({
				errorClass: 'wInput-error',
				rules: {
					walletSeed: {
						required: true,
						minlength: 25
					},
					walletPassword: {
						required: true,
						minlength: 8,
						// password: true
					},
					walletPasswordConfirm: {
						equalTo: '#walletPassword'
					}
				},
				messages: {
					walletSeed: {
						required: 'Wallet seed is required',
						minlength: 'Wallet seed is too short. A secure wallet seed should contain more than 25 characters'
					},
					walletPassword: {
						required: 'A password is required to store your seed safely',
						minlength: 'Password must be 8 characters or longer'
					},
					walletPasswordConfirm: {
						equalTo: 'Passwords do not match'
					}
				}
			});
		},
		isValid : function() { return this.getForm().valid(); }
	};

 //Import Iguana Account

	$("#import_account").on("click", function(e) {
		e.preventDefault();

		$("#import_account").hide();
		$("#create_account").hide();
		$("#ImportAccHeader").show();
		$("#AccHeader").hide();
		$("#wavesAccounts").addClass('noDisp');

		$("#step2_reg").show();
		$("#walletSeed").val('');
		$("#publicKeyLockscreen").html('');
		$("#privateKeyLockscreen").html('');
		$("#addresLockscreen").html('');

	});

	//Create new Iguana Acount
	$("#create_account").on("click", function(e) {
		e.preventDefault();

		$("#import_account").hide();
		$("#create_account").hide();
		$("#generateKeys").hide();
		$(".divider-1").hide();
		$("#AccHeader").hide();
		$("#NewAccHeader").show();
		$("#wavesAccounts").addClass('noDisp');

		$("#step2_reg").show();
		// $("#login-wPop-new").modal("show");

		var passphrase = PassPhraseGenerator.generatePassPhrase();
		$("#walletSeed").val(passphrase);

		var publicKey = Iguana.getPublicKey(passphrase);
		var privateKey = Iguana.getPrivateKey(passphrase);

		$("#publicKeyLockscreen").html(publicKey);
		$("#privateKeyLockscreen").html(privateKey);

		// $("#close_create_account_modal").on("click", function(){
		//     $.modal.close();
		// });

		// Iguana.apiRequest(Iguana.api.waves.address, publicKey, function(response) {
		//     $("#addresLockscreen").html(Waves.Addressing.fromRawAddress(response.address).getDisplayAddress());
		// });
	});


	$("#generateKeys").on("click", function(e) {
		e.preventDefault();

		var walletSeed = $("#walletSeed").val();

		var publicKey = Iguana.getPublicKey(walletSeed);
		var privateKey = Iguana.getPrivateKey(walletSeed);

		$("#publicKeyLockscreen").html(publicKey);
		$("#privateKeyLockscreen").html(privateKey);

		// Iguana.apiRequest(Waves.api.waves.address, publicKey, function(response) {
		//     $("#addresLockscreen").html(Waves.Addressing.fromRawAddress(response.address).getDisplayAddress());
		// });
	});

	$("#generateRandomSeed").on("click", function(e) {
		e.preventDefault();

		var passphrase = PassPhraseGenerator.generatePassPhrase();
		$("#walletSeed").val(passphrase);

		var publicKey = Iguana.getPublicKey(passphrase);
		var privateKey = Iguana.getPrivateKey(passphrase);

		$("#publicKeyLockscreen").html(publicKey);
		$("#privateKeyLockscreen").html(privateKey);

		// Waves.apiRequest(Waves.api.waves.address, publicKey, function(response) {
		//     $("#addresLockscreen").html(Waves.Addressing.fromRawAddress(response.address).getDisplayAddress());
		// });
	});

	$(".goBack").on("click", function(e) {
		e.preventDefault();
		if(Iguana.hasLocalStorage) {
			location.reload();
		} else {
			chrome.runtime.reload();
		}
	});

	$("#registerSeed").on("click", function(e) {
		e.preventDefault();

		if (!Iguana.UI.registerForm.isValid())
			return;

		var passphrase = $("#walletSeed").val();
		var publicKey = $("#publicKeyLockscreen").html();
		var privateKey = $("#privateKeyLockscreen").html();
		// var address = Iguana.Addressing.fromDisplayAddress($("#addresLockscreen").html());
		var address = "";
		var name = $("#walletName").val();
		var password = $("#walletPassword").val();
		var cipher = Iguana.encryptWalletSeed(passphrase, password).toString();
		var checksum = converters.byteArrayToHexString(Iguana.simpleHash(converters.stringToByteArray(passphrase)));

		//Signup request
		var req = {
			"agent": "SuperNET", 
			"method": "login", 
			"handle": name, 
			"password": password, 
			"passphrase": passphrase
		};
		if(Iguana.hasLocalStorage) {
			Iguana.callRPC(req, function(req, res){

				Iguana.handle = res.handle;
				Iguana.btc = res.BTC;
				Iguana.btcd = res.BTCD;
				// Iguana.btc_addr = [res.BTCD];
				// Iguana.contacts = [];
				var accountData = {
					name: name,
					cipher: cipher,
					checksum: checksum,
					publicKey: publicKey,
					handle: res.handle,
					// address: Iguana.btcd,
					address_btc: Iguana.btc,
					address_btcd: Iguana.btcd
				};

				if(Iguana.hasLocalStorage) {

					var currentAccounts = localStorage.getItem('Iguana'+Iguana.network);
						currentAccounts = JSON.parse(currentAccounts);

					if(currentAccounts !== undefined && currentAccounts !== null) {

						currentAccounts.accounts.push(accountData);
						localStorage.setItem('Iguana'+Iguana.network, JSON.stringify(currentAccounts));
						$("#wavesAccounts").append('<br><b>'+accountData.name+'</b> ' + address.getDisplayAddress());

					} else {
						var accountArray = { accounts: [accountData] };
						localStorage.setItem('Iguana'+Iguana.network, JSON.stringify(accountArray));
						$("#wavesAccounts").append('<br><b>'+accountData.name+'</b>' + address.getDisplayAddress());
					}

				}
				else {
					$.growl.notice({ message: "No local storage access!" });
					// Iguana.getAccounts(function(currentAccounts) {
					// 	if(currentAccounts !== '') {
					// 		currentAccounts = currentAccounts['WavesAccounts'];
					// 		currentAccounts.accounts.push(accountData);
					// 		chrome.storage.sync.set({'WavesAccounts': currentAccounts}, function() {
					// 			// Notify that we saved.
					// 			$.growl.notice({ message: "Added Account!" });
					// 			$("#wavesAccounts").append('<br><b>'+accountData.name+'</b> ' + address.getDisplayAddress());
					// 		});
					// 	} else {
					// 		var accountArray = { accounts: [accountData] };
					// 		chrome.storage.sync.set({'WavesAccounts': accountArray}, function() {
					// 			// Notify that we saved.
					// 			$.growl.notice({ message: "Added Account!" });
					// 			$("#wavesAccounts").append('<br><b>'+accountData.name+'</b> ' + address.getDisplayAddress());
					// 		});
					// 	}
					// });
				}

				accountData.firstTime = true;
				accountData.password = password;
				accountData.passphrase = passphrase;
				// passphrase = '';

				Iguana.Login(accountData);

			});
		}
		else {
			$.growl.notice({ message: "No local storage access!" });
		}
	});

	Iguana.UI.registerForm.setupValidation();

	return Iguana;

}(Iguana || {}, jQuery));
