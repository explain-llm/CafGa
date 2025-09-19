export function deepEqual(x: any, y: any): boolean {
    const ok = Object.keys,
        tx = typeof x,
        ty = typeof y;
    return x && y && tx === 'object' && tx === ty
        ? ok(x).length === ok(y).length &&
              ok(x).every(key => deepEqual(x[key], y[key]))
        : x === y;
}

export function modulus(a: number, b: number) {
    //Implementing the modulus function that works for negative numbers
    return ((a % b) + b) % b;
}
export function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}
export function createIndexSchuffle(n_explanations: number) {
    const indexShuffle = new Array<number>(n_explanations);
    for (let i = 0; i < n_explanations; i++) {
        indexShuffle[i] = i;
    }
    for (let i = n_explanations - 1; i >= 0; i--) {
        const randomIndex = getRandomInt(i + 1);
        const temp = indexShuffle[i];
        indexShuffle[i] = indexShuffle[randomIndex];
        indexShuffle[randomIndex] = temp;
    }
    return indexShuffle;
}