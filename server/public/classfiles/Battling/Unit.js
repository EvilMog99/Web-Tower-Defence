class Unit {
  constructor(id, a1, a2, a3, a4, a5) {
    this.id = id;
    this.hp = 100;
    this.maxHp = 100;
    this.attack1 = a1;
    this.attack2 = a2;
    this.attack3 = a3;
    this.attack4 = a4;
    this.attack5 = a5;

    this.attackWarmUp;//counts down to 0
    this.attackUse;//counts down to 0
    this.attackRecharge;//counts down to 0
  }
}
