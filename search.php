<?php
    function i_case_pattern($string) {
        $result='';
        foreach (str_split($string) as $char) {
            if (ctype_alpha($char)) {
                $result.='['.lcfirst($char).ucfirst($char).']';
            } else {
                $result.=$char;
            }
        }
        return $result;
    }
    function recursive_glob($start, $middle, $end) {
        $middle = i_case_pattern($middle);
        $result = Array();
        for ($i =0; $i <= 2; $i++) {
            array_merge($result, glob($start.'/'.str_repeat('*/', $i).$middle.'*'.$end));
        }
        return $result;
    }
?>
<?=json_encode(recursive_glob('menu_data', $_GET['q'], '.json'));?>