// public/core.js
var macAddressTool = angular.module('webTool', []);

var socket = io();

socket.on('console req', function(res) {
	$('#con').append(res);
});

function mainController($scope, $http) {
	$( "#macaddr" ).draggable();
	$( "#queryForm" ).draggable();
	$('#consoleLog').draggable();
	//global vars ftw
	var prefix = "";
	$scope.isAuth = false;
	$scope.users = [{userName: ''}];
	$scope.userProps = [{whenCreated: '', PasswordExpired: '', PasswordLastSet: '', Name: '', MemberOf: '', LastBadPasswordAttempt: '', LastLogonDate: '', Enabled: '', Created: '', EmailAddress: '', PSDssn: '', HasDefaultPassword: ''}];
	$scope.authPass = [{pass: ''}];
	$scope.addresses = [{address: ''}];
	// look at all these post requests
	// when submitting the add form, send the text to the node API
	$scope.createAddresses = function() {
		$('#followingBallsG').show('fade');
		$('.drop-return').hide('blind');
		$http.post('/network/addmac', $scope.addresses)
			.success(function(data) {
				$('#followingBallsG').hide('fade');
				$scope.addresses = data;
				console.log(data);
				$('.drop-return').show('blind');
			}) 
			.error(function(data) {
				console.error('Error: ' +data);
			});
	};

	$scope.getConsole = function() {
		socket.emit('console req', 'please');
	}

	$scope.doTheThing = function(event, index) {
		if (event.keyCode == 13) {
			$scope.showPass();
		}
	}

	$scope.doTheOtherThing = function(event, index) {
		if (event.keyCode == 13) {
			$scope.postName();
		}
	}

	$scope.showConsole = function() {
		$('#con').text('');
		socket.emit('console req', 'please');
		$('#console').show('fade');
	}

	$scope.showPass = function() {
		$('#passDialog').show('fade');
		$('#authText').focus();
	}

	$scope.showMac = function() {
		$('#macaddr').show('fade');
	}

	$scope.hide = function(id) {
		$('#' + id).hide('fade');
	}

	$scope.postName = function() {
		$scope.authPass[0].pass = $('#authText').val();
		console.log($scope.authPass);
		$('#followingBallsG').show('fade');
		$('#displayProps').hide('fade');
		$('#passDialog').hide('fade');

		$http.post('/auth', $scope.authPass)
			.success(function (data) {
				if (data === "true") {
					console.log(data);
					$scope.isAuth = true;
					$http.post('/adprop', $scope.users)
						.success(function(data) {
							$('#followingBallsG').hide('fade');
							$('#queryForm').hide('fade');
							$scope.userProps = data;
							$scope.userProps.MemberOf = $scope.userProps.MemberOf.replace(/(\r\n|\n|\r)/gm, '');
							$scope.userProps.MemberOf = $scope.userProps.MemberOf.replace(/(CN)/g, '');
							$scope.userProps.MemberOf = $scope.userProps.MemberOf.replace(/(DC=)/g, '');
							$scope.userProps.MemberOf = $scope.userProps.MemberOf.replace(/[\[\]']+/g, '');
							$scope.userProps.MemberOf = $scope.userProps.MemberOf.replace(/,"/g, ', "');
							//$scope.userProps.MemberOf = $scope.userProps.MemberOf.replace(/[^a-zA-Z0-9- ,]/g, '');
							
							console.log(data);
							$('#displayProps').show('fade');
						}) 
						.error(function(data) {
							console.error('Error: ' +data);
						});
				} else {
					$('#prefixDialog').show('fade');
					$('#prefixDialog').text('Incorrect password.');
				}
			})
			.error(function(data) {
				console.error('Error: ' +data);
			});
		
	};

	$scope.closeReturn = function( ){
		$('#displayProps').hide('fade');
		$('#queryForm').show('fade');
	}

	$scope.showQuery = function () {
		$('#queryDB').show('fade');
		$('#uName').focus();
	}

	$scope.startTime = function() {
		function time() {
		    var today = new Date();
		    var h = today.getHours();
		    var m = today.getMinutes();
		    var s = today.getSeconds();
		    m = checkTime(m);
		    s = checkTime(s);
			var todaysDate = new Date();
			var dd = today.getDate();
			var mm = today.getMonth()+1; //January is 0!
			var yyyy = today.getFullYear();

			if (dd < 10) {
			    dd = '0' + dd;
			} 

			if (mm < 10) {
			    mm = '0' + mm;
			} 

			todaysDate = mm + '/' + dd + '/' + yyyy;

			$('#clock').text(h+":"+m+":"+s+" - " +todaysDate);
			var t = setTimeout(function(){time()},500);
		}
		function checkTime(i) {
		    if (i < 10) {
		    	i = "0" + i
		    };  // add zero in front of numbers < 10

		    return i;
		}
		time();
	}

	$scope.dismiss = function() {
		$('#passDialog').hide('fade');
	};

	//Called when a input is typed into
	$scope.checkAddress = function(address, event, index) {
		if (event.keyCode == 8 && address.address.length == 0 && $scope.addresses.length > 1) {
			$scope.addresses.splice(index, 1);
			$('.form-control')[index - 1].focus();
			return;
		}
		if (event.keyCode == 13) {
			$scope.createAddresses();
		}
		if(event.keyCode >= 48 && event.keyCode <= 90 || event.keyCode >= 96 && event.keyCode <= 111 || event.keyCode >= 186 && event.keyCode <= 222 || event.keyCode == 8 || event.keyCode == 46) {
			address = $scope.cleanAddress(address);
			if (address.note) {
				$('.drop-return').hide('blind');
				address.note = null;
			}
		}
	};
	//When an input is created, focus it
	$scope.focusInput = function(address) {
		$('.form-control').last().focus();

		if (address) {
			address = $scope.cleanAddress(address);
		}
	};

	//Add an address to the array
	$scope.addAddress = function(address) {
		$scope.addresses.push( {address: address} );
	};

	$scope.removeAddress = function(address, event, index) {
		if (index !== 0) { //cannot remove first address
			$scope.addresses.splice(index, 1);
		} else { //perhaps user just wants that entry cleared
			address.address = null; 
		}
	}

	// Function to clean up mess in pasted mac addresses
	$scope.cleanAddress = function(address) { 
		//Replace incorrect characters, prevent incorrect character from being entered
		if (address.address) {
			address.address = address.address.toLowerCase();
			address.address = address.address.replace(/ /g, '');
			address.address = address.address.replace(/:/g, '');
			address.address = address.address.replace(/l/g, '1');
			address.address = address.address.replace(/o/g, '0');
			address.address = address.address.replace(/i/g, '1');
			address.address = address.address.replace(/[^a-f0-9]/g, '');
			if (address.address.length == 12) {
				address.valid = true;
			} else if (address.address.length > 12) {
				$scope.addAddress(address.address.substr(12, address.address.length));
				address.address = address.address.substr(0, 12);
			}
			
			return address;
		}
	}
}