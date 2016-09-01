'use strict';
app.controller('topPlayersCtrl', function ($scope, $modal, $filter, Data) {
	Data.get('topplayers').then(function(data){
        $scope.players = data.data;
    });        
 $scope.columns = [
                    {text:"S.No.",predicate:"sno",sortable:false},
					{text:"Player Name",predicate:"name",sortable:true},
					{text:"Played",predicate:"totalplayed",sortable:true},
					{text:"Won",predicate:"totalwins",sortable:true},					
					{text:"Points",predicate:"totalpoints",sortable:true},
					{text:"Win Points",predicate:"winpoints",sortable:true},
                ];

});
app.controller('matchesCtrl', function ($scope, $modal, $filter, Data) {
    $scope.match = {};
    Data.get('matches').then(function(data){
        $scope.matches = data.data;
    });
	Data.get('players').then(function(data){
        $scope.players = data.data;
    });    
    $scope.deleteMatch = function(match){
        if(confirm("Are you sure to remove the match")){
            Data.delete("matches/"+match.id).then(function(result){
                $scope.matches = _.without($scope.matches, _.findWhere($scope.matches, {id:match.id}));
            });
        }
    };
    $scope.open = function (p,size) {
        var modalInstance = $modal.open({
          templateUrl: 'partials/matchrEdit.html',
          controller: 'matchEditCtrl',
          size: size,
          resolve: {
            item: function () {
              return p;
            }
          }
        });
        modalInstance.result.then(function(selectedObject) {
            if(selectedObject.save == "insert"){
                $scope.matches.push(selectedObject);
                $scope.matches = $filter('orderBy')($scope.matches, 'id', 'reverse');
            }else if(selectedObject.save == "update"){
				console.log(selectedObject);
                p.name1 = selectedObject.name1;
				p.player1 = selectedObject.player1;
				p.player1_points = selectedObject.player1_points;
				p.name2 = selectedObject.name2;
				p.player2_points = selectedObject.player2_points;
				p.player2 = selectedObject.player2;
				p.date = selectedObject.date;
				p.result= selectedObject.result;
				p.winner_id= parseInt(selectedObject.winner_id);
				
            }
        });
    };
    
 $scope.columns = [
                    {text:"Player 1",predicate:"name",sortable:true},
					{text:"Points",predicate:"name",sortable:true},
					{text:"Player 2",predicate:"name",sortable:true},
					{text:"Points",predicate:"name",sortable:true},
                    {text:"Date",predicate:"date",sortable:true},
					{text:"Result",predicate:"result",sortable:true},
					{text:"Winner",predicate:"winner_id",sortable:true},
                    {text:"Action",predicate:"",sortable:false}
                ];

});

app.controller('matchEditCtrl', function ($scope, $modalInstance, item, Data) {
		
		Data.get('players').then(function(data){
			$scope.players = data.data;
		});
		
		$scope.match = angular.copy(item);
        $scope.cancel = function () {
            $modalInstance.dismiss('Close');
        };
        $scope.title = (item.id > 0) ? 'Edit Match [ID: '+item.id+']' : 'Add Match';
        $scope.buttonText = (item.id > 0) ? 'Update Match' : 'Add New Match';

        var original = item;
        $scope.isClean = function() {
            return angular.equals(original, $scope.match);
        }
        $scope.saveMatch = function (match) {
			match.name1= $("#player1 option:selected").html();
			match.name2= $("#player2 option:selected").html();
            match.uid = $scope.uid;
            if(match.id > 0){
                Data.put('matches/'+match.id, match).then(function (result) {
                    if(result.status != 'error'){
                        var x = angular.copy(match);
                        x.save = 'update';
						console.log(result);
                        $modalInstance.close(x);
                    }else{
                        console.log(result);
                    }
                });
            }else{
                Data.post('matches', match).then(function (result) {
                    if(result.status != 'error'){
                        var x = angular.copy(match);
                        x.save = 'insert';
                        x.id = result.data;
                        $modalInstance.close(x);
                    }else{
                        console.log(result);
                    }
                });
            }
        };
});


app.controller('playersCtrl', function ($scope, $modal, $filter, Data) {
    $scope.player = {};
    Data.get('players').then(function(data){
        $scope.players = data.data;
    });
    $scope.changePlayerStatus = function(player){
        player.active = (player.active==1 ? 0 : 1);
        Data.put("players/"+player.id,{active:player.active});
    };
    $scope.deletePlayer = function(player){
        if(confirm("Are you sure to remove the player")){
            Data.delete("players/"+player.id).then(function(result){
                $scope.players = _.without($scope.players, _.findWhere($scope.players, {id:player.id}));
            });
        }
    };
    $scope.open = function (p,size) {
        var modalInstance = $modal.open({
          templateUrl: 'partials/playerEdit.html',
          controller: 'playerEditCtrl',
          size: size,
          resolve: {
            item: function () {
              return p;
            }
          }
        });
        modalInstance.result.then(function(selectedObject) {
            if(selectedObject.save == "insert"){
                $scope.players.push(selectedObject);
                $scope.players = $filter('orderBy')($scope.players, 'id', 'reverse');
            }else if(selectedObject.save == "update"){
                p.name = selectedObject.name;
            }
        });
    };
    
 $scope.columns = [
                    {text:"ID",predicate:"id",sortable:true,dataType:"number"},
                    {text:"Name",predicate:"name",sortable:true},
                    {text:"Active",predicate:"active",sortable:true},
                    {text:"Action",predicate:"",sortable:false}
                ];

});



app.controller('playerEditCtrl', function ($scope, $modalInstance, item, Data) {

		$scope.player = angular.copy(item);
        
        $scope.cancel = function () {
            $modalInstance.dismiss('Close');
        };
        $scope.title = (item.id > 0) ? 'Edit Player' : 'Add Player';
        $scope.buttonText = (item.id > 0) ? 'Update Player' : 'Add New Player';

        var original = item;
        $scope.isClean = function() {
            return angular.equals(original, $scope.player);
        }
        $scope.savePlayer = function (player) {
            player.uid = $scope.uid;
            if(player.id > 0){
                Data.put('players/'+player.id, player).then(function (result) {
                    if(result.status != 'error'){
                        var x = angular.copy(player);
                        x.save = 'update';
                        $modalInstance.close(x);
                    }else{
                        console.log(result);
                    }
                });
            }else{
                player.active = 1;
                Data.post('players', player).then(function (result) {
                    if(result.status != 'error'){
                        var x = angular.copy(player);
                        x.save = 'insert';
                        x.id = result.data;
                        $modalInstance.close(x);
                    }else{
                        console.log(result);
                    }
                });
            }
        };
});