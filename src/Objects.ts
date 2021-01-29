import { screenWidth, screenHeight, friction } from "./SeacoScript";
import {
  random,
  getVectorComponents,
  modAbs,
  getAngleBetweenPoints,
  dist,
} from "./Math Functions";
import {
  fishColors,
  spawnRate,
  mutationChance,
  mutationAmount,
  colorEvolution,
  herringFoodWhenFull,
  herringFoodWhenHungry,
  herringActionTime,
  codFoodWhenFull,
  codFoodWhenHungry,
  codActionTime,
  selection,
  updateSelection,
  herringSpeed,
  herringVision,
  codSpeed,
  codVision,
  herringBabyCost,
  codBabyCost
} from "./UI-management";
import { createSprite, deleteSprite } from "./Draw";
import { createBloodCloud, createBubbles, createTemporaryObject } from "./FX";

const pi = Math.PI;

export let frameCounter = 0;
export function updateFrameCounter() {frameCounter++;};

export let numOfElementsCreated = 0;

export const plantsArr = [];
export const fishArr = [];

// arrays to keep track of the individual fishes, used to update behaviour
const herringArr = [],
  herringLookingForMate = [],
  codArr = [],
  codLookingForMate = [];

const animationData = [
  {
    // swimming animation
    funcX: function (animationLength, animationCounter) {
      return 0.1 * (animationCounter / animationLength);},
    funcY: function (animationLength, animationCounter) {
      return -0.1 * (animationCounter / animationLength);}
  },
  {
    // eating animation
    funcX: function () {
        return 0.1
    },
    funcY: function () {
        return 0.1 
    }
  },
  {
    // mating animation
    funcX: function (animationLength, animationCounter) {
      return 0.3 * Math.sin(animationCounter * 0.5);},
    funcY: function (animationLength, animationCounter) {
      return 0.1 * Math.cos(animationCounter * 0.5);},
  },
];

// All starting attributes of the fish. Ordered by species, 0 = Herring, 1  = Cod, 2 = Shark
export const protoFish = [
  {
    maxSpeed: 1.3,
    size: 20,
    actionTime: 20,
    randomSwimAngle: 0.3,
    startFood: 3,
    foodWhenHungry: 7,
    foodWhenFull: 15,
    foodReserve: 3,
    turnSpeed: 5,
    vision: 150,
    framesTillAdult: 500,
    foodValue: 2,
    babySpeed: 0.6,
    babyCost: 5,
    spriteName: "fish1",
    babySpriteName: "fish1baby",
    speciesName: "Herring",
    colorArr: [255,255,255],
    colorDepth: 150,
    deadFXIndex: 1,
    loveFXIndex: 0,
    foodArr: plantsArr,
    enemyArr: codArr,
    mateArr: herringLookingForMate,
    ownSpeciesArr: herringArr,
    mateTime: 50,
    eatTime: 10,
    hungerMultiplier: 1,
    animationMultiplier: 1.2,
    bubbleAmtWhenEats: function(){return 1 + random(2)},
  },
  {
    maxSpeed: 2.0,
    size: 50,
    actionTime: 20,
    randomSwimAngle: 0.3,
    startFood: 3,
    foodWhenHungry: 7,
    foodWhenFull: 15,
    foodReserve: 5,
    turnSpeed: 10,
    vision: 250,
    framesTillAdult: 600,
    foodValue: 4,
    babySpeed: 0.6,
    babyCost: 5,
    spriteName: "fish2",
    babySpriteName: "fish2baby",
    speciesName: "Cod",
    color: 1.8,
    colorDepth: 100,
    deadFXIndex: 2,
    loveFXIndex: 0,
    foodArr: herringArr,
    enemyArr: [],
    mateArr: codLookingForMate,
    ownSpeciesArr: codArr,
    mateTime: 80,
    eatTime: 20,
    hungerMultiplier: 0.4,
    animationMultiplier: 0.6,
    bubbleAmtWhenEats: function(){return 5 + random(10)},
  }
];

//an array with properties for a new fish that's placed by the player, which starts off identical to the protofish
export const newFish = JSON.parse(JSON.stringify(protoFish));

enum behaviourEnum {
  LOOKINGFORFOOD = "Looking For Food",
  LOOKINGFORMATE = "Looking For Mate",
  EATING = "Eating",
  FLEEING = "Fleeing",
  MATING = "Mating"
}

const protoPlant = {
  size : 2,
  growSize : 1.5,
  speed : 0.5,
  gColorStart : 165,
  rColorStart : 64,
  startColor: [136,221,17],
  RColoration : -40,
  GColoration : -150,
  color :  "0x88DD11",
  reproduceRate : 300,
  wobbleAmt : 0.03,
  reproduceChance : 0.45,
  spawnRate : 5,
  foodValue : 2
  }

// basic object properties
export class seaObject{
  //(x, y, speed, currentAngle, size) 
  x : number;
  y : number;
  speed: number;
  currentAngle: number;
  creationTime: number;
  size: number;
  constructor(x: number, y: number, speed: number, currentAngle: number, size: number){
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.creationTime = frameCounter;
    this.size = size;
    this.currentAngle = currentAngle;
  }
}

//create a new plant/plankton
export class plant extends seaObject {
//properties
  reproduceRate: number;
  reproduceChance: number;
  wobbleAmt: number;
  RColor: number;
  GColor: number;
  BColor: number;
  foodValue: number;

//constructor
  constructor(x, y, speed, currentAngle, size){
    super(x, y, speed, currentAngle, size)
    this.reproduceRate = protoPlant.reproduceRate + random(protoPlant.reproduceRate);
    this.reproduceChance = protoPlant.reproduceChance;
    this.wobbleAmt = protoPlant.wobbleAmt;
    this.RColor = protoPlant.startColor[0];
    this.GColor = protoPlant.startColor[1];
    this.BColor = protoPlant.startColor[2];
    this.foodValue = protoPlant.foodValue;
  };
}

//create a new fish
export class fish extends seaObject {
  //(x, y, currentAngle, spriteName, actionTime, maxSpeed, randomSwimAngle, vision, turnSpeed, adult, species, generation, colorArr) {
  //properties
  species: number;
  adult: boolean;
  generation: number;

  currentFood: number;
  foodWhenHungry: number;
  foodWhenFull: number;
  foodValue: number;
  mateTime: number;
  eatTime: number;

  maxSpeed: number;
  randomSwimAngle: number;
  turnSpeed: number;
  colorArr: [];
  vision: number;

  spriteName: string;
  id: number;

  nextAction: number;
  actionTime: number;
  turnCounter: number;
  turnFraction: number;
  currentBehaviour: string;
  framesTillAdult: number;
  animated: boolean;
  animationScaleX: number;
  animationScaleY: number;
  animationID: number;

  constructor (x, y, currentAngle, spriteName, actionTime, maxSpeed, randomSwimAngle, vision, turnSpeed, adult, species, generation, colorArr){
    super(x, y, 0, currentAngle, protoFish[species].size)
    this.species = species;
    this.adult = adult;
    this.generation = generation;

    this.currentFood = protoFish[species].startFood;
    this.foodWhenHungry = newFish[species].foodWhenHungry;
    this.foodWhenFull = newFish[species].foodWhenFull;
    this.foodValue = protoFish[species].foodValue;
    this.mateTime = protoFish[species].mateTime;
    this.eatTime = protoFish[species].eatTime;

    this.maxSpeed = maxSpeed;
    this.randomSwimAngle = randomSwimAngle;
    this.vision = vision;
    this.turnSpeed = turnSpeed;
    this.colorArr = colorArr;
  
    //create a sprite for the fish
    this.spriteName = spriteName;
    this.id = numOfElementsCreated;

    this.nextAction = 0;
    this.actionTime = actionTime;
    this.turnCounter = 0;
    this.turnFraction = 0;
    this.currentBehaviour = "";
    this.framesTillAdult = protoFish[species].framesTillAdult;
    this.animated = false;
    this.animationScaleX = 1;
    this.animationScaleY = 1;
    this.animationID = 0;

    createSprite(this.spriteName, this.id, this.x, this.y, this.currentAngle, this.colorArr);
    numOfElementsCreated++;
  }
}

//plant update cycle
export function updatePlants() {
  if (frameCounter % protoPlant.spawnRate === 0){
    createPlants(1, random(screenWidth), random(screenHeight));
  }
  plantsArr.forEach((plant, index) => {
    //movement
    movePlant(plant);
    //grow
    grow(plant);

    //reproduction
    if (frameCounter - plant.creationTime > plant.reproduceRate) {
      if (Math.random() < plant.reproduceChance) {
        createPlants(2, plant.x, plant.y);
      }
      plantsArr.splice(index, 1);
    }
  });
}

//fish update cycle
export function updateFish() {
  //reset all arrays containing individual fish catagories - they are used in fishBehaviour
  herringArr.length = 0;
  herringLookingForMate.length = 0;
  codArr.length = 0;
  codLookingForMate.length = 0;

  fishArr.forEach((fish) => {
    switch (fish.species) {
      case 0:
        herringArr.push(fish);
        if (fish.currentBehaviour === behaviourEnum.LOOKINGFORMATE) {
          herringLookingForMate.push(fish);
        }
        break;
      case 1:
        codArr.push(fish);
        if (fish.currentBehaviour === behaviourEnum.LOOKINGFORMATE) {
          codLookingForMate.push(fish);
        }
        break;
    }
  });

  //now update all the individual fishes
  fishArr.forEach((thisfish, index) => {
    // check if baby fishes are ready to become adults
    if (thisfish.adult == false){
      thisfish.framesTillAdult--;
      if (thisfish.framesTillAdult == 0){
        fishArr.push(new fish(thisfish.x, thisfish.y, thisfish.currentAngle, protoFish[thisfish.species].spriteName, thisfish.actionTime, thisfish.maxSpeed, thisfish.randomSwingAngle, thisfish.vision, thisfish.turnSpeed, true, thisfish.species, thisfish.generation, thisfish.colorArr))
        //if the babyfish was selected update selection to the adult
        if (selection.id == thisfish.id){
          updateSelection(numOfElementsCreated - 1, protoFish[thisfish.species].spriteName, true)
        }
        deleteSprite(thisfish.id, false)
        fishArr.splice(index, 1);
      }
    }
    //movement
    moveFish(thisfish);
    if (thisfish.currentBehaviour === behaviourEnum.LOOKINGFORFOOD){
      checkForFood(thisfish, protoFish[thisfish.species].foodArr);
      checkIfYoureDead(thisfish, index);
    }
    if (thisfish.currentBehaviour === behaviourEnum.LOOKINGFORMATE){
      checkForMate(thisfish, protoFish[thisfish.species].mateArr);
    }
  });
}

function moveFish(fish) {
  //check if the fish is ready to make a new decision about what to do next
  if (frameCounter > fish.nextAction) {  
    // make sure the angle > 0 (to prevent extra rotations)
    if (fish.currentAngle < 0){fish.currentAngle += pi * 2}
    if (fish.currentAngle > pi * 2){fish.currentAngle -= pi * 2}
    // make the fish turn smooth using a framecounter that counts till it reaches fish.turnSpeed
    if (fish.turnCounter == 0) {
      //this function decides what the fish prioritizes and sets the fish.targetAngle accordingly
      fish.targetAngle = fishBehaviour(fish);
      if (fish.targetAngle  - fish.currentAngle > pi){fish.targetAngle -= pi * 2};
      if (fish.targetAngle - fish.currentAngle < -pi){fish.targetAngle += pi * 2};
      
      fish.turnFraction =
        (fish.targetAngle - fish.currentAngle) / fish.turnSpeed;
      fish.turnCounter = 1;
    } else {
      fish.currentAngle += fish.turnFraction;
      fish.turnCounter++;
      if (fish.turnCounter == fish.turnSpeed) {
        fish.currentAngle = fish.targetAngle;
        fish.speed = fish.maxSpeed;
        fish.nextAction = frameCounter + fish.actionTime + random(fish.actionTime);
        setFishAnimation(fish);
        fish.turnCounter = 0;
      }
    }
  }
  //update the fish position
  fish.speed *= friction;
  fish.currentFood -= (0.002 * protoFish[fish.species].hungerMultiplier) +(fish.maxSpeed * 0.004 * protoFish[fish.species].hungerMultiplier);

  let dx = getVectorComponents(fish.currentAngle, fish.speed)[0];
  let dy = getVectorComponents(fish.currentAngle, fish.speed)[1];
  fish.x += dx;
  fish.y += dy;
  fish.x = modAbs(fish.x, screenWidth);
  fish.y = modAbs(fish.y, screenHeight);

  updateFishAnimation(fish);
}

function fishBehaviour(fish){
  let outAngle;
  // check if enemies are nearby, if so, flee
  let enemyArr = protoFish[fish.species].enemyArr;
  let closestEnemyIndex = getClosestTargetIndex(fish, enemyArr)
  if (!isNaN(closestEnemyIndex)) {
    outAngle = getAngleBetweenPoints(fish.x, fish.y, enemyArr[closestEnemyIndex].x, enemyArr[closestEnemyIndex].y) + pi;
    fish.currentBehaviour = behaviourEnum.FLEEING;
    return outAngle;
  }
  //if the fish is a baby it just swims around randomly
  if (fish.adult == false){
    outAngle = fish.currentAngle + random(protoFish[fish.species].randomSwimAngle * 2) - protoFish[fish.species].randomSwimAngle;
    return outAngle
  }
  //check if a new behaviour should be set based on the amound of food
  if (fish.currentFood < fish.foodWhenHungry){
    fish.currentBehaviour = behaviourEnum.LOOKINGFORFOOD;
  }
  if (fish.currentFood < fish.foodWhenFull && fish.currentBehaviour != behaviourEnum.LOOKINGFORMATE){
    fish.currentBehaviour = behaviourEnum.LOOKINGFORFOOD;
  }
  if (fish.currentFood > fish.foodWhenFull){
    fish.currentBehaviour = behaviourEnum.LOOKINGFORMATE;
  }

  // if the fish is hungry check if there's any food in range - else just keep on looking
  if (fish.currentBehaviour === behaviourEnum.LOOKINGFORFOOD){
    let closestFoodIndex = getClosestTargetIndex(fish, protoFish[fish.species].foodArr)
    // if theres food in sight set targetAngle towards it
    if (!isNaN(closestFoodIndex)){
      outAngle = getAngleBetweenPoints(fish.x, fish.y, protoFish[fish.species].foodArr[closestFoodIndex].x, protoFish[fish.species].foodArr[closestFoodIndex].y)
      fish.targetFoodIndex = closestFoodIndex;
    } else {
      outAngle = fish.currentAngle + random(protoFish[fish.species].randomSwimAngle * 2) - protoFish[fish.species].randomSwimAngle;
    }
  }

  //if the fish is full check if theres a mate in sight
  if (fish.currentBehaviour === behaviourEnum.LOOKINGFORMATE){
    let closestMateIndex = getClosestTargetIndex(fish, protoFish[fish.species].mateArr)
    // if theres food in sight set targetAngle towards it
    if (!isNaN(closestMateIndex)){
      outAngle = getAngleBetweenPoints(fish.x, fish.y, protoFish[fish.species].mateArr[closestMateIndex].x, protoFish[fish.species].mateArr[closestMateIndex].y)
      fish.targetMateIndex = closestMateIndex;
    } else {
      outAngle = fish.currentAngle + random(protoFish[fish.species].randomSwimAngle * 2) - protoFish[fish.species].randomSwimAngle;
    }
  }

  return outAngle;
}

//this function checks which item in targetArray is closest to object thisfish, and returns its index in the targetArray
function getClosestTargetIndex(thisfish, targetArray){
  let closestTargetIndex;
  let closestTargetDistance = screenWidth * 2;
  targetArray.forEach((target, index) => {
      //get the nearest target
      let distToCurrentTarget = dist(thisfish.x, thisfish.y, target.x, target.y)
      if (distToCurrentTarget < thisfish.vision){
        //make sure the fish cant choose itself as target
        if (distToCurrentTarget < closestTargetDistance && distToCurrentTarget > 0){
          closestTargetIndex = index;
          closestTargetDistance = distToCurrentTarget;
      }
    }
  })
  return closestTargetIndex
}

//check if a fish is close enough to its food to eat it
function checkForFood(thisfish, targetArr){
  //check if the fish has a target
  if (!isNaN(thisfish.targetFoodIndex)){
    //check if the target still exists
    if (typeof targetArr[thisfish.targetFoodIndex] != "undefined"){
      //check if it's close enough to eat
      if (dist(thisfish.x, thisfish.y, targetArr[thisfish.targetFoodIndex].x, targetArr[thisfish.targetFoodIndex].y) < thisfish.size){
        let eatenFoodIndex =  fishArr.findIndex(targetfish => targetArr[thisfish.targetFoodIndex] === targetfish)
        //check if the food is a fish, in that case it also has to be removed from fishArr
        if (eatenFoodIndex > -1){
          //if the eaten fish was selected clear the selection
          if (fishArr[eatenFoodIndex].id == selection.id){
            updateSelection("","", false);
          }
          createBloodCloud(fishArr[eatenFoodIndex].x, fishArr[eatenFoodIndex].y);
          deleteSprite(fishArr[eatenFoodIndex].id, false);
          fishArr.splice(eatenFoodIndex, 1);
        }
        //the fish has more food now
        thisfish.currentFood += targetArr[thisfish.targetFoodIndex].foodValue;
        //delete it from the target array
        targetArr.splice(thisfish.targetFoodIndex, 1);

        //the fish has a new behaviour now, eating
        createBubbles(thisfish.x, thisfish.y, 3, numOfElementsCreated, protoFish[thisfish.species].bubbleAmtWhenEats());
        thisfish.currentBehaviour = behaviourEnum.EATING;
        thisfish.speed = thisfish.speed * 0.2;
        thisfish.nextAction = frameCounter + thisfish.eatTime;
        setFishAnimation(thisfish);
      }
    }
  }
}

function checkForMate(thisfish, targetArr){
  //check if the fish has a target
  if (!isNaN(thisfish.targetMateIndex)){
    //check if the target still exists
    if (typeof targetArr[thisfish.targetMateIndex] != "undefined"){
      //check if it's close enough to mate
      if (dist(thisfish.x, thisfish.y, targetArr[thisfish.targetMateIndex].x, targetArr[thisfish.targetMateIndex].y) < thisfish.size * 0.8  &&
        dist(thisfish.x, thisfish.y, targetArr[thisfish.targetMateIndex].x, targetArr[thisfish.targetMateIndex].y) > 1){
        //check which fish is the oldest(the generation of the oldest one counts for the new fish)
        let oldestGeneration = thisfish.generation;
        if (targetArr[thisfish.targetMateIndex].generation > oldestGeneration){oldestGeneration = targetArr[thisfish.targetMateIndex].generation}
        // determine the offspring color
        let newFishStats = determineOffspringStats(thisfish, targetArr[thisfish.targetMateIndex]);
        //create a new fish
        fishArr.push(new fish(thisfish.x, thisfish.y, thisfish.currentAngle + pi * 0.5, protoFish[thisfish.species].babySpriteName, newFishStats[2], newFishStats[0], thisfish.randomSwimAngle, newFishStats[1], thisfish.turnSpeed, false, thisfish.species, oldestGeneration + 1, newFishStats[3]))
        //spawn a heart
        createTemporaryObject((thisfish.x + targetArr[thisfish.targetMateIndex].x) / 2, (thisfish.y + targetArr[thisfish.targetMateIndex].y) / 2, 0, 0, protoFish[thisfish.species].loveFXIndex, numOfElementsCreated)
        numOfElementsCreated++;
        //the parent fishes have less food now
        targetArr[thisfish.targetMateIndex].currentFood -= newFish[thisfish.species].babyCost;
        targetArr[thisfish.targetMateIndex].currentBehaviour = behaviourEnum.MATING;
        targetArr[thisfish.targetMateIndex].speed = 0;
        targetArr[thisfish.targetMateIndex].nextAction = frameCounter + protoFish[thisfish.species].mateTime;
        targetArr[thisfish.targetMateIndex].currentAngle += thisfish.currentAngle + pi
        setFishAnimation(targetArr[thisfish.targetMateIndex]);
        thisfish.currentFood -= newFish[thisfish.species].babyCost;
        thisfish.currentBehaviour = behaviourEnum.MATING
        thisfish.speed = 0;
        thisfish.nextAction = frameCounter + thisfish.mateTime;
        setFishAnimation(thisfish);
      }
    }
  }
}

//check if a fish should die from hunger
function checkIfYoureDead(fish, index){
  if (fish.currentFood < 0){
    if (fish.id == selection.id){
      updateSelection("","", false)
    }
    deleteSprite(fish.id, false);
    createTemporaryObject(fish.x, fish.y, fish.speed / 2, fish.currentAngle, protoFish[fish.species].deadFXIndex, numOfElementsCreated);
    fishArr.splice(index, 1);
  }
}

//update stats of new fish when they are changed in the fish place UI
export function updateNewFishStats(){
  newFish[0].maxSpeed = protoFish[0].maxSpeed * herringSpeed.value;
  newFish[0].vision = Math.ceil(protoFish[0].vision * herringVision.value);
  newFish[0].actionTime = Math.ceil(protoFish[0].actionTime * herringActionTime.value);
  newFish[1].maxSpeed = protoFish[1].maxSpeed * codSpeed.value;
  newFish[1].vision = Math.ceil(protoFish[1].vision * codVision.value);
  newFish[1].actionTime = Math.ceil(protoFish[1].actionTime * codActionTime.value);
}

export function updateNewFishColor(index, species){
  newFish[species].colorArr = fishColors[index];
}

//kill a fish (used when a fish is selected)
export function killFish(id){
  let index = fishArr.findIndex(fish => fish.id === id)
  deleteSprite(id, false);
  createTemporaryObject(fishArr[index].x, fishArr[index].y, fishArr[index].speed / 2, fishArr[index].currentAngle, protoFish[fishArr[index].species].deadFXIndex, numOfElementsCreated);
  numOfElementsCreated++;
  fishArr.splice(index, 1);
}

function setFishAnimation(fish) {
    fish.animationLength = fish.nextAction - frameCounter;
    fish.animationCounter = 0;
    fish.animated = true;

    if (fish.currentBehaviour === behaviourEnum.LOOKINGFORFOOD || fish.currentBehaviour === behaviourEnum.LOOKINGFORMATE || fish.currentBehaviour === behaviourEnum.FLEEING) {
      fish.animationID = 0;
    }
    if (fish.currentBehaviour === behaviourEnum.EATING) {
      fish.animationID = 1;
    }
    if (fish.currentBehaviour === behaviourEnum.MATING) {
      fish.animationID = 2;
    }
  }

function updateFishAnimation(thisfish){
  // check if the sprite is animated, if so animate it
  if (thisfish.animated){
    thisfish.animationScaleX = 1 + animationData[thisfish.animationID].funcX(thisfish.animationLength, thisfish.animationCounter) * protoFish[thisfish.species].animationMultiplier;
    thisfish.animationScaleY = 1 + animationData[thisfish.animationID].funcY(thisfish.animationLength, thisfish.animationCounter) * protoFish[thisfish.species].animationMultiplier;

    thisfish.animationCounter++;
   if (thisfish.animationCounter > thisfish.animationLength){
    thisfish.animationCounter = 0;
   }
  }
}
  
function movePlant(plant) {
  let dxy = getVectorComponents(plant.currentAngle, plant.speed);
  plant.x += dxy[0];
  plant.y += dxy[1];
  plant.x += wobblePlants(plant.x, plant.y, plant.wobbleAmt)[0];
  plant.y += wobblePlants(plant.x, plant.y, plant.wobbleAmt)[1];

  plant.x = modAbs(plant.x, screenWidth);
  plant.y = modAbs(plant.y, screenHeight);

  plant.speed *= friction;
}

function wobblePlants(x, y, amount) {
  return [
    amount * Math.sin(0.001 * frameCounter + 0.005 * x),
    amount * Math.cos(0.001 * frameCounter + 0.001 * y),
  ];
}

//growth function for the plants (size and color)
function grow(object) {
  let timeAlive = frameCounter - object.creationTime;
  let lifeFactor = timeAlive / object.reproduceRate;
  object.size = protoPlant.size + protoPlant.growSize * lifeFactor;

  object.RColor = Math.floor(protoPlant.startColor[0] + protoPlant.RColoration * lifeFactor);
  object.GColor = Math.floor(protoPlant.startColor[1] + protoPlant.GColoration * lifeFactor);
}

export function createPlants(number, x, y) {
  for (let i = 0; i < number; i++) {
    plantsArr.push(
      new plant(
        x,
        y,
        protoPlant.speed,
        Math.random() * 2 * pi,
        protoPlant.size
      )
    );
  }
}

export function createProtoFish(x, y, species, colorArr) {
  if (typeof(colorArr) == "undefined"){
    colorArr = newFish[species].colorArr;
  }
  fishArr.push(
    new fish(
      x,
      y,
      Math.random() * 2 * pi,
      newFish[species].spriteName,
      newFish[species].actionTime,
      newFish[species].maxSpeed,
      newFish[species].randomSwimAngle,
      newFish[species].vision,
      newFish[species].turnSpeed,
      true,
      species,
      0,
      colorArr
    )
  );
}

function determineOffspringStats(fish1, fish2){
  //color
  let selectiveGene = Math.random();
  let randomR = Math.random() * 2 * colorEvolution.value - colorEvolution.value;
  let randomG = Math.random() * 2 * colorEvolution.value - colorEvolution.value;
  let randomB = Math.random() * 2 * colorEvolution.value - colorEvolution.value;
  let RColor = fish1.colorArr[0] * selectiveGene + fish2.colorArr[0] * (1 - selectiveGene) + randomR;
  let GColor = fish1.colorArr[1] * selectiveGene + fish2.colorArr[1] * (1 - selectiveGene) + randomG;
  let BColor = fish1.colorArr[2] * selectiveGene + fish2.colorArr[2] * (1 - selectiveGene) + randomB;
  RColor = Math.floor(Math.max(Math.min(255, RColor), 30))
  GColor = Math.floor(Math.max(Math.min(255, GColor), 30))
  BColor = Math.floor(Math.max(Math.min(255, BColor), 30))

  //get the stats for the baby fish from the parent fishes
  let newSpeed = fish1.maxSpeed * selectiveGene + fish2.maxSpeed * (1-selectiveGene);
  let newVision = fish1.vision * selectiveGene + fish2.vision * (1-selectiveGene);
  let newActionTime = fish1.actionTime * selectiveGene + fish2.actionTime * (1-selectiveGene);
  let evolveStr;

  //random mutation
  //check if a mutation occurs
  if (Math.random() < mutationChance.value){
    let whichStatMutates = random(2);
    let evolutionAmount = Math.random() * 2 * mutationAmount.value - mutationAmount.value;
    //update mutated stat and set string to be displayed
    evolveStr= "No Mutation"
    switch (whichStatMutates){
      case 0:
        newSpeed += evolutionAmount;
        //check what text should be displayed
        if (evolutionAmount > 0) {
          evolveStr = 'Speed + ' + Math.round(evolutionAmount * 10) / 10;
        }
        if (evolutionAmount < 0) {
          evolveStr = 'Speed - ' + Math.round(-evolutionAmount * 10) / 10;
        }
        //check is stat doesnt get too low
        if (newSpeed < 0.1){
          newSpeed = 0.1
        }
        break;
      case 1:
        newVision += 40 * evolutionAmount;
        //check what text should be displayed
        if (evolutionAmount > 0) {
          evolveStr = 'Vision + ' + Math.round(40 * evolutionAmount);
        }
        if (evolutionAmount < 0) {
          evolveStr = 'Vision - ' + Math.round(40 * -evolutionAmount);
        }
        //check is stat doesnt get too low
        if (newVision < 10){
          newVision = 10;
        }
        break;
      case 2:
        newActionTime += evolutionAmount;
        //check what text should be displayed
        if (evolutionAmount > 0) {
          evolveStr = 'Reaction time + ' + Math.round(evolutionAmount * 10) / 10;
        }
        if (evolutionAmount < 0) {
          evolveStr = 'Reaction time - ' + Math.round(-evolutionAmount * 10) / 10;
        }
        //check is stat doesnt get too low
        if (newActionTime < 4){
          newActionTime = 4
        }
        break;
    }
    createTemporaryObject(fish1.x + 24, fish1.y - 8, 0, 0, 5, numOfElementsCreated, evolveStr)
  }
  return [newSpeed, newVision, newActionTime, [RColor, GColor, BColor]];
}

//kill everything (called from options menu)
export function killAllFish(){
  frameCounter = 0;
  fishArr.forEach(thisfish => {
    deleteSprite(thisfish.id, false);
    createTemporaryObject(thisfish.x, thisfish.y, thisfish.speed / 2, thisfish.currentAngle, protoFish[thisfish.species].deadFXIndex, numOfElementsCreated);
    numOfElementsCreated++;
  })
  fishArr.length = 0;
  plantsArr.length = 0;
}

export function increaseObjectCounter(){
  numOfElementsCreated++;
}

export function initialize(){
  fishArr.forEach(thisfish => {
    deleteSprite(thisfish.id, false);
  })
  fishArr.length = 0;
  plantsArr.length = 0;

  newFish[0].colorArr = fishColors[0];
  newFish[1].colorArr = fishColors[0];
}

export function changeOptions(){
  protoPlant.spawnRate = 28 - (3*(spawnRate.value-1));

  newFish[0].foodWhenHungry = herringFoodWhenHungry.value;
  newFish[0].foodWhenFull = herringFoodWhenFull.value;
  newFish[0].babyCost = herringBabyCost.value;

  newFish[1].foodWhenHungry = codFoodWhenHungry.value;
  newFish[1].foodWhenFull = codFoodWhenFull.value;
  newFish[1].babyCost = codBabyCost.value;

  fishArr.forEach(thisfish => {
    thisfish.foodWhenHungry = newFish[thisfish.species].foodWhenHungry;
    thisfish.foodWhenFull = newFish[thisfish.species].foodWhenFull;
    thisfish.babyCost = newFish[thisfish.species].babyCost;
  });
}
