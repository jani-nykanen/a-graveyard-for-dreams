/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { Vector2 } from "./vector.js";


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


export function overlay(pos, center, hitbox, x, y, w, h) {

    if (center == null)
        center = new Vector2(0, 0);

    let px = pos.x + center.x - hitbox.x/2;
    let py = pos.y + center.y - hitbox.y/2;

    return px + hitbox.x >= x && px < x+w &&
           py + hitbox.y >= y && py < y+h;
}
