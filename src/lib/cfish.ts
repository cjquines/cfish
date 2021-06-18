import { assert } from "chai";
import _ from "lodash";

import { Card, FishSuit, genDeck, genFishSuit, Hand } from "lib/cards";

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
  // only partial record; no other record can have undefined
  declarerOf: Partial<Record<FishSuit, CFish.Team>> = {} as any;

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
    this.seats = _.range(numPlayers);
    for (const seat of this.seats) {
      this.userOf[seat] = null;
      this.handOf[seat] = null;
      this.handSize[seat] = 0;
    }
  }

  // getters

  numSeated(): number {
    return this.seats.filter((seat) => this.userOf[seat] !== null).length;
  }

  indexOf(seat: SeatID): number {
    return this.seats.findIndex((seat_) => seat_ === seat);
  }

  seatOf(user: UserID): SeatID | null {
    const res = this.seats.filter((seat) => this.userOf[seat] === user);
    return res.length === 1 ? res[0] : null;
  }

  teamOf(seat: SeatID): CFish.Team | null {
    return seat % 2 === 0 ? CFish.Team.FIRST : CFish.Team.SECOND;
  }

  playersOf(team: CFish.Team): SeatID[] {
    return this.seats.filter((seat) => seat % 2 === Number(team));
  }

  scoreOf(team: CFish.Team): number {
    return Card.FISH_SUITS.filter((suit) => this.declarerOf[suit] === team)
      .length;
  }

  // rotated such that user appears first
  rotatedSeats(user: UserID = this.identity): SeatID[] {
    const seat = this.seatOf(user);
    if (seat === null) return this.seats;
    const index = this.indexOf(seat);
    return this.seats.slice(index).concat(this.seats.slice(0, index));
  }

  // protocol actions

  addUser(user: UserID): void {
    assert.isNotOk(this.users.has(user));
    this.users.add(user);
    if (this.host === null) this.host = user;
  }

  seatAt(user: UserID, seat: SeatID): void {
    assert.isOk(this.users.has(user));
    assert.strictEqual(this.userOf[seat], null);
    assert.strictEqual(this.seatOf(user), null);
    this.userOf[seat] = user;
  }

  unseatAt(seat: SeatID): void {
    assert.notStrictEqual(this.userOf[seat], null);
    this.userOf[seat] = null;
  }

  removeUser(user: UserID): void {
    assert.isOk(this.users.has(user));
    this.users.delete(user);

    const seat = this.seatOf(user);
    if (seat !== null) this.unseatAt(seat);
    if (user === this.host) {
      this.host = null;
      for (const seat of this.seats) {
        if (this.userOf[seat] !== null) {
          this.host = this.userOf[seat];
          this.seats = this.rotatedSeats(this.host);
          break;
        }
      }
    }
  }

  // state machine actions
  // first argument is always seat initiating

  // WAIT -> ASK
  startGame(seat: SeatID, shuffle: boolean = true): void {
    assert.strictEqual(this.phase, CFish.Phase.WAIT);
    assert.strictEqual(this.userOf[seat], this.host);
    assert.strictEqual(this.numSeated(), this.numPlayers);

    if (this.identity === null) {
      const deck = shuffle ? _.shuffle([...genDeck()]) : [...genDeck()];
      const deal = _.unzip(_.chunk(deck, this.numPlayers));
      for (const [seat, hand] of _.zip(this.seats, deal)) {
        this.handOf[seat] = new Hand(hand);
        this.handSize[seat] = this.handOf[seat].size;
      }
    }

    this.declarerOf = {} as any;
    this.asker = null;
    this.askee = null;
    this.askedCard = null;
    this.declarer = null;
    this.declaredSuit = null;

    this.asker = this.seats[0]; // host goes first
    this.phase = CFish.Phase.ASK;
  }

  // ASK -> ANSWER
  ask(asker: SeatID, askee: SeatID, card: Card): void {
    assert.strictEqual(this.phase, CFish.Phase.ASK);
    assert.strictEqual(this.asker, asker);

    assert.notStrictEqual(this.teamOf(asker), this.teamOf(askee));
    assert.isOk(this.handOf[asker].hasSuit(card.fishSuit));
    assert.isNotOk(this.handOf[asker].includes(card));

    this.askee = askee;
    this.askedCard = card;
    this.phase = CFish.Phase.ANSWER;
  }

  // ANSWER -> ASK
  answer(askee: SeatID, response: boolean): void {
    assert.strictEqual(this.phase, CFish.Phase.ANSWER);
    assert.strictEqual(this.askee, askee);

    assert.strictEqual(this.handOf[askee].includes(this.askedCard), response);

    if (response) {
      this.handOf[this.asker].insert(this.askedCard);
      this.handOf[this.askee].remove(this.askedCard);
    }
    this.asker = response ? this.asker : this.askee;
    this.askee = null;
    this.askedCard = null;
    this.phase = CFish.Phase.ASK;
  }

  // ASK -> DECLARE
  initDeclare(declarer: SeatID, declaredSuit: FishSuit): void {
    assert.strictEqual(this.phase, CFish.Phase.ASK);

    assert.strictEqual(this.declarerOf[declaredSuit], undefined);

    this.declarer = declarer;
    this.declaredSuit = declaredSuit;
    this.phase = CFish.Phase.DECLARE;
  }

  // DECLARE -> ASK / FINISH
  // owners: Record<card as string, SeatID>
  declare(declarer: SeatID, owners: Record<string, SeatID>): void {
    assert.strictEqual(this.phase, CFish.Phase.DECLARE);
    assert.strictEqual(this.declarer, declarer);

    const team = this.teamOf(declarer);
    let correct = true;
    for (const card of genFishSuit(this.declaredSuit)) {
      const owner = owners[String(card)];
      assert.notStrictEqual(owner, undefined);
      assert.strictEqual(team, this.teamOf(owner));
      correct &&= this.handOf[owner].includes(card);
    }
    for (const seat of this.seats) {
      this.handOf[seat].removeSuit(this.declaredSuit);
    }

    const scorer = correct ? team : 1 - team;
    this.declarerOf[this.declaredSuit] = scorer as CFish.Team;
    if (this.scoreOf(scorer) > Card.FISH_SUITS.length / 2) {
      // they win, hooray? what else?
      this.phase = CFish.Phase.FINISH;
    } else {
      this.phase = CFish.Phase.ASK;
    }
  }

  // FINISH -> WAIT
  // newGame(host: SeatID): void
  // just do a phase change?

  // debug

  toString(): string {
    let res = "[declarations]\n";
    for (let team = 0; team <= 1; team++) {
      res += `${team}: (${this.scoreOf(team)}) `;
      for (const suit in Card.FISH_SUITS) {
        if (this.declarerOf[suit] === team) {
          res += `${FishSuit[suit]} `;
        }
      }
      res += `\n`;
    }
    res += `[phase: ${CFish.Phase[this.phase]}]\n`;
    if (this.phase === CFish.Phase.DECLARE) {
      res += `${this.declarer} declaring ${FishSuit[this.declaredSuit]}\n`;
    } else if (this.phase === CFish.Phase.ANSWER) {
      res += `${this.asker} asking ${this.askee} for ${this.askedCard}\n`;
    } else if (this.phase === CFish.Phase.ASK) {
      res += `${this.asker} asking\n`;
    }
    res += "[hands]\n";
    for (const seat of this.seats) {
      res += `${seat}: ${this.handOf[seat]}\n`;
    }
    return res;
  }
}
