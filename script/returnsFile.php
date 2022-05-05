<?php
$code = $_POST["code"];

$dbUser = "structorizer";
$dbPassword ="oiWf!809";
$dbName = "structorizer";

$conn = new PDO("mysql:host=localhost;dbname=$dbName", $dbUser, $dbPassword);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt = $conn->prepare("SELECT * FROM codes WHERE structCode LIKE :structCode");
$stmt1 = $conn->prepare("INSERT INTO codes (structCode, version) VALUES (:structCode, :version)");

$stmt->execute(array('structCode' => $code ."%"));
$version = 0;
if($stmt->rowCount() > 0 ) {
	$results = $stmt->fetchAll();
	foreach($results as $row) {
		if($row["version"] > $version) {
			$version = $row["version"];
		}
	}
}


if(file_exists("../sharedStructs/" .$code ."/v" .$version.".txt")) {
	if(isset($_GET["v"])) {
		$file = fopen("../sharedStructs/" .$code ."/v" .$_GET["v"].".txt", "r");
		$fileContent = fread($file,filesize("../sharedStructs/" .$code ."/v" .$_GET["v"].".txt"));
	} else {
		$file = fopen("../sharedStructs/" .$code ."/v" .$version.".txt", "r");
		$fileContent = fread($file,filesize("../sharedStructs/" .$code ."/v" .$version.".txt"));
	}
}
	


$fileContent = trim(preg_replace('/\s\s+/', ' ', $fileContent));
fclose($fileContent);

echo $fileContent

?>