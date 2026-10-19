import { describe, it, expect } from "vitest";
import { applyWrong, newPlayer, MAX_LIVES } from "./logic";
describe("lives", () => {
  it("starts with 3 lives", () => expect(newPlayer(0).lives).toBe(3));
  it("stops the game when lives reach zero", () => {
    let p = newPlayer(0);
    for (let i = 0; i < MAX_LIVES; i++) p = applyWrong(p);
    expect(p.lives).toBe(0);
    expect(p.status).toBe("out");
    expect(p.locked).toBe(true);
  });
  it("keeps playing with lives left", () => expect(applyWrong(newPlayer(0)).status).toBe("playing"));
});
