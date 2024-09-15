<?php
function diagonalDifference($matrix) {
    $n = count($matrix);
    $primaryDiagonalSum = 0;
    $hasilDiagonalSum = 0;

    for ($i = 0; $i < $n; $i++) {
        $primaryDiagonalSum += $matrix[$i][$i];
        
        $hasilDiagonalSum += $matrix[$i][$n - 1 - $i];
    }

    return abs($primaryDiagonalSum - $hasilDiagonalSum);
}

$matrix = [
    [1, 2, 0],
    [4, 5, 6],
    [7, 8, 9]
];

$result = diagonalDifference($matrix);
echo $result;
?>
