class Projectile {
  constructor() {
    this.id = -1;//don't draw if ID is -1
    this.x = 0;
    this.y = 0;
    this.startX = 0;
    this.startY = 0;
    this.endX = 0;
    this.endY = 0;
  }

  init(id, startX, startY, endX, endY) {
    this.id = id;
    this.x = startX;
    this.y = startY;
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
  }

  update() {
    if (this.x > this.endX - 10 && this.x < this.endX + 10
    && this.y > this.endY - 10 && this.y < this.endY + 10) {
      //hit target
    }
    else {
      if (this.x > this.endX) {
        this.x -= 1;
      }
      else if (this.x < this.endX) {
        this.x += 1;
      }

      if (this.y > this.endY) {
        this.y -= 1;
      }
      else if (this.y < this.endY) {
        this.y += 1;
      }
    }
  }
}
