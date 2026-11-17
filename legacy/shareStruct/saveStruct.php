<?php
$structCode = $_POST["structCode"];
$structContent =  $_POST["structContent"];



$dbUser = "structorizer";
$dbPassword ="oiWf!809";
$dbName = "structorizer";

$conn = new PDO("mysql:host=localhost;dbname=$dbName", $dbUser, $dbPassword);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt = $conn->prepare("SELECT * FROM codes WHERE structCode=:structCode");
$stmt1 = $conn->prepare("INSERT INTO codes (structCode, version, projectTitle) VALUES (:structCode, :version, :projectTitle)");

$stmt->execute(array('structCode' => $structCode, ));
$version = 0;
if($stmt->rowCount() > 0 ) {
	$results = $stmt->fetchAll();
	foreach($results as $row) {
		if($row["version"] > $version) {
			$version = $row["version"];
		}
	}
	$fp = fopen("../sharedStructs/" .$structCode ."/v".($version+1) .".txt", "w+");
	if (false === $fp) {
		echo 1;
		
		
	} else {
		echo $structContent;
		ftruncate($fp, 0); //Clear the file to 0bit
		fwrite($fp, $structContent);
		fclose($fp);
		
		$stmt1->execute(array('structCode' => $structCode, 'version' => ($version+1), 'projectTitle' => $projectTitle));
	}
	
}
	



?>