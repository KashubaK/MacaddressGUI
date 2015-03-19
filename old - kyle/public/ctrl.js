var webToolControllers = angular.module('webToolControllers', []);

webToolControllers.controller('toolCtrl', ['$scope', '$http',
function ($scope, $http) {
	$http.get('/addmac').success(function(data) {
		$('#test').html(data);
	});
}]);