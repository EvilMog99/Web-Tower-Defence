class GameData {
  //this.IMG_PLACEHOLDER     = 0;
}

var IMG_PLACEHOLDER     = 0;

function getTexture(entityIndex, animationIndex, frameIndex, allAnimations) {
  //if (index <= allTextures.size)
  //console.log('entityIndex: ' + entityIndex + ' animIndex: ' + animationIndex + ' frameIndex:' + frameIndex);
  //if () {}
  return allAnimations[entityIndex][animationIndex][frameIndex];
}



function loadAnimation(name, id, animationsData)//animationsData is an array of numbers specifying how many frames are in each animation to be loaded
{
  var arr = [];
  var tempA;
  id = formatNumber(id, 3);
  for (var a = 0; a < animationsData.length; a++) {
    arr[a] = [];
    tempA = formatNumber(a, 2);
    for (var f = 0; f < animationsData[a]; f++) {
      arr[a].push(loadImage('textures/' + name + id + '/' + 'A' + tempA + '/' + 'F' + formatNumber(f, 2) + '.png'));
    }
  }

  return arr;
}

function formatNumber(n, digits) {
  var ret = '';
  for (var i = digits - 1; i > -1; i--) {
    if (n < Math.pow(10, i))
      ret += '0';
    else {
      ret += n;
      break;
    }
  }
  return ret;
}
