// public/core.js
var macAddressTool = angular.module('macAddressTool', []);

function mainController($scope, $http) {
	$scope.addresses = [{address: '', added: false, valid: true}];

	// when submitting the add form, send the text to the node API
	$scope.createAddresses = function() {
		$http.post('http://10.5.1.83/network/addmac', $scope.addresses)
			.success(function(data) {
				$scope.addresses = data;
				console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
		
	};


	//Called when a input is typed into
	$scope.checkAddress = function(address, event, index) {
		if (event.keyCode == 8 && address.address.length == 0 && $scope.addresses.length > 1) {
			$scope.addresses.splice(index, 1);
			$('.form-control')[index - 1].focus();
			return;
		}

		if(event.keyCode >= 48 && event.keyCode <= 90){
			address = $scope.cleanAddress(address);
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
	$scope.addAddress = function(address){
		$scope.addresses.push({address: address, added: false, valid: true});
	};


	// Function to clean up mess in pasted mac addresses
	$scope.cleanAddress = function(address) {
		if (address.address) {
			address.address = address.address.toLowerCase();
			address.address = address.address.replace(/ /g, '');
			address.address = address.address.replace(/:/g, '');
			address.address = address.address.replace(/l/g, '1');
			address.address = address.address.replace(/o/g, '0');
			address.address = address.address.replace(/i/g, '1');
			address.address = address.address.replace(/[^a-f0-9]/g, '');

			if (address.address.indexOf(/[^0-9]/g) == 11) {
				$scope.addAddress("");
			}

			if (address.address.replace(/[^a-f0-9]/g, '') !== address.address || address.address.length !== 12) {
				address.valid = false;
			} else {
				address.valid = true;
			}
		//address.address = address.address.replace(/[^a-f0-9]/g, '');
			if (!address.address.indexOf(/[^a-f0-9]/g)) {
				address.valid = false;
			}
			if (address.address.length >= 12) {
				$scope.addAddress(address.address.substr(12, address.address.length));
				address.address = address.address.substr(0, 12);
			}

			return address;
		}
	}
}