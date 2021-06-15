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
  // all users in the room
  users: Set<UserID> = new Set();
  // whose data is this? null is server
  identity: UserID | null = null;
  host: UserID | null = null;

  // players 0, 1, 2, etc. are host clockwise
  players: PlayerID[] = [];
  // map player to the user seated in that spot
  // even-indexed seats are in CFish.Team.FIRST
  seated: Record<PlayerID, UserID | null> = {} as any;
  declarations: Record<FishSuit, CFish.Team> = {} as any;

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

// client/server agnostic cfish engine
// client and server use the same state machine
// upon connect server pushes all state info to client engine
// client sends action to client engine and server
// server sends action to server engine and clients

export class Engine extends Data {
  constructor(readonly numPlayers: number) {
    super();
    this.players = [...Array(numPlayers).keys()];
    this.players.forEach((id) => {
      this.seated[id] = null;
      this.hand[id] = null;
      this.handSize[id] = 0;
    });
  }

  indexOf(user: UserID): PlayerID | null {
    const res = this.players.filter((id) => this.seated[id] === user);
    return res.length === 1 ? res[0] : null;
  }

  teamOf(user: UserID): CFish.Team | null {
    const idx = this.indexOf(user);
    if (idx === null) return null;
    return idx % 2 === 0 ? CFish.Team.FIRST : CFish.Team.SECOND;
  }

  playersOf(team: CFish.Team): PlayerID[] {
    return this.players.filter((id) => id % 2 === Number(team));
  }

  // rotate such that identity appears first
  rotatedPlayers(): PlayerID[] {
    const idx = this.indexOf(this.identity);
    if (idx === null) return this.players;
    return this.players.slice(idx).concat(this.players.slice(0, idx));
  }

  // state machine begins here

  // ANY -> ANY: addUser(UserID)
  // ANY -> ANY: removeUser(UserID)
  // ANY -> ANY: seatAt(UserID, PlayerID)
  // ANY -> ANY: unseatAt(PlayerID)

  // first argument is always player initiating action
  // WAIT -> ASK: startGame(player: PlayerID)
  // ASK -> ANSWER: ask(asker: PlayerID, askee: PlayerID, Card)
  // ANSWER -> ASK: answer(askee: PlayerID, boolean)
  // ASK -> DECLARE: initDeclare(player: PlayerID)
  // DECLARE -> ASK / FINISH: declare(player: PlayerID, Record<Card, PlayerID>)
  // FINISH -> WAIT: newGame(player: PlayerID)
}
