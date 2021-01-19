
//import "./Home.html";
import "./Style.css";
import {updatePlants, updateFish, updateFrameCounter, fishArr, initialize, createPlants, createProtoFish} from "./Objects";
import {random} from "./Math Functions";
import {createHoverSprites, initializeFilters, resizePixi, updateSprite, drawPlants, updateDisplacementFilter, pixiInit} from "./Draw";
import {animationSpeed, updateUIGraphics} from "./UI-management";
import {initializeSound} from "./sound";
import {updateFX, FXArr} from "./FX";

export const friction = 0.97;
export let screenWidth = window.innerWidth;
export let screenHeight = window.innerHeight;


pixiInit();



export function mainGame() {

  initializeSound();
  createHoverSprites();
  initializeFilters();
  InitializeGame();
  requestAnimationFrame(mainLoop);

  function mainLoop() {
    for (let i = 0; i < animationSpeed; i++) {
      updatePlants();
      updateFish();
      updateFrameCounter();
      updateFX();
    }

    updatePixiGraphics();
    updateUIGraphics();

    requestAnimationFrame(mainLoop);
  }
}

window.addEventListener('resize', resizeScreen, false);
function resizeScreen(){
  screenWidth  = window.innerWidth;
  screenHeight = window.innerHeight;
  resizePixi(screenWidth, screenHeight);
}

function updatePixiGraphics (){
  //update fish sprites
  fishArr.forEach(thisfish => {
    updateSprite(thisfish.id, thisfish.x, thisfish.y, thisfish.currentAngle, 1, thisfish.animated, thisfish.animationScaleX, thisfish.animationScaleY)
  });
  //draw the plants
  drawPlants();
  //update FX sprites
  FXArr.forEach(fxObject => {
    updateSprite(fxObject.id, fxObject.x, fxObject.y, fxObject.angle, fxObject.opacity)
  });

  updateDisplacementFilter();
}

function InitializeGame(){
  initialize();

  for (let i = 0; i < 100; i++) {
    createPlants(1,
      random(screenWidth),
      random(screenHeight)
    );
  }
  for (let i = 0; i < 5; i++) {
    createProtoFish(
      random(window.innerWidth),
      random(window.innerHeight),
      0,
      [255,60,60]
    );
  }
  for (let i = 0; i < 50; i++) {
    createProtoFish(
      random(window.innerWidth),
      random(window.innerHeight),
      0,
      [60,160,255]
    );
  }
  for (let i = 0; i < 0; i++) {
    createProtoFish(
      random(window.innerWidth),
      random(window.innerHeight),
      0,
      [30,255,30]
    );
  }
  for (let i = 0; i < 1; i++) {
    createProtoFish(
      random(window.innerWidth),
      random(window.innerHeight),
      1,
      [200,200,140]
    );
  }
}