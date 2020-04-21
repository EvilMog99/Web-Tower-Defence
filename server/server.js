//command to run: dir/serverfolder: node servername.js
//Ctrl + C to stop server

//Download Node

//pushd D:\ to go to D drive
//popd to go back to C drive

//command to install express: npm install express

//command to install socket: npm install socket.io

//command to install client socket: dir/clientfolder: npm install socket.io

console.log('Starting Server');

var express = require('express');//import express
var app = express();
var server = app.listen(3000);

app.use(express.static('public'));//specifies which files to host
app.use(function (req, res, next) {
  //express.static('public');
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  //res.send({'text': 'this text was from the server'});
});

console.log("Socket server is running");

var GameMaxNumberOfCycles = 1200;
var Diff_1 = GameMaxNumberOfCycles - 300;
var Diff_2 = GameMaxNumberOfCycles - 600;
var Diff_3 = GameMaxNumberOfCycles - 900;

//setup socket
var socket = require('socket.io');//import socket
var io = socket(server);//set io with the server (and its socket data)



var WldWidth = 255;
var WldHeight = 255;
var TileWidth = 100;
var TileHeight = 100;
var TotalMapWidth = WldWidth * TileWidth;
var TotalMapHeight = WldHeight * TileHeight;


var infectLv1 = 10;
var infectLv2 = 10;
var infectLv3 = 30;
var infectLv4 = 40;
var infectionMaxArr = {infectLv1, infectLv2, infectLv3, infectLv4};

var ItemStone    = 0;
var ItemIron     = 1;
var ItemCopper   = 2;
var ItemUranium  = 3;
var ItemCoal     = 4;
var allRecipes = [
  //{item index, amount}
  [[ItemStone, 5], [ItemIron, 5]], //0 - Anti Bacteria Turret
  [[ItemStone, 5], [ItemIron, 5]], //1 - Anti Player Turret
  [[ItemStone, 30], [ItemIron, 30]], //2 - Mining Base
  [[ItemCopper, 2], [ItemIron, 1]], //3 - Cables
  [[ItemCopper, 5], [ItemIron, 2]], //3 - Solar Panel
  [[ItemCopper, 10], [ItemStone, 30]], //3 - Coal Plant
];

//minimum electricity values to change Cable image
var ElectricCableLvl1 = 5;
var ElectricCableLvl2 = 10;
var ElectricCableLvl3 = 20;
var ElectricCableLvl4 = 50;

//all buildings that can use cables
var allCableBuildings = [0, 1, 2, 3, 4, 5];
var spawnableBuildingIds = [6, 6, 6, 6, 6, 7, 7, 8, 8, 9, 9, 9, 10];

var BuildProjectileTimerMax = 1;
var ProjectileRange = 8;
var BuildingMaxHp = 100;
var NumberOfFlags = 11;//number of different flags in game

var allGameInstances = [];
var MaxNumberOfGameInstances = 6;
var MaxNumberOfPlayersPerGI = 2;
function testGameInstanceExists(index) {
  if (allGameInstances[index] !== undefined) return true;
  return false;
}

//set event handler for new connection
io.sockets.on('connection', newConnection);

function init() {
  //create all game sessions
  for (var i = 0; i < MaxNumberOfGameInstances; i++) {
    allGameInstances[i] = new GameInstance(i);
  }

  console.log('Finished Initializing Server');
}

function newConnection(socket) {
  console.log('New Connection on Socket: ' + socket.id);

  socket.on('newClient', newClient);
  socket.on('updateFromClient', receivedUserUpdate);

  function newClient(data) {
    //register new player
    if (testGameInstanceExists(data.gameInstanceIndex)) {
      var gameInstance = allGameInstances[data.gameInstanceIndex];
      //test if this gameinstance is full
      if (gameInstance.allPlayers.length >= MaxNumberOfPlayersPerGI) {
        socket.emit('joinFail', {reason: 'full GameInstance'});
      }
      else {
        if (gameInstance.getPlayerByIdCode(data.uniqueIdCode) || gameInstance.getPlayerByInteractCode(data.interactCode)) {
          console.log('Client: ' + socket.id + ' Has same ID as existing use IdCode: ' + data.uniqueIdCode + ' InteractCode: ' + data.interactCode);
          socket.emit('joinFail', {reason: 'taken code'});
        }
        else {
          //add player to game
          gameInstance.playerIndex++;
          console.log('Client: ' + socket.id + ' Will be added to the game with IdCode: ' + data.uniqueIdCode + ' InteractCode: ' + data.interactCode);
          gameInstance.addPlayer(new Player(socket, data.name, gameInstance.playerIndex, Math.floor(Math.random() * NumberOfFlags), data.uniqueIdCode, data.interactCode));
          //have a set number of attempts to set a random player starting position
          var startingXarr = [];
          var startingYarr = [];
          var areaFaultsArr = [];
          var indexToBuild = -1;
          for (var i = 0; i < 20; i++) {
            startingXarr[i] = (Math.random() * WldWidth) * TileWidth;
            startingYarr[i] = (Math.random() * WldHeight) * TileHeight;
            areaFaultsArr[i] = 0;
            for (var x = -5; x < 5; x++) {
              for (var y = -5; y < 5; y++) {
                //add fault points for every tile with another user's structure on it
                if (gameInstance.getTileIndexed(x + startingXarr[i], y + startingYarr[i]).buildingOwner == -1) areaFaultsArr[i]++;
              }
            }
            //break loop with location to build if a good spot has been found
            if (areaFaultsArr[i] == 0) {
              indexToBuild = i;
              break;
            }
          }

          //if no perfect places were found look for the best
          if (indexToBuild == -1) {
            indexToBuild = 0;
            for (var i = 1; i < areaFaultsArr.length; i++) {
              if (areaFaultsArr[i] < areaFaultsArr[indexToBuild]) indexToBuild = i;
            }
          }

          // //clear the specified land for the new player
          // var tempTile;
          // for (var x = -5; x < 5; x++) {
          //   for (var y = -5; y < 5; y++) {
          //     //remove infection from all tiles that aren't player owned
          //     tempTile = getTileIndexed(x + startingXarr[indexToBuild], y + startingYarr[indexToBuild]);
          //     if (tempTile.buildingOwner == -1 && tempTile.floorId == 3) {
          //       tempTile.setFloorId(0);
          //       tempTile.infection = 0;
          //     }
          //   }
          // }

          socket.emit('joinSuccess', {startingX: startingXarr[indexToBuild], startingY: startingYarr[indexToBuild]});
        }
      }
    }
  }

  //console.log('receieved message from client: ' + data.message);
  //var retData = {message: 'heya'};
  //socket.emit('updateFromServer', retData);
  //io.sockets.emit('updateFromServer', retData);
  function receivedUserUpdate(data) {
    if (testGameInstanceExists(data.gameInstanceIndex)) {
      gameInstance = allGameInstances[data.gameInstanceIndex];
      //find player
      var playerAccount = gameInstance.getPlayerByIdCode(data.uniqueIdCode);

      //update server side player with client side data
      if (playerAccount) {
        playerAccount.updateFromClient(data.command, data.currentX, data.currentY, data.selectedItem, data.requestPlace, data.requestPlaceX, data.requestPlaceY);
      }

    /*  //return up to date user data
      if (playerAccount) {
        var retData = prepareReturnMessage(retData, playerAccount);
        socket.emit('updateFromServer', retData);
        //console.log('sent message');
      }*/
    }
  }

  //Has a dublicate made for server workings
  /*function getPlayerByIdCode(testCode) {
    for (var i = 0; i < allPlayers.length; i++) {
      if (allPlayers[i].verifyByIdCode(testCode)) {
        return allPlayers[i];
      }
    }
    return false;
  }*/


  /*function mouseMsg(data) {

    //send message back out to all clients
    socket.broadcast.emit('mouse', data);
    //io.sockets.emit('mouse', data);//sends to all clients including the client that sent the message
  }*/
}

class GameInstance {
  constructor(giId) {
    this.gameInstanceId = giId;
    //set a few basic variables that are needed to manage this GameInstance
    this.allPlayers = [];
    this.serverActive = false; //whether the server is active or not
    //setup and start timer to run GameInstance manager
    this.gameInstanceManagerTimer = setInterval(this.gameInstanceUpdate.bind(this), 100);
    console.log('Constructed new GameInstance at index: ' + this.gameInstanceId);
    this.setupNewGame();
  }

  setupNewGame() {
    //make sure game is not running before resetting it
    this.stopGame();
    //set game variables
    this.serverActive = false; //whether the server is active or not
    this.gameTimer;
    this.cableTimer;
    this.updateX = 0;
    this.gameNumberOfCycles = GameMaxNumberOfCycles;//counts down the number of cycles in the game to increase difficulty
    this.allPlayers = [];
    this.playerIndex = 0;
    this.indexToDelete = -1;
    this.cableUpdate_running = false;//make sure cableUpdate thread doesn't run twice at the same time
    this.timedUpdate_running = false;//make sure mainGame thread doesn't run twice at the same time
    this.allTiles = [];
    this.allProjectiles = [];
    this.allCables = [];//special array to process cables faster than other tiles
    this.allCablesRemoveRequests = [];

    this.tileUpdateX = 0;
    this.tileUpdateY = 0;

    //temp variables
    this.tileUpdate = [];
    this.projectileUpdate = [];
    this.runProjRemove = false;

    //make map
    for (var x = 0; x < WldWidth; x++) {
      this.allTiles[x] = [];
      for (var y = 0; y < WldHeight; y++) {
        this.allTiles[x][y] = new Tile(0, x, y);
      }
    }

    for (var x = 0; x < WldWidth; x++) {
      for (var y = 0; y < WldHeight; y++) {
        /*if (x % 10 == 0 || y % 10 == 0) {
          allTiles[x][y].setFloorId(2);
        }
        else if (x > WldWidth - 3 || y > WldHeight - 3) {
          allTiles[x][y].setFloorId(2);
        } else {
          allTiles[x][y].setFloorId(0);
        }*/

        this.allTiles[x][y].setFloorId(0);

        if (Math.random() * 100 < 2) {
          this.allTiles[x][y].setFloorId(3);
        }
        else if (Math.random() * 10 < 2) {
          this.allTiles[x][y].setBuildingId(spawnableBuildingIds[Math.floor(Math.random() * spawnableBuildingIds.length)], -1);
        }
      }
    }

    this.startGame();//start game loops so game can run
    console.log('Started new game in GameInstance: ' + this.gameInstanceId);
  }

  startGame() {
    this.gameTimer = setInterval(this.timedUpdate.bind(this), 100);
    this.cableTimer = setInterval(this.cableUpdate.bind(this), 100);
  }

  stopGame() {
    clearInterval(this.gameTimer);
    clearInterval(this.cableTimer);
  }

  addPlayer(pl) {
    this.allPlayers.push(pl);
    console.log('Added new player to GI: ' + this.gameInstanceId);
  }

  getPlayerByInteractCode(testCode) {
    for (var i = 0; i < this.allPlayers.length; i++) {
      console.log('testCode: ' + testCode + ' Index: ' + i + ' interactCode: ' + this.allPlayers[i].interactCode);
      if (this.allPlayers[i].verifyByInteractCode(testCode)) {
        console.log('found interactionCode match');
        return this.allPlayers[i];
      }
    }
    return false;
  }

  //game instance manager
  gameInstanceUpdate() {
    console.log('GI: ' + this.gameInstanceId);
    console.log(' allPlayer length: ' + this.allPlayers.length);
    if (this.allPlayers === undefined || this.allPlayers.length == 0)  this.serverActive = false;
    else this.serverActive = true;
  }

  //game logic
  testCableBuildings(buildingId) {
    for (var i = 0; i < allCableBuildings.length; i++) {
      if (allCableBuildings[i] == buildingId) return true;
    }
    return false;
  }

  cableUpdate() {
    if (!this.cableUpdate_running && this.serverActive) {
      this.cableUpdate_running = true;
      for (var i = 0; i < this.allCables.length; i++) {
        this.allCables[i].shareElectricity();
      }
      //if cable tiles requested to be removed?
      if (this.allCablesRemoveRequests.length > 0) {
        for (var i = 0; i < this.allCablesRemoveRequests.length; i++) {
          this.removeFromAllCables(this.allCablesRemoveRequests[i]);
        }
        this.allCablesRemoveRequests = [];
      }
      this.cableUpdate_running = false;
    }
  }

  addToAllCables(tile) {
    this.allCables.push(tile);
  }
  removeFromAllCables(tile) {
    for (var i = 0; i < this.allCables.length; i++) {
      if (this.allCables[i].x == tile.x && this.allCables[i].y == tile.y) {
        this.allCables.splice(i, 1);
        //keep searching through array incase there are multiple
      }
    }
  }

  timedUpdate() {
    console.log('server active: ' + this.serverActive);
    if (this.gameNumberOfCycles > 0) this.gameNumberOfCycles -= 0.1;//countdown game timer to progress the game

    if (!this.timedUpdate_running && this.serverActive) {
      console.log('Running game');
      this.timedUpdate_running = true;
      this.tileUpdate = [];
      this.projectileUpdate = [];
      this.runProjRemove = false;
      //console.log('updateX: ' + updateX);
      //update tiles
      /*for (var y = 0; y < WldHeight; y++) {
        //update tile
        allTiles[updateX][y].updateTile();

        //add tile to list of tiles to be sent to clients
        tileUpdate.push(allTiles[updateX][y].createTileToSend());
      }
      if (updateX >= WldWidth - 1) updateX = 0;
      else updateX++;*/

      if (this.allProjectiles.length > 0) {
        //update all projectiles and client data
        for (var i = 0; i < this.allProjectiles.length; i++) {
          this.allProjectiles[i].update(this.tileUpdate);
          if (this.allProjectiles[i].id > -1) {
            this.projectileUpdate.push(this.allProjectiles[i].createProjectileToSend());
          }
          else this.runProjRemove = true;
        }


        if (this.runProjRemove) {
          //will only remove 1 projectile at a time to safe gaurd against errors
          //console.log('try to delete projectile');
          for (var i = 0; i < this.allProjectiles.length; i++) {
            if (this.allProjectiles[i].id == -1) {
              //test to see if the turret that fired it wants to fire another
              var tempTile = getTileIndexed(this.allProjectiles[i].startX, this.allProjectiles[i].startY);
              if (tempTile.buildingId == 0 || tempTile.buildingId == 1 || tempTile.buildingId == 2) {
                tempTile.updateTile();
              }
              //splice projectile out of array
              this.allProjectiles.splice(i, 1);
              //console.log('deleted projectile');
              break;
            }
          }
        }
      }



      //update map
      for (var i = 0; i < TileWidth * 4; i++) {
        if (this.tileUpdateX >= WldWidth - 1) {
          this.tileUpdateX = 0;
          if (this.tileUpdateY >= WldHeight - 1) this.tileUpdateY = 0;
          else this.tileUpdateY++;
        }
        else this.tileUpdateX++;

        //console.log('Updating tile: x' + tileUpdateX + ' y: ' + tileUpdateY);
        this.allTiles[this.tileUpdateX][this.tileUpdateY].updateTile();
        //add tile to list of tiles to be sent to clients
        this.tileUpdate.push(this.allTiles[this.tileUpdateX][this.tileUpdateY].createTileToSend());
      }

      //console.log("allPlayers length: " + allPlayers.length);
      if (this.allPlayers.length > 0) {
        this.indexToDelete = -1;
        //prepare player specific data so message can be sent when next message from client is recieved
        for (var i = 0; i < this.allPlayers.length; i++) {
          this.allPlayers[i].update();
          if (this.allPlayers[i].connectionTimer < 0) this.indexToDelete = i;//see if this player needs to be deleted?
          //if the player requested to place a building?
          if (this.allPlayers[i].requestPlace) {
            this.allPlayers[i].requestPlace = false;
            //tests if the player can afford a building and has one selected?
            if (this.allPlayers[i].canAffordBuilding()) {
              //console.log('Player at x: ' + Math.floor(allPlayers[i].currentX / TileWidth) + ' y: ' + Math.floor(allPlayers[i].currentY / TileHeight) + ' - Try to place at x: ' + allPlayers[i].requestPlaceX + ' y: ' + allPlayers[i].requestPlaceY);
              var tempPlaceTile = this.getTileIndexed(this.allPlayers[i].requestPlaceX, this.allPlayers[i].requestPlaceY);
              //make sure player has permission to break/place building and can afford it
              if ( ((this.allPlayers[i].selectedItem == -1 && (this.allPlayers[i].uniqueIdCode == tempPlaceTile.buildingOwner || tempPlaceTile.buildingOwner == -1)) || (tempPlaceTile.buildingId == -1 && this.allPlayers[i].selectedItem > -1))
                && (tempPlaceTile.canBuildHere() || this.allPlayers[i].selectedItem == -1)) {
                if (this.allPlayers[i].selectedItem == -1) {
                  this.giveResources(this.allPlayers[i], tempPlaceTile.buildingId, 1);//give player some resources that the building had
                  tempPlaceTile.setBuildingId(this.allPlayers[i].selectedItem, -1);//set building Id to nothing
                }
                else {
                  tempPlaceTile.setBuildingId(this.allPlayers[i].selectedItem, this.allPlayers[i].uniqueIdCode);
                  this.allPlayers[i].buyBuilding();
                }
                //console.log('Successfully placed building: ' + getTileIndexed(allPlayers[i].requestPlaceX, allPlayers[i].requestPlaceY).buildingId);
                this.tileUpdate.push(tempPlaceTile.createTileToSend());//add to next update message to update for all clients
              }
            }
          }

          this.allPlayers[i].clientSocket.emit('updateFromServer', this.prepareReturnMessage(this.allPlayers[i], this.tileUpdate, this.projectileUpdate));
        }

        //Delete specified player
        if (this.indexToDelete != -1) {
          this.allPlayers.splice(this.indexToDelete, 1);
          console.log('Deleted player at index: ' + this.indexToDelete);
        }
      }
      timedUpdate_running = false;
    }
  }

  prepareReturnMessage(player, tiles, projectiles) {
    var retData = {
      allPlayers: [],
      tileUpdate: tiles,
      projectileUpdates: projectiles,
      playerData: player.createPlayerToSend()
    };

    for (var i = 0; i < allPlayers.length; i++) {
      retData.allPlayers.push(allPlayers[i].createPlayerToSend());
    }

    /*for (var x = -player.canvasWidth/2; x < player.canvasWidth/2; x++) {
      retData.tiles[x] = [];
      for (var y = -player.canvasHeight/2; y < player.canvasHeight/2; y++) {
        retData.tiles[x][y] = getTileIndexed(player.currentX + (x * TileWidth), player.currentY + (y * TileHeight));
      }
    }*/

    return retData;
  }

  updatePlayer() {

  }

  //tile access without supplying a specific index (wld co-ordinates instead)
  getTile(x, y) {
    x = x / TileWidth;
    y = y / TileHeight;
    return this.getTileIndexed(x, y);
  }

  //tile access functions - for round worlds
  getTileIndexed(x, y) {
    x = x % WldWidth;
    y = y % WldHeight;
    if (x < 0) x = WldWidth + x;
    if (y < 0) y = WldHeight + y;
    x = Math.floor(x);
    y = Math.floor(y);
    return this.allTiles[x][y];
  }

  //get array of all 4 tiles near current location - in co-ordinates
  getNeighbouringTiles(x, y) {
    var ret = [];
    ret[0] = this.getTileIndexed(x + 1, y);
    ret[1] = this.getTileIndexed(x - 1, y);
    ret[2] = this.getTileIndexed(x, y + 1);
    ret[3] = this.getTileIndexed(x, y - 1);

    return ret;
  }

  giveResources(player, buildingId, modifier) {
    switch (buildingId) {
      case 0:// Anti Bacteria Turret
      player.inventory[ItemStone] += Math.floor(((Math.random() * 2) + 3) * modifier);
      player.inventory[ItemIron] += Math.floor(((Math.random() * 3) + 2) * modifier);
      break;

      case 1:// Anti Player Turret
      player.inventory[ItemStone] += Math.floor(((Math.random() * 2) + 3) * modifier);
      player.inventory[ItemIron] += Math.floor(((Math.random() * 3) + 2) * modifier);
      break;

      case 2:// Mining Turret
      player.inventory[ItemCopper] += Math.floor(((Math.random() * 20) + 10) * modifier);
      player.inventory[ItemIron] += Math.floor(((Math.random() * 10) + 20) * modifier);
      break;

      case 3:// Cables
      player.inventory[ItemCopper] += Math.floor(((Math.random() * 2)) * modifier);
      player.inventory[ItemIron] += 1;
      break;

      case 4:// Solar Panels
      player.inventory[ItemCopper] += Math.floor(((Math.random() * 3) + 2) * modifier);
      player.inventory[ItemIron] += 1;
      break;

      case 5:// Coal Plant
      player.inventory[ItemCopper] += Math.floor(((Math.random() * 6) + 4) * modifier);
      player.inventory[ItemStone] += Math.floor(((Math.random() * 10) + 20) * modifier);
      break;

      case 6:// Stone
      player.inventory[ItemStone] += Math.floor(((Math.random() * 20) + 10) * modifier);
      player.inventory[ItemIron] += Math.floor(((Math.random() * 1.5)) * modifier);
      player.inventory[ItemCopper] += Math.floor(((Math.random() * 1.5)) * modifier);
      player.inventory[ItemUranium] += Math.floor(((Math.random() * 1.5)) * modifier);
      player.inventory[ItemCoal] += Math.floor(((Math.random() * 1.5)) * modifier);
      break;

      case 7:// Iron Ore
      player.inventory[ItemStone] += Math.floor(((Math.random() * 5) + 5) * modifier);
      player.inventory[ItemIron] += Math.floor(((Math.random() * 20) + 10) * modifier);
      break;

      case 8:// Copper Ore
      player.inventory[ItemStone] += Math.floor(((Math.random() * 5) + 5) * modifier);
      player.inventory[ItemCopper] += Math.floor(((Math.random() * 20) + 10) * modifier);
      break;

      case 9:// Uranium Ore
      player.inventory[ItemStone] += Math.floor(((Math.random() * 5) + 5) * modifier);
      player.inventory[ItemUranium] += Math.floor(((Math.random() * 20) + 10) * modifier);
      break;

      case 10:// Coal
      player.inventory[ItemStone] += Math.floor(((Math.random() * 5) + 5) * modifier);
      player.inventory[ItemCoal] += Math.floor(((Math.random() * 20) + 10) * modifier);
      break;

      default:
    }
  }

  getPlayerByIdCode(testCode) {
    for (var i = 0; i < this.allPlayers.length; i++) {
      if (this.allPlayers[i].verifyByIdCode(testCode)) {
        return this.allPlayers[i];
      }
    }
    return false;
  }

  createProjectile(projId, tile) {
    var tempTile;
    var foundTarget = false;//for tiles that take priority like bacteria
    var foundLessaTarget = false;//for targets that don't take priority like infection
    var targetX = ProjectileRange;
    var targetY = ProjectileRange;
    //set a random direction for search to go in
    var directionX = 1;
    //if (Math.random() * 100 > 50) directionX = -1;
    var directionY = 1;
    //if (Math.random() * 100 > 50) directionY = -1;
    for (var x = -ProjectileRange * directionX; x < Math.abs(targetX) * directionX; x++) {
      for (var y = -ProjectileRange * directionY; y < Math.abs(targetY) * directionY; y++) {
        if (Math.abs(x) <= Math.abs(targetX) && Math.abs(y) <= Math.abs(targetY)) {
          tempTile = this.getTileIndexed(tile.x + x, tile.y + y);
          //if this tile isn't already targeted?
          if (tempTile.projTargeted <= 0) {
            if (projId == 0) {
              //if the floor is infection
              if (tempTile.floorId == 3) {
                targetX = x;
                targetY = y;
                foundTarget = true;
              }
              //test for infection but only if an important target hasn't been found
              else if (!foundTarget && tempTile.infection > 0) {
                foundLessaTarget = true;
                targetX = x;
                targetY = y;
              }
            }
            else if (projId == 1) {
              //if the building exists and belongs to another player
              if (tempTile.buildingId > -1 && tempTile.buildingOwner != -1 && tempTile.buildingOwner != tile.buildingOwner) {
                targetX = x;
                targetY = y;
                //if this tile is an opposing Anti Player Turret it take priority
                if (tempTile.buildingId == 1) {
                  foundTarget = true;
                }
                //else if an important target hasn't been found choose this one
                else if (!foundTarget) {
                  foundLessaTarget = true;
                }
              }
            }
            else if (projId == 2) {
              //if it is an ore?
              var pl = this.getPlayerByIdCode(tile.buildingOwner);
              if ((tempTile.buildingId == 6 && this.testOreIsRequired(0, pl))
                  || (tempTile.buildingId == 7 && this.testOreIsRequired(1, pl))
                  || (tempTile.buildingId == 8  && this.testOreIsRequired(2, pl))
                  || (tempTile.buildingId == 9 && this.testOreIsRequired(3, pl))
                  || (tempTile.buildingId == 10 && this.testOreIsRequired(4, pl))) {
                targetX = x;
                targetY = y;
                foundTarget = true;
              }
              else if (!foundTarget &&
                  (tempTile.buildingId == 6 && this.testOreCanBeCollected(0, pl)
                  || (tempTile.buildingId == 7 && this.testOreIsRequired(1, pl))
                  || (tempTile.buildingId == 8  && this.testOreIsRequired(2, pl))
                  || (tempTile.buildingId == 9 && this.testOreIsRequired(3, pl))
                  || (tempTile.buildingId == 10 && this.testOreIsRequired(4, pl)))) {
                targetX = x;
                targetY = y;
                foundLessaTarget = true;
              }
            }
          }
        }
      }
    }

    //if a target was found?
    if (foundTarget || foundLessaTarget) {
      this.allProjectiles.push(new Projectile(projId, tile.x, tile.y, tile.x + targetX, tile.y + targetY));
      //Set tile so it can't be targeted again for another 2 rounds of processing
      this.getTileIndexed(tile.x + targetX, tile.y + targetY).projTargeted = 2;
      return true;
    }
    return false;
  }

  testOreIsRequired(invId, player) {
    //should try for 200 of each
    //take ore if player is low on it
    if (player.inventory[invId] < 200) return true;
    /*//only take ore if all inventory slots are at 200
    else {
      for (var i = 0; i < player.inventory.length; i++) {
        if (player.inventory[i] < 200) return false;
      }
    }*/
    return true;
  }

  testOreCanBeCollected(invId, player) {
    //take the random ore if inv is not at max
    if (player.inventory[invId] < 500) return true;
    return false;
  }
}

class Player {
  constructor(socket, name, id, flagId, uniqueIdCode, interactCode) {
    this.name = name;
    this.id = id;
    this.flagId = flagId;//flagId;
    this.uniqueIdCode = uniqueIdCode;//so the server can recognise an existing client
    this.interactCode = interactCode;//so clients can interact with each other
    this.clientSocket = socket;
    this.connectionTimer = 1000;
    this.currentCommand = -1;
    this.selectedItem = -1;
    this.requestPlace = false;
    this.requestPlaceX = 0;
    this.requestPlaceY = 0;
    this.currentX = 0;//not tile co-ordinate specific
    this.currentY = 0;
    this.inventory = [
      255,
      255,
      255,
      0,
      255,
    ];
    this.receievedClientMessage = true;
    this.canvasWidth = 900;
    this.canvasHeight = 700;

    console.log('Created a player with ID:' + id);
  }

  verifyByIdCode(code) {
    if (this.uniqueIdCode == code) {
      return true;
    }
    return false;
  }

  verifyByInteractCode(code) {
    if (this.interactCode == code) {
      return true;
    }
    return false;
  }

  update() {
    if (this.receievedClientMessage) {
      this.receievedClientMessage = false;
      this.connectionTimer = 1000;
    }
    else {
      this.connectionTimer--;
    }
  }

  canAffordBuilding() {
    if (this.selectedItem <= -2) return false;//if nothing is selected
    if (this.selectedItem == -1) return true;
    for (var i = 0; i < allRecipes[this.selectedItem].length; i++) {
      //test if each part of recipe can be afforded
      //if (this user's inventory item (specified by recipe) is less numerous than the recipe requires?)
      if (this.inventory[allRecipes[this.selectedItem][i][0]] < allRecipes[this.selectedItem][i][1]) {
        return false;
      }
    }
    return true;
  }

  buyBuilding() {
    for (var i = 0; i < allRecipes[this.selectedItem].length; i++) {
      //take each recipe value from inventory
      this.inventory[allRecipes[this.selectedItem][i][0]] -= allRecipes[this.selectedItem][i][1];
    }
  }

  updateFromClient(command, x, y, selectedItem, requestPlace, rpX, rpY) {
    this.receievedClientMessage = true;
    this.currentCommand = command;
    this.currentX = x;
    this.currentY = y;
    this.selectedItem = selectedItem;
    if (requestPlace) {
      this.requestPlace = true;
      this.requestPlaceX = rpX;
      this.requestPlaceY = rpY;
    }
  }

  createPlayerToSend() {
    return {
      name: this.name,
      interactCode: this.interactCode,
      flagId: this.flagId,
      inventory: this.inventory,
    };
  }
}

class Projectile {
  constructor(id, startX, startY, targetX, targetY) {
    this.id = id;
    this.x = startX;
    this.y = startY;
    //set with tile indexes
    this.targetX = targetX;
    this.targetY = targetY;
    this.startX = startX;
    this.startY = startY;
    this.speed = 0.1;
  }

  update(tileUpdate) {
    //if target has been reached
    if (this.x > this.targetX - 0.5 && this.x < this.targetX + 0.5
    && this.y > this.targetY - 0.5 && this.y < this.targetY + 0.5) {
      var tempSetId = -1;//to set this projectile's id after it's been processed at its destination
      switch (this.id) {
        case 0:// Anti Bacteria
        getTileIndexed(this.targetX, this.targetY).cureBacteria();
        //add tile to list of tiles to be updated on clients
        tileUpdate.push(getTileIndexed(this.targetX, this.targetY).createTileToSend());
        break;

        case 1:// Anti Player
        getTileIndexed(this.targetX, this.targetY).takeDamage(40);
        //add tile to list of tiles to be updated on clients
        tileUpdate.push(getTileIndexed(this.targetX, this.targetY).createTileToSend());
        break;

        case 2:// Mining
        var tempTile = getTileIndexed(this.targetX, this.targetY);
        if (tempTile.buildingId == 6 || tempTile.buildingId == 7
            || tempTile.buildingId == 8 || tempTile.buildingId == 9
            || tempTile.buildingId == 10) {
          switch (tempTile.buildingId) {
            case 6://Stone
            //set projectile to return to base with its collected Stone
            tempSetId = 3;
            this.targetX = this.startX;
            this.targetY = this.startY;
            break;

            case 7://Iron Ore
            //set projectile to return to base with its collected Iron Ore
            tempSetId = 4;
            this.targetX = this.startX;
            this.targetY = this.startY;
            break;

            case 8://Copper Ore
            //set projectile to return to base with its collected Copper Ore
            tempSetId = 5;
            this.targetX = this.startX;
            this.targetY = this.startY;
            break;

            case 9://Uranium Ore
            //set projectile to return to base with its collected Uranium Ore
            tempSetId = 6;
            this.targetX = this.startX;
            this.targetY = this.startY;
            break;

            case 10://Coal Ore
            //set projectile to return to base with its collected Coal Ore
            tempSetId = 7;
            this.targetX = this.startX;
            this.targetY = this.startY;
            break;

            default:
          }

          tempTile.takeDamage(10);
          //add tile to list of tiles to be updated on clients
          tileUpdate.push(getTileIndexed(this.targetX, this.targetY).createTileToSend());
        }
        break;

        case 3://Mining Proj returning with Stone
        this.addToPlayerInv(6);
        break;

        case 4://Mining Proj returning with Iron Ore
        this.addToPlayerInv(7);
        break;

        case 5://Mining Proj returning with Copper Ore
        this.addToPlayerInv(8);
        break;

        case 6://Mining Proj returning with Uranium Ore
        this.addToPlayerInv(9);
        break;

        case 7://Mining Proj returning with Coal Ore
        this.addToPlayerInv(10);
        break;

        default:
      }
      this.id = tempSetId;
    }
    else {
      if (this.targetX > this.x) this.x += this.speed;
      else if (this.targetX < this.x) this.x -= this.speed;

      if (this.targetY > this.y) this.y += this.speed;
      else if (this.targetY < this.y) this.y -= this.speed;
    }
  }

  addToPlayerInv(buildingIdBasedOnOre) {
    var tempPlayer = getPlayerByIdCode(getTileIndexed(this.targetX, this.targetY).buildingOwner);
    if (tempPlayer) {
      giveResources(tempPlayer, buildingIdBasedOnOre, 0.2);
    }
  }

  createProjectileToSend() {
    return {
      id: this.id,
      x: Math.floor(this.x * TileWidth),
      y: Math.floor(this.y * TileHeight)
    };
  }
}

class Tile {
  constructor(floorId, x, y) {
    this.floorId = floorId;
    this.floodAnimation = 0;
    this.buildingId = -1;
    this.buildingAnimation = 0;
    this.buildingOwner = 0;
    this.buildingMakeProjectileTimer = 100;
    this.buildingHp = 0;
    this.infection = 0;
    this.x = x;
    this.y = y;
    this.buildingFlagId = -1;
    this.infection = 0;
    this.infectionMax = infectLv1;//number infection must reach before tile can be changed
    this.justCured = false;
    this.projTargeted = 0;//if 0 it isn't targeted by any projectiles
    this.electricity = 0;
    this.canShareElectricity = false;

    //temp variables
    this.tempNeighbourTiles;
  }

  updateTile() {
    this.justCured = false;
    if (this.projTargeted > 0) this.projTargeted--;
    if (this.buildingHp <= 0) {
      this.setBuildingId(-1, -1);
    }
    else if (this.buildingOwner > -1 && this.buildingHp < BuildingMaxHp) {
      this.buildingHp += 10;
    }
    if (this.infection > this.infectionMax) {
      //if tiles isn't infected
      if (this.floorId != 3) {
        this.setFloorId(3);
        this.setBuildingId(-1, -1);
      }
      else {
        //evolve if infection is high enough
        if (this.floorAnimation < 3) {
          this.floorAnimation++;
          this.infection = 0;
          this.infectionMax = infectionMaxArr[this.floorAnimation];
        }
      }
    }

    switch (this.floorId) {
      case 0://dirt
      break;

      case 1://seeds
      break;

      case 2://stone
      break;

      case 3: //infection
      this.tempNeighbourTiles = this.getNeighbouringTiles(this.x, this.y);
      //var surroundingInfection = true;
      //infect nearby tiles
      for (var i = 0; i < this.tempNeighbourTiles.length; i++) {
        //infect faster when infection is more evolved
        this.tempNeighbourTiles[i].infection += this.floorAnimation + 2;
        //if (this.tempNeighbourTiles[i].floorId != 3) {
        //  surroundingInfection = false;
        //}
      }

      //if (surroundingInfection) {
      //  this.infection++;
      //}
      break;

      default:
    }

    switch (this.buildingId) {
      case -1: //nothing
      break;

      case 0: //Anti Bacteria Turret
      this.shareElectricity();
      this.electricityToProjectiles(5);
      this.updateProjectileCreationState(0);
      this.infection--;//de-infect self over time
      break;

      case 1: //Anti Player Turret
      this.shareElectricity();
      this.electricityToProjectiles(5);
      this.updateProjectileCreationState(1);
      break;

      case 2: //Mining Turret
      this.shareElectricity();
      this.electricityToProjectiles(5);
      this.updateProjectileCreationState(2);
      break;

      case 3: //Cables
      this.shareElectricity();
      if (this.electricity >= ElectricCableLvl4) {
        this.buildingAnimation = 4;
      }
      else if (this.electricity >= ElectricCableLvl3) {
        this.buildingAnimation = 3;
      }
      else if (this.electricity >= ElectricCableLvl2) {
        this.buildingAnimation = 2;
      }
      else if (this.electricity >= ElectricCableLvl1) {
        this.buildingAnimation = 1;
      }
      else {
        this.buildingAnimation = 0;
      }
      break;

      case 4: //Solar panel
      this.electricity += 10;
      this.testElectricityMax(1000);
      this.shareElectricity();
      //console.log('Solar panel power: ' + this.electricity);
      break;

      case 5: //Coal Plant
      break;

      default:
    }
  }

  takeDamage(damage) {
    this.projTargeted = 0;
    this.buildingHp -= damage;
    if (this.buildingHp <= 0) {
      this.setBuildingId(-1, -1);
    }
  }

  testElectricityMax(max) {
    if (this.electricity > max) {
      this.electricity = max;
    }
  }

  electricityToProjectiles(requiredElectricity) {
    if (this.electricity > requiredElectricity) {
      if (this.buildingMakeProjectileTimer < BuildProjectileTimerMax) {
        this.electricity -= requiredElectricity;
        this.buildingMakeProjectileTimer++;
      }
    }
  }

  updateProjectileCreationState(projId) {
    if (this.buildingMakeProjectileTimer >= BuildProjectileTimerMax) {
      if (createProjectile(projId, this))//if a projectile was created?
        this.buildingMakeProjectileTimer = 0;//reset timer
    }
  }

  shareElectricity() {
    this.tempNeighbourTiles = getNeighbouringTiles(this.x, this.y);
    for (var i = 0; i < this.tempNeighbourTiles.length; i++) {
      if (this.tempNeighbourTiles[i].canShareElectricity) {
        this.electricity = (this.electricity / 2) + (this.tempNeighbourTiles[i].electricity / 2);
        this.tempNeighbourTiles[i].electricity = this.electricity;
      }
    }
  }

  setFloorId(id) {
    this.floorId = id;
    this.floorAnimation = 0;
    this.infection = 0;
    //if this is an infected tile
    if (this.floorId == 3) {
      this.infectionMax = infectionMaxArr[this.floorAnimation];
    }
    else {
      this.infectionMax = infectLv1;
    }

  }

  setBuildingId(id, owner) {
    //add to allCables if it is a cable
    if (id == 3) {
      addToAllCables(this);
    }
    //if the buildingId about to be overwritten is cables?
    else if (this.buildingId == 3) {
      allCablesRemoveRequests.push(this);
    }
    this.buildingId = id;
    this.buildingAnimation = 0;
    this.buildingOwner = owner;
    this.buildingMakeProjectileTimer = 0;
    this.electricity = 0;
    if (this.buildingId > -1) this.buildingHp = BuildingMaxHp;
    else this.buildingHp = 0;

    if (id == 0 || id == 1 || id == 2 || id == 3 || id == 4 || id == 5) {
      this.canShareElectricity = true;
    }
    else this.canShareElectricity = false;

    //if this is an important building set its buildingAnimation to show the owner's flag
    if (this.buildingId == 0 || this.buildingId == 1 || this.buildingId == 2) {
      this.buildingFlagId = getPlayerByIdCode(this.buildingOwner).flagId;
    }
    else {
      this.buildingFlagId = -1;//set no building flag
    }
  }

  cureBacteria() {
    this.infection = 0;//cure infection
    //if is bacteria?
    if (this.floorId == 3) {
      this.setFloorId(0);
      this.infection = 0;
      //random chance of spawning ore
      if (Math.random() * 10 > 4)
        this.setBuildingId(spawnableBuildingIds[Math.floor(Math.random() * spawnableBuildingIds.length)], -1);
      this.justCured = true;
    }
  }

  canBuildHere() {
    if (this.buildingId == -1 && this.floorId != 3) {
      return true;
    }
    return false;
  }

  getInfectionPercent() {
    //send a number between 0 and 1 for infection, so it can be multiplied by animation length by client
    return this.infection / this.infectionMax;
  }

  createTileToSend() {
    return {
      gridX: this.x,
      gridY: this.y,
      floorId: this.floorId,
      floorAnimation: this.floorAnimation,
      buildingId: this.buildingId,
      buildingAnimation: this.buildingAnimation,
      infectionPercent: this.getInfectionPercent(),
      justCured: this.justCured,
      buildingFlagId: this.buildingFlagId
      //electricity: this.electricity
    };
  }
}



console.log('Finished Basic Setup');

init();
