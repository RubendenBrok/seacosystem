import * as main from "./SeacoScript.js";
import * as myMath from "./Math Functions.js";
import * as objects from "./Objects.js";
import * as UI from "./UI-management.js";

export let soundOn = true;

const menusound1 = new Howl({src: ['./sounds/menusound1.mp3'], volume: 0.3})
const menusound2 = new Howl({src: ['./sounds/menusound2.mp3'], volume: 0.3})
const hoversound = new Howl({src: ['./sounds/hoversound.mp3'], volume: 0.3})
const placefish = new Howl({src: ['./sounds/placefish.mp3'], volume: 0.3})
const killfish = new Howl({src: ['./sounds/killfish.mp3'], volume: 0.4})
const killallfish = new Howl({src: ['./sounds/killallfish.mp3'], volume: 0.2})

export function initializeSound(){
    Howler.volume(0.6);
    const music  = new Howl({
        src: ['./sounds/fishmusic4.mp3'],
        loop: true
      })
    music.play();
}

export function toggleSound(){
    if (soundOn){
        soundOn = false;
        Howler.volume(0);
    } else {
        soundOn = true;
        Howler.volume(0.6);
    }
}

export function playSound(num){
    switch (num){
        case 0:
            menusound1.play();
            break;
        case 1:
            menusound2.play();
            break;
        case 2:
            hoversound.play();
            break;
        case 3:
            placefish.play();
            break;
        case 4:
            killfish.play();
            break;
        case 5:
            killallfish.play();
            break;      
    }
}