//variables
var angle = 0;
let img;
let cam;

var keyDown_up = false;
var keyDown_down = false;
var keyDown_left = false;
var keyDown_right = false;

var positionX = 0;
var positionY = 0;
var positionZ = 0;

function preload()//run before setup
{
  img = loadImage('textures/img.png');
  //mdl = loadModel('models/Penguin large.FBX');
  //cam = createCapture(VIDEO);
  //cam.hide();
}

//setups
function setup()
{
  // put setup code here
  createCanvas(800, 800, WEBGL);
  graphics = createGraphics(800, 800);//define a square image (doesn't have to be square)(like a canvas - can be textured to the box)
  graphics.background(255);

  document.addEventListener('keydown', keyDownEvent);
  document.addEventListener('keyup', keyUpEvent);
}

function keyDownEvent(event)
{
  keyChangedEvent(event, true);
}

function keyUpEvent(event)
{
  keyChangedEvent(event, false);
}

function keyChangedEvent(event, state)
{
  if (event.keyCode == 37)//left key
  {
    keyDown_left = state;
  }
  else if (event.keyCode == 39)//right key
  {
    keyDown_rigth = state;
  }
  else if (event.keyCode == 38)//up key
  {
    keyDown_up = state;
  }
  else if (event.keyCode == 40)//down key
  {
    keyDown_down = state;
  }
  else if (event.keyCode == 65)//a key
  {
    keyDown_left = state;
  }
  else if (event.keyCode == 68)//d key
  {
    keyDown_right = state;
  }
  else if (event.keyCode == 87)//w key
  {
    keyDown_up = state;
  }
  else if (event.keyCode == 83)//s key
  {
    keyDown_down = state;
  }
  else
  {
    alert("Key code: " + event.keyCode);
  }
}


//drawing
function draw()
{
  //control commands
  if (keyDown_up) { positionZ -= 1; }
  if (keyDown_down) { positionZ += 1; }
  if (keyDown_left) { positionX -= 1; }
  if (keyDown_right) { positionX += 1; }

  //drawing commands
  background(50);

  let camX = map(mouseX, 0, width / 2, -200, 0);
  let camY = map(mouseY, 0, height / 2, -200, 0);
  let camZ = 0;
  //where camera is, where it is looking, orientation of camera
  camera(positionX, positionY, positionZ + ((height / 2) / tan(PI / 6)), positionX + (camX * 4), positionY + (camY * 4), positionZ + (camZ * 4), 0, 1, 0);



  ambientLight(255);
  //directionalLight(255, 255, 255, 0, -1, 0);

  push();
  //rotateX(angle);
  //rotateY(angle * 0.3);
  //rotateZ(angle * 1.2);
  //noStroke();
  //texture(img);
  //box(100);

  texture(img);
  translate(-50, -50);
  beginShape();

  vertex(0, 0, 0, 0, 0);//x, y, z, pixel mappings x(normalised), pixel mappings y(normalised)
  vertex(100, 0, 0, 1, 0);
  vertex(100, 100, 0, 1, 1);
  vertex(0, 100, 0, 0, 1);

  endShape(CLOSE);
  pop();


  noStroke();
  translate(0, 100);
  rotateX(HALF_PI);
  ambientMaterial(100);
  plane(500, 500);

  angle += 0.01;
}


/*


graphics2 = createGraphics(200, 200);
graphics2.background(50, 50, 100, 100);//colour, transparency
graphics2.fill(255);
graphics2.textAlign(CENTER);
graphics2.textSize(32);
graphics2.text('graphics', 150, 50);


graphics4.fill(0, 200, 0);
graphics4.ellipse(mouseX, mouseY, 50);
push();
translate(150, -100, -200);
rotateX(angle);
rotateY(angle * 1.2);
rotateZ(angle * 0.3);
noStroke();
texture(graphics4);
box(100);
pop();

push();
translate(-200, 0, -200);
rotateX(angle);
rotateY(angle * 0.3);
rotateZ(angle * 1.2);
noStroke();
texture(graphics2);
box(100);
pop();

push();
texture(graphics3);
translate(100, 0, -100);
plane(300, 200);
pop();



ortho(-200, 200, 200, -200, 0.01, 1000);//ortho with settings

ortho();//for non size changing (face on) through perspective with orthographic projection


//Normal feild of view code
let fov = PI / 3;//feild of view (larger numbers zoom in)
let cameraZ = (height / 2.0) / tan(fov / 2.0);//default cameraZ location to define clipping plane
perspective(fov, width / height, cameraZ / 10.0, cameraZ * 10.0);//set aspect radio with width/height


//Change feild of view with mouse
let fov = map(mouseX, 0, width, 0, PI);//feild of view (larger numbers zoom in)
let cameraZ = (height / 2.0) / tan((PI / 3) / 2.0);//default cameraZ location to define clipping plane
perspective(fov, width / height, cameraZ / 10.0, cameraZ * 10.0);//set aspect radio with width/height





let dx = mouseX - width / 2;
let dy = mouseY - height / 2;
let v = createVector(dx, dy, 0);
v.normalize();//make all direction values -1 to 1 to fix possible issues
//v.div(100);//divide function

ambientLight(255, 255, 255);//shines in all directions (no shadows or directions)
//directionalLight(255, 255, 0, 1, 1, -1);//points in one direction
//directionalLight(255, 255, 0, v);
//pointLight(0, 0, 255, -150, 0, 0);//shines in a direction (has shadows and positions)
//pointLight(255, 0, 0, mouseX-200, mouseY-200, 150);//shines in a direction (has shadows and positions)

// put drawing code here
background(190, 200, 200);

camera(0, 0, ((height / 2) / tan(PI / 6)), 0, 0, 0, 0, 1, 0);

//rectMode(CENTER);
//noStroke();


//rect(0, 0, 150, 200);
//translate(mouseX - width / 2, mouseY - height / 2);
//box(200, 100, 50);
//fill(0, 50, 200);//basicMaterial
//stroke(0);
noStroke();
//normalMaterial();//gives shape colour no matter what
//ambientMaterial(255);//reflects light
//specularMaterial(255);//reflects and is shiny
//torus(100, 10);

//texture(cam);//set next texture to draw

translate(0, 300, 0);
rotateX(90);
plane(500, 500);

rotateX(angle);
rotateY(angle);

translate(300, 0, 0);
box(100, 100, 50);

translate(-600, 0, 0);
plane(200, 200);

translate(0, 300, 0);
sphere(100);

translate(0, -600, 0);
torus(100, 20);

translate(300, 300, 0);
cone(80, 120);
//sphere(100);
//cylinder(100, 300, 10, 60);

angle += 0.01;

*/
