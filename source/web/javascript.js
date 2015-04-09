var socket = io('https://addmac.psd401.net/');




// This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
function addMac() {
	var self = this;

	this.addressFocus = ko.observable(false);
	this.macAddressResults = ko.observable();
	this.macAddressDisplay = ko.observable();
	this.macw	wqAddress = ko.computed(function(){

	}, this);
    this.macAddressRequest = ko.observableArray(['']);
    this.requestingMacAddress = ko.observable(false);

    $('.osx-address').blur(function() {
		self.addressFocus(false);

		$('.background').css({
    		'-webkit-transform': 'scale(1)',
    		'-webkit-filter': 'blur(0px)'
    	});

    	$('.background-col').css({
    		'opacity': '0'
    	});
	})
	.focus(function() {
		self.addressFocus(true);

		$('.background').css({
    		'-webkit-transform': 'scale(1.05)',
    		'-webkit-filter': 'blur(5px)'
    	});

    	$('.background-col').css({
    		'opacity': '0.5'
    	});
	});

    this.macAddress.subscribe(function(value) {
    	
    });

	function setResultsVariable (data) 
	{
		this.requestingMacAddress = ko.observable(false);
		self.macAddressResults(JSON.stringify(data));
	}  

    this.postSingleAddress = function postAddress()
    {	
    	this.macAddressRequest.push(self.macAddress());
    	socket.emit('addMacAddress', self.macAddressRequest());
    	this.requestingMacAddress = ko.observable(true);
    }

	//SOCKET IO LISTENERS HERE
	socket.on('macAddressFinished', setResultsVariable); 
}


// Activates knockout.js
ko.applyBindings(new addMac());