import assert from "assert/strict";

import { Card, FishSuit, Hand } from "lib/cards";

export type UserID = string; // socket io id
export type SeatID = number; // seat index (0, 1, 2, ...)

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

  // seats, clockwise; seats[0] should always be host
  // even-indexed seats are in CFish.Team.FIRST
  seats: SeatID[] = [];
  userOf: Record<SeatID, UserID | null> = {} as any;
  declared: Record<FishSuit, CFish.Team> = {} as any;

  // these are index-dependent and player-agnostic
  // hands; maps to null for private hands
  handOf: Record<SeatID, Hand | null> = {} as any;
  // hand size; always public
  handSize: Record<SeatID, number> = {} as any;

  // asker asks askedCard from askee
  // asker valid if phase is ASK / ANSWER / DECLARE
  asker: SeatID | null = null;
  // askee, askedCard valid if phase is ANSWER
  askee: SeatID | null = null;
  askedCard: Card | null = null;

  // declarer declares declaredSuit
  // valid if phase is DECLARE
  declarer: SeatID | null = null;
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
    this.seats = [...Array(numPlayers).keys()];
    this.seats.forEach((seat) => {
      this.userOf[seat] = null;
      this.handOf[seat] = null;
      this.handSize[seat] = 0;
    });
  }

  // getters

  numSeated(): number {
    return this.seats.filter((seat) => this.userOf[seat] !== null).length;
  }

  seatOf(user: UserID): SeatID | null {
    const res = this.seats.filter((seat) => this.userOf[seat] === user);
    return res.length === 1 ? res[0] : null;
  }

  teamOf(user: UserID): CFish.Team | null {
    const seat = this.seatOf(user);
    if (seat === null) return null;
    return seat % 2 === 0 ? CFish.Team.FIRST : CFish.Team.SECOND;
  }

  playersOf(team: CFish.Team): SeatID[] {
    return this.seats.filter((seat) => seat % 2 === Number(team));
  }

  // scoreOf(team: CFish.Team): number

  // rotated such that user appears first
  rotatedSeats(user: UserID = this.identity): SeatID[] {
    const seat = this.seatOf(user);
    if (seat === null) return this.seats;
    return this.seats.slice(seat).concat(this.seats.slice(0, seat));
  }

  // protocol actions

  addUser(user: UserID): void {
    assert.strictEqual(this.users.has(user), false);
    this.users.add(user);
  }

  seatAt(user: UserID, seat: SeatID): void {
    assert.strictEqual(this.users.has(user), true);
    assert.strictEqual(this.userOf[seat], null);
    this.userOf[seat] = user;
  }

  unseatAt(seat: SeatID): void {
    assert.notStrictEqual(this.userOf[seat], null);
    this.userOf[seat] = null;
  }

  removeUser(user: UserID): void {
    assert.strictEqual(this.users.has(user), true);
    const seat = this.seatOf(user);
    if (seat !== null) this.unseatAt(seat);
    if (user === this.host) {
      let found = false;
      this.seats.forEach((seat) => {
        if (!found && this.userOf[seat] !== null) {
          this.host = this.userOf[seat];
          // ensure seats[0] is host
          this.seats = this.rotatedSeats(this.host);
          found = true;
        }
      });
      if (!found) this.host = null;
    }
  }

  // state machine actions
  // first argument is always seat initiating

  // WAIT -> ASK
  startGame(seat: SeatID): void {
    assert.strictEqual(this.phase, CFish.Phase.WAIT);
    assert.strictEqual(this.userOf[seat], this.host);
    assert.strictEqual(this.numSeated, this.numPlayers);
    // shuffle and deal cards
    // clear declared suits
    // clear asker, etc.
    // set asker
    this.phase = CFish.Phase.ASK;
  }

  // ASK -> ANSWER
  ask(asker: SeatID, askee: SeatID, card: Card): void {
    assert.strictEqual(this.phase, CFish.Phase.ASK);
    assert.strictEqual(this.asker, asker);
    // check if valid ask if we can
    // set askee, card
    this.phase = CFish.Phase.ANSWER;
  }

  // ANSWER -> ASK
  answer(askee: SeatID, response: boolean): void {
    assert.strictEqual(this.phase, CFish.Phase.ANSWER);
    assert.strictEqual(this.askee, askee);
    // check response correct if we can
    // unset askee, card
    // set asker
    this.phase = CFish.Phase.ASK;
  }

  // ASK -> DECLARE
  initDeclare(declarer: SeatID, declaredSuit: FishSuit): void {
    assert.strictEqual(this.phase, CFish.Phase.ASK);
    // check suit isn't declared yet
    // set declarer, declaredSuit
    this.phase = CFish.Phase.DECLARE;
  }

  // DECLARE -> ASK / FINISH
  declare(declarer: SeatID, owners: Record<string, SeatID>): void {
    assert.strictEqual(this.phase, CFish.Phase.DECLARE);
    assert.strictEqual(this.declarer, declarer);
    // check owners keys are all good
    // check owners seats are all team
    // check if correct or not
    // add to declared suits
    // if a team has majority declared suits, move to finish
    // otherwise move back to asker
  }

  // FINISH -> WAIT
  // newGame(host: SeatID): void
  // just do a phase change?
}
