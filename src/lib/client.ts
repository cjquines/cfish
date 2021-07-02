import { assert } from "chai";
import { io, Socket } from "socket.io-client";

import { Card, FishSuit, Hand } from "lib/cards";
import { Data, Engine, SeatID } from "lib/cfish";
import { Protocol as P } from "lib/protocol";
import { RoomID, UserID } from "lib/server";

export class Client {
  engine: Engine | null = null;
  identity: P.User | null = null;
  socket: Socket;
  status: "waiting" | "connected" | "disconnected" = "waiting";
  users: P.User[] = [];
  onUpdate: (state: this) => void | null;

  constructor(readonly url: string, public room: RoomID, public name: string) {
    this.socket = io(url);

    this.socket.on("users", (users) => {
      this.users = users;
    });
    this.socket.on("join", (user) => this.join(user));
    this.socket.on("reset", (data) => this.reset(data));
    this.socket.on("event", (event) => this.update(event));
    this.socket.on("rename", (user, name) => this.rename(user, name));
    this.socket.on("leave", (user) => this.leave(user));
  }

  findUser(id: UserID | SeatID): P.User | null {
    const res =
      typeof id === "string" // true iff UserID
        ? this.users.filter((user) => user.id === id)
        : this.users.filter((user) => user.id === this.engine.userOf[id]);
    return res.length === 1 ? res[0] : null;
  }

  nameOf(id: UserID | SeatID): string | null {
    const user = this.findUser(id);
    return user ? user.name : null;
  }

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
      this.engine = new Engine(data.numPlayers);
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

    this.engine.asker = data.asker;
    this.engine.askee = data.askee;
    this.engine.askedCard = data.askedCard;
    this.engine.lastResponse = data.lastResponse;

    this.engine.declarer = data.declarer;
    this.engine.declaredSuit = data.declaredSuit;

    this.onUpdate?.(this);
  }

  // process event from server
  update(event: P.Event): void {
    if (this.engine === null) return;
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
      case "startGame":
        this.engine.startGame(event.seat);
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
        break;
      case "answer":
        this.engine.answer(event.askee, event.response);
        break;
      case "initDeclare":
        this.engine.initDeclare(event.declarer, event.declaredSuit);
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
        break;
    }
    this.onUpdate?.(this);
  }

  // convenience actions

  // we don't need to apply it to our own engine; server will update us
  // TODO do we want to predict?
  attempt(event: P.Event): void {
    this.socket.emit("event", event);
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

  startGame(shuffle: boolean = true): void {
    return this.attempt({
      type: "startGame",
      seat: this.engine.ownSeat,
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

  declare(owners: Record<string, SeatID>): void {
    return this.attempt({
      type: "declare",
      declarer: this.engine.ownSeat,
      owners: owners,
    });
  }
}
