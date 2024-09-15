<?php
function longest($kalimat) {
    $words = explode(' ', $kalimat);
    
    $panjangKalimat = '';
    
    foreach ($words as $word) {
        if (strlen($word) > strlen($panjangKalimat)) {
            $panjangKalimat = $word;
        }
    }
    
    return $panjangKalimat . ': ' . strlen($panjangKalimat) . ' characters';
}

$kalimat = "Saya sangat senang mengerjakan soal algoritma";
echo longest($kalimat); 
?>
