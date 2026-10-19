import { describe, it, expect } from "vitest";
import { applyWrong, newPlayer, MAX_LIVES } from "./logic";
describe("lives", () => {
  it("starts with 5 lives", () => expect(newPlayer(0).lives).toBe(5));
  it("stops the game when lives reach zero", () => {
    let p = newPlayer(0);
    for (let i = 0; i < MAX_LIVES; i++) p = applyWrong(p);
    expect(p.lives).toBe(0);
    expect(p.status).toBe("out");
    expect(p.locked).toBe(true);
  });
  it("keeps playing with lives left", () => expect(applyWrong(newPlayer(0)).status).toBe("playing"));
});
import { DIFFICULTIES, TOTAL_QUESTIONS } from "./logic";
describe("difficulty", () => {
  it("has four levels", () => expect(DIFFICULTIES.map((d) => d.label)).toEqual(["Mudah", "Sedang", "Sulit", "Sangat Sulit"]));
  it("has 10 questions", () => expect(TOTAL_QUESTIONS).toBe(10));
});
