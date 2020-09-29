/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */


export class Sprite {


    constructor(w, h) {

        this.width = w;
        this.height = h;
    
        this.frame = 0;
        this.row = 0;
        this.count = 0.0;
    }


    animate(row, start, end, speed, steps) {

        row |= 0;
        start |= 0;
        end |= 0;
        speed |= 0;

        if (start == end) {
    
            this.count = 0;
            this.frame = start;
            this.row = row;
            return;
        }
    
        if (this.row != row) {
        
            this.count = 0;
            this.frame = end > start ? start : end;
            this.row = row;
        }
    
        if ((start < end && this.frame < start) ||
            (start > end && this.frame > start)) {
        
            this.frame = start;
        }
    
        this.count += steps;
        if(this.count > speed) {
        
            if(start < end) {
            
                if (++ this.frame > end) {
                    
                    this.frame = start;
                }
            }
            else {
            
                if (-- this.frame < end) {
                
                    this.frame = start;
                }
            }
    
            this.count -= speed;
        }
    }


    setFrame(frame, row) {

        this.frame = frame;
        this.row = row;
        
        this.count = 0;
    }


    drawFrame(c, bmp, frame, row, dx, dy, flip) {
    
        c.drawBitmapRegion(bmp, 
            this.width * frame, this.height * row, 
            this.width, this.height, 
            dx, dy, flip);
    }


    draw(c, bmp, dx, dy, flip) {

        this.drawFrame(c, bmp, 
            this.frame, this.row,
            dx, dy, flip);
    }
}
