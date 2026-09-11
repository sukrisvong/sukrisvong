import { Rng } from "../rng"

describe("Rng", () => {
  it("produces deterministic output for a given seed", () => {
    const rng = new Rng(12345)
    expect(rng.nextInt(3)).toBe(87628868 % 3)
  })

  it("produces the same sequence for the same seed", () => {
    const seq1 = Array.from({ length: 10 }, () => new Rng(99).nextInt(3))
    const seq2 = Array.from({ length: 10 }, () => new Rng(99).nextInt(3))
    expect(seq1).toEqual(seq2)
  })

  it("advances state correctly across multiple calls", () => {
    const rng = new Rng(1)
    const a = rng.nextInt(100)
    const b = rng.nextInt(100)
    expect(a).not.toBe(b)
  })

  it("always returns values in [0, max)", () => {
    const rng = new Rng(42)
    for (let i = 0; i < 100; i++) {
      const v = rng.nextInt(3)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(3)
    }
  })

  it("produces different sequences for different seeds", () => {
    const rng1 = new Rng(1)
    const rng2 = new Rng(2)
    const a = rng1.nextInt(1000)
    const b = rng2.nextInt(1000)
    expect(a).not.toBe(b)
  })
})
