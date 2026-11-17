<?php

$dbUser = "structorizer";
$dbPassword ="oiWf!809";
$dbName = "structorizer";

$conn_uC = new PDO("mysql:host=localhost;dbname=$dbName", $dbUser, $dbPassword);
$conn_uC->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt_uC = $conn->prepare("SELECT * FROM userKey WHERE userKey=:userKey");
$stmt1_uC = $conn->prepare("INSERT INTO userKey (userKey) VALUES (:userKey)");




if(!isset($_COOKIE["userKey"])) {
	do {
		$userKey = generateRandom(32);
		$stmt_uC->execute(array('userKey' => $userKey));
	} while( $stmt_uC->rowCount() > 0);
	
	$stmt1_uC->execute(array('userKey' => $userKey));
	
	setcookie("userKey", $userKey, time() + (86400 * 365), "/");
}

function generateRandom($length) {
	$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	$charactersLength = strlen($characters);
	$randomString = '';
	for ($i = 0; $i < $length; $i++) {
		$randomString .= $characters[rand(0, $charactersLength - 1)];
	}
	return $randomString;
}
$conn_uC = null;
?>