var serverAddress = 'localhost:3000';
//var serverAddress = 'http://93.119.105.51:3000';
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
var allFlags;
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

var mainCanvas;

//key buttons and panels
var panel_gameInstructionsP1;//global panel storing instructions
var panel_gameInstructionsP2;//global panel storing instructions
var panel_gameCredits;//global panel storing credits
var allInstructionPanels = [];
var panel_gameSettings;//panel storing game settings
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
var AllItemNames = ['Stone', 'Iron', 'Copper', 'Uranium', 'Coal'];
var allRecipes = [
  //{item index, amount}
  [[ItemStone, 5], [ItemIron, 5]], //0 - Anti Bacteria Turret
  [[ItemStone, 5], [ItemIron, 5]], //1 - Anti Player Turret
  [[ItemStone, 30], [ItemIron, 30]], //2 - Mining Base
  [[ItemCopper, 2], [ItemIron, 1]], //3 - Cables
  [[ItemCopper, 5], [ItemIron, 2]], //3 - Solar Panel
  [[ItemCopper, 10], [ItemStone, 30]], //3 - Coal Plant
];

//all buildings that can use cables
var allCableBuildings = [0, 1, 2, 3, 4, 5];
function testCableBuildings(buildingId) {
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
var cableEnd_up = [];
var cableEnd_down = [];
var cableEnd_left = [];
var cableEnd_right = [];
var allGameInstancesInfoOutput = [];

var wldWidth = 255;
var wldHeight = 255;
var tileWidth = 100;
var tileHeight = 100;
var totalMapWidth = wldWidth * tileWidth;
var totalMapHeight = wldHeight * tileHeight;
var buildingWidth = 100;
var buildingHeight = 125;
var buildingOffsetY = -12.5;
var projectileWidth = 40;
var projectileHeight = 40;
var flagOffsetX = 0.12 * tileWidth;
var flagOffsetY = -0.45 * tileHeight;
var flagWidth = (buildingWidth / 4) * 1.125;
var flagHeight = (buildingHeight / 4) * 1.125;
var mapZoom = 1;

var panel_gameMenu;
var playerPositionOutput;//button with text field to show the player's current location
var scrnWidthOutput;
var scrnHeightOutput;
var panel_selectGameInstance_StartButton;
var panel_selectGameInstance;
var panel_gameStats;

//work out the start and end index of tiles to draw to the screen
var maxX;
var maxY;

//timer to send every 100 ticks
//, or can set timerToNextSendMessage to max value to automatically send a message
var timerToNextSendMessage = 0;
var MaxTimerToNextSendMessage = 100;

var testimg;

//server relevant long term data
var username = 'sam';
var flagId = 22;
var uniqueIdCode = 0;//unique code to identify user to server
var interactCode = 0;//unique code identify users to each other
var gameInstanceIndex = -1;

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
  //menuMusic = loadSound('music/Zefz - TheLoomingBattle/TheLoomingBattle.ogg');
  gameMusic = loadSound('music/Mega Pixel Music Lab - Battle Theme 2 v1.2/Battle Theme II v1.2.wav');
  menuMusic = gameMusic;

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
  allBuildingAnimations[0] = loadAnimation('Building', 0, [1]);//Building 000
  allBuildingAnimations[1] = loadAnimation('Building', 1, [1]);//Building 001
  allBuildingAnimations[2] = loadAnimation('Building', 2, [1]);//Building 002
  allBuildingAnimations[3] = loadAnimation('Building', 3, [1, 1, 1, 1, 1]);//Building 003
  allBuildingAnimations[4] = loadAnimation('Building', 4, [1]);//Building 004
  allBuildingAnimations[5] = loadAnimation('Building', 5, [1]);//Building 005

  allBuildingAnimations[6] = loadAnimation('Building', 6, [1]);//Building 006
  allBuildingAnimations[7] = loadAnimation('Building', 7, [1]);//Building 007
  allBuildingAnimations[8] = loadAnimation('Building', 8, [1]);//Building 008
  allBuildingAnimations[9] = loadAnimation('Building', 9, [1]);//Building 009
  allBuildingAnimations[10] = loadAnimation('Building', 10, [1]);//Building 010

  //get all projectile sprites
  allProjectileAnimations = [];
  allProjectileAnimations[0] = loadImage('textures/Projectiles/P00/F00.png');
  allProjectileAnimations[1] = loadImage('textures/Projectiles/P01/F00.png');
  allProjectileAnimations[2] = loadImage('textures/Projectiles/P02/F00.png');
  allProjectileAnimations[3] = loadImage('textures/Projectiles/P03/F00.png');
  allProjectileAnimations[4] = loadImage('textures/Projectiles/P04/F00.png');
  allProjectileAnimations[5] = loadImage('textures/Projectiles/P05/F00.png');
  allProjectileAnimations[6] = loadImage('textures/Projectiles/P06/F00.png');
  allProjectileAnimations[7] = loadImage('textures/Projectiles/P07/F00.png');

  //get cable ends
  cableEnd_up = getImageList('textures/CableEnds/', 'Up', 5);
  cableEnd_down = getImageList('textures/CableEnds/', 'Down', 5);
  cableEnd_left = getImageList('textures/CableEnds/', 'Left', 5);
  cableEnd_right = getImageList('textures/CableEnds/', 'Right', 5);

  //get all flages
  allFlags = getImageList('textures/AllFlags/', 'F', 11);

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

  var pStart_button_instruct = new GuiButton(0, 0, 0, 0, -50, 300, 100, allButtonFrames, buttonClick_showInstructionsP1, -1, -1, 'Instructions', 32);
  panel_start.allButtons.push(pStart_button_instruct);

  var pStart_button_credits = new GuiButton(0, 0, 0, 0, 100, 300, 100, allButtonFrames, buttonClick_showCredits, -1, -1, 'Credits', 32);
  panel_start.allButtons.push(pStart_button_credits);

  //setup game scene
  sceneGame = new Scene(); allScenes[1] = sceneGame;

  //setup game right side panel
  panel_gameMenu = new GuiPanel(0, 325, 0, 250, 700, allPanelFrames);
  sceneGame.allGuiPanels[5].push(panel_gameMenu);
  var pGameMenu_button_Quit = new GuiButton(0, 4, 0, 65, -270, 100, 50, allButtonFrames, buttonClick_openMenu, -1, -1, 'Quit', 20);
  panel_gameMenu.allButtons.push(pGameMenu_button_Quit);

  var pGameMenu_button_Settings = new GuiButton(0, 0, 0, -55, -270, 130, 50, allButtonFrames, buttonClick_openSettings, -1, -1, 'Settings', 20);
  panel_gameMenu.allButtons.push(pGameMenu_button_Settings);

  var pGameMenu_button_Instructions = new GuiButton(0, 0, 0, 0, -210, 240, 50, allButtonFrames, buttonClick_showInstructionsP1, -1, -1, 'Instructions', 20);
  panel_gameMenu.allButtons.push(pGameMenu_button_Instructions);

  //setup game purchase panel
  spacingX = 0;
  spacingY = 0;
  var tempButton;
  //var panel_gamePurchase = new GuiPanel(0, 0, 300, 900, 100, allPanelFrames);
  //sceneGame.allGuiPanels[5].push(panel_gamePurchase);
  spacingY = -140;
  createBuildingButton(spacingX, spacingY, 0, 2, -1, 'Clear', 'Free', panel_gameMenu.allButtons, allBuildingButtons);
  createBuildingButton(spacingX, spacingY, 1, 3, 0, 'Anti Bacteria Turret', getBuildngCostAsString(0), panel_gameMenu.allButtons, allBuildingButtons);
  createBuildingButton(spacingX, spacingY, 2, 4, 1, 'Anti Player Turret', getBuildngCostAsString(1), panel_gameMenu.allButtons, allBuildingButtons);
  createBuildingButton(spacingX, spacingY, 3, 5, 2, 'Mining Turret', getBuildngCostAsString(2), panel_gameMenu.allButtons, allBuildingButtons);
  createBuildingButton(spacingX, spacingY, 4, 6, 3, 'Cables', getBuildngCostAsString(3), panel_gameMenu.allButtons, allBuildingButtons);
  createBuildingButton(spacingX, spacingY, 5, 7, 4, 'Solar Panel', getBuildngCostAsString(4), panel_gameMenu.allButtons, allBuildingButtons);
  //createBuildingButton(spacingX, spacingY, 6, 8, 5, 'Power Station', getBuildngCostAsString(5), panel_gameMenu.allButtons, allBuildingButtons);
  //createBuildingButton(spacingX, spacingY, 7, 8, 5, 'Power Station', getBuildngCostAsString(5), panel_gameMenu.allButtons, allBuildingButtons);
  //createBuildingButton(spacingX, spacingY, 8, 8, 5, 'Power Station', getBuildngCostAsString(5), panel_gameMenu.allButtons, allBuildingButtons);


  //setup game resources panel
  var spacingX = 0;
  var spacingY = 0;
  panel_gameStats = new GuiPanel(0, 0, -325, 900, 50, allPanelFrames);
  sceneGame.allGuiPanels[5].push(panel_gameStats);
  spacingX = -450;
  playerPositionOutput = new GuiButton(0, 0, 0, spacingX + 60, 40, 100, 100, allButtonFrames, -1, -1, -1, '', 20);//button for position output
  panel_gameStats.allButtons.push(playerPositionOutput);
  spacingX += 120;
  panel_gameStats.allButtons.push(new GuiButton(1, 0, 0, spacingX + 25, 0, 48, 48, allButtonFrames, -1, -1, -1, '', 28));
  panel_gameStats.allButtons.push(new GuiButton(0, 0, 0, spacingX + 60, 0, 0, 0, allButtonFrames, -1, -1, -1, 'Stone:', 20));
  pGameStats_button_invStone = new GuiButton(0, 0, 0, spacingX + 105, 0, 0, 0, allButtonFrames, -1, -1, -1, '000', 20);
  panel_gameStats.allButtons.push(pGameStats_button_invStone);
  spacingX += 160;
  panel_gameStats.allButtons.push(new GuiButton(1, 1, 0, spacingX + 25, 0, 48, 48, allButtonFrames, -1, -1, -1, '', 28));
  panel_gameStats.allButtons.push(new GuiButton(0, 0, 0, spacingX + 60, 0, 0, 0, allButtonFrames, -1, -1, -1, 'Iron:', 20));
  pGameStats_button_invIron = new GuiButton(0, 0, 0, spacingX + 100, 0, 0, 0, allButtonFrames, -1, -1, -1, '000', 20);
  panel_gameStats.allButtons.push(pGameStats_button_invIron);
  spacingX += 155;
  panel_gameStats.allButtons.push(new GuiButton(1, 2, 0, spacingX + 25, 0, 48, 48, allButtonFrames, -1, -1, -1, '', 28));
  panel_gameStats.allButtons.push(new GuiButton(0, 0, 0, spacingX + 60, 0, 0, 0, allButtonFrames, -1, -1, -1, 'Copper:', 20));
  pGameStats_button_invCopper = new GuiButton(0, 0, 0, spacingX + 110, 0, 0, 0, allButtonFrames, -1, -1, -1, '000', 20);
  panel_gameStats.allButtons.push(pGameStats_button_invCopper);
  spacingX += 170;
  panel_gameStats.allButtons.push(new GuiButton(1, 3, 0, spacingX + 25, 0, 48, 48, allButtonFrames, -1, -1, -1, '', 28));
  panel_gameStats.allButtons.push(new GuiButton(0, 0, 0, spacingX + 60, 0, 0, 0, allButtonFrames, -1, -1, -1, 'Uranium:', 20));
  pGameStats_button_invUranium = new GuiButton(0, 0, 0, spacingX + 115, 0, 0, 0, allButtonFrames, -1, -1, -1, '000', 20);
  panel_gameStats.allButtons.push(pGameStats_button_invUranium);
  spacingX += 155;
  panel_gameStats.allButtons.push(new GuiButton(1, 4, 0, spacingX + 25, 0, 48, 48, allButtonFrames, -1, -1, -1, '', 28));
  panel_gameStats.allButtons.push(new GuiButton(0, 0, 0, spacingX + 60, 0, 0, 0, allButtonFrames, -1, -1, -1, 'Coal:', 20));
  pGameStats_button_invCoal = new GuiButton(0, 0, 0, spacingX + 100, 0, 0, 0, allButtonFrames, -1, -1, -1, '000', 20);
  panel_gameStats.allButtons.push(pGameStats_button_invCoal);


  //game settings
  panel_gameSettings = new GuiPanel(0, 0, 0, 800, 800, allPanelFrames);
  panel_gameSettings.visible = false;
  sceneGame.allGuiPanels[6].push(panel_gameSettings);
  panel_gameSettings.allButtons.push(new GuiButton(0, 0, 0, 0, 100, 200, 100, allButtonFrames, buttonClick_hideSettings, -1, -1, 'Ok', 32));

  scrnWidthOutput = new GuiButton(0, 0, 0, 0, -160, 0, 0, allButtonFrames, -1, -1, -1
    , 'Screen Width', 20);
  panel_gameSettings.allButtons.push(scrnWidthOutput);

  panel_gameSettings.allButtons.push(new GuiButton(0, 0, 0, 200, -120, 75, 40, allButtonFrames, buttonClick_setCanvasWidth600, -1, -1
    , '600', 14));
  panel_gameSettings.allButtons.push(new GuiButton(0, 0, 0, 120, -120, 75, 40, allButtonFrames, buttonClick_setCanvasWidth700, -1, -1
    , '700', 14));
  panel_gameSettings.allButtons.push(new GuiButton(0, 0, 0, 40, -120, 75, 40, allButtonFrames, buttonClick_setCanvasWidth800, -1, -1
    , '800', 14));
  panel_gameSettings.allButtons.push(new GuiButton(0, 0, 0, -40, -120, 75, 40, allButtonFrames, buttonClick_setCanvasWidth900, -1, -1
    , '900', 14));
  panel_gameSettings.allButtons.push(new GuiButton(0, 0, 0, -120, -120, 75, 40, allButtonFrames, buttonClick_setCanvasWidth1000, -1, -1
    , '1000', 14));
  panel_gameSettings.allButtons.push(new GuiButton(0, 0, 0, -200, -120, 75, 40, allButtonFrames, buttonClick_setCanvasWidth1100, -1, -1
    , '1100', 14));

  scrnHeightOutput = new GuiButton(0, 0, 0, 0, -60, 0, 0, allButtonFrames, -1, -1, -1
      , 'Screen Height', 20);
  panel_gameSettings.allButtons.push(scrnHeightOutput);

  panel_gameSettings.allButtons.push(new GuiButton(0, 0, 0, 200, -20, 75, 40, allButtonFrames, buttonClick_setCanvasHeight500, -1, -1
    , '500', 14));
  panel_gameSettings.allButtons.push(new GuiButton(0, 0, 0, 120, -20, 75, 40, allButtonFrames, buttonClick_setCanvasHeight600, -1, -1
    , '600', 14));
  panel_gameSettings.allButtons.push(new GuiButton(0, 0, 0, 40, -20, 75, 40, allButtonFrames, buttonClick_setCanvasHeight700, -1, -1
    , '700', 14));
  panel_gameSettings.allButtons.push(new GuiButton(0, 0, 0, -40, -20, 75, 40, allButtonFrames, buttonClick_setCanvasHeight800, -1, -1
    , '800', 14));
  panel_gameSettings.allButtons.push(new GuiButton(0, 0, 0, -120, -20, 75, 40, allButtonFrames, buttonClick_setCanvasHeight900, -1, -1
    , '900', 14));
  panel_gameSettings.allButtons.push(new GuiButton(0, 0, 0, -200, -20, 75, 40, allButtonFrames, buttonClick_setCanvasHeight1000, -1, -1
    , '1000', 14));


  //Game Instance selector
  panel_selectGameInstance = new GuiPanel(0, 0, 0, 800, 800, allPanelFrames);
  panel_selectGameInstance.visible = false;
  sceneGame.allGuiPanels[6].push(panel_selectGameInstance);
  panel_selectGameInstance_StartButton = new GuiButton(0, 0, 0, 0, 100, 200, 100, allButtonFrames, buttonClick_selectGameInstance, -1, -1, 'Click to Start!', 32);
  panel_selectGameInstance_StartButton.visible = false;
  panel_selectGameInstance.allButtons.push(panel_selectGameInstance_StartButton);

  panel_selectGameInstance.allButtons.push(new GuiButton(0, 0, 0, 0, -160, 0, 0, allButtonFrames, -1, -1, -1
    , 'Choose which Game Instance you\'d like to join', 20));

  panel_selectGameInstance.allButtons.push(new GuiButton(0, 0, 0, 200, -120, 75, 40, allButtonFrames, buttonClick_selectGameInstance00, -1, -1
    , 'Session 1', 14));
  allGameInstancesInfoOutput[0] = new GuiButton(0, 0, 0, 200, -100, 0, 0, allButtonFrames, buttonClick_selectGameInstance00, -1, -1
    , 'Data', 12);
  panel_selectGameInstance.allButtons.push(allGameInstancesInfoOutput[0]);

  panel_selectGameInstance.allButtons.push(new GuiButton(0, 0, 0, 120, -120, 75, 40, allButtonFrames, buttonClick_selectGameInstance01, -1, -1
    , 'Session 2', 14));
  allGameInstancesInfoOutput[1] = new GuiButton(0, 0, 0, 120, -100, 0, 0, allButtonFrames, buttonClick_selectGameInstance00, -1, -1
    , 'Data', 12);
  panel_selectGameInstance.allButtons.push(allGameInstancesInfoOutput[1]);

  panel_selectGameInstance.allButtons.push(new GuiButton(0, 0, 0, 40, -120, 75, 40, allButtonFrames, buttonClick_selectGameInstance02, -1, -1
    , 'Session 3', 14));
  allGameInstancesInfoOutput[2] = new GuiButton(0, 0, 0, 40, -100, 0, 0, allButtonFrames, buttonClick_selectGameInstance00, -1, -1
    , 'Data', 12);
  panel_selectGameInstance.allButtons.push(allGameInstancesInfoOutput[2]);

  panel_selectGameInstance.allButtons.push(new GuiButton(0, 0, 0, -40, -120, 75, 40, allButtonFrames, buttonClick_selectGameInstance03, -1, -1
    , 'Session 4', 14));
  allGameInstancesInfoOutput[3] = new GuiButton(0, 0, 0, -40, -100, 0, 0, allButtonFrames, buttonClick_selectGameInstance00, -1, -1
    , 'Data', 12);
  panel_selectGameInstance.allButtons.push(allGameInstancesInfoOutput[3]);

  panel_selectGameInstance.allButtons.push(new GuiButton(0, 0, 0, -120, -120, 75, 40, allButtonFrames, buttonClick_selectGameInstance04, -1, -1
    , 'Session 5', 14));
  allGameInstancesInfoOutput[4] = new GuiButton(0, 0, 0, -120, -100, 0, 0, allButtonFrames, buttonClick_selectGameInstance00, -1, -1
    , 'Data', 12);
  panel_selectGameInstance.allButtons.push(allGameInstancesInfoOutput[4]);

  panel_selectGameInstance.allButtons.push(new GuiButton(0, 0, 0, -200, -120, 75, 40, allButtonFrames, buttonClick_selectGameInstance05, -1, -1
    , 'Session 6', 14));
  allGameInstancesInfoOutput[5] = new GuiButton(0, 0, 0, -200, -100, 0, 0, allButtonFrames, buttonClick_selectGameInstance00, -1, -1
    , 'Data', 12);
  panel_selectGameInstance.allButtons.push(allGameInstancesInfoOutput[5]);

  //game instructions
  panel_gameInstructionsP1 = new GuiPanel(0, 0, 0, 800, 800, allPanelFrames);
  allInstructionPanels.push(panel_gameInstructionsP1);
  panel_gameInstructionsP1.visible = false;
  sceneGame.allGuiPanels[6].push(panel_gameInstructionsP1);
  sceneMenu.allGuiPanels[6].push(panel_gameInstructionsP1);
  panel_gameInstructionsP1.allButtons.push(new GuiButton(0, 0, 0, 240, 100, 180, 80, allButtonFrames, buttonClick_showInstructionsP2, -1, -1, 'Next', 32));

  var pGameInstructions_button_Close = new GuiButton(0, 0, 0, 0, 100, 200, 100, allButtonFrames, buttonClick_hideAllInstructions, -1, -1, 'Close', 32);
  panel_gameInstructionsP1.allButtons.push(pGameInstructions_button_Close);

  var pGameInstructions_button_instructText = new GuiButton(0, 0, 0, 0, -200, 0, 0, allButtonFrames, -1, -1, -1
    , 'Move Up: W     Move Down: S\nMove Left: A      Move Right: D', 28);
  panel_gameInstructionsP1.allButtons.push(pGameInstructions_button_instructText);

  panel_gameInstructionsP1.allButtons.push(new GuiButton(0, 0, 0, 0, -120, 0, 0, allButtonFrames, -1, -1, -1
    , 'Bacteria are taking over the world! \nYour goal is to fight it off using Anti Bacteria Turrets', 20));
  panel_gameInstructionsP1.allButtons.push(new GuiButton(0, 0, 0, 0, -20, 0, 0, allButtonFrames, -1, -1, -1
    , 'Your resources are shown in the top panel next to their icons \nThese are used to pay for Buildings you place down \nYou can collect more by using Clear on the terrain', 20));


  panel_gameInstructionsP2 = new GuiPanel(0, 0, 0, 800, 800, allPanelFrames);
  allInstructionPanels.push(panel_gameInstructionsP2);
  panel_gameInstructionsP2.visible = false;
  sceneGame.allGuiPanels[6].push(panel_gameInstructionsP2);
  sceneMenu.allGuiPanels[6].push(panel_gameInstructionsP2);
  panel_gameInstructionsP2.allButtons.push(new GuiButton(0, 0, 0, -240, 100, 180, 80, allButtonFrames, buttonClick_showInstructionsP1, -1, -1, 'Previous', 32));

  panel_gameInstructionsP2.allButtons.push(pGameInstructions_button_Close);

  panel_gameInstructionsP2.allButtons.push(new GuiButton(0, 0, 0, 0, -200, 0, 0, allButtonFrames, -1, -1, -1
    , 'Left click the buttons on the right hand panel to select the \nBuilding you want to buy. Then left click on the map to place them \n(The Building costs are shown below each button)', 20));
  panel_gameInstructionsP2.allButtons.push(new GuiButton(0, 0, 0, 0, -120, 0, 0, allButtonFrames, -1, -1, -1
    , 'All Turrets require electricity to work - \nUse Buildings like Solar Panels to generate electricity', 20));
  panel_gameInstructionsP2.allButtons.push(new GuiButton(0, 0, 0, 0, -20, 0, 0, allButtonFrames, -1, -1, -1
    , 'Every Building conducts electricity slowly, \nbut to move it quickly you can connect your Buildings with Cables', 20));



  //game credits
  panel_gameCredits = new GuiPanel(0, 0, 0, 800, 800, allPanelFrames);
  allInstructionPanels.push(panel_gameCredits);
  panel_gameCredits.visible = false;
  sceneMenu.allGuiPanels[6].push(panel_gameCredits);
  var pGameCredits_button_Close = new GuiButton(0, 0, 0, 0, 100, 200, 100, allButtonFrames, buttonClick_hideCredits, -1, -1, 'Close', 32);
  panel_gameCredits.allButtons.push(pGameCredits_button_Close);

  panel_gameCredits.allButtons.push(new GuiButton(0, 0, 0, 0, -200, 0, 0, allButtonFrames, -1, -1, -1
    , 'Programming', 20));
  panel_gameCredits.allButtons.push(new GuiButton(0, 0, 0, 0, -180, 0, 0, allButtonFrames, -1, -1, -1
    , 'Christopher Deane', 16));

  panel_gameCredits.allButtons.push(new GuiButton(0, 0, 0, 0, -120, 0, 0, allButtonFrames, -1, -1, -1
    , 'Art', 20));
  panel_gameCredits.allButtons.push(new GuiButton(0, 0, 0, 0, -100, 0, 0, allButtonFrames, -1, -1, -1
    , 'Chris so far...', 16));

  panel_gameCredits.allButtons.push(new GuiButton(0, 0, 0, 0, -40, 0, 0, allButtonFrames, -1, -1, -1
    , 'Music', 20));
  panel_gameCredits.allButtons.push(new GuiButton(0, 0, 0, 0, -20, 0, 0, allButtonFrames, -1, -1, -1
    , 'Battle Theme by Martin Opsahl at https://opengameart.org/content/battle-theme-ii', 16));
  panel_gameCredits.allButtons.push(new GuiButton(0, 0, 0, 0, -20 + 15, 0, 0, allButtonFrames, -1, -1, -1
    , 'The Looming Batttle by Johan Jansen at https://opengameart.org/content/orchestral-battle-music', 16));

}

function getBuildngCostAsString(buildingId) {
  var ret = '';
  for (var i = 0; i < allRecipes[buildingId].length; i++) {
    if (i > 0) ret += ' + ';
    ret += AllItemNames[allRecipes[buildingId][i][0]] + ' x' + allRecipes[buildingId][i][1];
  }
  return ret;
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
  buttonArrMain.push(new GuiButton(0, 0, 0, spaceX + 15, spaceY + 20, 0, 0, allButtonFrames, -1, -1, -1, 'Cost: ' + cost, 15));
}

function setCanvas() {
  mainCanvas = createCanvas(canvasWidth, canvasHeight, WEBGL);

  //set GUI
  panel_gameStats.width = canvasWidth;
  panel_gameStats.x = 450 - (canvasWidth / 2);
  panel_gameStats.y = -(canvasHeight / 2) + 25;

  panel_gameMenu.height = canvasHeight;
}

function setup()
{
  player = new Player(2000, 25000, layer_character, 0, 0, 0);
  player.selectedItem = -2;//nothing selected
  setCanvas();
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
  socket.on('returnedServerInfo', recievedServerInfo);
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
    //make sure position is within normal map parameters
    player.locX = getWldX(player.locX);
    player.locY = getWldY(player.locY);
    playerPositionOutput.text = 'Postion \nX: ' + (Math.floor(player.locX) / tileWidth) + ' \nY: ' + (Math.floor(player.locY) / tileHeight);

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

  timerToNextSendMessage--;
  //only send message to server sometimes or if a click command has been made
  if (timerToNextSendMessage <= 0 || player.requestPlace) {
    var updateFromClient = {
      message: 'hia',
      gameInstanceIndex: gameInstanceIndex,
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
    timerToNextSendMessage = MaxTimerToNextSendMessage;
  }
}


function joinGame(name, flagId, uniqueIdCode, interactCode){
  var data = {
    name: name,
    flagId: flagId,
    uniqueIdCode: uniqueIdCode,
    interactCode: interactCode,
    gameInstanceIndex: gameInstanceIndex
  }
  socket.emit('newClient', data);
}

function recievedServerInfo(data) {
  console.log('Received Server Info');
  if (data.allGameInstancesInfo !== undefined) {
    for (var i = 0; i < data.allGameInstancesInfo.length; i++) {
      allGameInstancesInfoOutput[i].text = 'Players ' + data.allGameInstancesInfo[i].currentNumberOfPlayers + '/' + data.allGameInstancesInfo[i].maxNumberOfPlayers;
    }
  }
}

function joinSuccess(data) {
  console.log('Join Succeeded');
  //set starting position fro player
  if (data.startingX !== undefined) player.locX = data.startingX;
  if (data.startingY !== undefined) player.locY = data.startingY;
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
  else if (data.reason == 'full GameInstance') {
    //the GameInstance was full - the player needs to choose a different one
    //open session selection screen again
    panel_selectGameInstance.visible = true;
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
    if (tempData.buildingFlagId !== undefined) allTiles[tempData.gridX][tempData.gridY].buildingFlagId = tempData.buildingFlagId;
    //if (tempData.electricity !== undefined) allTiles[tempData.gridX][tempData.gridY].electricity = tempData.electricity;
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

function getWldX(x) {
  //make sure x is positive even if its value is a bit excesive
  if (x < 0) x += totalMapWidth * (Math.abs(Math.floor(x / totalMapWidth)) + 1);
  x = x % totalMapWidth;
  return x;
}

function getWldY(y) {
  //make sure y is positive even if its value is a bit excesive
  if (y < 0) y += totalMapHeight * (Math.abs(Math.floor(y / totalMapHeight)) + 1);
  y = y % totalMapHeight;
  return y;
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
      gameMusic.play();
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

  // push()
  // //for (var i = 0; i < 10; i++)
  // {
  //
  // }
  // pop()
  //
  // push();
  // texture(testimg);
  // translate(100, 0, -100);
  // rotateX(30);
  // rotateY(50);
  // box(100);
  // pop();

  push();
  translate(0, 0, 0);
  noStroke();

  if (panel_gameSettings.visible) {
    scrnWidthOutput.text = 'Screen Width - Currently: ' + canvasWidth;
    scrnHeightOutput.text = 'Screen Height - Currently: ' + canvasHeight;
  }

  //update GUI positions based on the screen size
  panel_gameMenu.x = (canvasWidth / 2) - 100;

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
    //draw game within the canvas (-Gui panel on rigth side of screen)
    for (var x = maxX; x > -maxX + (panel_gameMenu.width / tileWidth); x--) {
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
          //if this building is cables?
          if (tempTile.buildingId == 3) {
            //if this tile is cables - show connections to nearby buildings
            if (testCableBuildings(getTile(tempX, tempY + tileWidth).buildingId)) {
              texture(cableEnd_up[tempTile.buildingAnimation]);
              plane(buildingWidth, buildingHeight);
            }
            if (testCableBuildings(getTile(tempX, tempY - tileWidth).buildingId)) {
              texture(cableEnd_down[tempTile.buildingAnimation]);
              plane(buildingWidth, buildingHeight);
            }
            if (testCableBuildings(getTile(tempX + tileHeight, tempY).buildingId)) {
              texture(cableEnd_left[tempTile.buildingAnimation]);
              plane(buildingWidth, buildingHeight);
            }
            if (testCableBuildings(getTile(tempX - tileHeight, tempY).buildingId)) {
              texture(cableEnd_right[tempTile.buildingAnimation]);
              plane(buildingWidth, buildingHeight);
            }
          }
          //if this building has a flag set to it
          else if (tempTile.buildingFlagId != -1) {
            push();
            translate(flagOffsetX, flagOffsetY, -0.0001);
            texture(allFlags[tempTile.buildingFlagId]);
            plane(flagWidth, flagHeight);
            pop();
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


    // var edgeLeftX = getWldX(player.locX - (canvasWidth / 2) - tileWidth);
    // var edgeRightX = getWldX(player.locX + (canvasWidth / 2) + tileWidth);
    // var edgeTopY = getWldY(player.locY - (canvasHeight / 2) - tileHeight);
    // var edgeBottomY = getWldY(player.locY + (canvasHeight / 2) + tileHeight);
    var edgeLeftX = - (canvasWidth / 2) - tileWidth;
    var edgeRightX = (canvasWidth / 2) + tileWidth;
    var edgeTopY = - (canvasHeight / 2) - tileHeight;
    var edgeBottomY = (canvasHeight / 2) + tileHeight;
    var plX = getWldX(player.locX);
    var plY = getWldY(player.locY);
    //draw projectiles
    for (var i = 0; i < allProjectiles.length; i++) {
      if ((plX - getWldX(allProjectiles[i].x) > edgeLeftX)// || plX + (totalMapWidth / 2) - getWldX(allProjectiles[i].x + (wldWidth / 2)) > edgeLeftX || plX - (totalMapWidth / 2) - getWldX(allProjectiles[i].x + (wldWidth / 2)) > edgeLeftX)
      && (plX - getWldX(allProjectiles[i].x) < edgeRightX)// || plX + (totalMapWidth / 2) - getWldX(allProjectiles[i].x + (wldWidth / 2)) > edgeRightX || plX - (totalMapWidth / 2) - getWldX(allProjectiles[i].x + (wldWidth / 2)) > edgeRightX)
      && (plY - getWldY(allProjectiles[i].y) > edgeTopY)// || plY + (totalMapHeight / 2) - getWldY(allProjectiles[i].y + (wldHeight / 2)) > edgeTopY || plY - (totalMapHeight / 2) - getWldY(allProjectiles[i].y + (wldHeight / 2)) > edgeTopY)
      && (plY - getWldY(allProjectiles[i].y) < edgeBottomY)) {// || plY + (totalMapHeight / 2) - getWldY(allProjectiles[i].y + (wldHeight / 2)) < edgeBottomY || plY - (totalMapHeight / 2) - getWldY(allProjectiles[i].y + (wldHeight / 2)) < edgeBottomY)) {
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
  panel_selectGameInstance.visible = true;
  socket.emit('requestServerInfo', {});//reset data about the server
}

var buttonClick_selectGameInstance = function (button) {
  panel_selectGameInstance.visible = false;
  panel_selectGameInstance_StartButton.visible = false;
  joinGame(username, flagId, uniqueIdCode, interactCode);//may move to a different intermediate scene for flag choosing
}

var buttonClick_selectGameInstance00 = function (button) {
  gameInstanceIndex = 0;
  panel_selectGameInstance_StartButton.visible = true;
}
var buttonClick_selectGameInstance01 = function (button) {
  gameInstanceIndex = 1;
  panel_selectGameInstance_StartButton.visible = true;
}
var buttonClick_selectGameInstance02 = function (button) {
  gameInstanceIndex = 2;
  panel_selectGameInstance_StartButton.visible = true;
}
var buttonClick_selectGameInstance03 = function (button) {
  gameInstanceIndex = 3;
  panel_selectGameInstance_StartButton.visible = true;
}
var buttonClick_selectGameInstance04 = function (button) {
  gameInstanceIndex = 4;
  panel_selectGameInstance_StartButton.visible = true;
}
var buttonClick_selectGameInstance05 = function (button) {
  gameInstanceIndex = 5;
  panel_selectGameInstance_StartButton.visible = true;
}

var buttonClick_openMenu = function (button) {
  openNewScene(0);

}

var buttonClick_showCredits = function (button) {
  panel_gameCredits.visible = true;
}

var buttonClick_hideCredits = function (button) {
  panel_gameCredits.visible = false;
}

var buttonClick_showInstructionsP1 = function (button) {
  hideInstructions();
  panel_gameInstructionsP1.visible = true;
}

var buttonClick_showInstructionsP2 = function (button) {
  hideInstructions();
  panel_gameInstructionsP2.visible = true;
}

var buttonClick_hideAllInstructions = function (button) {
  hideInstructions();
}

function hideInstructions() {
  for (var i = 0; i < allInstructionPanels.length; i++) {
    allInstructionPanels[i].visible = false;
  }
}

var buttonClick_openSettings = function (button) {
  panel_gameSettings.visible = true;
}

var buttonClick_hideSettings = function (button) {
  panel_gameSettings.visible = false;
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

//set canvas width
var buttonClick_setCanvasWidth600 = function (button) {
  canvasWidth = 600;
  setCanvas();
}

var buttonClick_setCanvasWidth700 = function (button) {
  canvasWidth = 700;
  setCanvas();
}

var buttonClick_setCanvasWidth800 = function (button) {
  canvasWidth = 800;
  setCanvas();
}

var buttonClick_setCanvasWidth900 = function (button) {
  canvasWidth = 900;
  setCanvas();
}

var buttonClick_setCanvasWidth1000 = function (button) {
  canvasWidth = 1000;
  setCanvas();
}

var buttonClick_setCanvasWidth1100 = function (button) {
  canvasWidth = 1100;
  setCanvas();
}

//set canvas height
var buttonClick_setCanvasHeight500 = function (button) {
  canvasHeight = 500;
  setCanvas();
}

var buttonClick_setCanvasHeight600 = function (button) {
  canvasHeight = 600;
  setCanvas();
}

var buttonClick_setCanvasHeight700 = function (button) {
  canvasHeight = 700;
  setCanvas();
}

var buttonClick_setCanvasHeight800 = function (button) {
  canvasHeight = 800;
  setCanvas();
}

var buttonClick_setCanvasHeight900 = function (button) {
  canvasHeight = 900;
  setCanvas();
}

var buttonClick_setCanvasHeight1000 = function (button) {
  canvasHeight = 1000;
  setCanvas();
}
