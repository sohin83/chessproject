<?php
require '.././libs/Slim/Slim.php';
require_once 'dbHelper.php';

\Slim\Slim::registerAutoloader();
$app = new \Slim\Slim();
$app = \Slim\Slim::getInstance();
$db = new dbHelper();

/**
 * Database Helper Function templates
 */
/*
select(table name, where clause as associative array)
insert(table name, data as associative array, mandatory column names as array)
update(table name, column names as associative array, where clause as associative array, required columns as array)
delete(table name, where clause as array)
*/
$app->post('/users', function() use ($app) { 
    global $db;
	$data = json_decode($app->request->getBody());
	$condition=array('username'=>isset($data->username)?$data->username:'','password'=>isset($data->password)?md5($data->password):'');
	$rows = $db->select("users","id",$condition);
	if($rows["status"]=='success'){
		$rows["success"]=true;
	}else{
		$rows["success"]=false;
	}	
    echoResponse(200, $rows);
});
//Top Players
$app->get('/topplayers', function() { 
    global $db;
    $rows = $db->select2("players","id,name,(select count(*) from matches INNER JOIN results on results.match_id=matches.id where results.result>0 and (matches.player1=players.id or matches.player2=players.id)) as totalplayed,(select count(*) from results where winner_id=players.id group by winner_id) as totalwins,(select sum(result) from results where winner_id=players.id group by winner_id) as winpoints,(select sum(score) from points where player_id=players.id group by player_id) as totalpoints",array(),"ORDER BY winpoints DESC,totalpoints DESC");
    echoResponse(200, $rows);
});

//Matches
$app->get('/matches', function() { 
    global $db;
    $rows = $db->selectjoin("matches","results","results.match_id=matches.id","matches.id,result,winner_id,matches.date,matches.player1,matches.player2,(select name from players where id=matches.player1) as name1,(select name from players where id=matches.player2) as name2,(select score from points where match_id=matches.id and player_id=matches.player1 limit 1) as player1_points,(select score from points where match_id=matches.id and player_id=matches.player2 limit 1) as player2_points",array());
    echoResponse(200, $rows);
});

$app->post('/matches', function() use ($app) { 
    $data = json_decode($app->request->getBody());
	
	$match=array('player1'=>$data->player1,'player2'=>$data->player2,'date'=>$data->date);
    $mandatory = array('player1','player2','date');
	
    global $db;
    $rows = $db->insert("matches",(object)$match, $mandatory);
    if($rows["status"]=="success"){
		$points=array('match_id'=>$rows['data'],'player_id'=>$data->player1,'score'=>isset($data->player1_points)?$data->player1_points:0);
		$db->insert("points",(object)$points,array());
		$points=array('match_id'=>$rows['data'],'player_id'=>$data->player2,'score'=>isset($data->player2_points)?$data->player2_points:0);
		$db->insert("points",(object)$points,array());
		$result=array('match_id'=>$rows['data'],'winner_id'=>isset($data->winner_id)?$data->winner_id:0,'result'=>isset($data->result)?$data->result:0);
		$db->insert("results",(object)$result,array());
        $rows["message"] = "Match added successfully.";
	}
    echoResponse(200, $rows);
});

$app->put('/matches/:id', function($id) use ($app) { 
    $data = json_decode($app->request->getBody());
	$match=array('player1'=>$data->player1,'player2'=>$data->player2,'date'=>$data->date);
    $condition = array('id'=>$id);
    $mandatory = array();
    global $db;
    $rows = $db->update("matches", $match, $condition, $mandatory);
	$db->delete("points", array('match_id'=>$id));
	
	$points=array('match_id'=>$id,'player_id'=>$data->player1,'score'=>isset($data->player1_points)?$data->player1_points:0);
	$db->insert("points",(object)$points,array());
	$points=array('match_id'=>$id,'player_id'=>$data->player2,'score'=>isset($data->player2_points)?$data->player2_points:0);
	$db->insert("points",(object)$points,array());
	
	$db->delete("results", array('match_id'=>$id));
	
	$result=array('match_id'=>$id,'winner_id'=>isset($data->winner_id)?$data->winner_id:0,'result'=>isset($data->result)?$data->result:0);
	$db->insert("results",(object)$result,array());
	
    if($rows["status"]=="success")
	$rows["message"] = "Match information updated successfully.";
    echoResponse(200, $rows);
});

$app->delete('/matches/:id', function($id) { 
    global $db;
    $rows = $db->delete("matches", array('id'=>$id));
	$db->delete("points", array('match_id'=>$id));
	$db->delete("results", array('match_id'=>$id));	
    if($rows["status"]=="success")
        $rows["message"] = "Match removed successfully.";
    echoResponse(200, $rows);
});






//Players
$app->get('/players', function() { 
    global $db;
    $rows = $db->select2("players","id,name,active",array(),"ORDER BY name ASC");
    echoResponse(200, $rows);
});

$app->post('/players', function() use ($app) { 
    $data = json_decode($app->request->getBody());
    $mandatory = array('name');
    global $db;
    $rows = $db->insert("players", $data, $mandatory);
    if($rows["status"]=="success")
        $rows["message"] = "Player added successfully.";
    echoResponse(200, $rows);
});

$app->put('/players/:id', function($id) use ($app) { 
    $data = json_decode($app->request->getBody());
    $condition = array('id'=>$id);
    $mandatory = array();
    global $db;
    $rows = $db->update("players", $data, $condition, $mandatory);
    if($rows["status"]=="success")
        $rows["message"] = "Player information updated successfully.";
    echoResponse(200, $rows);
});

$app->delete('/players/:id', function($id) { 
    global $db;
    $rows = $db->delete("players", array('id'=>$id));
    if($rows["status"]=="success")
        $rows["message"] = "Player removed successfully.";
    echoResponse(200, $rows);
});

// Products
$app->get('/products', function() { 
    global $db;
    $rows = $db->select("products","id,sku,name,description,price,mrp,stock,image,packing,status",array());
    echoResponse(200, $rows);
});

$app->post('/products', function() use ($app) { 
    $data = json_decode($app->request->getBody());
    $mandatory = array('name');
    global $db;
    $rows = $db->insert("products", $data, $mandatory);
    if($rows["status"]=="success")
        $rows["message"] = "Product added successfully.";
    echoResponse(200, $rows);
});

$app->put('/products/:id', function($id) use ($app) { 
    $data = json_decode($app->request->getBody());
    $condition = array('id'=>$id);
    $mandatory = array();
    global $db;
    $rows = $db->update("products", $data, $condition, $mandatory);
    if($rows["status"]=="success")
        $rows["message"] = "Product information updated successfully.";
    echoResponse(200, $rows);
});

$app->delete('/products/:id', function($id) { 
    global $db;
    $rows = $db->delete("products", array('id'=>$id));
    if($rows["status"]=="success")
        $rows["message"] = "Product removed successfully.";
    echoResponse(200, $rows);
});

function echoResponse($status_code, $response) {
    global $app;
    $app->status($status_code);
    $app->contentType('application/json');
    echo json_encode($response,JSON_NUMERIC_CHECK);
}

$app->run();
?>