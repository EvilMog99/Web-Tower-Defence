class BattleLogic {
  constructor() {
    this.setUpTypes();
    this.allAttacks = [];
    this.setUpAttacks();
    this.tempUnit = null;
    var playerTeam = new Team();
    this.addUnitToTeam(playerTeam, new Unit(0, 0, 1, 2, 3, 4));


    var enemyTeam = new Team();

  }

  addUnitToTeam(team, unit) {
    team.allUnits.push(unit);
    for (var i = 0; i < team.teamLength; i++) {
      if (team.team[i] == 0) {
        //add unit to active team
        team.team[i] = unit;
        break;
      }
    }
  }


  //create all attacks in id order
  setUpAttacks() {
    this.allAttacks[0] = new Attack(0, 0, 10, 2, 3, 1, 'Shot');
    this.allAttacks[1] = new Attack(1, 0, 20, 4, 2, 1, 'Blast');
    this.allAttacks[2] = new Attack();
    this.allAttacks[3] = new Attack();
    this.allAttacks[4] = new Attack();
    this.allAttacks[5] = new Attack();

    //this.allAttacks[id] = new Attack(id, type id, 0-100, warm up, use, recharge, 'name');
  }

  //create all types and mathcups
  setUpTypes() {

  }
}
