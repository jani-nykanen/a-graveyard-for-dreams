/**
 * A Graveyard for Dreams
 * 
 * (c) 2020 Jani Nykänen
 */


export function drawBoxWithOutlines(c, x, y, w, h) {


    const COLORS = [
        [0, 0, 0],
        [255, 255, 255]
        [0, 0, 0], 
        [0, 85, 170]
    ];

    let offset = COLORS.length-1;
    for (let i = 0; i < COLORS.length; ++ i, -- offset) {

        // For some reason ...COLORS[i] did not work
        c.setColor(COLORS[i][0], COLORS[i][1], COLORS[i][2], 1.0);
        c.fillRect(x - offset, y - offset, 
            w + offset*2, h + offset*2);
    }
}
