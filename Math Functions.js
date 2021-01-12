////////////////////
// MATH FUNCTIONS //
////////////////////

import {screenHeight, screenWidth} from "./SeacoScript.js";

export var randomSineList = [];

export function intersects(a, b, c, d, p, q, r, s) {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
  }
}

export function dist(x1, y1, x2, y2) {
  var dx = Math.abs(x2 - x1);
  var dy = Math.abs(y2 - y1);

  if (dx > screenWidth / 2){dx = screenWidth - dx}
  if (dy > screenHeight / 2){dy = screenHeight - dy}

  return Math.sqrt(dx * dx + dy * dy);
}

// point - { x, y }
// line - { sx, sy, ex, ey }
export function distToSegmentXY(px, py, x1, y1, x2, y2) {
  var dx = x2 - x1;
  var dy = y2 - y1;
  var l2 = dx * dx + dy * dy;

  if (l2 == 0) return dist(px, py, x1, y1);

  var t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));

  return [x1 + t * dx - px, y1 + t * dy - py];
}

export function random(num) {
  return Math.floor(Math.random() * (num + 1));
}

export function newRandomSine(speedMod) {
  randomSineList.push({
    speedMod: speedMod,
    dY: 0,
    value: 0,
    counter: 0,
  });
}

export function advanceRandomSines() {
  randomSineList.forEach((i) => {
    i.counter += i.speedMod * Math.random();
    i.value = Math.sin(i.counter);
    i.counter > 360 ? (i.counter = 0) : (i.counter = i.counter);
  });
}

export function getVectorComponents(direction, speed) {
  return [Math.cos(direction) * speed, Math.sin(direction) * speed];
}

export function getAngleBetweenPoints(inx1, iny1, inx2, iny2){
  let x1 = inx1,
  x2 = inx2,
  y1 = iny1,
  y2= iny2;
  if (x1 - x2 > screenWidth / 2){x2 += screenWidth};
  if (x2 - x1 > screenWidth / 2){x1 += screenWidth};
  if (y1 - y2 > screenHeight / 2){y2 += screenHeight};
  if (y2 - y1 > screenHeight / 2){y1 += screenHeight};
  return Math.atan2(y2-y1, x2-x1)
}

export function modAbs(value, modulo){
  return (value % modulo + modulo) % modulo;
}