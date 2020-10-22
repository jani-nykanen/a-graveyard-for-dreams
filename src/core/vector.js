/**
 * A Graveyard for Fools
 * 
 * (c) 2020 Jani Nykänen
 */

import { clamp } from "./util.js";


export class Vector2 {


	constructor(x, y) {
		
		this.x = x == undefined ? 0 : x;
        this.y = y == undefined ? 0 : y;
	}
	
	
	length() {
		
		return Math.hypot(this.x, this.y);
	}
	
	
	normalize(forceUnit) {
		
		const EPS = 0.0001;
		
		let l = this.length();
		if (l < EPS) {
			
			this.x = forceUnit ? 1 : 0;
            this.y = 0;

			return;
		}
		
		this.x /= l;
		this.y /= l;
		
		return this.clone();
	}
	
	
	clone() {
		
		return new Vector2(this.x, this.y);
	}


	zeros() {

		this.x = 0;
		this.y = 0;
	}


	static dot(u, v) {

		return u.x*v.x + u.y*v.y;
	}
}


export class RGB {


	constructor(r, g, b) {

		this.r = clamp(r, 0, 255);
		this.g = clamp(g, 0, 255);
		this.b = clamp(b, 0, 255);
	}


	clone() {

		return new RGB(this.r, this.g, this.b);
	}
}
