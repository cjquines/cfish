export type UserID = string;

export class Data {
  // players from host clockwise
  players: UserID[] = ["p1", "p2", "p3", "p4", "p5", "p6"];
}

export class Game extends Data {}

export type State = Game;
export type PlayerState = Game;
