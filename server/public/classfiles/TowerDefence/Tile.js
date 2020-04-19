class Tile {
  constructor(id, x, y) {
    this.floorId = id;
    this.floorAnimation = 0;
    this.buildingId = -1;
    this.buildingAnimation = 0;
    this.locX = x;
    this.locY = y;
    this.locZ = 0;
    this.width = tileWidth;
    this.height = tileHeight;
    this.timeToFrameChange = 0;
    this.floorFrame = 0;
    this.buildingFrame = 0;
    this.infectionPercent = 0;
    this.infectionFrame = 0;
    this.buildingFlagId = -1;
  }

  setFloorId(id) {
    //update floor animation if it's changed
    if (id != this.floorId) {
      this.floorId = id;
      this.floorAnimation = 0;
      this.floorFrame = 0;
    }

    this.maxTimeToFrameChange = 10;
    this.locZ = layer_floor;
    this.defaultImportantce = 0;

    switch (this.floorId) {

      case 0://soil

      break;

      case 1://soil with seeds

      break;

      case 2://stone

      break;

      case 3://infection

      break;

      default:
    }
  }

  setBuildingId(id) {
    //update building animation if it's changed
    if (id != this.buildingId) {
      this.buildingId = id;
      this.buildingAnimation = 0;
      this.buildingFrame = 0;
    }

    switch (this.buildingId) {

      case 0://

      break;

      case 1://

      break;

      default:
    }
  }

  setInfection(infect) {
    //update infection animation if it's changed
    if (infect != this.infectionPercent) {
      this.infectionPercent = infect;
      this.infectionFrame = 0;
    }
  }

  update() {



    //update floor
    switch(this.floorId) {
      case 0:
      break;

      default:
    }

    //update building
    switch(this.buildingId) {
      case 0:
      break;

      default:
    }
  }

  findNextFrames(allFloorAnim, allBuildingAnim, allInfectionAnim) {
    this.timeToFrameChange++;
    if (this.timeToFrameChange >= this.maxTimeToFrameChange)
    {
      this.timeToFrameChange = 0;
      //update the floor
      this.floorFrame++;
      if (this.floorFrame >= allFloorAnim[this.floorId][this.floorAnimation].length)
      {
        this.floorFrame = 0;
      }
      //uodate the building if it exists
      if (this.buildingId > -1) {
        this.buildingFrame++;
        if (this.buildingFrame >= allBuildingAnim[this.buildingId][this.buildingAnimation].length)
        {
          this.buildingFrame = 0;
        }
      }
      //update infection animation if it exists
      if (this.infectionPercent > 0) {
        this.infectionFrame++;
        //make sure index is possitive and exists
        var tempTextureIndex = Math.floor(this.infectionPercent * (allInfectionAnim[0].length - 0.1));
        if (tempTextureIndex >= 0 && tempTextureIndex < allInfectionAnim[0].length) {
          if (this.infectionFrame >= allInfectionAnim[0][tempTextureIndex].length) {
            this.infectionFrame = 0;
          }
        }
      }
    }
  }



  show(allAnimations)
  {
    push();
    translate(this.locX, this.locY, this.locZ);
    rotateZ(this.rotX);
    rotateZ(this.rotY);
    rotateZ(this.rotZ);
    noStroke();//remove plane lines when drawing
    texture(getTexture(this.floorId, this.animation, this.frame, allAnimations));
    plane(this.width, this.height);
    pop();
  }
}
