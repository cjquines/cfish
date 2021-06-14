import { Card, FishSuit, Hand } from "lib/cards";

// okay indices are good but this should be generic length not 6
// because what if 8 player games?
type Tuple6<T> = [T, T, T, T, T, T];

// socket io id
export type UserID = string;

export namespace CFish {
  export enum Phase {
    WAIT, // between rounds
    ASK, // waiting for someone to ask
    ANSWER, // waiting for someone to answer
    DECLARE, // waiting for someone to declare
    FINISH, // game over
  }

  export enum Team {
    FIRST, // goes first
    SECOND,
  }
}

export class Data {
  // game phase
  phase: CFish.Phase = CFish.Phase.WAIT;
  // whose data is this?
  identity: UserID | null = null;

  // host id
  host: UserID = null;
  // players from host clockwise
  // even-indexed is in CFish.Team.FIRST
  players: Tuple6<UserID | null> = [null, null, null, null, null, null];
  // declared suits to team
  declaredSuits: Record<FishSuit, CFish.Team> = {} as any;

  // these are index-dependent and player-agnostic
  // hands (maps to null for users != identity)
  hand: Tuple6<Hand | null> = [null, null, null, null, null, null];
  // hand size (because hands aren't public)
  handSize: Tuple6<number | null> = [null, null, null, null, null, null];

  // asker asks askedCard from askee
  // asker valid if phase is ASK / ANSWER
  asker: UserID | null = null;
  // askee, askedCard valid if phase is ANSWER
  askee: UserID | null = null;
  askedCard: Card | null = null;

  // declarer declares declaredSuit
  // valid if phase is DECLARE
  declarer: UserID | null = null;
  declaredSuit: FishSuit | null = null;
}

export class Game extends Data {
  // number of players
  // player index
  // player to team
  // index to team
  // team to players
  // etc.

  // rotate such that identity appears first
  rotatedPlayers(): UserID[] {
    return this.players;
  }

  // returns player to take next action, sensitive to phase
  currentPlayer(): UserID | null {
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
