import { assert } from "chai";
import _ from "lodash";

import { Card, FishSuit, genDeck, genFishSuit, Hand } from "lib/cards";
import { UserID } from "lib/server";

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
  numPlayers: number;

  phase: CFish.Phase = CFish.Phase.WAIT;
  // all users in the room
  users: UserID[] = [];
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

  // asker asks askedCard from askee, last answer is lastResponse
  // valid if phase is ASK / ANSWER / DECLARE, initially null
  asker: SeatID | null = null;
  askee: SeatID | null = null;
  askedCard: Card | null = null;
  lastResponse: boolean | null = null;

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

  get numSeated(): number {
    return this.seats.filter((seat) => this.userOf[seat] !== null).length;
  }

  get ownSeat(): SeatID | null {
    return this.seatOf(this.identity);
  }

  get ownHand(): Hand | null {
    return this.handOf[this.ownSeat] ?? null;
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

  // dupe and redact state
  redactFor(user: UserID): Data {
    const res = new Data();
    res.numPlayers = this.numPlayers;

    res.phase = this.phase;
    res.users = this.users;
    res.identity = user;
    res.host = this.host;

    res.seats = this.seats;
    res.userOf = this.userOf;
    res.declarerOf = this.declarerOf;

    const seat_ = this.seatOf(user);
    for (const seat of this.seats) {
      res.handOf[seat] = seat === seat_ ? this.handOf[seat] : null;
    }
    res.handSize = this.handSize;

    res.asker = this.asker;
    res.askee = this.askee;
    res.askedCard = this.askedCard;
    res.lastResponse = this.lastResponse;

    res.declarer = this.declarer;
    res.declaredSuit = this.declaredSuit;

    return res;
  }

  // protocol actions

  addUser(user: UserID): void {
    assert.isNotOk(this.users.includes(user));
    this.users.push(user);
    if (this.host === null) this.host = user;
  }

  seatAt(user: UserID, seat: SeatID): void {
    assert.isOk(this.users.includes(user));
    assert.strictEqual(this.userOf[seat], null);
    assert.strictEqual(this.seatOf(user), null);
    this.userOf[seat] = user;
  }

  unseatAt(seat: SeatID): void {
    assert.notStrictEqual(this.userOf[seat], null);
    this.userOf[seat] = null;
  }

  removeUser(user: UserID): void {
    assert.isOk(this.users.includes(user));
    _.remove(this.users, (user_) => user_ === user);

    const seat = this.seatOf(user);
    if (seat !== null) {
      this.unseatAt(seat);
    }
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
  // server response: player hands
  startGame(seat: SeatID, shuffle: boolean = true): void {
    assert.strictEqual(this.phase, CFish.Phase.WAIT);
    assert.strictEqual(this.userOf[seat], this.host);
    assert.strictEqual(this.numSeated, this.numPlayers);

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

  startGameResponse(
    server: null,
    hand: Hand | null,
    handSizes: Record<SeatID, number>
  ): void {
    if (this.ownSeat !== null && hand !== null) {
      this.handOf[this.ownSeat] = new Hand(hand);
    }
    this.handSize = handSizes;
  }

  // ASK -> ANSWER
  ask(asker: SeatID, askee: SeatID, card: Card): void {
    assert.strictEqual(this.phase, CFish.Phase.ASK);
    assert.strictEqual(this.asker, asker);
    assert.notStrictEqual(this.teamOf(asker), this.teamOf(askee));

    if (this.handOf[asker] !== null) {
      assert.isOk(this.handOf[asker].hasSuit(card.fishSuit));
      assert.isNotOk(this.handOf[asker].includes(card));
    }

    this.askee = askee;
    this.askedCard = card;
    this.phase = CFish.Phase.ANSWER;
  }

  // ANSWER -> ASK
  answer(askee: SeatID, response: boolean): void {
    assert.strictEqual(this.phase, CFish.Phase.ANSWER);
    assert.strictEqual(this.askee, askee);

    if (this.handOf[askee] !== null) {
      assert.strictEqual(this.handOf[askee].includes(this.askedCard), response);
    }

    if (response) {
      if (this.handOf[this.asker] !== null) {
        this.handOf[this.asker].insert(this.askedCard);
      }
      if (this.handOf[this.askee] !== null) {
        this.handOf[this.askee].remove(this.askedCard);
      }
      this.handSize[this.asker] += 1;
      this.handSize[this.askee] -= 1;
    }

    this.asker = response ? this.asker : this.askee;
    this.lastResponse = response;
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
  // server response: correct or not
  declare(declarer: SeatID, owners: Record<string, SeatID>): boolean {
    assert.strictEqual(this.phase, CFish.Phase.DECLARE);
    assert.strictEqual(this.declarer, declarer);

    const team = this.teamOf(declarer);
    let correct = true;

    for (const card of genFishSuit(this.declaredSuit)) {
      const owner = owners[String(card)];
      assert.notStrictEqual(owner, undefined);
      assert.strictEqual(team, this.teamOf(owner));
      if (this.handOf[owner] !== null) {
        correct &&= this.handOf[owner].includes(card);
      }
    }

    for (const seat of this.seats) {
      if (this.handOf[seat] !== null) {
        this.handOf[seat].removeSuit(this.declaredSuit);
        this.handSize[seat] = this.handOf[seat].size;
      }
    }

    if (this.identity === null) {
      this.declareResponse(null, correct, this.handSize);
    }

    return correct;
  }

  declareResponse(
    server: null,
    correct: boolean,
    handSizes: Record<SeatID, number>
  ): void {
    const team = this.teamOf(this.declarer);
    const scorer = correct ? team : 1 - team;

    this.declarerOf[this.declaredSuit] = scorer as CFish.Team;

    if (this.scoreOf(scorer) > Card.FISH_SUITS.length / 2) {
      // they win, hooray? what else?
      this.phase = CFish.Phase.FINISH;
    } else {
      // special case: person asking no longer has cards
      this.phase = CFish.Phase.ASK;
    }

    this.declarer = null;
    this.declaredSuit = null;
  }

  // FINISH -> WAIT
  // newGame(host: SeatID): void
  // just do a phase change?

  // debug

  toString(): string {
    let res = "[seats]\n";
    for (const user of this.users) {
      res += ` ${user} seated in ${this.seatOf(user)}\n`;
    }
    res += "[declarations]\n";
    for (let team = 0; team <= 1; team++) {
      res += ` ${team}: (${this.scoreOf(team)}) `;
      for (const suit in Card.FISH_SUITS) {
        if (this.declarerOf[suit] === team) {
          res += `${FishSuit[suit]} `;
        }
      }
      res += `\n`;
    }
    res += `[phase: ${CFish.Phase[this.phase]}]\n `;
    if (this.phase === CFish.Phase.DECLARE) {
      res += `${this.declarer} declaring ${FishSuit[this.declaredSuit]}\n`;
    } else if (this.phase === CFish.Phase.ANSWER) {
      res += `${this.asker} asking ${this.askee} for ${this.askedCard}\n`;
    } else if (this.phase === CFish.Phase.ASK) {
      res += `${this.asker} asking\n`;
    }
    res += "[hands]\n";
    for (const seat of this.seats) {
      res += ` ${seat}: ${this.handOf[seat] ?? this.handSize[seat]}\n`;
    }
    return res;
  }
}
