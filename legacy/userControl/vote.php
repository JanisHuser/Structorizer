<?php
$structCode = $_POST["structCode"];
$type = $_COOKIE["type"];


$dbUser = "structorizer";
$dbPassword ="oiWf!809";
$dbName = "structorizer";

$conn = new PDO("mysql:host=localhost;dbname=$dbName", $dbUser, $dbPassword);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt = $conn->prepare("SELECT * FROM codes WHERE structCode=:structCode AND version=:version");
$stmtVoteUp = $conn->prepare("UPDATE codes SET posVotes=vote WHERE structCode=:structCode");
$stmtVoteDown = $conn->prepare("UPDATE codes SET negVotes=vote WHERE structCode=:structCode");



$stmt->execute(array('structCode' => $structCode, 'version' => $version));
$posVotes = 0;
$negVotes = 0;
if($stmt->rowCount() > 0 ) {
	$results = $stmt->fetchAll();
	foreach($results as $row) {
		$posVotes = $row["posVotes"];
		$negVotes = $row["negVotes"];
	}
	if($type == "0") {
		$stmtVoteDown->execute(array('vote' => ($negVotes+1), 'structCode' => $structCode));
	} else if($type == "1") {
		$stmtVoteUp->execute(array('vote' => ($posVotes+1), 'structCode' => $structCode));
	}
}




?>