<?php
$structContent = $_POST["structContent"];
$projectTitle = $_POST["projectTitle"];

$dbUser = "structorizer";
$dbPassword ="oiWf!809";
$dbName = "structorizer";

$conn = new PDO("mysql:host=localhost;dbname=$dbName", $dbUser, $dbPassword);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt = $conn->prepare("SELECT * FROM codes WHERE structCode=:structCode");
$stmt1 = $conn->prepare("INSERT INTO codes (structCode, projectTitle) VALUES (:structCode, :projectTitle)");
$structCode = generateRandom(12);

$stmt->execute(array('structCode' => $structCode));
while($stmt->rowCount() > 0) {
	$structCode = generateRandom(12);
	$stmt->execute(array('structCode' => $structCode));
}
$stmt1->execute(array('structCode' => $structCode, 'projectTitle' => $projectTitle));

if (!mkdir("../sharedStructs/" .$structCode ."/", 0777, true)) {
    die('Erstellung der Verzeichnisse schlug fehl...');
}

$file = fopen("../sharedStructs/" .$structCode ."/v0.txt", "w");

fwrite($file, $structContent);

fclose($file);
echo $structCode;

function generateRandom($length) {
	$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	$charactersLength = strlen($characters);
	$randomString = '';
	for ($i = 0; $i < $length; $i++) {
		$randomString .= $characters[rand(0, $charactersLength - 1)];
	}
	return $randomString;
}
?>