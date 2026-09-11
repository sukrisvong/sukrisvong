import { themeFor, ALL_THEME_IDS } from "../themes/index"
import { cyberpunk } from "../themes/cyberpunk"
import { medieval } from "../themes/medieval"

describe("themes", () => {
  it("ALL_THEME_IDS contains cyberpunk and medieval", () => {
    expect(ALL_THEME_IDS).toContain("cyberpunk")
    expect(ALL_THEME_IDS).toContain("medieval")
  })

  it("themeFor returns cyberpunk", () => {
    expect(themeFor("cyberpunk")).toBe(cyberpunk)
  })

  it("themeFor returns medieval", () => {
    expect(themeFor("medieval")).toBe(medieval)
  })

  it("cyberpunk has required fields", () => {
    expect(cyberpunk.id).toBe("cyberpunk")
    expect(cyberpunk.label).toBeTruthy()
    expect(cyberpunk.playerEmoji).toBeTruthy()
    expect(cyberpunk.obstacleEmoji).toBeTruthy()
    expect(cyberpunk.colors.background).toBeTruthy()
  })

  it("medieval has required fields", () => {
    expect(medieval.id).toBe("medieval")
    expect(medieval.label).toBeTruthy()
    expect(medieval.playerEmoji).toBeTruthy()
    expect(medieval.obstacleEmoji).toBeTruthy()
    expect(medieval.colors.background).toBeTruthy()
  })
})
