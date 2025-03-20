var d1 = 0;
var d2 = 0;
var d3 = 0;
OOCSI.connect("wss://oocsi.id.tue.nl/ws");

// Change channel name here
OOCSI.subscribe("your_channel_name", function (msg) {
  console.log(msg.data);
  if (msg.data["pot1"]) d1 = msg.data["pot1"];
  if (msg.data["pot2"]) d2 = msg.data["pot2"];
  if (msg.data["pot3"]) d3 = msg.data["pot3"];
});

class Dial {
  constructor(id, x, y, radius, currentState) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.currentState = currentState;
    this.newState = currentState;
    this.updating = false;
    this.rateIncrease = 0;
  }

  update(newState) {
    let closestMarker = floor(newState / (PI / 9)) * (PI / 9); // Snap to 20-degree markers, floor to ensure 0 stays 0
    if (closestMarker !== this.currentState) {
      this.newState = closestMarker;
      this.rateIncrease = (this.newState - this.currentState) / 5;
      this.updating = true;
    }
  }

  display() {
    if (this.updating) {
      if (abs(this.newState - this.currentState) > 0.01) {
        this.currentState += this.rateIncrease;
      } else {
        this.updating = false;
      }
    }
    
    this.drawMarkers();
    this.drawNumbers();
    
    push();
    translate(this.x, this.y);
    stroke(100);
    fill(150, 150, 150, 150); // Grey dials
    ellipse(0, 0, this.radius, this.radius);
    
    fill(50);
    let pointerAngle = this.currentState - PI / 2; // Align 0 at 12 o'clock
    let pointerX = cos(pointerAngle) * (this.radius / 2.5); // Move closer to center
    let pointerY = sin(pointerAngle) * (this.radius / 2.5);
    
    push();
    translate(pointerX, pointerY);
    rotate(pointerAngle + PI / 2); // Ensure triangle points outward
    beginShape();
    vertex(0, -10);
    vertex(-10, 10);
    vertex(10, 10);
    endShape(CLOSE);
    pop();
    pop();
  }

  drawMarkers() {
    push();
    translate(this.x, this.y);
    stroke(0);
    for (let angle = 0; angle < 360; angle += 20) {
      let rad = radians(angle - 90); // Align 0 at 12 o'clock
      let x1 = cos(rad) * (this.radius / 2);
      let y1 = sin(rad) * (this.radius / 2);
      let x2 = cos(rad) * (this.radius / 2 - 7);
      let y2 = sin(rad) * (this.radius / 2 - 7);
      line(x1, y1, x2, y2);
    }
    pop();
  }

  drawNumbers() {
    push();
    translate(this.x, this.y);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(this.radius / 22); // Adjust font size based on dial size
    for (let angle = 0; angle < 360; angle += 20) {
      let rad = radians(angle - 90); // Align 0 at 12 o'clock
      let numX = cos(rad) * (this.radius / 2.3);
      let numY = sin(rad) * (this.radius / 2.3);
      text(angle / 20, numX, numY);
    }
    pop();
  }
}

let pot1 = -1, pot2 = -1, pot3 = -1;
let newPot1, newPot2, newPot3;
let lastStateCorrect = false; // Tracks if the last state was the correct combination

let dial1, dial2, dial3;
let clickSound, heavyClick, successSound;

function preload() {
  clickSound = loadSound("click.mp3");
  heavyClick = loadSound("heavy_click.mp3");
  successSound = loadSound("success.mp3");
}

function setup() {
  createCanvas(displayWidth, displayHeight);
  let centerX = displayWidth / 2;
  let centerY = displayHeight / 2;
  dial1 = new Dial("dial_1", centerX, centerY, 400, 0);
  dial2 = new Dial("dial_2", centerX, centerY, 325, 0);
  dial3 = new Dial("dial_3", centerX, centerY, 250, 0);
}

function draw() {
  background(220);
  newPot1 = floor(d1 / 4095 * 18);
  newPot2 = floor(d2 / 4095 * 18);
  newPot3 = floor(d3 / 4095 * 18);
  
  if (newPot1 != pot1) {
    if (newPot1 == 7) {
      if (!heavyClick.isPlaying()) heavyClick.play();
    } else {
      if (!clickSound.isPlaying()) clickSound.play();
    }
  }
  if (newPot2 != pot2) {
    if (newPot2 == 4) {
      if (!heavyClick.isPlaying()) heavyClick.play();
    } else {
      if (!clickSound.isPlaying()) clickSound.play();
    }
  }
  if (newPot3 != pot3) {
    if (newPot3 == 8) {
      if (!heavyClick.isPlaying()) heavyClick.play();
    } else {
      if (!clickSound.isPlaying()) clickSound.play();
    }
  }

  pot1 = newPot1;
  pot2 = newPot2;
  pot3 = newPot3;
  
  dial1.update(pot1 * (PI / 9));
  dial2.update(pot2 * (PI / 9));
  dial3.update(pot3 * (PI / 9));
  
  dial1.display();
  dial2.display();
  dial3.display();
}
