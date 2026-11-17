<?php

function viewStructs(
	$page,
	$count) {
	if ($page == null) {
		echo "page is null";
		return false;
	}
	
	
	
	if ($count == null) {
		$count = 50;
	}
	
	if ($page < 1) {
		$page = 1;
	}
	
	
	$files = array();
	if ($handle = opendir('sharedStructs')) {
		while (false !== ($file = readdir($handle))) {
		
			if ($file != "." && $file != "..") {

				array_push($files, $file);
			}
		}
		closedir($handle);
	}
	
	$totalPage = ceil(count($files)/$count);
	
	echo "<h4>Viewing Page: $page of $totalPage</h4>";
	
	
	$total =count($files);
	for ($i=$from; $i < $total && $i < ($from+$count); $i++) {
		
		
		$file = $files[$i];
		if (strlen($file) < 5) {
			continue;
		}
		echo "<iframe width='640' height='480' src='https://www.structorizer.com/loadStruct/?structCode=$file'></iframe>";
	}
	$from = ($page-1)*$count;

}

viewStructs(
	$_GET["page"],
	$_GET["count"]);
?>