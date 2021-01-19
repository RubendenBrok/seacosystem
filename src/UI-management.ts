import { dist } from "./Math Functions";
import { newFish, fishArr, createProtoFish, updateNewFishColor, updateNewFishStats, changeOptions, killAllFish, killFish, protoFish} from "./Objects";
import  { clearSelectionDarkness, drawHover, drawSelection} from "./Draw"
import {playSound, soundOn, toggleSound} from "./Sound";
import * as $ from "jquery"


export let animationSpeed = 1

export const selection = {
  selected: false,
  className: "",
  id: "",
  speed: 0,
  food: 0,
  angle: 0,
  x: 0,
  y: 0,
  range: 30,
  frameCounter: 0,
  fadeTime: 120,
  opacity: 0,
  maxOpacity: 1,
  generation: 1,
  framesTillAdult: 0,
  actionTime: 1,
  vision: 1,
  currentBehaviour: "",
  name: "",
  size: 1
};


export const hover = {
  hoverClass : "",
  hoverID : "",
  index: -1,
}

export const herringSpeed: any = document.getElementById("herringspeed");
export const herringVision: any = document.getElementById("herringvision");
export const herringActionTime: any = document.getElementById("herringactiontime");
export const herringRed = document.getElementById("herringred");
export const herringBlue = document.getElementById("herringblue");
export const herringGreen = document.getElementById("herringgreen");
export const herringYellow = document.getElementById("herringyellow");
export const herringPurple = document.getElementById("herringpurple");
export const herringTurquoise = document.getElementById("herringturquoise");
export const herringWhite = document.getElementById("herringwhite");
export const herringBlack = document.getElementById("herringblack");
export const codSpeed: any = document.getElementById("codspeed");
export const codVision: any = document.getElementById("codvision");
export const codActionTime: any = document.getElementById("codactiontime");
export const codRed = document.getElementById("codred");
export const codBlue = document.getElementById("codblue");
export const codGreen = document.getElementById("codgreen");
export const codYellow = document.getElementById("codyellow");
export const codPurple = document.getElementById("codpurple");
export const codTurquoise = document.getElementById("codturquoise");
export const codWhite = document.getElementById("codwhite");
export const codBlack = document.getElementById("codblack");
export const fishColors = [
  [255,140,140],
  [140,140,255],
  [140,255,140],
  [200,200,100],
  [230,60,200],
  [40,220,220],
  [200,200,200],
  [50,50,50]];
export const spawnRate: any = document.getElementById("spawnrate");
export const mutationAmount: any = document.getElementById("mutationamount");
export const mutationChance: any = document.getElementById("mutationchance");
export const colorEvolution: any = document.getElementById("colorevolution");
export const herringFoodWhenHungry: any = document.getElementById("herringfoodwhenhungry");
export const herringFoodWhenFull: any = document.getElementById("herringfoodwhenfull");
export const herringBabyCost: any = document.getElementById("herringbabycost");
export const codFoodWhenHungry: any = document.getElementById("codfoodwhenhungry");
export const codFoodWhenFull: any = document.getElementById("codfoodwhenfull");
export const codBabyCost: any = document.getElementById("codbabycost");

const fish1Width = 40;
const fish1Height = 30;

export let placingFish = -1;
export let canPlaceFish = true;
export let mouseX = 0;
export let mouseY = 0;

export function updateUIGraphics() {
  clearSelectionDarkness();
  updateHover();
  drawHover();

  if (selection.selected){
    let object = fishArr.find(thisfish => thisfish.id === selection.id);
    drawSelection(object.x, object.y, object.vision, object.size);
    updateSelectionStats(object);
    updateSelectionBox();
  }
}

export function removeElement(element){
  $(element).remove();
}

export function fadeThenDelete(element){
  $(element).fadeOut(1000, function(){
    $(element).remove();
  });
}

export function moveElement(cssclass, id, x, y, objangle) {
  $("." + cssclass + "#" + id).css({
    left: x - fish1Width / 2,
    top: y - fish1Height / 2,
    transform: "rotate(" + objangle + "rad)"
  });
}

$(document).click((e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  let target = $(e.target);
  //check if the player didnt click on a UI button
  if (target.is("canvas")) {
    // if any popup is open close it
    if ($("#intro").css("display") == "block"){
      playSound(1);
      $("#intro").fadeOut(200);
    }
    if ($("#options").css("display") == "block"){
      playSound(1);
      $("#options").fadeOut(200);
    }
    if ($("#help").css("display") == "block"){
      playSound(1);
      $("#help").fadeOut(200);
    }
    //check if a new fish should be placed
    if (placingFish >= 0) {
      playSound(3);
      createProtoFish(e.pageX, e.pageY, placingFish, newFish.colorArr);
    //if not the selection should be updated
    } else {
      //see which fish is closest
      let closestDist = 10000;
      let closestIndex;
      fishArr.forEach((fish, index) => {
        if (dist(e.pageX, e.pageY, fish.x, fish.y) < closestDist) {
          closestDist = dist(e.pageX, e.pageY, fish.x, fish.y);
          closestIndex = index;
        }
      });
      //if the closest fish is closer than the selection range, select it
      if (closestDist < selection.range) {
        if (!selection.selected) {
          $("#selectionbox").slideDown(300);
          $("#selectionbox").css("display","flex")
          playSound(0);
        }
        updateSelection(
          fishArr[closestIndex].id,
          fishArr[closestIndex].spriteName,
          true
        );
      } else {
        // if it's to far away, nothing is selected anymore
        if (selection.selected){
          playSound(1);
          $("#selectionbox").slideUp(300, function () {
            selection.selected = false;
          });
        }
      }
    }
  }
});

//get current mouse position, used in selecting and hovering over fish
$(document).on("mousemove", function(e){
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function updateHover(){
  let mouseElement = $(document.elementFromPoint(mouseX,mouseY));
    if (mouseElement.is("canvas")){
      canPlaceFish = true;
      let closestDist = 10000;
      let closestIndex;
      fishArr.forEach((fish, index) => {
        if (dist(mouseX, mouseY, fish.x, fish.y) < closestDist) {
          closestDist = dist(mouseX, mouseY, fish.x, fish.y);
          closestIndex = index;
        }
      });
      //if the closest fish is closer than the selection range, select it
      if (closestDist < selection.range) {
        hover.index = closestIndex;
      } else {
        hover.index = -1
      }
    } else {
      canPlaceFish = false;
    }
}

//close button in popups
$(document).on('click', '.close', function(e) {
  $(e.target).parent().parent().fadeOut(200);
  playSound(1);
});

//close button in new fish menu
$(document).on('click', '.closestats', () => {
  placingFish = -1;
  if ($("#codstats.fishstats").css("display") == "block") {
    $("#codstats.fishstats").toggle(200);
  }
  if ($("#herringstats.fishstats").css("display") == "block") {
    $("#herringstats.fishstats").toggle(200);
  }
  playSound(1);
});

//speed play/pause buttons
$("#pauze").click(()=>{
  playSound(0);
  animationSpeed = 0;
  console.log(fishArr)
});

$("#play").click(()=>{
  playSound(0);
  animationSpeed = 1;
});

$("#fastforward").click(()=>{
  playSound(0);
  animationSpeed = 5;
});

$("#ultrafastforward").click(()=>{
  playSound(0);
  animationSpeed = 20;
});

//options popup
$("#optionsbutton").click(()=>{
  playSound(0);
  $("#options").fadeToggle(200);
  //unselect fish if selected
  $("#selectionbox").slideUp(300)
  selection.selected = false;
  //close popup menus if open
  if ($("#intro").css("display") == "block" || $("#intro").css("opacity") != "0"){
    $("#intro").fadeOut(200);
  }
  if ($("#help").css("display") == "block" || $("#help").css("opacity") != "0"){
    $("#help").fadeOut(200);
  }
  //close place fish menu if open
  placingFish = -1;
  if ($("#codstats.fishstats").css("display") == "block") {
    $("#codstats.fishstats").toggle(200);
  }
  if ($("#herringstats.fishstats").css("display") == "block") {
    $("#herringstats.fishstats").toggle(200);
  }
});

//help popup
$("#helpbutton").click(()=>{
  playSound(0);
  $("#help").fadeToggle(200);
  //unselect fish if selected
  $("#selectionbox").slideUp(300)
  selection.selected = false;
  //close popup menus if open
  if ($("#intro").css("display") == "block" || $("#intro").css("opacity") != "0"){
    $("#intro").fadeOut(200);
  }
  if ($("#options").css("display") == "block" || $("#options").css("opacity") != "0"){
    $("#options").fadeOut(200);
  }
  //close place fish menu if open
  placingFish = -1;
  if ($("#codstats.fishstats").css("display") == "block") {
    $("#codstats.fishstats").toggle(200);
  }
  if ($("#herringstats.fishstats").css("display") == "block") {
    $("#herringstats.fishstats").hide(200);
  }
});

//sound on/of
$('#soundtoggle').click((e) => {
  if (soundOn){
    $(e.target).html("SOUND ON")
  } else {
    $(e.target).html("SOUND OFF")
  }
  toggleSound();
});

//placing new fish menu
herringSpeed.addEventListener("change", () => {updateNewFishStats()});
herringVision.addEventListener("change", () => {updateNewFishStats()});
herringActionTime.addEventListener("change", () => {updateNewFishStats()});
herringRed.addEventListener("click", () => {updateNewFishColor(0, 0), changeColorSelect(0,0)});
herringBlue.addEventListener("click", () => {updateNewFishColor(1, 0), changeColorSelect(1,0)});
herringGreen.addEventListener("click", () => {updateNewFishColor(2, 0), changeColorSelect(2,0)});
herringYellow.addEventListener("click", () => {updateNewFishColor(3, 0), changeColorSelect(3,0)});
herringPurple.addEventListener("click", () => {updateNewFishColor(4, 0), changeColorSelect(4,0)});
herringTurquoise.addEventListener("click", () => {updateNewFishColor(5, 0), changeColorSelect(5,0)});
herringWhite.addEventListener("click", () => {updateNewFishColor(6, 0), changeColorSelect(6,0)});
herringBlack.addEventListener("click", () => {updateNewFishColor(7, 0), changeColorSelect(7,0)});
codSpeed.addEventListener("change", () => {updateNewFishStats()});
codVision.addEventListener("change", () => {updateNewFishStats()});
codActionTime.addEventListener("change", () => {updateNewFishStats()});
codRed.addEventListener("click", () => {updateNewFishColor(0, 1), changeColorSelect(0,1)});
codBlue.addEventListener("click", () => {updateNewFishColor(1, 1), changeColorSelect(1,1)});
codGreen.addEventListener("click", () => {updateNewFishColor(2, 1), changeColorSelect(2,1)});
codYellow.addEventListener("click", () => {updateNewFishColor(3, 1), changeColorSelect(3,1)});
codPurple.addEventListener("click", () => {updateNewFishColor(4, 1), changeColorSelect(4,1)});
codTurquoise.addEventListener("click", () => {updateNewFishColor(5, 1), changeColorSelect(5,1)});
codWhite.addEventListener("click", () => {updateNewFishColor(6, 1), changeColorSelect(6,1)});
codBlack.addEventListener("click", () => {updateNewFishColor(7, 1), changeColorSelect(7,1)});

//options menu
spawnRate.addEventListener("change", () => {
  $("#spawnratevalue").html(spawnRate.value);
  changeOptions();
});
mutationChance.addEventListener("change", () => {
  $("#mutationchancevalue").html(mutationChance.value * 100 + "%");
  changeOptions();
});
mutationAmount.addEventListener("change", () => {
  $("#mutationamountvalue").html(mutationAmount.value * 100 + "%");
  changeOptions();
});
colorEvolution.addEventListener("change", () => {
  $("#colorevolutionvalue").html(Math.round(colorEvolution.value / 255 * 100) + "%");
  changeOptions();
});
//options for each fish species
herringFoodWhenHungry.addEventListener("change", () => {
  $("#herringfoodwhenhungryvalue").html(herringFoodWhenHungry.value);
  changeOptions();
});
herringFoodWhenFull.addEventListener("change", () => {
  $("#herringfoodwhenfullvalue").html(herringFoodWhenFull.value);
  changeOptions();
});
herringBabyCost.addEventListener("change", () => {
  $("#herringbabycostvalue").html(herringBabyCost.value);
  changeOptions();
});
codFoodWhenHungry.addEventListener("change", () => {
  $("#codfoodwhenhungryvalue").html(codFoodWhenHungry.value);
  changeOptions();
});
codFoodWhenFull.addEventListener("change", () => {
  $("#codfoodwhenfullvalue").html(codFoodWhenFull.value);
  changeOptions();
});
codBabyCost.addEventListener("change", () => {
  $("#codbabycostvalue").html(codBabyCost.value);
  changeOptions();
});

//kill all fish button
$("#killallfish").click(()=>{
  playSound(5);
  killAllFish();
})

//toggle the place a fish menus
$("#placeherringbutton").click(()=>{
  $("#herringstats").toggle(300);
  $("#selectionbox").slideUp(300, function () {
    selection.selected = false;
  });
  switch (placingFish){
    case -1:
      playSound(0);
      placingFish = 0;
    break;
    case 0:
      playSound(1);
      placingFish = -1;
      break;
    case 1:
      $("#codstats").toggle(300);
      playSound(0);
      placingFish = 0;
      break;
  }
  //close popup menus if open
  if ($("#intro").css("display") == "block" || $("#intro").css("opacity") != "0"){
    $("#intro").fadeOut(200);
  }
  if ($("#help").css("display") == "block" || $("#help").css("opacity") != "0"){
    $("#help").fadeOut(200);
  }
  if ($("#options").css("display") == "block" || $("#options").css("opacity") != "0"){
    $("#options").fadeOut(200);
  }
})
$("#placecodbutton").click(()=>{
  $("#codstats").toggle(300);
  $("#selectionbox").slideUp(300, function () {
    selection.selected = false;
  });
  switch (placingFish){
    case -1:
      playSound(0);
      placingFish = 1;
      break;
    case 0:
      $("#herringstats").toggle(300);
      playSound(0);
      placingFish = 1;
      break;
    case 1:
      playSound(1);
      placingFish = -1;
      break;
  }
  //close popup menus if open
  if ($("#intro").css("display") == "block" || $("#intro").css("opacity") != "0"){
    $("#intro").fadeOut(200);
  }
  if ($("#help").css("display") == "block" || $("#help").css("opacity") != "0"){
    $("#help").fadeOut(200);
  }
  if ($("#options").css("display") == "block" || $("#options").css("opacity") != "0"){
    $("#options").fadeOut(200);
  }
})

//check if something is selected
function updateSelectionStats(object){
  selection.id = object.id;
  selection.speed = object.maxSpeed;
  selection.size = object.size;
  selection.vision = object.vision;
  selection.actionTime = object.actionTime;
  selection.currentBehaviour = object.currentBehaviour;
  selection.food = object.currentFood;
  selection.angle = object.currentAngle;
  selection.name = protoFish[object.species].speciesName;
  selection.generation = object.generation;
  selection.x = object.x;
  selection.y = object.y;
  selection.framesTillAdult = object.framesTillAdult;
}

// give other functions the ability to update the selection
export function updateSelection(id, className, selected){
  selection.id = id;
  selection.className = className;
  if (selected){
    selection.selected = true;
  } else {
    selection.selected = false;
    $("#selectionbox").slideUp(300);
  }
}

//let the selectionbox move and update when a fish is selected
function updateSelectionBox(){
  if (selection.className == "fish1" || selection.className == "fish2"){
  $("#selectionboxtext").html(
    "<h3><b>"+selection.name.toUpperCase()+"</b></h3>"+
    "<p>Food: "+Math.round(selection.food * 10) / 10+"</p>"+
    "<p>Speed: "+Math.round(selection.speed * 10) / 10+"</p>"+
    "<p>Visual Range: "+Math.round(selection.vision)+"</p>"+
    "<p>Reaction Time: "+Math.round(selection.actionTime)+"</p>"+
    "<p>Generation: "+(selection.generation + 1)+"</p>"+
    "<p><b><br><i>"+selection.currentBehaviour+"</i></b></p>")
  }

  if (selection.className == "fish1baby" || selection.className == "fish2baby"){
    $("#selectionboxtext").html(
      "<h3><b>BABY "+selection.name.toUpperCase()+"</b></h3>"+
      "<p>Speed: "+Math.floor(selection.speed * 10) / 10+"</p>"+
      "<p>Generation: "+(selection.generation + 1)+"</p>"+
      "<p>Time till adulthood: "+Math.floor(selection.framesTillAdult / 4))
    }
}

//'kill' button when fish is selected
$(document).on('click', '#killfish', function(){
  killFish(selection.id)
  selection.selected = false;
  playSound(4);
  $("#selectionbox").slideUp(300)
});

//handle the color selection in the place a fish menus
function changeColorSelect(color, species){
  let speciesClass;
  if (species === 0){
    speciesClass = ".herring"
  } else {
    speciesClass = ".cod"
  }
  $(speciesClass+".colorblock").css("box-shadow", "none")

  switch (color){
    case 0:
      $(speciesClass+".colorblock.red").css("box-shadow", "var(--glow2)");
      break;
    case 1:
      $(speciesClass+".colorblock.blue").css("box-shadow", "var(--glow2)");
      break;
    case 2:
      $(speciesClass+".colorblock.green").css("box-shadow", "var(--glow2)");
      break;
    case 3:
      $(speciesClass+".colorblock.yellow").css("box-shadow", "var(--glow2)");
      break;
    case 4:
      $(speciesClass+".colorblock.purple").css("box-shadow", "var(--glow2)");
      break;
    case 5:
      $(speciesClass+".colorblock.turquoise").css("box-shadow", "var(--glow2)");
      break;
    case 6:
      $(speciesClass+".colorblock.white").css("box-shadow", "var(--glow2)");
      break;
    case 7:
      $(speciesClass+".colorblock.black").css("box-shadow", "var(--glow2)");
      break;
  }
}