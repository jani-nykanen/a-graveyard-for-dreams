/**
 * The End of Journey
 * 
 * (c) 2020 Jani Nykänen
 */

import { Application } from "./core/application.js";
import { Game } from "./game.js";


window.onload = () => (new Application(160, 144, 0))
    .loadAssets("assets/assets.json")
    .run(Game);
