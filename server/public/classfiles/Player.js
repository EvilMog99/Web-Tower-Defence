class Player {
  constructor(tempX, tempY, tempZ, tempRotX, tempRotY, tempRotZ) {
    this.objType = "Player";
    this.tag = 'C';
    this.id = 0;
    this.walkSpeed = 10;
    this.selectedItem = -1;
    this.requestPlace = false;
    this.requestPlaceX = 0;
    this.requestPlaceY = 0;
    this.width = 0;
    this.height = 0;
    this.locX = tempX;
    this.locY = tempY;
    this.locZ = tempZ;
    this.rotX = tempRotX;
    this.rotY = tempRotY;
    this.rotZ = tempRotZ;
    this.prevX = this.rotX;
    this.prevY = this.rotY;
    this.dirX = 0;
    this.dirY = 0;

    this.animation = 0;
    this.frame = 0;

    this.timeToFrameChange = 0;
    this.maxTimeToFrameChange = 10;

    this.locZ = layer_character;
    this.defaultImportantce = 10;//to be transfered to tile that is being stood on

    this.keyCommand = -1;

    this.weight = 10;
    this.frontSize = 10;
    this.velocity = 0;

    this.rampStart = 0;
  }

  setRequestPlacing() {
    this.requestPlace = true;
  }

  updateRequestPlace(wldIndexX, wldIndexY) {
    this.requestPlaceX = wldIndexX;
    this.requestPlaceY = wldIndexY;
  }

  updatePopsition() {
    this.moveX(Math.cos(this.rotZ) * this.velocity);
    this.moveY(Math.sin(this.rotZ) * this.velocity);
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
  }

  updateMovement(x, y) {
    this.moveX(this.walkSpeed * x);
    this.moveY(this.walkSpeed * y);
    this.dirX = x;
    this.dirY = y;
  }

  moveX(x) {
    this.locX += x;
  }

  moveY(y) {
    this.locY += y;
  }

  show(allAnimations)
  {
    push();
    translate(this.locX, this.locY, this.locZ);
    rotateZ(this.rotZ);
    noStroke();//remove plane lines when drawing
    texture(getTexture(0, this.animation, this.frame, allAnimations));
    plane(this.width, this.height);
    pop();
  }

  runPlayer() {
    this.keyCommand = '';//reset the command
  }

}
