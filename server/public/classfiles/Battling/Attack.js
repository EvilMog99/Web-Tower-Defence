class Attack {
  //power is usually up to 100
  constructor(id, typeId, power, timeToWarmUp, timeToUse, timeToRecharge, name) {
    this.id = id;
    this.typeId = typeId;
    this.power = power;
    this.timeToWarmUp = timeToWarmUp;
    this.timeToUse = timeToUse;
    this.timeToRecharge = timeToRecharge;
    this.name = name;
  }
}
