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
var gameTimer;
var cableTimer;
var retData;
var updateX = 0;

//setup socket
var socket = require('socket.io');//import socket
var io = socket(server);//set io with the server (and its socket data)

//set game variables
var allPlayers = [];
var playerIndex = 0;

var wldWidth = 255;
var wldHeight = 255;
var tileWidth = 100;
var tileHeight = 100;
var allTiles = [];
var allProjectiles = [];
var allCables = [];//special array to process cables faster than other tiles
var allCablesRemoveRequests = [];
function addToAllCables(tile) {
  allCables.push(tile);
}
function removeFromAllCables(tile) {
  for (var i = 0; i < allCables.length; i++) {
    if (allCables[i].x == tile.x && allCables[i].y == tile.y) {
      allCables.splice(i, 1);
      //keep searching through array incase there are multiple
    }
  }
}

var tileUpdateX = 0;
var tileUpdateY = 0;

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

var spawnableBuildingIds = [6, 6, 6, 6, 6, 7, 7, 8, 8, 9, 9, 9, 10];

var BuildProjectileTimerMax = 1;
var ProjectileRange = 8;
var BuildingMaxHp = 100;

//set event handler for new connection
io.sockets.on('connection', newConnection);

function init() {
  //make map
  for (var x = 0; x < wldWidth; x++) {
    allTiles[x] = [];
    for (var y = 0; y < wldHeight; y++) {
      allTiles[x][y] = new Tile(0, x, y);
    }
  }

  for (var x = 0; x < wldWidth; x++) {
    for (var y = 0; y < wldHeight; y++) {
      if (x % 10 == 0 || y % 10 == 0) {
        allTiles[x][y].setFloorId(2);
      }
      else if (x > wldWidth - 3 || y > wldHeight - 3) {
        allTiles[x][y].setFloorId(2);
      } else {
        allTiles[x][y].setFloorId(0);
      }

      if (Math.random() * 100 < 2) {
        allTiles[x][y].setFloorId(3);
      }
      else if (Math.random() * 10 < 2) {
        allTiles[x][y].setBuildingId(spawnableBuildingIds[Math.floor(Math.random() * spawnableBuildingIds.length)], -1);
      }
    }
  }

  console.log('Finished Initializing Server');
}

function newConnection(socket) {
  console.log('New Connection on Socket: ' + socket.id);

  socket.on('newClient', newClient);
  socket.on('updateFromClient', receivedUserUpdate);

  function newClient(data) {
    //register new player

    if (getPlayerByIdCode(data.uniqueIdCode) || getPlayerByInteractCode(data.interactCode)) {
      console.log('Client: ' + socket.id + ' Has same ID as existing use IdCode: ' + data.uniqueIdCode + ' InteractCode: ' + data.interactCode);
      socket.emit('joinFail', {reason: 'taken code'});
    }
    else {
      //add player to game
      console.log('Client: ' + socket.id + ' Will be added to the game with IdCode: ' + data.uniqueIdCode + ' InteractCode: ' + data.interactCode);
      allPlayers.push(new Player(socket, data.name, data.flagId, data.uniqueIdCode, data.interactCode));
      socket.emit('joinSuccess', {});
    }
  }

  //console.log('receieved message from client: ' + data.message);
  //var retData = {message: 'heya'};
  //socket.emit('updateFromServer', retData);
  //io.sockets.emit('updateFromServer', retData);
  function receivedUserUpdate(data) {
    //find player
    var playerAccount = getPlayerByIdCode(data.uniqueIdCode);

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

  function getPlayerByIdCode(testCode) {
    for (var i = 0; i < allPlayers.length; i++) {
      if (allPlayers[i].verifyByIdCode(testCode)) {
        return allPlayers[i];
      }
    }
    return false;
  }

  function getPlayerByInteractCode(testCode) {
    for (var i = 0; i < allPlayers.length; i++) {
      console.log('testCode: ' + testCode + ' Index: ' + i + ' interactCode: ' + allPlayers[i].interactCode);
      if (allPlayers[i].verifyByInteractCode(testCode)) {
        console.log('found interactionCode match');
        return allPlayers[i];
      }
    }
    return false;
  }

  /*function mouseMsg(data) {

    //send message back out to all clients
    socket.broadcast.emit('mouse', data);
    //io.sockets.emit('mouse', data);//sends to all clients including the client that sent the message
  }*/
}

function cableUpdate() {
  for (var i = 0; i < allCables.length; i++) {
    allCables[i].shareElectricity();
  }
  //if cable tiles requested to be removed?
  if (allCablesRemoveRequests.length > 0) {
    for (var i = 0; i < allCablesRemoveRequests.length; i++) {
      removeFromAllCables(allCablesRemoveRequests[i]);
    }
    allCablesRemoveRequests = [];
  }
}

function timedUpdate() {
  var tileUpdate = [];
  var projectileUpdate = [];
  var runProjRemove = false;

  //console.log('updateX: ' + updateX);
  //update tiles
  /*for (var y = 0; y < wldHeight; y++) {
    //update tile
    allTiles[updateX][y].updateTile();

    //add tile to list of tiles to be sent to clients
    tileUpdate.push(allTiles[updateX][y].createTileToSend());
  }
  if (updateX >= wldWidth - 1) updateX = 0;
  else updateX++;*/

  if (allProjectiles.length > 0) {
    //update all projectiles and client data
    for (var i = 0; i < allProjectiles.length; i++) {
      allProjectiles[i].update(tileUpdate);
      if (allProjectiles[i].id > -1) {
        projectileUpdate.push(allProjectiles[i].createProjectileToSend());
      }
      else runProjRemove = true;
    }

    if (runProjRemove) {
      //will only remove 1 projectile at a time to safe gaurd against errors
      //console.log('try to delete projectile');
      for (var i = 0; i < allProjectiles.length; i++) {
        if (allProjectiles[i].id == -1) {
          //test to see if the turret that fired it wants to fire another
          var tempTile = getTileIndexed(allProjectiles[i].startX, allProjectiles[i].startY);
          if (tempTile.buildingId == 0 || tempTile.buildingId == 1 || tempTile.buildingId == 2) {
            tempTile.updateTile();
          }
          //splice projectile out of array
          allProjectiles.splice(i, 1);
          //console.log('deleted projectile');
          break;
        }
      }
    }
  }



  //update map
  for (var i = 0; i < tileWidth * 4; i++) {
    if (tileUpdateX >= wldWidth - 1) {
      tileUpdateX = 0;
      if (tileUpdateY >= wldHeight - 1) tileUpdateY = 0;
      else tileUpdateY++;
    }
    else tileUpdateX++;

    //console.log('Updating tile: x' + tileUpdateX + ' y: ' + tileUpdateY);
    allTiles[tileUpdateX][tileUpdateY].updateTile();
    //add tile to list of tiles to be sent to clients
    tileUpdate.push(allTiles[tileUpdateX][tileUpdateY].createTileToSend());
  }

  //console.log("allPlayers length: " + allPlayers.length);
  if (allPlayers.length > 0) {
    //prepare player specific data so message can be sent when next message from client is recieved
    for (var i = 0; i < allPlayers.length; i++) {
      allPlayers[i].update();
      //if the player requested to place a building?
      if (allPlayers[i].requestPlace) {
        allPlayers[i].requestPlace = false;
        //tests if the player can afford a building and has one selected?
        if (allPlayers[i].canAffordBuilding()) {
          //console.log('Player at x: ' + Math.floor(allPlayers[i].currentX / tileWidth) + ' y: ' + Math.floor(allPlayers[i].currentY / tileHeight) + ' - Try to place at x: ' + allPlayers[i].requestPlaceX + ' y: ' + allPlayers[i].requestPlaceY);
          var tempPlaceTile = getTileIndexed(allPlayers[i].requestPlaceX, allPlayers[i].requestPlaceY);
          //make sure player has permission to break/place building and can afford it
          if ( ((allPlayers[i].selectedItem == -1 && (allPlayers[i].uniqueIdCode == tempPlaceTile.buildingOwner || tempPlaceTile.buildingOwner == -1)) || (tempPlaceTile.buildingId == -1 && allPlayers[i].selectedItem > -1))
            && (tempPlaceTile.canBuildHere() || allPlayers[i].selectedItem == -1)) {
            if (allPlayers[i].selectedItem == -1) {
              giveResources(allPlayers[i], tempPlaceTile.buildingId);//give player some resources that the building had
              tempPlaceTile.setBuildingId(allPlayers[i].selectedItem, -1);//set building Id to nothing
            }
            else {
              tempPlaceTile.setBuildingId(allPlayers[i].selectedItem, allPlayers[i].uniqueIdCode);
              allPlayers[i].buyBuilding();
            }
            //console.log('Successfully placed building: ' + getTileIndexed(allPlayers[i].requestPlaceX, allPlayers[i].requestPlaceY).buildingId);
            tileUpdate.push(tempPlaceTile.createTileToSend());//add to next update message to update for all clients
          }
        }
      }

      allPlayers[i].clientSocket.emit('updateFromServer', prepareReturnMessage(allPlayers[i], tileUpdate, projectileUpdate));
    }
  }
}

function prepareReturnMessage(player, tiles, projectiles) {
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
      retData.tiles[x][y] = getTileIndexed(player.currentX + (x * tileWidth), player.currentY + (y * tileHeight));
    }
  }*/

  return retData;
}

function updatePlayer() {

}

//tile access without supplying a specific index (wld co-ordinates instead)
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

//get array of all 4 tiles near current location - in co-ordinates
function getNeighbouringTiles(x, y) {
  var ret = [];
  ret[0] = getTileIndexed(x + 1, y);
  ret[1] = getTileIndexed(x - 1, y);
  ret[2] = getTileIndexed(x, y + 1);
  ret[3] = getTileIndexed(x, y - 1);

  return ret;
}

function giveResources(player, buildingId) {
  switch (buildingId) {
    case 0:// Anti Bacteria Turret
    player.inventory[ItemStone] += Math.floor((Math.random() * 2) + 3);
    player.inventory[ItemIron] += Math.floor((Math.random() * 3) + 2);
    break;

    case 1:// Anti Player Turret
    player.inventory[ItemStone] += Math.floor((Math.random() * 2) + 3);
    player.inventory[ItemIron] += Math.floor((Math.random() * 3) + 2);
    break;

    case 2:// Mining Turret
    player.inventory[ItemCopper] += Math.floor((Math.random() * 20) + 10);
    player.inventory[ItemIron] += Math.floor((Math.random() * 10) + 20);
    break;

    case 3:// Cables
    player.inventory[ItemCopper] += Math.floor((Math.random() * 2));
    player.inventory[ItemIron] += 1;
    break;

    case 4:// Solar Panels
    player.inventory[ItemCopper] += Math.floor((Math.random() * 3) + 2);
    player.inventory[ItemIron] += 1;
    break;

    case 5:// Coal Plant
    player.inventory[ItemCopper] += Math.floor((Math.random() * 6) + 4);
    player.inventory[ItemStone] += Math.floor((Math.random() * 10) + 20);
    break;

    case 6:// Stone
    player.inventory[ItemStone] += Math.floor((Math.random() * 20) + 10);
    player.inventory[ItemIron] += Math.floor((Math.random() * 1.5));
    player.inventory[ItemCopper] += Math.floor((Math.random() * 1.5));
    player.inventory[ItemUranium] += Math.floor((Math.random() * 1.5));
    player.inventory[ItemCoal] += Math.floor((Math.random() * 1.5));
    break;

    case 7:// Iron Ore
    player.inventory[ItemStone] += Math.floor((Math.random() * 5) + 5);
    player.inventory[ItemIron] += Math.floor((Math.random() * 20) + 10);
    break;

    case 8:// Copper Ore
    player.inventory[ItemStone] += Math.floor((Math.random() * 5) + 5);
    player.inventory[ItemCopper] += Math.floor((Math.random() * 20) + 10);
    break;

    case 9:// Uranium Ore
    player.inventory[ItemStone] += Math.floor((Math.random() * 5) + 5);
    player.inventory[ItemUranium] += Math.floor((Math.random() * 20) + 10);
    break;

    case 10:// Coal
    player.inventory[ItemStone] += Math.floor((Math.random() * 5) + 5);
    player.inventory[ItemCoal] += Math.floor((Math.random() * 20) + 10);
    break;

    default:
  }
}

class Player {
  constructor(socket, name, flagId, uniqueIdCode, interactCode) {
    this.name = name;
    this.id = playerIndex++;
    this.flagId = playerIndex;//flagId;
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

    console.log('Created a player with index:' + playerIndex);
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

function createProjectile(projId, tile) {
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
        tempTile = getTileIndexed(tile.x + x, tile.y + y);
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
            if ((tempTile.buildingId == 6 && testOreIsRequired(0, tile.owner))
                || (tempTile.buildingId == 7 && testOreIsRequired(1, tile.owner))
                || (tempTile.buildingId == 8  && testOreIsRequired(2, tile.owner))
                || (tempTile.buildingId == 9 && testOreIsRequired(3, tile.owner))
                || (tempTile.buildingId == 10 && testOreIsRequired(4, tile.owner))) {
              targetX = x;
              targetY = y;
              foundTarget = true;
            }
          }
        }
      }
    }
  }

  //if a target was found?
  if (foundTarget || foundLessaTarget) {
    allProjectiles.push(new Projectile(projId, tile.x, tile.y, tile.x + targetX, tile.y + targetY));
    //Set tile so it can't be targeted again for another 2 rounds of processing
    getTileIndexed(tile.x + targetX, tile.y + targetY).projTargeted = 2;
    return true;
  }
  return false;
}

function testOreIsRequired(invId, ownerId) {
  //should try for 200 of each then go random to a max of 500
  var player = getPlayerByIdCode(ownerId);
  //take ore if player is low on it
  if (player.inventory[invId] < 200) return true;
  //sometimes it will just take the random ore if inv is not at max
  else if (player.inventory[invId] < 500 && Math.random() * 100 > 80) return true;
  //only take ore if all inventory slots are at 200
  else {
    for (var i = 0; i < player.inventory.length; i++) {
      if (player.inventory[i] < 200) return false;
    }
  }
  return true;
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

        break;

        default:
      }
      this.id = -1;
    }
    else {
      if (this.targetX > this.x) this.x += this.speed;
      else if (this.targetX < this.x) this.x -= this.speed;

      if (this.targetY > this.y) this.y += this.speed;
      else if (this.targetY < this.y) this.y -= this.speed;
    }
  }

  createProjectileToSend() {
    return {
      id: this.id,
      x: this.x * tileWidth,
      y: this.y * tileHeight
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
    else if (this.buildingHp < BuildingMaxHp) {
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
      this.tempNeighbourTiles = getNeighbouringTiles(this.x, this.y);
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
      break;

      case 4: //Solar panel
      this.electricity += 40;
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
  }

  cureBacteria() {
    this.infection = 0;//cure infection
    //if is bacteria?
    if (this.floorId == 3) {
      this.setFloorId(0);
      this.infection = 0;
      //random chance of spawning ore
      if (Math.random * 10 > 4)
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
      buildingAniamtion: this.buildingAniamtion,
      infectionPercent: this.getInfectionPercent(),
      justCured: this.justCured,
      electricity: this.electricity
    };
  }
}



console.log('Finished Basic Setup');

init();
gameTimer = setInterval(timedUpdate, 100);
cableTimer = setInterval(cableUpdate, 100);
