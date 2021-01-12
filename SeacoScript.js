//window.onresize = scaleCanvas();
window.addEventListener("resize", resizeScreen, false);

import * as objects from "./Objects.js";
import * as myMath from "./Math Functions.js";
import * as draw from "./Draw.js";
import * as UI from "./UI-management.js";
import * as sound from "./sound.js";
import * as FX from "./FX.js";

export const friction = 0.97;
export let screenWidth = window.innerWidth;
export let screenHeight = window.innerHeight;

draw.pixiInit();

export function main() {
  sound.initializeSound();
  draw.createHoverSprites();
  draw.initializeFilters();
  InitializeGame();
  requestAnimationFrame(mainLoop);

  function mainLoop() {
    for (let i = 0; i < UI.animationSpeed; i++) {
      objects.updatePlants();
      objects.updateFish();
      objects.updateFrameCounter();
      FX.updateFX();
    }

    updatePixiGraphics();
    UI.updateUIGraphics();

    requestAnimationFrame(mainLoop);
  }
}

function resizeScreen() {
  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;
  draw.resizePixi(screenWidth, screenHeight);
}

function updatePixiGraphics() {
  //fish sprites
  objects.getSeaObjectsByFamily("fish").forEach((thisfish) => {
    draw.updateSprite(
      thisfish.id,
      thisfish.x,
      thisfish.y,
      thisfish.currentAngle,
      1,
      thisfish.animated,
      thisfish.animationScaleX,
      thisfish.animationScaleY
    );
  });
  //draw the plants
  draw.drawPlants();
  //update FX sprites
  FX.FXArr.forEach((fxObject) => {
    draw.updateSprite(
      fxObject.id,
      fxObject.x,
      fxObject.y,
      fxObject.angle,
      fxObject.opacity
    );
  });

  draw.updateDisplacementFilter();
}

function InitializeGame() {
  objects.initialize();

  for (let i = 0; i < 100; i++) {
    objects.createPlants(
      1,
      myMath.random(screenWidth),
      myMath.random(screenHeight)
    );
  }
  for (let i = 0; i < 5; i++) {
    objects.createProtoFish(
      myMath.random(window.innerWidth),
      myMath.random(window.innerHeight),
      "herring",
      [255, 60, 60]
    );
  }
  for (let i = 0; i < 5; i++) {
    objects.createProtoFish(
      myMath.random(window.innerWidth),
      myMath.random(window.innerHeight),
      "herring",
      [60, 160, 255]
    );
  }
  for (let i = 0; i < 0; i++) {
    objects.createProtoFish(
      myMath.random(window.innerWidth),
      myMath.random(window.innerHeight),
      "herring",
      [30, 255, 30]
    );
  }
  for (let i = 0; i < 3; i++) {
    objects.createProtoFish(
      myMath.random(window.innerWidth),
      myMath.random(window.innerHeight),
      "cod",
      [200, 200, 140]
    );
  }
}
