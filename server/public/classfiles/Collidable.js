class Collidable {
  constructor(allCollidables) {
    this.allCollidables = allCollidables;
    this.tempX = 0;
    this.tempY = 0;
    this.ret = false;
    this.lastCollisions = [];//to store all collisions that can be interacted with
    this.colBoxWidth = tileWidth;
    this.colBocHeight = tileHeight;
  }

  interactWithCollisions(keyCommand, locX, locY) {
    //test for collisions' existance
    if (this.lastCollisions) {
      //loop through all collisions that can be interacted with
      for (var i = 0; i < this.lastCollisions.length; i++) {
        //process item
        if (this.lastCollisions[i].objType == "CollidableObject") {
          //run collision interaction code here
          //alert("col");
          if (this.lastCollisions[i].tag == 'T') {
            switch (keyCommand) {
              case 'P'://plant seeds
                this.lastCollisions[i].setID(1, 'T');
              break;

              default:
            }
          }
          else if (this.lastCollisions[i].tag == 'C') {

          }
        }
      }
    }
  }

  //to work out which tile the entity is mostly on
  getRoundedLocation(loc, scale) {
    return (loc % scale)
  }

  resetLastCollisions() {
    this.lastCollisions = null;
    this.lastCollisions = [];
  }

  testForInteract(self, dirX, dirY) {
    return this.testPoint(self.locX + (dirX * ((self.width / 2) + 50)), self.locY + (dirY * ((self.height / 2) + 50)), self.locX, self.locY);
  }

  testForCollision(self, addX, addY, colOn) {
    if (colOn) {
      /*if (addX > 0)
        this.tempX = self.locX + addX + (self.width / 2);
      else if (addX < 0)
        this.tempX = self.locX + addX - (self.width / 2);
      else
        this.tempX = 0;

      if (addY > 0)
        this.tempY = self.locY + addY + (self.height / 2);
      else if (addY < 0)
        this.tempY = self.locY + addY - (self.height / 2);
      else
        this.tempY = 0;

      return this.testPoint(this.testX, this.testY, self.locX, self.locY);
        */

      this.ret = false;

      //right corners
      this.testPoint(self.locX + addX + (self.width / 2), self.locY + addY + (self.height / 2), self.locX, self.locY);
      this.testPoint(self.locX + addX - (self.width / 2), self.locY + addY + (self.height / 2), self.locX, self.locY);

      //left corners
      this.testPoint(self.locX + addX + (self.width / 2), self.locY + addY - (self.height / 2), self.locX, self.locY);
      this.testPoint(self.locX + addX - (self.width / 2), self.locY + addY - (self.height / 2), self.locX, self.locY);

      //top and bottom mid points
      this.testPoint(self.locX, self.locY + addY + (self.height / 2), self.locX, self.locY);
      this.testPoint(self.locX, self.locY + addY - (self.height / 2), self.locX, self.locY);

      //left and right mid points
      this.testPoint(self.locX + addX + (self.width / 2), self.locY, self.locX, self.locY);
      this.testPoint(self.locX + addX - (self.width / 2), self.locY, self.locX, self.locY);

      return this.ret;
    }
  }

  testPoint(testX, testY, cx, cy) {
    for (var i = 0; i < allCollidables.length; i++) {
      //if this isn't the same object
      if (allCollidables[i].locX != cx && allCollidables[i].locY != cy) {
        if (testX > allCollidables[i].locX - (allCollidables[i].width / 2) && testX < allCollidables[i].locX + (allCollidables[i].width / 2)
      && testY > allCollidables[i].locY - (allCollidables[i].height / 2) && testY < allCollidables[i].locY + (allCollidables[i].height / 2))
        {
          //if it can be interacted or collided with?
          if (allCollidables[i].canCollide) {
            this.ret = true;//to stop movement
          }
          if (allCollidables[i].canInteract) {
            this.lastCollisions.push(allCollidables[i]);//register collision
          }
        }

      }
    }
  }


}
