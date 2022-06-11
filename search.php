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
    $files = new RegexIterator(new RecursiveIteratorIterator(new RecursiveDirectoryIterator('menu_data')), '*'.i_case_pattern($_GET['q']).'*.json', RegexIterator::GET_MATCH);
    $fileList = array();
    foreach($files as $file) {
        $fileList = array_merge($fileList, $file);
    }
?>
<?=json_encode($fileList);?>