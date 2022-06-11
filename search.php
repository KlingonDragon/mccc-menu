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
?>
<?=$_GET['q']?>
<br/>
<?=i_case_pattern($_GET['q'])?>
<br/>
<?=glob('menu_data/*'.i_case_pattern($_GET['q']).'*.json')?>
<br/>
<?=json_encode(glob('menu_data/*'.i_case_pattern($_GET['q']).'*.json'))?>