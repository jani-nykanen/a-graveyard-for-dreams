/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */


export function negMod(m, n) {

    m |= 0;
    n |= 0;

    return ((m % n) + n) % n;
}


export function clamp(x, min, max) {

    return Math.max(min, Math.min(x, max));
}


export function nextObject(arr, o) {

    for (let a of arr) {

        if (!a.exist) return a;
    }
    arr.push(new o.prototype.constructor());
    return arr[arr.length-1];
}


export function updateSpeedAxis(speed, target, step) {
		
    if (speed < target) {
        
        return Math.min(target, speed+step);
    }
    return Math.max(target, speed-step);
}
