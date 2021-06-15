import { Card, FishSuit, Hand } from "lib/cards";

// socket io id
export type UserID = string;
// player index (0, 1, 2, ...)
export type PlayerID = number;

export namespace CFish {
  export enum Phase {
    WAIT, // between rounds
    ASK, // waiting for someone to ask
    ANSWER, // waiting for someone to answer
    DECLARE, // waiting for someone to declare
    FINISH, // game over
  }

  export enum Team {
    FIRST = 0, // goes first
    SECOND,
  }
}

export class Data {
  phase: CFish.Phase = CFish.Phase.WAIT;
  // whose data is this? null is global
  identity: PlayerID | null = null;

  host: UserID | null = null;
  // players 0, 1, 2, etc. are host clockwise
  // disconnected players are null
  // even-indexed players are in CFish.Team.FIRST
  players: PlayerID[] = [];
  users: Record<PlayerID, UserID | null> = {} as any;
  declaredSuits: Record<FishSuit, CFish.Team> = {} as any;

  // these are index-dependent and player-agnostic
  // hands (maps to null for users != identity)
  hand: Record<PlayerID, Hand | null> = {} as any;
  // hand size (because hands aren't public)
  handSize: Record<PlayerID, number> = {} as any;

  // asker asks askedCard from askee
  // asker valid if phase is ASK / ANSWER
  asker: PlayerID | null = null;
  // askee, askedCard valid if phase is ANSWER
  askee: PlayerID | null = null;
  askedCard: Card | null = null;

  // declarer declares declaredSuit
  // valid if phase is DECLARE
  declarer: PlayerID | null = null;
  declaredSuit: FishSuit | null = null;
}

export class Game extends Data {
  constructor(readonly numPlayers: number) {
    super();
    this.players = [...Array(numPlayers).keys()];
    this.players.forEach((id) => {
      this.users[id] = null;
      this.hand[id] = null;
      this.handSize[id] = 0;
    });
  }

  indexOf(user: UserID): PlayerID {
    const res = this.players.filter((id) => this.users[id] === user);
    console.assert(res.length === 1);
    return res[0];
  }

  teamOf(user: UserID): CFish.Team {
    return this.indexOf(user) % 2 === 0 ? CFish.Team.FIRST : CFish.Team.SECOND;
  }

  playersOf(team: CFish.Team): PlayerID[] {
    return this.players.filter((id) => id % 2 === Number(team));
  }

  // rotate such that identity appears first
  rotatedPlayers(): PlayerID[] {
    let res = this.players.slice();
    if (this.identity !== null)
      while (res[0] !== this.identity) res.push(res.shift());
    return res;
  }

  // returns player to take next action, sensitive to phase
  currentPlayer(): PlayerID | null {
    return null;
  }

  // state machine begins here

  // WAIT -> WAIT: addPlayer
  // WAIT -> WAIT: removePlayer
  // WAIT -> ASK: startGame
  // ASK -> ANSWER: ask
  // ANSWER -> ASK: answer
  // ASK -> DECLARE: initDeclare
  // DECLARE -> ASK / FINISH: declare
  // FINISH -> WAIT: newGame
}

export type State = Game;
export type PlayerState = Game;
