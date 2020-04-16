var serverAddress = 'localhost:3000';
var socket;

var mouse;
var canvasWidth = 900;
var canvasHeight = 700;

var keyDown_up = false;
var keyDown_down = false;
var keyDown_left = false;
var keyDown_right = false;
var keyDown_space = false;

var camLocX; var camLocY; var camLocZ;
var camRotX; var camRotY; var camRotZ;
var mouseScreenX; var mouseScreenY;

var allCharAnimations;
var allTileAnimations;
var allBuildingAnimations;
var allProjectileAnimations;
var allButtonFrames;
var allPanelFrames;


var gamePlayTimer;

var player;
var playerMoveX = 0;
var playerMoveY = 0;

var layer_floor       = -0.005;
var layer_character   = -0.004;
var layer_wall        = -0.003;
var layer_roof        = -0.002;

var basicFont;

var menuMusic;
var gameMusic;

//all scenes
var sceneMenu;//index: 0
var sceneGame;//index: 1

var allScenes = [];

var currentSceneId = 0;


//key buttons and panels
var panel_gameInstructions;//global panel storing instructions
var pGameStats_button_invStone;
var pGameStats_button_invIron;
var pGameStats_button_invCopper;
var pGameStats_button_invUranium;
var pGameStats_button_invCoal;

//copied from server code
var ItemStone    = 0;
var ItemIron     = 1;
var ItemCopper   = 2;
var ItemUranium  = 3;
var ItemCoal     = 4;
var allRecipes = [
  //{item index, amount}
  [[ItemStone, 5], [ItemIron, 5]], //0 - Anti Bacteria Turret
  [[ItemStone, 5], [ItemIron, 5]], //1 - Anti Player Turret
  [[ItemCopper, 30], [ItemIron, 30]], //2 - Mining Base
  [[ItemCopper, 2], [ItemIron, 1]], //3 - Cables
  [[ItemCopper, 5], [ItemIron, 2]], //3 - Solar Panel
  [[ItemCopper, 10], [ItemStone, 30]], //3 - Coal Plant
];

//all buildings that can use cables
var allCableBuildings = [0, 1, 2, 3, 4, 5];
function testCbaleBuildings(buildingId) {
  for (var i = 0; i < allCableBuildings.length; i++) {
    if (allCableBuildings[i] == buildingId) return true;
  }
  return false;
}

var tempGuiPanels;
var tempPanel;

//local data about players, projectiles and tile (may not be up to date with server)
var allPlayers = [];
var allTiles = [];
var allProjectiles = [];
var allInfectionAnimations = [];
var allBuildingButtons = [];
var cableEnd_up;
var cableEnd_down;
var cableEnd_left;
var cableEnd_right;

var wldWidth = 255;
var wldHeight = 255;
var tileWidth = 100;
var tileHeight = 100;
var buildingWidth = 100;
var buildingHeight = 125;
var buildingOffsetY = -12.5;
var projectileWidth = 50;
var projectileHeight = 50;

//work out the start and end index of tiles to draw to the screen
var maxX;
var maxY;

var testimg;

//server relevant long term data
var username = 'sam';
var flagId = 22;
var uniqueIdCode = 0;//unique code to identify user to server
var interactCode = 0;//unique code identify users to each other

//client opperations
//...


function preload()
{
  soundFormats('mp3', 'ogg');//set file formats to import
  loadResources();
}

function loadResources()
{
  //load music
  menuMusic = loadSound('music/Autumn Lullaby.wav');
  gameMusic = loadSound('music/Autumn Lullaby.wav');

  //load fonts
  basicFont = loadFont('fonts/raidercrusader.ttf');


  testimg = loadImage('textures/test.png');//always run inside a function

  //load button frames
  allButtonFrames = [];
  allButtonFrames[0] = [];
  allButtonFrames[0][0] = [];
  allButtonFrames[0][0][0] = loadImage('textures/Button000/A00/F00.png');
  allButtonFrames[0][1] = [];
  allButtonFrames[0][1][0] = loadImage('textures/Button000/A01/F00.png');
  allButtonFrames[0][2] = [];
  allButtonFrames[0][2][0] = loadImage('textures/Button000/A02/F00.png');
  allButtonFrames[0][2][1] = loadImage('textures/Button000/A02/F01.png');
  allButtonFrames[0][3] = [];
  allButtonFrames[0][3][0] = loadImage('textures/Button000/A03/F00.png');
  allButtonFrames[0][4] = [];
  allButtonFrames[0][4][0] = loadImage('textures/Button000/A04/F00.png');

  allButtonFrames[1] = [];
  allButtonFrames[1][0] = [];
  allButtonFrames[1][0][0] = loadImage('textures/Button001/A00/F00.png');
  allButtonFrames[1][1] = [];
  allButtonFrames[1][1][0] = loadImage('textures/Button001/A01/F00.png');
  allButtonFrames[1][2] = [];
  allButtonFrames[1][2][0] = loadImage('textures/Button001/A02/F00.png');
  allButtonFrames[1][3] = [];
  allButtonFrames[1][3][0] = loadImage('textures/Button001/A03/F00.png');
  allButtonFrames[1][4] = [];
  allButtonFrames[1][4][0] = loadImage('textures/Button001/A04/F00.png');

  //buulding images
  allButtonFrames[2] = [];
  allButtonFrames[2][0] = [];
  allButtonFrames[2][0][0] = loadImage('textures/Clear.png');
  allButtonFrames[3] = [];
  allButtonFrames[3][0] = [];
  allButtonFrames[3][0][0] = loadImage('textures/Building000/A00/F00.png');
  allButtonFrames[4] = [];
  allButtonFrames[4][0] = [];
  allButtonFrames[4][0][0] = loadImage('textures/Building001/A00/F00.png');
  allButtonFrames[5] = [];
  allButtonFrames[5][0] = [];
  allButtonFrames[5][0][0] = loadImage('textures/Building002/A00/F00.png');
  allButtonFrames[6] = [];
  allButtonFrames[6][0] = [];
  allButtonFrames[6][0][0] = loadImage('textures/Building003/A00/F00.png');
  allButtonFrames[7] = [];
  allButtonFrames[7][0] = [];
  allButtonFrames[7][0][0] = loadImage('textures/Building004/A00/F00.png');
  allButtonFrames[8] = [];
  allButtonFrames[8][0] = [];
  allButtonFrames[8][0][0] = loadImage('textures/Building005/A00/F00.png');

  //load panel frames
  allPanelFrames = [];
  allPanelFrames[0] = [];
  allPanelFrames[0][0] = loadImage('textures/basicpanel.png');

  //load character animations
  allCharAnimations = [];//create ID dimension
  allCharAnimations[0] = [];//create Animations dimension
  allCharAnimations[0][0] = [];//create Frames dimension
  allCharAnimations[0][0][0] = loadImage('textures/test.png');//always run inside a function


  allInfectionAnimations[0] = loadAnimation('Infection', 0, [2, 2, 2, 2, 2]);

  allBuildingAnimations = [];
  allBuildingAnimations[0] = loadAnimation('Building', 0, [1, 1, 1, 1]);//Building 000
  allBuildingAnimations[1] = loadAnimation('Building', 1, [1]);//Building 001
  allBuildingAnimations[2] = loadAnimation('Building', 2, [1]);//Building 002
  allBuildingAnimations[3] = loadAnimation('Building', 3, [1]);//Building 003
  allBuildingAnimations[4] = loadAnimation('Building', 4, [1]);//Building 004
  allBuildingAnimations[5] = loadAnimation('Building', 5, [1]);//Building 005

  allBuildingAnimations[6] = loadAnimation('Building', 6, [1]);//Building 006
  allBuildingAnimations[7] = loadAnimation('Building', 7, [1]);//Building 007
  allBuildingAnimations[8] = loadAnimation('Building', 8, [1]);//Building 008
  allBuildingAnimations[9] = loadAnimation('Building', 9, [1]);//Building 009
  allBuildingAnimations[10] = loadAnimation('Building', 10, [1]);//Building 010

  //get cable ends
  cableEnd_up = loadImage('textures/CableEnds/Up.png');
  cableEnd_down = loadImage('textures/CableEnds/Down.png');
  cableEnd_left = loadImage('textures/CableEnds/Left.png');
  cableEnd_right = loadImage('textures/CableEnds/Right.png');

  //get all projectile sprites
  allProjectileAnimations = [];
  allProjectileAnimations[0] = loadImage('textures/Projectiles/P00/F00.png');
  allProjectileAnimations[1] = loadImage('textures/Projectiles/P01/F00.png');
  allProjectileAnimations[2] = loadImage('textures/Projectiles/P02/F00.png');
  allProjectileAnimations[3] = loadImage('textures/Projectiles/P02/F00.png');
  allProjectileAnimations[4] = loadImage('textures/Projectiles/P02/F00.png');
  allProjectileAnimations[5] = loadImage('textures/Projectiles/P02/F00.png');
  allProjectileAnimations[6] = loadImage('textures/Projectiles/P02/F00.png');
  allProjectileAnimations[7] = loadImage('textures/Projectiles/P02/F00.png');

  //!!!!!!!!Do same for characters later!

  allTileAnimations = [];//create ID dimension
  allTileAnimations[0] = loadAnimation('Tile', 0, [1]);//Tile 000 soil
  allTileAnimations[1] = loadAnimation('Tile', 1, [1, 1, 1, 1, 10]);//Tile 001 soil with seeds
  allTileAnimations[2] = loadAnimation('Tile', 2, [1]);//Tile 002 stone
  allTileAnimations[3] = loadAnimation('Tile', 3, [4, 4, 4, 4]);//Tile 003 infection


  //setup menu scene
  sceneMenu = new Scene(); allScenes[0] = sceneMenu;

  var panel_start = new GuiPanel(0, 0, 0, 400, 650, allPanelFrames);
  sceneMenu.allGuiPanels[5].push(panel_start);
  var pStart_button_start = new GuiButton(0, 0, 0, 0, -200, 300, 100, allButtonFrames, buttonClick_startGame, -1, -1, 'Start Game', 32);
  panel_start.allButtons.push(pStart_button_start);

  var pStart_button_instruct = new GuiButton(0, 0, 0, 0, -50, 300, 100, allButtonFrames, buttonClick_showInstructions, -1, -1, 'Instructions', 32);
  panel_start.allButtons.push(pStart_button_instruct);

  //setup game scene
  sceneGame = new Scene(); allScenes[1] = sceneGame;

  //setup game resources panel
  var spacingX = 0;
  var spacingY = 0;
  var panel_gameStats = new GuiPanel(0, 0, -325, 900, 50, allPanelFrames);
  sceneGame.allGuiPanels[5].push(panel_gameStats);
  spacingX = -450;
  panel_gameStats.allButtons.push(new GuiButton(1, 0, 0, spacingX + 25, 0, 48, 48, allButtonFrames, -1, -1, -1, '', 28));
  panel_gameStats.allButtons.push(new GuiButton(0, 0, 0, spacingX + 60, 0, 0, 0, allButtonFrames, -1, -1, -1, 'Stone:', 20));
  pGameStats_button_invStone = new GuiButton(0, 0, 0, spacingX + 105, 0, 0, 0, allButtonFrames, -1, -1, -1, '000', 20);
  panel_gameStats.allButtons.push(pGameStats_button_invStone);
  spacingX += 140;
  panel_gameStats.allButtons.push(new GuiButton(1, 1, 0, spacingX + 25, 0, 48, 48, allButtonFrames, -1, -1, -1, '', 28));
  panel_gameStats.allButtons.push(new GuiButton(0, 0, 0, spacingX + 60, 0, 0, 0, allButtonFrames, -1, -1, -1, 'Iron:', 20));
  pGameStats_button_invIron = new GuiButton(0, 0, 0, spacingX + 100, 0, 0, 0, allButtonFrames, -1, -1, -1, '000', 20);
  panel_gameStats.allButtons.push(pGameStats_button_invIron);
  spacingX += 135;
  panel_gameStats.allButtons.push(new GuiButton(1, 2, 0, spacingX + 25, 0, 48, 48, allButtonFrames, -1, -1, -1, '', 28));
  panel_gameStats.allButtons.push(new GuiButton(0, 0, 0, spacingX + 60, 0, 0, 0, allButtonFrames, -1, -1, -1, 'Copper:', 20));
  pGameStats_button_invCopper = new GuiButton(0, 0, 0, spacingX + 110, 0, 0, 0, allButtonFrames, -1, -1, -1, '000', 20);
  panel_gameStats.allButtons.push(pGameStats_button_invCopper);
  spacingX += 150;
  panel_gameStats.allButtons.push(new GuiButton(1, 3, 0, spacingX + 25, 0, 48, 48, allButtonFrames, -1, -1, -1, '', 28));
  panel_gameStats.allButtons.push(new GuiButton(0, 0, 0, spacingX + 60, 0, 0, 0, allButtonFrames, -1, -1, -1, 'Uranium:', 20));
  pGameStats_button_invUranium = new GuiButton(0, 0, 0, spacingX + 115, 0, 0, 0, allButtonFrames, -1, -1, -1, '000', 20);
  panel_gameStats.allButtons.push(pGameStats_button_invUranium);
  spacingX += 135;
  panel_gameStats.allButtons.push(new GuiButton(1, 4, 0, spacingX + 25, 0, 48, 48, allButtonFrames, -1, -1, -1, '', 28));
  panel_gameStats.allButtons.push(new GuiButton(0, 0, 0, spacingX + 60, 0, 0, 0, allButtonFrames, -1, -1, -1, 'Coal:', 20));
  pGameStats_button_invCoal = new GuiButton(0, 0, 0, spacingX + 90, 0, 0, 0, allButtonFrames, -1, -1, -1, '000', 20);
  panel_gameStats.allButtons.push(pGameStats_button_invCoal);

  //setup game left side panel
  var panel_gameMenu = new GuiPanel(0, 325, 0, 250, 700, allPanelFrames);
  sceneGame.allGuiPanels[5].push(panel_gameMenu);
  var pGameMenu_button_Quit = new GuiButton(0, 0, 0, 0, -270, 240, 50, allButtonFrames, buttonClick_openMenu, -1, -1, 'Quit', 20);
  panel_gameMenu.allButtons.push(pGameMenu_button_Quit);

  var pGameMenu_button_Instructions = new GuiButton(0, 0, 0, 0, -210, 240, 50, allButtonFrames, buttonClick_showInstructions, -1, -1, 'Instructions', 20);
  panel_gameMenu.allButtons.push(pGameMenu_button_Instructions);

  //setup game purchase panel
  spacingX = 0;
  spacingY = 0;
  var tempButton;
  //var panel_gamePurchase = new GuiPanel(0, 0, 300, 900, 100, allPanelFrames);
  //sceneGame.allGuiPanels[5].push(panel_gamePurchase);
  spacingY = -140;
  createBuildingButton(spacingX, spacingY, 0, 2, -1, 'Clear', 'Free', panel_gameMenu.allButtons, allBuildingButtons);
  createBuildingButton(spacingX, spacingY, 1, 3, 0, 'Anti Batteria Turret', getBuildngCostAsString(0), panel_gameMenu.allButtons, allBuildingButtons);
  createBuildingButton(spacingX, spacingY, 2, 4, 1, 'Anti Player Turret', getBuildngCostAsString(1), panel_gameMenu.allButtons, allBuildingButtons);
  createBuildingButton(spacingX, spacingY, 3, 5, 2, 'Mining Turret', getBuildngCostAsString(2), panel_gameMenu.allButtons, allBuildingButtons);
  createBuildingButton(spacingX, spacingY, 4, 6, 3, 'Cables', getBuildngCostAsString(3), panel_gameMenu.allButtons, allBuildingButtons);
  createBuildingButton(spacingX, spacingY, 5, 7, 4, 'Solar Panel', getBuildngCostAsString(4), panel_gameMenu.allButtons, allBuildingButtons);
  createBuildingButton(spacingX, spacingY, 6, 8, 5, 'Power Station', getBuildngCostAsString(5), panel_gameMenu.allButtons, allBuildingButtons);
  createBuildingButton(spacingX, spacingY, 7, 8, 5, 'Power Station', getBuildngCostAsString(5), panel_gameMenu.allButtons, allBuildingButtons);
  createBuildingButton(spacingX, spacingY, 8, 8, 5, 'Power Station', getBuildngCostAsString(5), panel_gameMenu.allButtons, allBuildingButtons);




  //game instructions
  panel_gameInstructions = new GuiPanel(0, 0, 0, 800, 700, allPanelFrames);
  panel_gameInstructions.visible = false;
  sceneGame.allGuiPanels[6].push(panel_gameInstructions);
  sceneMenu.allGuiPanels[6].push(panel_gameInstructions);
  var pGameInstructions_button_Close = new GuiButton(0, 0, 0, 0, 250, 200, 100, allButtonFrames, buttonClick_hideInstructions, -1, -1, 'Close', 32);
  panel_gameInstructions.allButtons.push(pGameInstructions_button_Close);

  var pGameInstructions_button_instructText = new GuiButton(0, 0, 0, 0, -200, 0, 0, allButtonFrames, -1, -1, -1, 'Move Up: W\nMove Down: S\nMove Left: A\nMove Right: D\nPlant Seeds: P', 28);
  panel_gameInstructions.allButtons.push(pGameInstructions_button_instructText);
}

function getBuildngCostAsString(buildingId) {
  return 'Stone: 00, Copper: 00';
}

function createBuildingButton(spaceX, spaceY, posIndex, textureIndex, buildingIndex, buildingName, cost, buttonArrMain, buttonArrUpdating) {
  spaceY += posIndex * 60;
  //setup so that both image and button can be clicked with same effect
  var tempButtonMain = new GuiButton(0, 0, 0, spaceX + 25, spaceY, 190, 50, allButtonFrames, buttonClick_selectBuildItem, -1, -1, buildingName, 18);
  tempButtonMain.extraData1 = tempButtonMain;
  tempButtonMain.extraData2 = buildingIndex;
  buttonArrMain.push(tempButtonMain);
  buttonArrUpdating.push(tempButtonMain);
  var tempButton2 = new GuiButton(textureIndex, 0, 0, spaceX - 95, spaceY - 6, 50, 62, allButtonFrames, buttonClick_selectBuildItem, -1, -1, '', 0);
  tempButton2.visualClickReact = false;//set no visual effect to being clicked
  tempButton2.extraData1 = tempButtonMain;
  tempButton2.extraData2 = buildingIndex;
  buttonArrMain.push(tempButton2);
  buttonArrMain.push(new GuiButton(0, 0, 0, spaceX, spaceY + 20, 0, 0, allButtonFrames, -1, -1, -1, 'Cost: ' + cost, 14));
}

function setup()
{
  player = new Player(2000, 25000, layer_character, 0, 0, 0);
  player.selectedItem = -2;//nothing selected
  createCanvas(canvasWidth, canvasHeight, WEBGL);
  //obj = new CollidableObject(allCollidables, 0, 'C', 150, 40, layer_character, 0, 0, 0, true, true, 100, 100);
  //obj_land = new CollidableObject(allCollidables, 1, 'T', 250, 40, 0, 0, 0, 0, true, true, 80, 100);
  //new CollidableObject(allCollidables, 2, 'T', 350, 40, 0, 0, 0, 0, false, true, 60, 120);
  //new CollidableObject(allCollidables, 0, 'T', 450, 40, 0, 0, 0, 0, true, false, 120, 90);
  //player.addToVelocity(0.5);

  //obj_land.animation = 4;

  allTiles = [];
  //make basic map (will be overwritten by server)
  for (var x = 0; x < wldWidth; x++) {
    allTiles[x] = [];
    for (var y = 0; y < wldHeight; y++) {
      allTiles[x][y] = new Tile(0, x, y);
    }
  }

  allProjectiles = [];

  graphics = createGraphics(canvasWidth, canvasHeight);
  graphics.background(255);

  document.addEventListener('keydown', EventKeyDown);
  document.addEventListener('keyup', EventKeyUp);

  mouse = new Mouse();
  document.addEventListener('mousedown', EventMouseDown);
  document.addEventListener('mouseup', EventMouseUp);
  document.addEventListener('mouseover', EventUpdateMouse);

    //setup socket connection to server
  socket = io.connect(serverAddress);
  socket.on('joinSuccess', joinSuccess);
  socket.on('joinFail', joinFail);
  socket.on('updateFromServer', updateFromServer);

  //setup gamePlayTimer
  gamePlayTimer = setInterval(timedUpdate, 10);

  background(100, 0, 0);

  openNewScene(0);//set to open menu
}

function timedUpdate() {

  //handle mouse
  if (mouse.eventDown || mouse.eventUp) {
    testMouseClick(true);
    mouse.state = -1;
    mouse.eventDown = false;
    mouse.eventUp = false;
  }
  else testMouseClick(false);

  //run scene specific content
  switch (currentSceneId)//search for game scene
  {
    case 1://game overworld
    if (keyDown_left)
      playerMoveX = 1;
    else if (keyDown_right)
      playerMoveX = -1;
    else
      playerMoveX = 0;

    if (keyDown_up)
      playerMoveY = 1;
    else if (keyDown_down)
      playerMoveY = -1;
    else
      playerMoveY = 0;

    if (keyDown_space){

    }

    player.updateMovement(playerMoveX, playerMoveY);

    //update all projectiles
    //(removed)

    maxX = ((canvasWidth / 2) / tileWidth) + 2;
    maxY = ((canvasHeight / 2) / tileHeight) + 2;

    //update all tiles in view
    var tempX;
    var tempY;
    for (var x = -maxX; x < maxX; x++) {
      tempX = (x * tileWidth) + player.locX - (player.locX % tileWidth);
      for (var y = -maxY; y < maxY; y++) {
        tempY = (y * tileHeight) + player.locY - (player.locY % tileHeight);
        getTile(tempX, tempY).findNextFrames(allTileAnimations, allBuildingAnimations, allInfectionAnimations);
      }
    }
    break;

    default:
  }

  // for (var i = 0; i < allCollidables.length; i++) {
  //   if (allCollidables[i].objType == "Player") {
  //     allCollidables[i].runPlayer();
  //   } else if (allCollidables[i].objType == "CollidableObject") {
  //     allCollidables[i].runEntity();
  //   }
  //
  // }

  var updateFromClient = {
    message: 'hia',
    uniqueIdCode: uniqueIdCode,
    command: -1,
    currentX: player.locX,
    currentY: player.locY,
    selectedItem: player.selectedItem,
    requestPlace: player.requestPlace,
    requestPlaceX: player.requestPlaceX,
    requestPlaceY: player.requestPlaceY
  };
  player.requestPlace = false;
  //set message to server to update it
  socket.emit('updateFromClient', updateFromClient);
}


function joinGame(name, flagId, uniqueIdCode, interactCode){
  var data = {
    name: name,
    flagId: flagId,
    uniqueIdCode: uniqueIdCode,
    interactCode: interactCode
  }
  socket.emit('newClient', data);
}

function joinSuccess(data) {
  console.log('Join Succeeded');
}

function joinFail(data) {
  console.log('Join Failed');
  //if the reason was that another user had the same id try again with another one
  if (data.reason == 'taken code') {
    console.log('Trying to join again');
    uniqueIdCode = random(100000);
    interactCode = random(100000);
    joinGame(username, flagId, uniqueIdCode, interactCode);
  }
}

//where updates from the server are processed
function updateFromServer(data) {
  //console.log('Received message from server unique code:' + data.message);

  if (data.playerData.inventory !== undefined) {
    pGameStats_button_invStone.text = data.playerData.inventory[0];
    pGameStats_button_invIron.text = data.playerData.inventory[1];
    pGameStats_button_invCopper.text = data.playerData.inventory[2];
    pGameStats_button_invUranium.text = data.playerData.inventory[3];
    pGameStats_button_invCoal.text = data.playerData.inventory[4];
  }

  if (data.projectileUpdates !== undefined) {
    allProjectiles = data.projectileUpdates;
  }

  var tempData;
  for (var i = 0; i < data.tileUpdate.length; i++) {
    tempData = data.tileUpdate[i];
    if (tempData.floorId !== undefined) { allTiles[tempData.gridX][tempData.gridY].setFloorId(tempData.floorId);
      if (tempData.floorAnimation !== undefined) allTiles[tempData.gridX][tempData.gridY].floorAnimation = tempData.floorAnimation;
    }
    if (tempData.buildingId !== undefined) { allTiles[tempData.gridX][tempData.gridY].setBuildingId(tempData.buildingId);
      if (tempData.buildingAnimation !== undefined) allTiles[tempData.gridX][tempData.gridY].buildingAnimation = tempData.buildingAnimation;
    }
    if (tempData.infectionPercent !== undefined) allTiles[tempData.gridX][tempData.gridY].setInfection(tempData.infectionPercent);
    if (tempData.electricity !== undefined) allTiles[tempData.gridX][tempData.gridY].electricity = tempData.electricity;
    //if (tempData.justCured !== undefined) ;//wheather to run curing animation
  }
}

//tile access without supplying a specific index
function getTile(x, y) {
  x = x / tileWidth;
  y = y / tileHeight;
  return getTileIndexed(x, y);
}

//tile access functions - for round worlds
function getTileIndexed(x, y) {
  x = x % wldWidth;
  y = y % wldHeight;
  if (x < 0) x = wldWidth + x;
  if (y < 0) y = wldHeight + y;
  x = Math.floor(x);
  y = Math.floor(y);
  return allTiles[x][y];
}

//function getTileIndexed(x, y) {
//  return allTiles[x % wldWidth][y % wldHeight];
//}

function openNewScene(s_id) {

  menuMusic.stop();
  gameMusic.stop();

  switch(s_id) {
    case 0://main menu
      menuMusic.setVolume(0.1);
      //menuMusic.play();
      menuMusic.setLoop(true);
    break;

    case 1://game
      gameMusic.setVolume(0.1);
      //gameMusic.play();
      gameMusic.setLoop(true);
    break;

    default:
  }

  currentSceneId = s_id;
}

function draw()
{
  background(100, 0, 0);

  mouseScreenX = map(mouseX, 0, width / 2, -200, 0);
  mouseScreenY = map(mouseY, 0, height / 2, -200, 0);

  push()
  translate(-50, -50, -1);
  plane(100, 100);

  pop()

  push()
  //for (var i = 0; i < 10; i++)
  {

  }
  pop()

  push();
  texture(testimg);
  translate(100, 0, -100);
  rotateX(30);
  rotateY(50);
  box(100);
  pop();

  push();
  translate(0, 0, 0);
  noStroke();

  //draw current scene GUI
  tempGuiPanels = allScenes[currentSceneId].allGuiPanels;
  for (var i = 0; i < tempGuiPanels.length; i++) {
    for (var j = 0; j < tempGuiPanels[i].length; j++) {
      if (tempGuiPanels[i][j].visible) {
        tempPanel = tempGuiPanels[i][j];
        push();
        texture(tempPanel.allPF[tempPanel.tag][0]);
        translate(tempPanel.x, tempPanel.y, (0.01 * i) + (0.0001 * j));
        plane(tempPanel.width, tempPanel.height);
        for (var k = 0; k < tempPanel.allButtons.length; k++) {
          if (tempPanel.allButtons[k].visible) {
            push();
            //panel.allButtons[i].draw();
            if (tempPanel.allButtons[k].frameTimer > 0) tempPanel.allButtons[k].frameTimer--;
            else {
              tempPanel.allButtons[k].frameTimer = 20;
              //run animation
              if (allButtonFrames[tempPanel.allButtons[k].buttonType][tempPanel.allButtons[k].buttonId].length > tempPanel.allButtons[k].frame + 1) {
                tempPanel.allButtons[k].frame++;
              }
              else {
                tempPanel.allButtons[k].frame = 0;
              }
            }
            //console.log('button Type: ' + tempPanel.allButtons[k].buttonType + ' Id: ' + tempPanel.allButtons[k].buttonId + ' Frame: ' + tempPanel.allButtons[k].frame);
            texture(allButtonFrames[tempPanel.allButtons[k].buttonType][tempPanel.allButtons[k].buttonId][tempPanel.allButtons[k].frame]);
            translate(tempPanel.allButtons[k].x, tempPanel.allButtons[k].y, 0.001);
            plane(tempPanel.allButtons[k].width, tempPanel.allButtons[k].height);
            textSize(tempPanel.allButtons[k].textSize);
            textFont(basicFont);
            textAlign(CENTER, CENTER);
            fill(tempPanel.allButtons[k].textColour.r, tempPanel.allButtons[k].textColour.g, tempPanel.allButtons[k].textColour.b);
            text('s' + tempPanel.allButtons[k].text + ' ', 0, 0);
            pop();
          }
        }
        pop();
      }
    }
  }
  pop();

  //draw game to screen
  switch (currentSceneId)//search for game scene
  {
    case 1://game overworld - tiles and projectiles
    //draw tiles
    var tempX;
    var tempY;
    var tempTile;
    var tempTextureIndex;
    for (var x = maxX; x > -maxX; x--) {
      tempX = (x * tileWidth) + player.locX - (player.locX % tileWidth);
      for (var y = maxY; y > -maxY; y--) {
        tempY = (y * tileHeight) + player.locY - (player.locY % tileHeight);
        tempTile = getTile(tempX, tempY);
        push();
        translate(player.locX - tempX, player.locY - tempY, tempTile.locZ);
        noStroke();//remove plane lines when drawing
        texture(getTexture(tempTile.floorId, tempTile.floorAnimation, tempTile.floorFrame, allTileAnimations));
        plane(tempTile.width, tempTile.height);

        if (tempTile.buildingId > -1) {
          translate(0, buildingOffsetY, -0.0001);
          texture(getTexture(tempTile.buildingId, tempTile.buildingAnimation, tempTile.buildingFrame, allBuildingAnimations));
          plane(buildingWidth, buildingHeight);
          if (tempTile.buildingId == 3) {
            //if this tile is cables - show connections to nearby buildings
            if (testCbaleBuildings(getTile(tempX, tempY + tileWidth).buildingId)) {
              texture(cableEnd_up);
              plane(buildingWidth, buildingHeight);
            }
            if (testCbaleBuildings(getTile(tempX, tempY - tileWidth).buildingId)) {
              texture(cableEnd_down);
              plane(buildingWidth, buildingHeight);
            }
            if (testCbaleBuildings(getTile(tempX + tileHeight, tempY).buildingId)) {
              texture(cableEnd_left);
              plane(buildingWidth, buildingHeight);
            }
            if (testCbaleBuildings(getTile(tempX - tileHeight, tempY).buildingId)) {
              texture(cableEnd_right);
              plane(buildingWidth, buildingHeight);
            }
          }
        }
        if (tempTile.infectionPercent > 0) {
          //make sure index is possitive and exists
          tempTextureIndex = Math.floor(tempTile.infectionPercent * (allInfectionAnimations[0].length - 0.1));
          if (tempTextureIndex >= 0 && tempTextureIndex < allInfectionAnimations[0].length) {
            texture(getTexture(0, tempTextureIndex, tempTile.infectionFrame, allInfectionAnimations));
            plane(tempTile.width - 10, tempTile.height - 10);
          }
        }

        /*var indX = Math.floor(tempX / tileWidth);
        var indY = Math.floor(tempY / tileHeight);
        if (indX == player.requestPlaceX && indY == player.requestPlaceY) {
          texture();
          plane(tempTile.width - 10, tempTile.height - 10);
        }*/
        pop();
      }
    }

    //draw projectiles
    for (var i = 0; i < allProjectiles.length; i++) {
      if (allProjectiles[i].x > player.locX - (canvasWidth / 2) - tileWidth
      && allProjectiles[i].x < player.locX + (canvasWidth / 2) + tileWidth
      && allProjectiles[i].y > player.locY - (canvasHeight / 2) - tileHeight
      && allProjectiles[i].y < player.locY + (canvasHeight / 2) + tileHeight) {
        push();
        noStroke();
        translate(player.locX - allProjectiles[i].x - (tileWidth / 2), player.locY - allProjectiles[i].y - (tileHeight / 2), -0.0002);
        texture(allProjectileAnimations[allProjectiles[i].id]);
        plane(projectileWidth, projectileHeight);
        pop();
      }
    }

    //camera(player.locX, player.locY, 1000, player.locX, player.locY, 0, 0, 1, 0);

    //textGraphics1.text('X: ' + mouseScreenX + ' Y: ' + mouseScreenY, 150, 50);

    //draw all objects
    /*var framesRef;
    for (var i = 0; i < allCollidables.length; i++) {
      framesRef = false;
      //if this object is the player or is in view
      if ((allCollidables[i].locX == player.locX && allCollidables[i].locY == player.locY) ||
        (allCollidables[i].locX - (allCollidables[i].width / 2) - player.locX < canvasWidth
      && allCollidables[i].locX + (allCollidables[i].width / 2) - player.locX > -canvasWidth
      && allCollidables[i].locY - (allCollidables[i].height / 2) - player.locY < canvasHeight
      && allCollidables[i].locY + (allCollidables[i].height / 2) - player.locY > -canvasHeight)) {
        if (allCollidables[i].tag == 'C') {
          framesRef = allCharAnimations;
          findNextFrame(allCollidables[i], allCharAnimations);
          //allCollidables[i].show(allCharAnimations);
        }
        else if (allCollidables[i].tag == 'T') {
          framesRef = allTileAnimations;
          findNextFrame(allCollidables[i], allTileAnimations);
          //allCollidables[i].show(allTileAnimations);
        }

        if (framesRef) {
          push();
          translate(allCollidables[i].locX - player.locX, allCollidables[i].locY - player.locY, allCollidables[i].locZ - player.locZ);
          rotateZ(allCollidables[i].rotX);
          rotateZ(allCollidables[i].rotY);
          rotateZ(allCollidables[i].rotZ);
          noStroke();//remove plane lines when drawing
          texture(getTexture(allCollidables[i].id, allCollidables[i].animation, allCollidables[i].frame, framesRef));
          plane(allCollidables[i].width, allCollidables[i].height);
          pop();
        }
      }
    }*/
    break;

    case 2:

    break;

    default:
  }
}

//!!!!!!!!!!!!!!!!!!!!!!!!Add testing for panel's existance
function testMouseClick(clickedEvent) {
  //if the click happend in the canvas
  //if (mouse.canX >= canvasWidth && mouse.canY >= canvasHeight) {
  //test each layer of GUI, higher levels of GUI overright lower level click events
  var tempResult = 0;
  var tempButton = 0;
  var tempLocalBtn;
  var mouseOnPanel = false;
  for (var i = 0; i < allScenes[currentSceneId].allGuiPanels.length; i++) {
    for (var j = 0; j < allScenes[currentSceneId].allGuiPanels[i].length; j++) {
      if (allScenes[currentSceneId].allGuiPanels[i][j].visible) {
        //if click happened in this panel?
        if (panelTest(allScenes[currentSceneId].allGuiPanels[i][j])) {
          tempButton = 0;//reset incase the panel is being clicked
          mouseOnPanel = true;
          for (var k = 0; k < allScenes[currentSceneId].allGuiPanels[i][j].allButtons.length; k++) {
            tempLocalBtn = allScenes[currentSceneId].allGuiPanels[i][j].allButtons[k];
            if (tempLocalBtn.visible) {
              //reset clicked buttons to unclicked
              if (tempLocalBtn.buttonId == 1 && !mouse.eventWasDown)
                tempLocalBtn.buttonId = 0;

              if (clickedEvent) {
                tempResult = buttonTest(allScenes[currentSceneId].allGuiPanels[i][j], tempLocalBtn);
                if (tempResult) {
                  tempButton = tempLocalBtn;
                }
              }
            }
          }
        }
      }
    }
  }

  if (tempButton != 0) {
    tempButton.state = mouse.state;
    if (mouse.eventUp) {
      //set button to run its function
      switch (mouse.state) {
        case 0://left
          if (tempButton.leftClickFunc != -1)
            tempButton.leftClickFunc(tempButton);
        break;

        case 1://middle
          if (tempButton.middleClickFunc != -1)
            tempButton.middleClickFunc(tempButton);
        break;

        case 2://right
          if (tempButton.rightClickFunc != -1)
            tempButton.rightClickFunc(tempButton);
        break;

        default:
      }
      mouse.state = -1;
    }
    else if (tempButton.visualClickReact)
      tempButton.buttonId = 1;//set button to show it has been pressed

  }
  else if (mouse.eventDown && !mouseOnPanel) {
    //search for in game item to click
    switch (currentSceneId) {
      case 1://game over world
      //player.setRequestPlacing(Math.floor((mouse.canX - (canvasWidth / 2) + player.locX) / tileWidth)
      //, Math.floor((mouse.canY - (canvasHeight / 2) + player.locY) / tileHeight));

      //if the click was with the left mouse button?
      if (mouse.state == 0)
        player.setRequestPlacing();
      break;

      default:
    }
  }

  //player.updateRequestPlace(Math.floor((-mouse.canX + (player.locX % tileWidth) + player.locX) / tileWidth)
  //, Math.floor((-mouse.canY + (player.locY % tileHeight) + player.locY) / tileHeight));

  //works for 100 by 100
  player.updateRequestPlace(Math.floor((-mouse.canX + player.locX) / tileWidth)
  , Math.floor((-mouse.canY + player.locY) / tileHeight));

  //works for 120 by 120
  //player.updateRequestPlace(Math.floor((-mouse.canX +30 + player.locX) / tileWidth)
  //, Math.floor((-mouse.canY +50 + player.locY) / tileHeight));

}

function buttonTest(panel, button) {
  if ((mouse.canX >= panel.x + button.x - button.width / 2) && (mouse.canX <= panel.x + button.x + button.width / 2)
  && (mouse.canY >= panel.y + button.y - button.height / 2) && (mouse.canY <= panel.y + button.y + button.height / 2)) {
    return true;
  }
  return false;
}

function panelTest(panel) {
  if ((mouse.canX >= panel.x - panel.width / 2) && (mouse.canX <= panel.x + panel.width / 2)
  && (mouse.canY >= panel.y - panel.height / 2) && (mouse.canY <= panel.y + panel.height / 2)) {
    return true;
  }
  return false;
}



function EventMouseDown(event)
{
  ProcessMouseChanged(event, true);
}

function EventMouseUp(event)
{
  ProcessMouseChanged(event, false);
}
//event.button [0 = left button, 1 = middle button, 2 = right button]

function ProcessMouseChanged(event, state)
{
  /*mouse.leftDown = false;
  mouse.middleDown = false;
  mouse.rightDown = false;
  if (event.button == 0)//left button
    mouse.leftDown = true;
  else if (event.button == 1)//middle button
    mouse.middleDown = true;
  else if (event.button == 2)//right button
    mouse.rightDown = true;*/
  mouse.x = event.x;
  mouse.y = event.y;
  mouse.canX = event.x - canvasWidth / 2;
  mouse.canY = event.y - canvasHeight / 2;
  mouse.state = event.button;

  mouse.evenDown = false;
  mouse.eventUp = false;
  if (state) mouse.eventDown = true;
  else mouse.eventUp = true;
  mouse.eventWasDown = state;
}

function EventUpdateMouse(event)
{
  mouse.x = event.x;
  mouse.y = event.y;
  mouse.canX = event.x - canvasWidth / 2;
  mouse.canY = event.y - canvasHeight / 2;
}


//Keyboard Event Handling
function EventKeyDown(event)
{
  ProcessKeyChanged(event, true);
}

function EventKeyUp(event)
{
  ProcessKeyChanged(event, false);
}

function ProcessKeyChanged(event, state)
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
  else if (event.keyCode == 32)//space keyup
  {
    keyDown_space = state;
  }
  //
  else if (event.keyCode == 80)//p key
  {
    player.keyCommand = 'P';
  }
  //else statement
  else
  {
    //alert("Key code: " + event.keyCode);
  }
}

//all button event handlers
var buttonClick_startGame = function (button) {
  openNewScene(1);
  uniqueIdCode = random(100000);
  interactCode = 8;
  joinGame(username, flagId, uniqueIdCode, interactCode);//may move to a different intermediate scene for flag choosing
}

var buttonClick_openMenu = function (button) {
  openNewScene(0);

}

var buttonClick_showInstructions = function (button) {
  panel_gameInstructions.visible = true;
}

var buttonClick_hideInstructions = function (button) {
  panel_gameInstructions.visible = false;
}

var buttonClick_selectBuildItem = function (button) {
  //reset rest of building buttons
  for (var i = 0; i < allBuildingButtons.length; i++) {
    allBuildingButtons[i].buttonId = 0;
    allBuildingButtons[i].frame = 0;
  }
  //if a different item has been selected?
  if (button.extraData2 != player.selectedItem) {
    //buildingId + 1 because Clear is -1 in index 0
    button.extraData1.buttonId = 3;//set main button's id
    player.selectedItem = button.extraData2;//stores buildingId
  }
  else {
    //it is the same item as it selected so it should be unselected
    player.selectedItem = -2;//set to have nothing selected
  }
}
