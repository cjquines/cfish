import { io, Socket } from "socket.io-client";

import { Card, FishSuit, fishSuitToString, Hand } from "lib/cards";
import { CFish as C, Data, Engine, SeatID } from "lib/cfish";
import { Protocol as P } from "lib/protocol";
import { RoomID, UserID } from "lib/server";

export class Client {
  engine: Engine | null = null;
  identity: P.User | null = null;
  log: string[] = [];
  socket: Socket;
  status: "waiting" | "connected" | "disconnected" = "waiting";
  users: P.User[] = [];

  cardAnimHook:
    | ((asker: SeatID, askee: SeatID, askedCard: Card) => void)
    | null = null;
  declareMoveHook:
    | ((srcId: string, srcIdx: number, destId: string, destIdx: number) => void)
    | null = null;
  onUpdate: ((state: this) => void) | null = null;
  resetShakeAnimHook: (() => void) | null = null;

  constructor(readonly url: string, public room: RoomID, public name: string) {
    this.socket = io(url);

    this.socket.on("users", (users) => {
      this.users = users;
    });
    this.socket.on("join", (user) => this.join(user));
    this.socket.on("reset", (data) => this.reset(data));
    this.socket.on("event", (event) => this.update(event));
    this.socket.on("error", (error) => console.error(error));
    this.socket.on("rename", (user, name) => this.rename(user, name));
    this.socket.on("leave", (user) => this.leave(user));
  }

  // getters

  findUser(id: UserID | SeatID): P.User | null {
    const res =
      typeof id === "string" // true iff UserID
        ? this.users.filter((user) => user.id === id)
        : this.users.filter((user) => user.id === this.engine.userOf[id]);
    return res.length === 1 ? res[0] : null;
  }

  nameOf(id: UserID | SeatID): string {
    const user = this.findUser(id);
    return user ? user.name : "no one";
  }

  stringify(
    key: "asker" | "askee" | "askedCard" | "declarer" | "declaredSuit" | "host"
  ): string {
    const obj = this.engine[key];
    if (key === "declaredSuit") {
      return fishSuitToString(this.engine[key]);
    } else if (key === "host") {
      return this.nameOf(this.engine[key]);
    } else if (typeof obj === "number") {
      const user = this.findUser(obj);
      return user?.id === this.identity?.id ? "you" : this.nameOf(obj);
    } else {
      return obj.toString();
    }
  }

  // protocol actions

  connect(): void {
    this.socket.on("connect", () => {
      this.status = "connected";
      this.socket.emit("join", this.room, this.name);
    });
  }

  join(user: P.User): void {
    if (this.socket.id === user.id) {
      this.identity = user;
    }
    this.users.push(user);
    this.onUpdate?.(this);
  }

  rename(user: P.User, name: string): void {
    const user_ = this.findUser(user.id);
    user_.name = name;
    this.onUpdate?.(this);
  }

  leave(user: P.User): void {
    const idx = this.users.findIndex((user_) => user_.id === user.id);
    this.users.splice(idx, 1);
    if (this.socket.id === user.id) {
      this.status = "disconnected";
    }
    this.onUpdate?.(this);
  }

  // get redacted state and initiate engine
  reset(data: Data): void {
    if (this.engine === null) {
      this.engine = new Engine(data.rules);
    }

    this.engine.phase = data.phase;
    this.engine.users = data.users;
    this.engine.identity = data.identity;
    this.engine.host = data.host;

    this.engine.seats = data.seats;
    this.engine.userOf = data.userOf;
    this.engine.declarerOf = data.declarerOf;

    for (const seat of data.seats) {
      this.engine.handOf[seat] = data.handOf[seat]
        ? new Hand(data.handOf[seat])
        : null;
    }
    this.engine.handSize = data.handSize;
    if (this.engine.ownSeat && this.engine.ownHand) {
      this.engine.handSize[this.engine.ownSeat] = this.engine.ownHand.size;
    }

    this.engine.asker = data.asker;
    this.engine.askee = data.askee;
    this.engine.askedCard =
      data.askedCard && new Card(data.askedCard.cardSuit, data.askedCard.rank);
    this.engine.lastResponse = data.lastResponse;

    this.engine.declarer = data.declarer;
    this.engine.declaredSuit = data.declaredSuit;

    this.onUpdate?.(this);
  }

  // process event from server
  update(event: P.Event): void {
    if (this.engine === null) return;
    const sfy = (key) => this.stringify(key);

    switch (event.type) {
      case "addUser":
        this.engine.addUser(event.user);
        break;
      case "seatAt":
        this.engine.seatAt(event.user, event.seat);
        break;
      case "unseatAt":
        this.engine.unseatAt(event.seat);
        break;
      case "removeUser":
        this.engine.removeUser(event.user);
        break;
      case "setRules":
        this.engine.setRules(event.user, event.rules);
        break;
      case "startGame":
        this.engine.startGame(event.user);
        this.log = [];
        this.log.push(`${this.nameOf(event.user)} started the game`);
        break;
      case "startGameResponse":
        this.engine.startGameResponse(
          event.server,
          event.hand,
          event.handSizes
        );
        break;
      case "ask":
        const card = new Card(event.card.cardSuit, event.card.rank);
        this.engine.ask(event.asker, event.askee, card);
        this.log.push(
          `${sfy("asker")} asked ${sfy("askee")} for the ${sfy("askedCard")}`
        );
        break;
      case "answer":
        this.engine.answer(event.askee, event.response);
        this.log.push(
          event.response
            ? `${sfy("askee")} gave ${sfy("asker")} the ${sfy("askedCard")}`
            : `${sfy("askee")} did not have the ${sfy("askedCard")}`
        );
        if (event.response) {
          const { asker, askee, askedCard } = this.engine;
          this.cardAnimHook?.(
            asker,
            askee,
            new Card(askedCard.cardSuit, askedCard.rank)
          );
        } else {
          this.resetShakeAnimHook?.();
        }
        break;
      case "initDeclare":
        this.engine.initDeclare(event.declarer, event.declaredSuit);
        this.log.push(
          `${sfy("declarer")} began declaring ${sfy("declaredSuit")}`
        );
        break;
      case "declareMove":
        if (this.engine.ownSeat !== this.engine.declarer) {
          this.declareMoveHook?.(
            event.srcId,
            event.srcIdx,
            event.destId,
            event.destIdx
          );
        }
        break;
      case "declare":
        this.engine.declare(event.declarer, event.owners);
        break;
      case "declareResponse":
        this.engine.declareResponse(
          event.server,
          event.correct,
          event.handSizes
        );
        this.log.push(
          event.correct
            ? `${sfy("declarer")} correctly declared ${sfy("declaredSuit")}`
            : `${sfy("declarer")} incorrectly declared ${sfy("declaredSuit")}`
        );
        if (this.engine.winner !== null) {
          this.log.push(
            `team ${this.engine.seats
              .filter((seat) => this.engine.teamOf(seat) === this.engine.winner)
              .map((seat) => this.nameOf(seat))
              .join(", ")} won!`
          );
        }
        break;
      case "pass":
        this.engine.pass(event.passer, event.next);
        this.log.push(
          `${this.nameOf(event.passer)} passed the turn to ${sfy("asker")}`
        );
        break;
    }
    this.onUpdate?.(this);
  }

  // convenience actions

  // we don't need to apply it to our own engine; server will update us
  attempt(event: P.Event): void {
    this.socket.emit("event", event);
  }

  attemptRename(name: string): void {
    this.socket.emit("rename", name);
  }

  seatAt(seat: SeatID): void {
    return this.attempt({
      type: "seatAt",
      user: this.engine.identity,
      seat: seat,
    });
  }

  unseatAt(): void {
    return this.attempt({
      type: "unseatAt",
      seat: this.engine.ownSeat,
    });
  }

  setRules(rules: C.Rules): void {
    return this.attempt({
      type: "setRules",
      user: this.engine.identity,
      rules: rules,
    });
  }

  startGame(shuffle: boolean = true): void {
    return this.attempt({
      type: "startGame",
      user: this.engine.identity,
      shuffle: shuffle,
    });
  }

  ask(askee: SeatID, card: Card): void {
    return this.attempt({
      type: "ask",
      asker: this.engine.ownSeat,
      askee: askee,
      card: card,
    });
  }

  answer(response: boolean): void {
    return this.attempt({
      type: "answer",
      askee: this.engine.ownSeat,
      response: response,
    });
  }

  initDeclare(declaredSuit: FishSuit): void {
    return this.attempt({
      type: "initDeclare",
      declarer: this.engine.ownSeat,
      declaredSuit: declaredSuit,
    });
  }

  declareMove(
    srcId: string,
    srcIdx: number,
    destId: string,
    destIdx: number
  ): void {
    return this.attempt({
      type: "declareMove",
      srcId: srcId,
      srcIdx: srcIdx,
      destId: destId,
      destIdx: destIdx,
    });
  }

  declare(owners: Record<string, SeatID>): void {
    return this.attempt({
      type: "declare",
      declarer: this.engine.ownSeat,
      owners: owners,
    });
  }

  pass(next: SeatID): void {
    return this.attempt({
      type: "pass",
      passer: this.engine.ownSeat,
      next: next,
    });
  }
}
