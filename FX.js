import * as main from "./SeacoScript.js";
import * as myMath from "./Math Functions.js";
import * as UI from "./UI-management.js";
import * as draw from "./Draw.js";
import * as objects from "./Objects.js";

export const FXArr = [];

export const FXData = [{
    name : "HEART",
    totalLifeTime : 70,
    fadeInTime : 30,
    fadeOutStartTime : 20,
    lifeTimeRandomness: 0,
    spriteName: "heart"
},{
    name : "DEAD FISH 1",
    totalLifeTime : 300,
    fadeInTime : 0,
    fadeOutStartTime : 100,
    lifeTimeRandomness: 0,
    spriteName: "deadfish1"
},{
    name : "DEAD FISH 2",
    totalLifeTime : 300,
    fadeInTime : 0,
    fadeOutStartTime : 100,
    lifeTimeRandomness: 0,
    spriteName: "deadfish2"
},{
    name : "BUBBLE",
    totalLifeTime : 30,
    fadeInTime : 0,
    fadeOutStartTime : 25,
    lifeTimeRandomness: 70,
    spriteName: "bubble"
},{
    name : "BLOOD",
    totalLifeTime : 15,
    fadeInTime : 0,
    fadeOutStartTime : 1,
    lifeTimeRandomness: 30,
    spriteName: "blood"
},{
    name : "EVOLUTION TEXT",
    totalLifeTime : 90,
    fadeInTime : 10,
    fadeOutStartTime : 45,
    lifeTimeRandomness: 0,
}];

export function createTemporaryObject(x, y, speed, angle, kind, id, textStr){
    let randomTime = myMath.random(FXData[kind].lifeTimeRandomness);
    FXArr.push(new temoraryObject(x, y, speed, angle, FXData[kind].totalLifeTime + randomTime, FXData[kind].fadeInTime, FXData[kind].fadeOutStartTime + randomTime, FXData[kind].spriteName, id, FXData[kind].name, textStr));
}

export function createBubbles(x, y, kind, id, amount){
    for (let i = 0; i < amount; i++){
        let randomTime = myMath.random(FXData[kind].lifeTimeRandomness);
        FXArr.push(new temoraryObject(x + myMath.random(6)-3, y+ myMath.random(6)-3, 0.2 + Math.random(), Math.random()* 0.2 * Math.PI - 0.6 * Math.PI, FXData[kind].totalLifeTime + randomTime, FXData[kind].fadeInTime, FXData[kind].fadeOutStartTime + randomTime, FXData[kind].spriteName, objects.numOfElementsCreated, FXData[kind].name));
        objects.increaseObjectCounter();
    }
}

export function createBloodCloud(x, y){
    for (let i = 0; i < 10; i++){
        let randomTime = myMath.random(FXData[4].lifeTimeRandomness);
        FXArr.push(new temoraryObject(x + myMath.random(6)-3, y+ myMath.random(6)-3, Math.random() * 0.7, Math.random() * 2 * Math.PI, FXData[4].totalLifeTime + randomTime, FXData[4].fadeInTime, FXData[4].fadeOutStartTime + randomTime, FXData[4].spriteName, objects.numOfElementsCreated, FXData[4].name));
        objects.increaseObjectCounter();
    }
}

function temoraryObject (x, y, speed, angle, totalLifeTime, fadeInTime, fadeOutStartTime, spriteName, id, name, textStr){
    this.x = x,
    this.y = y,
    this.speed = speed,
    this.angle = angle,
    this.frameCounter = 0,
    this.totalLifeTime = totalLifeTime,
    this.fadeInTime = fadeInTime
    this.fadeOutStartTime = fadeOutStartTime,
    this.fadeDuration = totalLifeTime - fadeOutStartTime,
    this.id = id,
    this.opacity = 1,
    this.name = name;
    //check if the object is a sprite or a text
    if (typeof spriteName !== 'undefined'){
        this.spriteName = spriteName;
        draw.createSprite(spriteName, id, x, y, angle);
        objects.increaseObjectCounter();
    }
    if (typeof textStr !== 'undefined'){
        draw.createText(textStr, id, x, y);
        objects.increaseObjectCounter();
    }
}

export function updateFX() {
    //update temporary objects
    FXArr.forEach((fxObject, index) => {
        if (fxObject.spriteName == "bubble"){
            fxObject.y -= Math.random() * 0.5;
        }
        if (fxObject.speed != 0){
            moveObject(fxObject);
        }
        updateLifeTime(fxObject, index);
    })
}

function updateLifeTime(fxObject, index){
    fxObject.frameCounter ++;
    //check if the object is still fading in
    if (fxObject.frameCounter < fxObject.fadeInTime){
        fxObject.opacity = fxObject.frameCounter / fxObject.fadeInTime;
    }
    //check if the object should start fading out
    if (fxObject.frameCounter > fxObject.fadeOutStartTime){
        //check if it isn't already dead
        if (fxObject.frameCounter > fxObject.totalLifeTime){
            if (fxObject.name == "EVOLUTION TEXT"){
                draw.deleteSprite(fxObject.id, true);
            } else {
                draw.deleteSprite(fxObject.id);
            }
            FXArr.splice(index, 1);
        } else {
            //update the opacity
            fxObject.opacity = 1 - ((fxObject.frameCounter - fxObject.fadeOutStartTime) / (fxObject.totalLifeTime - fxObject.fadeOutStartTime))
        }
    }
}

function moveObject(object) {
    let dxy = myMath.getVectorComponents(object.angle, object.speed);
    object.x += dxy[0];
    object.y += dxy[1];
    object.speed *= main.friction;
  }