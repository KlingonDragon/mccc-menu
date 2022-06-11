<?php
if ($_GET['q']) {
	function ciGlob($pat, $base = '', $suffix = '') {
		$p = $base;
		for ($x=0; $x<strlen($pat); $x++) {
			$c = substr($pat, $x, 1);
			if (preg_match("/[^A-Za-z]/", $c)) {
				if ($c == ' ' || $c == '-' || $c == '_') {
					$p .= '[ -_]*';
				} else {
					$p .= $c;
				}
				continue;
			}
			$a = strtolower($c);
			$b = strtoupper($c);
			$p .= "[{$a}{$b}]";
		}
		$p .= $suffix;
		return glob($p);
	}
	$strings = unserialize(file_get_contents('strings/'.$_SESSION['lang']));
	function xs($mystring) {global $strings;
		if (is_array($mystring)) {
			$mystring = ($_GET['desc'] ? $mystring[$_GET['desc']]:$mystring['default']);
		}
		return ($strings[$mystring]?$strings[$mystring]:$mystring);
	}
	$results = ciglob('*/*'.$_GET['q'].'*.json');
	if (count($results)) {
		$j = 0;
		foreach ($results as $result) {
			if ($j < 10) {
				$result_link = preg_replace('/.*\/(.*)\..*/','$1',$result);
				$menu_path = '';
				$path = '';
				foreach (explode('_',$result_link) as $i => $path_item) {
					$menu_path .= ($i?'_':'').xs($path_item);
					$path .= ($i?'_':'').xs(json_decode(file_get_contents('menu/'.$menu_path.'.json'),true)['title']);
				}
?>				<div class="result"><a href="?menu=<?=$result_link;?>">
					<h5><?=xs(json_decode(file_get_contents($result),true)['title']);?></h5>
					<h6><?=str_replace('_',' > ',$path);?></h6>
				</a></div>
<? 
			}
			$j++;
		}
		if ($j >= 10) {?>
			<h4><?=str_replace('#',count($results)-10,xs('more_results'));?></h4>
<?
		}
	} else {?>
			<h6><?=xs('no_results');?></h6>
<?php	
	}
}
?>