<?php
function reverseAlphabets($str) {
    preg_match('/([A-Za-z]+)(\d+)/', $str, $matches);
    
    $balikan = strrev($matches[1]);
    
    return $balikan . $matches[2];
}

$str = "NEGIE1";
echo reverseAlphabets($str);
?>
