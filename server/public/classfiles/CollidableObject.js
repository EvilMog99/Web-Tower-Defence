class CollidableObject {
  /*constructor(allCollidables, id, tag, tempX, tempY, tempZ, tempRotX, tempRotY, tempRotZ, canCollide, canInteract, width, height) {
    this.objType = "CollidableObject";
    this.id = id;
    this.animation = 0;
    this.frame = 0;
    this.tag = tag;
    allCollidables.push(this);
    this.collidable = new Collidable(allCollidables);
    this.canInteract = canInteract;//gets registered on collision but doesn't have walls
    this.canCollide = canCollide;//gets registered on collision and has walls
    this.walkSpeed = 1;
    this.width = width;
    this.height = height;
    this.locX = tempX;
    this.locY = tempY;
    this.locZ = tempZ;
    this.rotX = tempRotX;
    this.rotY = tempRotY;
    this.rotZ = tempRotZ;
    this.dirX = 0;
    this.dirY = 0;

    this.timeToFrameChange = 10;
    this.maxTimeToFrameChange = 10;

    this.velocity = 0;
  }*/

  constructor(allCollidables, allPathWalls, id, tag, tempX, tempY, tempZ) {
    this.objType = "CollidableObject";
    //this.id = id;
    allCollidables.push(this);
    this.collidable = new Collidable(allCollidables);
    this.allPathWalls = allPathWalls;//for AI navigation
    this.locX = tempX;
    this.locY = tempY;
    this.locZ = tempZ;
    this.rotX = 0;
    this.rotY = 0;
    this.rotZ = 0;
    this.dirX = 0;
    this.dirY = 0;
    this.defaultImportantce = 0;

    this.velocity = 0;

    this.setID(id, tag);
  }

  setID(id, tag) {
    this.id = id;
    this.keyCommand = -1;
    this.timeToFrameChange = 0;
    this.animation = 0;
    this.frame = 0;
    this.tag = tag;

    if (tag == 'T') {
      switch (this.id) {

        case 0://soil
          this.maxTimeToFrameChange = 10;
          this.canInteract = true;//gets registered on collision but doesn't have walls
          this.canCollide = false;//gets registered on collision and has walls
          this.walkSpeed = 1;
          this.width = tileWidth;
          this.height = tileHeight;
          this.locZ = layer_floor;
          this.defaultImportantce = 0;
        break;

        case 1://soil with seeds
          this.maxTimeToFrameChange = 10;
          this.canInteract = true;//gets registered on collision but doesn't have walls
          this.canCollide = false;//gets registered on collision and has walls
          this.walkSpeed = 1;
          this.width = tileWidth;
          this.height = tileHeight;
          this.locZ = layer_floor;
          this.defaultImportantce = 0;
        break;

        case 2://stone floor
          this.maxTimeToFrameChange = 10;
          this.canInteract = false;//gets registered on collision but doesn't have walls
          this.canCollide = false;//gets registered on collision and has walls
          this.walkSpeed = 1;
          this.width = tileWidth;
          this.height = tileHeight;
          this.locZ = layer_floor;
          this.defaultImportantce = -1;
        break;

        case 3://stone wall
          this.maxTimeToFrameChange = 10;
          this.canInteract = true;//gets registered on collision but doesn't have walls
          this.canCollide = false;//gets registered on collision and has walls
          this.walkSpeed = 1;
          this.width = tileWidth;
          this.height = tileHeight;
          this.locZ = layer_wall;
          this.defaultImportantce = 0;
        break;

        default:
          this.maxTimeToFrameChange = 10;
          this.canInteract = false;//gets registered on collision but doesn't have walls
          this.canCollide = false;//gets registered on collision and has walls
          this.walkSpeed = 1;
          this.width = tileWidth;
          this.height = tileHeight;
          this.locZ = layer_floor;
          this.defaultImportantce = 0;
      }
    }
    else if (this.tag == 'C') {
      switch (this.id) {
        case 0://enemy
          this.maxTimeToFrameChange = 10;
          this.canInteract = true;//gets registered on collision but doesn't have walls
          this.canCollide = false;//gets registered on collision and has walls
          this.walkSpeed = 1;
          this.width = tileWidth;
          this.height = tileHeight;
          this.locZ = layer_character;
          this.defaultImportantce = 0;
        break;

        default:
          this.maxTimeToFrameChange = 10;
          this.canInteract = false;//gets registered on collision but doesn't have walls
          this.canCollide = false;//gets registered on collision and has walls
          this.walkSpeed = 1;
          this.width = tileWidth;
          this.height = tileHeight;
          this.locZ = layer_floor;
          this.defaultImportantce = 0;
      }
    }
  }

  setTileOnCollisionMap() {
    var t = this.allPathWalls[this.locX / tileWidth][this.locY / tileHeight];
    if (this.defaultImportantce > 0 || this.defaultImportantce > t)
      t = this.defaultImportantce;
    else
      this.allPathWalls[this.locX / tileWidth][this.locY / tileHeight] = t - 0.1;

    if (t > 0) {
      this.spreadPath(this.locX / tileWidth, this.locY / tileHeight, t);
    }
  }

  spreadPath(x, y, pathVal) {
    if (this.getTile(x + 1, y) && this.allPathWalls[x + 1][y] < pathVal - 1) this.allPathWalls[x + 1][y] = pathVal -1;
    if (this.getTile(x - 1, y) && this.allPathWalls[x - 1][y] < pathVal - 1) this.allPathWalls[x - 1][y] = pathVal -1;
    if (this.getTile(x, y + 1) && this.allPathWalls[x][y + 1] < pathVal - 1) this.allPathWalls[x][y + 1] = pathVal -1;
    if (this.getTile(x, y - 1) && this.allPathWalls[x][y - 1] < pathVal - 1) this.allPathWalls[x][y - 1] = pathVal -1;
  }

  getTile(x, y) {
    if (this.allPathWalls[x] !== 'undefined' && this.allPathWalls[x][y] !== 'undefined') {
      return this.allPathWalls[x][y];
    }
    return false;
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
    if (!this.collidable.testForCollision(this, x, 0, this.canCollide))
      this.locX += x;
    else
      this.locX -= x;
  }

  moveY(y) {
    if (!this.collidable.testForCollision(this, 0, y, this.canCollide))
      this.locY += y;
    else
      this.locY -= y;
  }

  show(allAnimations)
  {
    push();
    translate(this.locX, this.locY, this.locZ);
    rotateZ(this.rotX);
    rotateZ(this.rotY);
    rotateZ(this.rotZ);
    noStroke();//remove plane lines when drawing
    texture(getTexture(this.id, this.animation, this.frame, allAnimations));
    plane(this.width, this.height);
    pop();
  }

  runEntity() {



    this.updateMovement(-0, 0);//try to move object and register collision
    this.processEntity();//run entity code
    //if (this.tag == 'T')
    //  this.setTileOnCollisionMap();
    this.collidable.interactWithCollisions(this.keyCommand, this.locX, this.locY);
    this.collidable.resetLastCollisions();
    this.keyCommand = '';//reset the command
  }

  processEntity() {

  }
}
