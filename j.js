function countingValleys(n, s) {
    let elevation = 0;

    for (let i = 0; i < n; i += 1) {
        if (s[i] === 'U') elevation += 1
        if (s[i] === 'D') elevation -= 1
    }
    return elevation
}

console.log(countingValleys(12, 'DDUUDDUDUUUD'))