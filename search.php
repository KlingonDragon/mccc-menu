<?php
function i_case_pattern($string) {
    $result='';
    for(str_split($string) as $char) {
        if (ctype_alpha($char)) {
            $result.='['.lcfirst($char).ucfirst($char).']';
        } else {
            $result.=$char;
        }
    }
    return $result;

}
?>
<?=json_encode(glob('menu_data/*'.i_case_pattern($_GET['q']).'*.json'))?>