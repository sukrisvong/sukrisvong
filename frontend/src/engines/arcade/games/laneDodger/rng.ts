import { LCG_A, LCG_C, LCG_M } from "./constants"

export class Rng {
  private x: number

  constructor(seed: number) {
    this.x = seed >>> 0
  }

  nextInt(max: number): number {
    this.x = ((LCG_A * this.x + LCG_C) % LCG_M) >>> 0
    return this.x % max
  }
}
