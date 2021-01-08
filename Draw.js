import * as main from "./SeacoScript.js";
import * as objects from "./Objects.js";
import * as UI from "./UI-management.js";
import { Application, Sprite, Graphics, Container, Texture, filters, WRAP_MODES} from 'pixi.js'
//import * as PIXI from 'pixi.js'
import { CRTFilter, AdjustmentFilter } from 'pixi-filters'

export const spriteArr = [];

let app;
let fishTank;

const menuColor = 0xcdffc8;
const backgroundColor = 0x332255;
//const backgroundColor = 0x2d2947;


let placeFish1Sprite;
let placeFish2Sprite;


let graphics;
let background;
let selectionDarkness;
let selectionMask;
let displacementSprite;
let displacementFilter;
let vintageFilter;
let adjustmentFilter;


export function pixiInit() {
  //Create a Pixi Application
    app = new Application({
    width: window.innerWidth,
    height: window.innerHeight,
    antialias: true,
    transparent: true,
    resolution: 1,
  });


  document.body.appendChild(app.view);

  background = new Graphics()
  app.stage.addChild(background);
  background.beginFill(backgroundColor);
  background.drawRect(0,0,main.screenWidth, main.screenHeight);
  background.endFill();

  fishTank = new Container();
  app.stage.addChild(fishTank);

  graphics = new Graphics()
  app.stage.addChild(graphics);

  selectionDarkness = new Graphics();
  app.stage.addChild(selectionDarkness);

  selectionMask = new Graphics()
  app.stage.addChild(selectionMask);
  selectionMask.isMask = true;

  app.loader.baseUrl = "sprites"
  app.loader 
    .add("fish1","nieuwevis1.png")
    .add("fish1baby","vis1baby.png")
    .add("fish2","vis2rechts.png")
    .add("fish2baby","vis2baby.png")
    .add("heart","hartje.png")
    .add("deadfish1","Visgraat1.png")
    .add("deadfish2","Visgraat2.png")
    .add("cloudtexture","cloudtexture.png")
    .add("bubble","bubble.png")
    .add("blood","bloed.png")
    .add("addfish1","addfish1.png")
    .add("addfish2","addfish2.png");

  app.loader.load(main.main);
};

export function createHoverSprites(){
  placeFish1Sprite = new Sprite.from(app.loader.resources.addfish1.texture)
  placeFish2Sprite = new Sprite.from(app.loader.resources.addfish2.texture)
  app.stage.addChild(placeFish1Sprite);
  app.stage.addChild(placeFish2Sprite);
  placeFish1Sprite.anchor.set(0.5);
  placeFish2Sprite.anchor.set(0.5);
  placeFish1Sprite.position.set(-100,-100);
  placeFish2Sprite.position.set(-100,-100);
}

export function initializeFilters(){
  console.log(app.loader.resources.cloudtexture.texture)
  displacementSprite = new Sprite.from(app.loader.resources.cloudtexture.texture);
  displacementSprite.scale.x = 2.5;
  displacementSprite.scale.y = 2.5;

  displacementFilter = new filters.DisplacementFilter(displacementSprite);
  displacementSprite.texture.baseTexture.wrapMode = WRAP_MODES.REPEAT;
  fishTank.addChild(displacementSprite);
  fishTank.filters = [displacementFilter];

  vintageFilter = new CRTFilter();
  vintageFilter.curvature = 2;
  vintageFilter.lineWidth = 20;
  vintageFilter.lineContrast= 0.01
  vintageFilter.vignettingAlpha = 0.6;
  vintageFilter.noise = 0
  vintageFilter.noiseSize = 1;
  vintageFilter.seed = 1;

  adjustmentFilter = new AdjustmentFilter();
  adjustmentFilter.blue = 1.05;
  adjustmentFilter.green = 1;
  adjustmentFilter.red = 0.95;
  adjustmentFilter.contrast = 1.3;
  adjustmentFilter.gamma =1.3;
  adjustmentFilter.saturation = 1.3;
  
  app.stage.filters = [vintageFilter, adjustmentFilter];
}

export function createSprite(spriteName, id, x, y, angle, color){
  //push new sprite into array
  spriteArr.push({
    sprite : new Sprite.from(app.loader.resources[spriteName].texture),
    id : id,
    animation : {
    }
  })
  console.log(spriteArr[spriteArr.length-1])
  //initialize the new sprite to its position and rotation
  spriteArr[spriteArr.length-1].sprite.position.set(x, y);
  spriteArr[spriteArr.length-1].sprite.anchor.set(0.5);
  spriteArr[spriteArr.length-1].sprite.rotation = angle;

  fishTank.addChild(spriteArr[spriteArr.length-1].sprite);

  //tint the sprite if needed
  if (typeof color != "undefined"){
    let coloration = RGBToHexColor(color)
    spriteArr[spriteArr.length-1].sprite.tint = coloration;
  }
}

export function updateSprite(id, x, y, angle, opacity, animated, scaleX, scaleY){
  let index = spriteArr.findIndex(num => num.id === id);
  spriteArr[index].sprite.position.set(x, y);
  spriteArr[index].sprite.rotation = angle;
  // flip the sprite if the fish swims to the left
  if (angle > Math.PI * 0.5 && angle < Math.PI * 1.5){
    spriteArr[index].sprite.scale.y = -1;
  } else {
    spriteArr[index].sprite.scale.y = 1;
  }
  // if the function receives opacity information, update the sprites opacity
  if (typeof opacity != "undefined"){
    spriteArr[index].sprite.alpha = opacity;
  }

  if (animated){
    if  (angle > Math.PI * 0.5 && angle < Math.PI * 1.5){
      spriteArr[index].sprite.scale.y = -1 * scaleY;
    } else {
      spriteArr[index].sprite.scale.y =  scaleY;
    }
  spriteArr[index].sprite.scale.x = scaleX;
}
}

export function deleteSprite(id, isText){
  let index = spriteArr.findIndex(num => num.id === id);
  if (isText){
    app.stage.removeChild(spriteArr[index].sprite)
  } else {
    fishTank.removeChild(spriteArr[index].sprite);
  }
  spriteArr.splice(index, 1);
}

export function createText(textStr, id, x, y){
  //push new sprite into array
  spriteArr.push({
    sprite : new Text(textStr),
    id : id
  })
  spriteArr[spriteArr.length-1].sprite.style.fontSize = '15px';
  spriteArr[spriteArr.length-1].sprite.style.fill = '#cdffc8';
  //initialize the new sprite to its position and rotation
  spriteArr[spriteArr.length-1].sprite.position.set(x, y);

  app.stage.addChild(spriteArr[spriteArr.length-1].sprite);
}


export function drawHover() {
  //draw a circle over a fish when you hover over it
  if (UI.hover.index >= 0){
    if (typeof(objects.fishArr[UI.hover.index]) !== "undefined"){
      graphics.beginFill(menuColor, 0.1);
      graphics.drawCircle(objects.fishArr[UI.hover.index].x, objects.fishArr[UI.hover.index].y, objects.fishArr[UI.hover.index].size * 1.2, 0.7);
      graphics.endFill();
    }
  }
  //move the place a fish sprite to mouse position when the user is placing a fish
  if (UI.canPlaceFish){
    if (UI.placingFish == 0){
      placeFish1Sprite.position.set(UI.mouseX, UI.mouseY);
    } else {
      placeFish1Sprite.position.set(-100,-100);
    }
    if (UI.placingFish == 1){
      placeFish2Sprite.position.set(UI.mouseX, UI.mouseY);
    } else {
      placeFish2Sprite.position.set(-100,-100);
    }
  } else {
    placeFish1Sprite.position.set(-100,-100);
    placeFish2Sprite.position.set(-100,-100);
  }
}

export function drawSelection(x, y, vision, size){
  graphics.lineStyle(1, menuColor, 0.7);
  graphics.drawCircle(x, y, size * 1.2, 0.7);
  graphics.endFill();
  drawSelectionDarkness(x, y, vision)
}

export function updateDisplacementFilter(){
  if (UI.animationSpeed > 0){
    displacementSprite.x += 0.5;
    displacementSprite.y += 0.2;
  }
  vintageFilter.time += 0.1;
  vintageFilter.seed += 10;
  if (vintageFilter.seed > 200){vintageFilter.seed = 1}; 
}

export function drawBlueOverlay(){
  graphics.beginFill(backgroundColor, 0.3);
  graphics.drawRect(0, 0, main.screenWidth, main.screenHeight);
  graphics.endFill();
}

export function drawSelectionDarkness(x, y, vision){
  selectionDarkness.beginFill(0x000000, 0.4);
  selectionDarkness.drawRect(0, 0, main.screenWidth, main.screenHeight);
  selectionDarkness.endFill();

  selectionMask.clear();
  selectionMask.lineStyle(2000, 0x000000);
  selectionMask.drawCircle(x,y,vision + 1000);
  selectionMask.endFill();

  selectionDarkness.mask = selectionMask;
}

export function clearSelectionDarkness(){
  selectionDarkness.clear();
};

export function drawPlants() {
  graphics.clear();

  //graphics.beginFill(0x88DD11);
  objects.plantsArr.forEach((plant) => {
    let plantHexColor = RGBToHexColor([plant.RColor, plant.GColor, plant.BColor])
    graphics.beginFill(plantHexColor);
    graphics.drawCircle(plant.x, plant.y, plant.size);

  });
  graphics.endFill();
}

  export function resizePixi(w, h){
    app.renderer.resize(w,h);
    background.clear();
    background.beginFill(0x332255);
    background.drawRect(0,0,main.screenWidth, main.screenHeight);
    background.endFill();
  }

  export function RGBToHexColor(RGBIn) {
    let rHex = (+RGBIn[0]).toString(16);
    if (rHex.length == 1) {
      rHex = "0" + rHex;
    }
    let gHex = (+RGBIn[1]).toString(16);

    if (gHex.length == 1) {
      gHex = "0" + gHex;
    }
    let bHex = (+RGBIn[2]).toString(16);
    if (bHex.length == 1) {
      bHex = "0" + bHex;
    }

    return "0x" + rHex + gHex + bHex;
  }

  export function hueShift(shift, depth, RGBIn) {
    let r, g, b;
    r = RGBIn[0];
    b = RGBIn[1];
    g = RGBIn[2];

    switch (true) {
      case shift < 0.5:
        b -= depth;
        g -= Math.floor(depth * ((-shift + 0.5) / 0.5));
        break;
      case shift >= 0.5 && shift < 1:
        b -= depth;
        r -= Math.floor(depth * ((shift - 0.5) / 0.5));
        break;
      case shift >= 1 && shift < 1.5:
        r -= depth;
        b -= Math.floor(depth * ((-shift + 1.5) / 0.5));
        break;
      case shift >= 1.5 && shift < 2:
        r -= depth;
        g -= Math.floor(depth * ((shift - 1.5) / 0.5));
        break;
      case shift >= 2 && shift < 2.5:
        g -= depth;
        r -= Math.floor(depth * ((-shift + 2.5) / 0.5));
        break;
      case shift >= 2.5 :
        g -= depth;
        b -= Math.floor(depth * ((shift - 2.5) / 0.5));
        break;
    }
    if (r < 0){r = 0};
    if (g < 0){g = 0};
    if (b < 0){b = 0};

    return [r,g,b]
  }

  
