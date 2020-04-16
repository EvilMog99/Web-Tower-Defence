class GuiPanel {
  constructor(id, x, y, width, height, allPF) {
    this.tag = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.allButtons = [];
    this.allPF = allPF;
    this.visible = true;
  }

  /*draw() {
    texture(this.allPF[this.tag][0]);
    translate(this.x, this.y, 0.001);
    plane(this.width, this.height);
    for (var i = 0; i < this.allButtons.length; i++) {
      this.allButtons[i].draw();
    }
    for (var i = 0; i < this.allPanels.length; i++) {
      this.allPanels[i].draw();
    }
  }*/
}
