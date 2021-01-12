import * as main from "./SeacoScript.js";
import * as myMath from "./Math Functions.js";
import * as UI from "./UI-management.js";
import * as draw from "./Draw.js";
import * as FX from "./FX.js";
import * as sound from "./sound.js";

export let numOfElementsCreated = 0;

const protoPlant = {
  species: "plant",
  family: "plant",
  size: 2,
  growSize: 1.5,
  speed: 0.5,
  gColorStart: 165,
  rColorStart: 64,
  startColor: [136, 221, 17],
  RColoration: -40,
  GColoration: -150,
  color: "0x88DD11",
  reproduceRate: 300,
  wobbleAmt: 0.03,
  reproduceChance: 0.45,
  spawnRate: 5,
  foodValue: 2,
};

const pi = Math.PI;

let colorEvolution = 20;
let mutationChance = 0.4;
let mutationAmount = 0.4;

export let frameCounter = 0;
export function updateFrameCounter() {
  frameCounter++;
}

// arrays to keep track of all fish and plants, used to update behaviour
export const state = {
  seaObjects: [],
};

export function getSeaObjectsBySpecies(species) {
  return state.seaObjects.filter((object) => object.species === species);
}

export function getSeaObjectsByFamily(family) {
  return state.seaObjects.filter((object) => object.family === family);
}

function removeSeaObject(object) {
  state.seaObjects.splice(state.seaObjects.indexOf(object), 1);
}

const animationData = [
  {
    // swimming animation
    funcX: function (animationLength, animationCounter) {
      return 0.1 * (animationCounter / animationLength);
    },
    funcY: function (animationLength, animationCounter) {
      return -0.1 * (animationCounter / animationLength);
    },
  },
  {
    // eating animation
    funcX: function (animationLength, animationCounter) {
      return 0.1;
    },
    funcY: function (animationLength, animationCounter) {
      return 0.1;
    },
  },
  {
    // mating animation
    funcX: function (animationLength, animationCounter) {
      return 0.3 * Math.sin(animationCounter * 0.5);
    },
    funcY: function (animationLength, animationCounter) {
      return 0.1 * Math.cos(animationCounter * 0.5);
    },
  },
];

// All starting attributes of the fish. Ordered by species, 0 = Herring, 1  = Cod, 2 = Shark
export const protoFish = {
  herring: {
    family: "fish",
    species: "herring",
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
    colorArr: [255, 255, 255],
    colorDepth: 150,
    deadFXIndex: 1,
    loveFXIndex: 0,
    foodSpecies: "plant",
    enemySpecies: "cod",
    mateTime: 50,
    eatTime: 10,
    hungerMultiplier: 1,
    animationMultiplier: 1.2,
    bubbleAmtWhenEats: function () {
      return 1 + myMath.random(2);
    },
  },
  cod: {
    family: "fish",
    species: "cod",
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
    foodSpecies: "herring",
    enemySpecies: "shark",
    mateTime: 80,
    eatTime: 20,
    hungerMultiplier: 0.4,
    animationMultiplier: 0.6,
    bubbleAmtWhenEats: function () {
      return 5 + myMath.random(10);
    },
  },
};

//an array with properties for a new fish that's placed by the player, which starts off identical to the protofish
const newFish = JSON.parse(JSON.stringify(protoFish));

// basic object properties
export function seaObject(x, y, speed, currentAngle, size) {
  this.x = x;
  this.y = y;
  this.speed = speed;
  this.currentAngle = currentAngle;
  this.creationTime = frameCounter;
  this.size = size;
}

//create a new plant/plankton
export function plant(
  x,
  y,
  speed,
  currentAngle,
  size,
  reproduceRate,
  reproduceChance,
  wobbleAmt,
  color
) {
  seaObject.call(this, x, y, speed, currentAngle, size);
  this.reproduceRate = reproduceRate + myMath.random(reproduceRate);
  this.reproduceChance = reproduceChance;
  this.wobbleAmt = wobbleAmt;
  this.family = protoPlant.family;
  this.RColor = protoPlant.startColor[0];
  this.GColor = protoPlant.startColor[1];
  this.BColor = protoPlant.startColor[2];
  this.foodValue = protoPlant.foodValue;
}

//create a new fish
export function fish(
  x,
  y,
  currentAngle,
  spriteName,
  actionTime,
  maxSpeed,
  randomSwimAngle,
  vision,
  turnSpeed,
  adult,
  species,
  generation,
  colorArr
) {
  seaObject.call(this, x, y, 0, currentAngle);
  //set whether it's an adult or baby
  this.adult = adult;
  this.generation = generation;

  //set non-evolvable attributes for the fish by referencing the protoFish object for the specific species
  this.species = protoFish[species].species;
  this.family = protoFish[species].family;
  this.size = protoFish[species].size;
  this.currentFood = protoFish[species].startFood;
  this.foodWhenHungry = newFish[species].foodWhenHungry;
  this.foodWhenFull = newFish[species].foodWhenFull;
  this.foodValue = protoFish[species].foodValue;
  this.mateTime = protoFish[species].mateTime;
  this.eatTime = protoFish[species].eatTime;

  //set evolvable attributes for the fish, these have to be passed on in the creation function
  this.maxSpeed = maxSpeed;
  this.randomSwimAngle = randomSwimAngle;
  this.vision = vision;
  this.turnSpeed = turnSpeed;
  this.colorArr = colorArr;

  //create a sprite for the fish
  this.spriteName = spriteName;
  this.id = numOfElementsCreated;
  draw.createSprite(
    spriteName,
    this.id,
    this.x,
    this.y,
    this.currentAngle,
    colorArr,
    protoFish[species].colorDepth
  );
  numOfElementsCreated++;

  //other variables used by the movement and behaviour functions
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
}

//plant update cycle
export function updatePlants() {
  if (frameCounter % protoPlant.spawnRate === 0) {
    createPlants(
      1,
      myMath.random(main.screenWidth),
      myMath.random(main.screenHeight)
    );
  }
  const plants = getSeaObjectsBySpecies("plant");
  plants.forEach((plant) => {
    //movement
    movePlant(plant);
    //grow
    grow(plant);

    //reproduction
    if (frameCounter - plant.creationTime > plant.reproduceRate) {
      if (Math.random() < plant.reproduceChance) {
        createPlants(2, plant.x, plant.y);
      }
      removeSeaObject(plant);
    }
  });
}

//fish update cycle
export function updateFish() {
  //now update all the individual fishes
  const fishArr = getSeaObjectsByFamily("fish");

  fishArr.forEach((thisfish) => {
    // check if baby fishes are ready to become adults
    if (thisfish.adult == false) {
      thisfish.framesTillAdult--;
      if (thisfish.framesTillAdult == 0) {
        fishArr.push(
          new fish(
            thisfish.x,
            thisfish.y,
            thisfish.currentAngle,
            protoFish[thisfish.species].spriteName,
            thisfish.actionTime,
            thisfish.maxSpeed,
            thisfish.randomSwingAngle,
            thisfish.vision,
            thisfish.turnSpeed,
            true,
            thisfish.species,
            thisfish.generation,
            thisfish.colorArr
          )
        );
        //if the babyfish was selected update selection to the adult
        if (UI.selection.id == thisfish.id) {
          UI.updateSelection(
            numOfElementsCreated - 1,
            protoFish[thisfish.species].spriteName,
            true
          );
        }
        draw.deleteSprite(thisfish.id);
        removeSeaObject(thisfish);
      }
    }
    //movement
    moveFish(thisfish);
    if (thisfish.currentBehaviour == "Looking for Food") {
      checkForFood(thisfish);
      checkIfYoureDead(thisfish);
    }
    if (thisfish.currentBehaviour == "Looking for Mate") {
      checkForMate(thisfish);
    }
  });
}

function moveFish(fish) {
  //check if the fish is ready to make a new decision about what to do next
  if (frameCounter > fish.nextAction) {
    // make sure the angle > 0 (to prevent extra rotations)
    if (fish.currentAngle < 0) {
      fish.currentAngle += pi * 2;
    }
    if (fish.currentAngle > pi * 2) {
      fish.currentAngle -= pi * 2;
    }
    // make the fish turn smooth using a framecounter that counts till it reaches fish.turnSpeed
    if (fish.turnCounter == 0) {
      //this function decides what the fish prioritizes and sets the fish.targetAngle accordingly
      fish.targetAngle = fishBehaviour(fish);
      if (fish.targetAngle - fish.currentAngle > pi) {
        fish.targetAngle -= pi * 2;
      }
      if (fish.targetAngle - fish.currentAngle < -pi) {
        fish.targetAngle += pi * 2;
      }

      fish.turnFraction =
        (fish.targetAngle - fish.currentAngle) / fish.turnSpeed;
      fish.turnCounter = 1;
    } else {
      fish.currentAngle += fish.turnFraction;
      fish.turnCounter++;
      if (fish.turnCounter == fish.turnSpeed) {
        fish.currentAngle = fish.targetAngle;
        fish.speed = fish.maxSpeed;
        fish.nextAction =
          frameCounter + fish.actionTime + myMath.random(fish.actionTime);
        setFishAnimation(fish);
        fish.turnCounter = 0;
      }
    }
  }
  //update the fish position
  fish.speed *= main.friction;
  fish.currentFood -=
    0.002 * protoFish[fish.species].hungerMultiplier +
    fish.maxSpeed * 0.004 * protoFish[fish.species].hungerMultiplier;

  let dx = myMath.getVectorComponents(fish.currentAngle, fish.speed)[0];
  let dy = myMath.getVectorComponents(fish.currentAngle, fish.speed)[1];
  fish.x += dx;
  fish.y += dy;
  fish.x = myMath.modAbs(fish.x, main.screenWidth);
  fish.y = myMath.modAbs(fish.y, main.screenHeight);

  updateFishAnimation(fish);
}

function fishBehaviour(fish) {
  let outAngle;
  // check if enemies are nearby, if so, flee
  let enemies = getSeaObjectsBySpecies(protoFish[fish.species].enemySpecies);
  let closestEnemyIndex = getClosestTargetIndex(fish, enemies);
  if (
    !isNaN(closestEnemyIndex && fish.currentBehaviour != "Looking for Mate")
  ) {
    outAngle =
      myMath.getAngleBetweenPoints(
        fish.x,
        fish.y,
        enemies[closestEnemyIndex].x,
        enemies[closestEnemyIndex].y
      ) + Math.PI;
    fish.currentBehaviour = "Fleeing";
    return outAngle;
  }
  //if the fish is a baby it just swims around randomly
  if (fish.adult == false) {
    outAngle =
      fish.currentAngle +
      myMath.random(protoFish[fish.species].randomSwimAngle * 2) -
      protoFish[fish.species].randomSwimAngle;
    return outAngle;
  }
  //check if a new behaviour should be set based on the amound of food
  if (fish.currentFood < fish.foodWhenHungry) {
    fish.currentBehaviour = "Looking for Food";
  }
  if (
    fish.currentFood < fish.foodWhenFull &&
    fish.currentBehaviour != "Looking for Mate"
  ) {
    fish.currentBehaviour = "Looking for Food";
  }
  if (fish.currentFood > fish.foodWhenFull) {
    fish.currentBehaviour = "Looking for Mate";
  }

  // if the fish is hungry check if there's any food in range - else just keep on looking
  if (fish.currentBehaviour == "Looking for Food") {
    const foods = getSeaObjectsBySpecies(protoFish[fish.species].foodSpecies);
    let closestFoodIndex = getClosestTargetIndex(fish, foods);
    // if theres food in sight set targetAngle towards it
    if (!isNaN(closestFoodIndex)) {
      const food = foods[closestFoodIndex];
      outAngle = myMath.getAngleBetweenPoints(fish.x, fish.y, food.x, food.y);
      fish.targetFood = food;
    } else {
      outAngle =
        fish.currentAngle +
        myMath.random(protoFish[fish.species].randomSwimAngle * 2) -
        protoFish[fish.species].randomSwimAngle;
    }
  }

  //if the fish is full check if theres a mate in sight
  if (fish.currentBehaviour == "Looking for Mate") {
    const potentialMates = state.seaObjects.filter(
      (otherFish) =>
        otherFish.currentBehaviour == "Looking for Mate" &&
        otherFish.species === fish.species
    );

    let closestMateIndex = getClosestTargetIndex(fish, potentialMates);
    // if theres food in sight set targetAngle towards it
    if (!isNaN(closestMateIndex)) {
      const mate = potentialMates[closestMateIndex];
      outAngle = myMath.getAngleBetweenPoints(fish.x, fish.y, mate.x, mate.y);
      fish.targetMate = mate;
    } else {
      outAngle =
        fish.currentAngle +
        myMath.random(protoFish[fish.species].randomSwimAngle * 2) -
        protoFish[fish.species].randomSwimAngle;
    }
  }

  return outAngle;
}

//this function checks which item in targetArray is closest to object thisfish, and returns its index in the targetArray
function getClosestTargetIndex(thisfish, targetArray) {
  let closestTargetIndex;
  let closestTargetDistance = main.screenWidth * 2;
  targetArray.forEach((target, index) => {
    //get the nearest target
    let distToCurrentTarget = myMath.dist(
      thisfish.x,
      thisfish.y,
      target.x,
      target.y
    );
    if (distToCurrentTarget < thisfish.vision) {
      //make sure the fish cant choose itself as target
      if (
        distToCurrentTarget < closestTargetDistance &&
        distToCurrentTarget > 0
      ) {
        closestTargetIndex = index;
        closestTargetDistance = distToCurrentTarget;
      }
    }
  });
  return closestTargetIndex;
}

//check if a fish is close enough to its food to eat it
function checkForFood(thisfish) {
  //check if the fish has a target
  const food = thisfish.targetFood;
  if (food) {
    //check if the target still exists
    if (state.seaObjects.indexOf(food) !== -1) {
      //check if it's close enough to eat
      if (myMath.dist(thisfish.x, thisfish.y, food.x, food.y) < thisfish.size) {
        //check if the food is a fish, in that case it also has to be removed from fishArr
        if (food.family === "fish") {
          //if the eaten fish was selected clear the selection
          if (food.id == UI.selection.id) {
            UI.updateSelection("", "", false);
          }
          FX.createBloodCloud(food.x, food.y);
          draw.deleteSprite(food.id);
        }
        //the fish has more food now
        thisfish.currentFood += food.foodValue;
        //delete it from the target array
        removeSeaObject(food);

        //the fish has a new behaviour now, eating
        FX.createBubbles(
          thisfish.x,
          thisfish.y,
          3,
          numOfElementsCreated,
          protoFish[thisfish.species].bubbleAmtWhenEats()
        );
        thisfish.currentBehaviour = "Eating";
        thisfish.speed = thisfish.speed * 0.2;
        thisfish.nextAction = frameCounter + thisfish.eatTime;
        setFishAnimation(thisfish);
      }
    }
  }
}

function checkForMate(thisfish) {
  // check if the fish has a target
  const target = thisfish.targetMate;
  if (target) {
    // check if the target still exists
    if (state.seaObjects.indexOf(thisfish.targetMate) !== -1) {
      // check if it's close enough to mate
      // TODO: add fish dick length to equation
      if (
        myMath.dist(thisfish.x, thisfish.y, target.x, target.y) <
          thisfish.size * 0.8 &&
        myMath.dist(thisfish.x, thisfish.y, target.x, target.y) > 1
      ) {
        // check which fish is the oldest(the generation of the oldest one counts for the new fish)
        let oldestGeneration = Math.max(thisfish.generation, target.generation);

        // determine the offspring color
        let newFishStats = determineOffspringStats(thisfish, target);
        //create a new fish
        state.seaObjects.push(
          new fish(
            thisfish.x,
            thisfish.y,
            thisfish.currentAngle + Math.PI * 0.5,
            protoFish[thisfish.species].babySpriteName,
            newFishStats[2],
            newFishStats[0],
            thisfish.randomSwimAngle,
            newFishStats[1],
            thisfish.turnSpeed,
            false,
            thisfish.species,
            oldestGeneration + 1,
            newFishStats[3]
          )
        );
        //spawn a heart
        FX.createTemporaryObject(
          (thisfish.x + target.x) / 2,
          (thisfish.y + target.y) / 2,
          0,
          0,
          protoFish[thisfish.species].loveFXIndex,
          numOfElementsCreated
        );
        numOfElementsCreated++;
        //the parent fishes have less food now
        target.currentFood -= newFish[thisfish.species].babyCost;
        target.currentBehaviour = "Mating";
        target.speed = 0;
        target.nextAction = frameCounter + protoFish[thisfish.species].mateTime;
        target.currentAngle += thisfish.currentAngle + Math.PI;
        setFishAnimation(target);
        thisfish.currentFood -= newFish[thisfish.species].babyCost;
        thisfish.currentBehaviour = "Mating";
        thisfish.speed = 0;
        thisfish.nextAction = frameCounter + thisfish.mateTime;
        setFishAnimation(thisfish);
      }
    }
  }
}

//check if a fish should die from hunger
function checkIfYoureDead(fish) {
  if (fish.currentFood < 0) {
    if (fish.id == UI.selection.id) {
      UI.updateSelection("", "", false);
    }
    draw.deleteSprite(fish.id);
    FX.createTemporaryObject(
      fish.x,
      fish.y,
      fish.speed / 2,
      fish.currentAngle,
      protoFish[fish.species].deadFXIndex,
      numOfElementsCreated
    );
    removeSeaObject(fish);
  }
}

//update stats of new fish when they are changed in the fish place UI
export function updateNewFishStats() {
  newFish.herring.maxSpeed = protoFish.herring.maxSpeed * UI.herringSpeed.value;
  newFish.herring.vision = Math.ceil(
    protoFish.herring.vision * UI.herringVision.value
  );
  newFish.herring.actionTime = Math.ceil(
    protoFish.herring.actionTime * UI.herringActionTime.value
  );
  newFish.cod.maxSpeed = protoFish.cod.maxSpeed * UI.codSpeed.value;
  newFish.cod.vision = Math.ceil(protoFish.cod.vision * UI.codVision.value);
  newFish.cod.actionTime = Math.ceil(
    protoFish.cod.actionTime * UI.codActionTime.value
  );
}

export function updateNewFishColor(index, species) {
  newFish[species].colorArr = UI.fishColors[index];
}

//kill a fish (used when a fish is selected)
export function killFish(id) {
  const index = state.seaObjects.findIndex((fish) => fish.id === id);
  const fish = state.seaObjects[index];
  draw.deleteSprite(id);
  FX.createTemporaryObject(
    fish.x,
    fish.y,
    fish.speed / 2,
    fish.currentAngle,
    protoFish[fish.species].deadFXIndex,
    numOfElementsCreated
  );
  numOfElementsCreated++;
  removeSeaObject(fish);
}

function setFishAnimation(fish) {
  fish.animationLength = fish.nextAction - frameCounter;
  fish.animationCounter = 0;
  fish.animated = true;

  if (
    fish.currentBehaviour == "Looking for Food" ||
    fish.currentBehaviour == "Looking for Mate" ||
    fish.currentBehaviour == "Fleeing"
  ) {
    fish.animationID = 0;
  }
  if (fish.currentBehaviour == "Eating") {
    fish.animationID = 1;
  }
  if (fish.currentBehaviour == "Mating") {
    fish.animationID = 2;
  }
}

function updateFishAnimation(thisfish) {
  // check if the sprite is animated, if so animate it
  if (thisfish.animated) {
    thisfish.animationScaleX =
      1 +
      animationData[thisfish.animationID].funcX(
        thisfish.animationLength,
        thisfish.animationCounter
      ) *
        protoFish[thisfish.species].animationMultiplier;
    thisfish.animationScaleY =
      1 +
      animationData[thisfish.animationID].funcY(
        thisfish.animationLength,
        thisfish.animationCounter
      ) *
        protoFish[thisfish.species].animationMultiplier;

    thisfish.animationCounter++;
    if (thisfish.animationCounter > thisfish.animationLength) {
      thisfish.animationCounter = 0;
    }
  }
}

function movePlant(plant) {
  let dxy = myMath.getVectorComponents(plant.currentAngle, plant.speed);
  plant.x += dxy[0];
  plant.y += dxy[1];
  plant.x += wobblePlants(plant.x, plant.y, plant.wobbleAmt)[0];
  plant.y += wobblePlants(plant.x, plant.y, plant.wobbleAmt)[1];

  if (plant.x < 0) {
    plant.x = main.screenWidth + plant.x;
  }
  if (plant.x > main.screenWidth) {
    plant.x = plant.x - main.screenWidth;
  }
  if (plant.y < 0) {
    plant.y = main.screenHeight + plant.y;
  }
  if (plant.y > main.screenHeight) {
    plant.y = plant.y - main.screenHeight;
  }

  plant.speed *= main.friction;
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

  object.RColor = Math.floor(
    protoPlant.startColor[0] + protoPlant.RColoration * lifeFactor
  );
  object.GColor = Math.floor(
    protoPlant.startColor[1] + protoPlant.GColoration * lifeFactor
  );
}

export function createPlants(number, x, y) {
  for (let i = 0; i < number; i++) {
    state.seaObjects.push(
      new plant(
        x,
        y,
        protoPlant.speed,
        Math.random() * 2 * Math.PI,
        protoPlant.size,
        protoPlant.reproduceRate,
        protoPlant.reproduceChance,
        protoPlant.wobbleAmt,
        protoPlant.color
      )
    );
  }
}

export function createProtoFish(x, y, species, colorArr) {
  if (typeof colorArr == "undefined") {
    colorArr = newFish[species].colorArr;
  }
  state.seaObjects.push(
    new fish(
      x,
      y,
      Math.random() * 2 * Math.PI,
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

function determineOffspringStats(fish1, fish2) {
  //color
  let selectiveGene = Math.random();
  let randomR = Math.random() * 2 * colorEvolution - colorEvolution;
  let randomG = Math.random() * 2 * colorEvolution - colorEvolution;
  let randomB = Math.random() * 2 * colorEvolution - colorEvolution;
  let RColor =
    fish1.colorArr[0] * selectiveGene +
    fish2.colorArr[0] * (1 - selectiveGene) +
    randomR;
  let GColor =
    fish1.colorArr[1] * selectiveGene +
    fish2.colorArr[1] * (1 - selectiveGene) +
    randomG;
  let BColor =
    fish1.colorArr[2] * selectiveGene +
    fish2.colorArr[2] * (1 - selectiveGene) +
    randomB;
  RColor = Math.floor(Math.max(Math.min(255, RColor), 30));
  GColor = Math.floor(Math.max(Math.min(255, GColor), 30));
  BColor = Math.floor(Math.max(Math.min(255, BColor), 30));

  //get the stats for the baby fish from the parent fishes
  let newSpeed =
    fish1.maxSpeed * selectiveGene + fish2.maxSpeed * (1 - selectiveGene);
  let newVision =
    fish1.vision * selectiveGene + fish2.vision * (1 - selectiveGene);
  let newActionTime =
    fish1.actionTime * selectiveGene + fish2.actionTime * (1 - selectiveGene);
  let evolveStr;

  //random mutation
  //check if a mutation occurs
  if (Math.random() < mutationChance) {
    let whichStatMutates = myMath.random(2);
    let evolutionAmount = Math.random() * 2 * mutationAmount - mutationAmount;
    //update mutated stat and set string to be displayed
    evolveStr = "No Mutation";
    switch (whichStatMutates) {
      case 0:
        newSpeed += evolutionAmount;
        //check what text should be displayed
        if (evolutionAmount > 0) {
          evolveStr = "Speed + " + Math.round(evolutionAmount * 10) / 10;
        }
        if (evolutionAmount < 0) {
          evolveStr = "Speed - " + Math.round(-evolutionAmount * 10) / 10;
        }
        //check is stat doesnt get too low
        if (newSpeed < 0.1) {
          newSpeed = 0.1;
        }
        break;
      case 1:
        newVision += 40 * evolutionAmount;
        //check what text should be displayed
        if (evolutionAmount > 0) {
          evolveStr = "Vision + " + Math.round(40 * evolutionAmount);
        }
        if (evolutionAmount < 0) {
          evolveStr = "Vision - " + Math.round(40 * -evolutionAmount);
        }
        //check is stat doesnt get too low
        if (newVision < 10) {
          newVision = 10;
        }
        break;
      case 2:
        newActionTime += evolutionAmount;
        //check what text should be displayed
        if (evolutionAmount > 0) {
          evolveStr =
            "Reaction time + " + Math.round(evolutionAmount * 10) / 10;
        }
        if (evolutionAmount < 0) {
          evolveStr =
            "Reaction time - " + Math.round(-evolutionAmount * 10) / 10;
        }
        //check is stat doesnt get too low
        if (newActionTime < 4) {
          newActionTime = 4;
        }
        break;
    }
    FX.createTemporaryObject(
      fish1.x + 24,
      fish1.y - 8,
      0,
      0,
      5,
      numOfElementsCreated,
      evolveStr
    );
  }
  return [newSpeed, newVision, newActionTime, [RColor, GColor, BColor]];
}

//kill everything (called from options menu)
export function killAllFish() {
  frameCounter = 0;
  state.seaObjects.forEach((object) => {
    draw.deleteSprite(object.id);
    if (object.family === "fish") {
      FX.createTemporaryObject(
        object.x,
        object.y,
        object.speed / 2,
        object.currentAngle,
        protoFish[object.species].deadFXIndex,
        numOfElementsCreated
      );
      numOfElementsCreated++;
    }
  });
  state.seaObjects = [];
}

export function increaseObjectCounter() {
  numOfElementsCreated++;
}

export function initialize() {
  state.seaObjects.forEach((object) => {
    draw.deleteSprite(object.id);
  });
  state.seaObjects = [];

  newFish.herring.colorArr = UI.fishColors[0];
  newFish.cod.colorArr = UI.fishColors[0];
}

export function changeOptions() {
  protoPlant.spawnRate = 28 - 3 * (UI.spawnRate.value - 1);
  mutationChance = UI.mutationChance.value;
  mutationAmount = UI.mutationAmount.value;
  colorEvolution = UI.colorEvolution.value;

  newFish.herring.foodWhenHungry = UI.herringFoodWhenHungry.value;
  newFish.herring.foodWhenFull = UI.herringFoodWhenFull.value;
  newFish.herring.babyCost = UI.herringBabyCost.value;

  newFish.cod.foodWhenHungry = UI.codFoodWhenHungry.value;
  newFish.cod.foodWhenFull = UI.codFoodWhenFull.value;
  newFish.cod.babyCost = UI.codBabyCost.value;

  const fishArr = getSeaObjectsByFamily("fish");

  fishArr.forEach((thisfish) => {
    thisfish.foodWhenHungry = newFish[thisfish.species].foodWhenHungry;
    thisfish.foodWhenFull = newFish[thisfish.species].foodWhenFull;
    thisfish.babyCost = newFish[thisfish.species].babyCost;
  });
}
