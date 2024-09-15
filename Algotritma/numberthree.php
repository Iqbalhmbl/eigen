<?php
function countOccurrences($input, $query) {
    $inputCount = array_count_values($input);

    $hasil = [];

    foreach ($query as $q) {
        $hasil[] = isset($inputCount[$q]) ? $inputCount[$q] : 0;
    }

    return $hasil;
}

$input = ['xc', 'dz', 'bbb', 'dz'];
$query = ['bbb', 'ac', 'dz'];

$output = countOccurrences($input, $query);
print_r($output);
?>
