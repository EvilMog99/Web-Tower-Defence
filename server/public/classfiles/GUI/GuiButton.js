class GuiButton {
  constructor(buttonType, buttonId, state, x, y, width, height, allBF, leftFunc, middleFunc, rightFunc, text, tSize) {
    this.buttonType = buttonType;//for button type
    this.buttonId = buttonId;//for animation
    this.frame = 0;
    this.frameTimer = 0;
    this.state = state;//button code used
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.allBF = allBF;
    this.leftClickFunc = leftFunc;//function to run when left clicked
    this.middleClickFunc = middleFunc;//function to run when middle clicked
    this.rightClickFunc = rightFunc;//function to run when right clicked
    this.text = text;
    this.textSize = tSize;
    this.textColour = {r: 0, g: 0, b: 0};
    this.visible = true;
    this.visualClickReact = true;//whether button will light up or not when clicked

    this.extraData1 = null;
    this.extraData2 = null;
  }



  /*draw() {
    texture(this.allBF[this.buttonId][this.state]);
    translate(this.x, this.y, -0.001);
    plane(this.width, this.height);
  }*/
}
