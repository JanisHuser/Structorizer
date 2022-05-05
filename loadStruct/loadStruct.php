<?php
$structCode = $_POST["structCode"];
$dbUser = "structorizer";
$dbPassword ="oiWf!809";
$dbName = "structorizer";

$conn = new PDO("mysql:host=localhost;dbname=$dbName", $dbUser, $dbPassword);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt = $conn->prepare("SELECT * FROM codes WHERE structCode=:structCode");
$stmt->execute(array('structCode' => $structCode));

if($stmt->rowCount() > 0 ) {
	echo 0;
} else {
	echo 1;
}
?>