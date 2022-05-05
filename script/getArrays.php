<?php
$wholePage = preg_split('/$\R?^/m', $_POST["code"]);
$brackets = 0;


echo json_encode(getChildNodes($wholePage));

function getChildNodes($wholePage) {
	
	return getChildren($wholePage);
}


function getChildren($array) {
	$n = 0;
	$arr = array();
	$nOld = $n;
	while($n < count($array)) {
		if(string_contains($array[$n], '}')) {
			$brackets--;
			if($brackets == 0) {
				if($array[$n] == "}" && !string_contains($array[$n], '{')) {
					$n++;
					continue;
				}
			}
		}
		if(string_contains($array[$n], '{')) {
			$brackets++;
			if($brackets > 0) {
				if(!string_contains($array[$n], '}') && string_contains($array[$n], '{')) {
					array_push($arr, array('line' => analyseLine($array[($n)]), 'children' => getSubChildren($array, ($n+1))));		//fehler => nOld ist noch falsch
				} else if(string_contains($array[$n], '}') && string_contains($array[$n], '{')) {
					$nOld = (getSubChildrenPos($array, ($n+1)) - ( count($arr)));
					array_push($arr, array('line' => analyseLine($array[$nOld]), 'children' => getSubChildren($array, ($n+1))));
				}
			}
		}
		if(!string_contains($array[$n], '{') && !string_contains($array[$n], '}')) {
			array_push($arr, analyseLine($array[$n], 'b'));
		}
		if(string_contains($array[$n], '{')) {
			$brackets++;
			if($brackets > 0) {
				$n = getSubChildrenPos($array, ($n+1));
			}
		}
		$n++;
	}
	return $arr;
}

function getSubChildren($array, $n) {
	$nOld = 0;
	$arr = array();
	$brackets = 1;
	while($brackets > 0 && $n < count($array)) {
		$nOld = $n;
		if(string_contains($array[$n], '}')) {
			$brackets--;
			if($brackets <= 0 || $array[$n] == "}") {
				continue;
			}
		}
		if(string_contains($array[$n], '{')) {
			$brackets++;
			if($brackets > 0) {
				array_push($arr, array('line' => analyseLine($array[$nOld]), 'children' => getSubChildren($array, ($n+1))));
				$n = getSubChildrenPos($array, ($n+1));
			}
		} else if($brackets > 0 && $array[$n] != "}") {
			if($array[$n] !== "}" && !preg_match("/[}]/", $array[$n])) {
				array_push($arr, analyseLine($array[$n]));
			}
		}
		$n++;
	}
	return $arr;
}

function getSubChildrenPos($array, $n) {
	$nOld = 0;
	$arr = array();
	$brackets = 1;
	while($brackets > 0 && $n < count($array)) {
		$nOld = $n;
		if(string_contains($array[$n], '}')) {
			$brackets--;
			if($brackets == 0) {
				
				continue;
			}
		}
		if(string_contains($array[$n], '{')) {
			$brackets++;
			if($brackets > 0) {
				$line = analyseLine($array[$nOld]);
				array_push($arr, array('line' => $line, 'children' => getSubChildren($array, ($n+1))));
				$n = getSubChildrenPos($array, ($n+1));
			}
		} else 
		if($brackets > 0) {
			array_push($arr, $array[$n]);
		}
		$n++;
	}
	return ($n-1);
}




function analyseLine($line) {
	$comment = "";
	$type = "";
	if( $line !== "}") {
		$type = getElemType($line);
		$comment =  getComment($line);
	}
	if(string_contains($line, '//')) {
		$line = explode("//", $line)[0];
	}
	
	return array('line' => $line,'type' => $type, 'comment' => $comment);
}
function getComment($line) {
	if(string_contains($line, '//')) {
		return explode('//', $line)[1];
	}
}
				 
				 
function getElemType($line) {
	$start = 0;
	$end = 0;
	$startFound = false;
	$clipsFound = 0;
	
	$splited = str_split($line);
	$i=0;
	for($i=0; $i <= count($splited); $i++) {
		if($splited[$i] == '(') {
			$clipsFound++;
			if($startFound == false) {
				$startFound = true;
				$start = $i;
			}
		}
	}
	if(!isOnlyComment($line)) {
		if(string_contains(substr($line, 0, ($start)), "if")) {
			return 3;
		} else if(string_contains(substr($line, 0, ($start)), "while")) {
			return 0;
		} else if(string_contains(substr($line, 0, ($start)), "for")) {
			return 2;
		} else if(string_contains(substr($line, 0, ($start)), "do")) {
			return 1;
		} else if(string_contains(substr($line, 0, ($start)), "switch")) {
			return 4;
		} else if(isFunction($line)) {
			return 7;
		} else {
			return 5;
		}
	} else {
		return -1;
	}
}


function isFunction($string) {
	$len = strlen($string);
	$i=0;
	$functionBefore = false;
	while($i < $len) {
		if(preg_match("/[(]/", substr($string, $i, ($i+1)))) {
			if(substr($string, ($i-1), $i) != ' ' && !preg_match("/[(]/", substr($string, ($i-1), $i))) {
				$functionBefore = true;
				break;
			}
		}
		$i++;
	}
	return $functionBefore;
}


function isOnlyComment($string) {
	$len = strlen($string);
	$i=0;
	$isOnlyComment = false;
	if(string_contains($string, "//")) {
		if(substr($string, 0, 1) == "/") {
			$isOnlyComment = true;
		}
	}
	return $isOnlyComment;
}
function concatArray($array) {
	$string = "";
	foreach($array as $p) {
		if($p != null && $p != "") {
			$string = $string .$p;
		}
	}
	return $string;
}
function concatArrayWN($array, $WN) {
	$string = "";
	$i=0;
	foreach($array as $p) {
		if($p != null && $p != "" && strpos( $p, $WN) === false) {
			$string = $string .$p;
		}
	}
	return $string;
}

function removeOuterClips($string) {
	$len = strlen($string);
	$i = 0;
	$clips = 0;
	$start = 0;
	$end = 0;
	while($i < $len) {
		if(substr($string, $i, ($i+1)) == '(') {
			if($clips == 0) { $start = $i; }
			$clips++;
		}
		if(substr($string, $i, ($i+1)) == ')') {
			$clips--;
			if($clips == 0) { $end = $i; }
		}
		$i++;
	}
	return $start;
}

function string_contains($string, $search) {
	if(strpos($string, $search) === false) {
		return false;
	} else {
		return true;
	}
}

?>