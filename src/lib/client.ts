import { assert } from "chai";
import { io, Socket } from "socket.io-client";

import { Data, Engine } from "lib/cfish";
import { Protocol as P } from "lib/protocol";
import { RoomID, UserID } from "lib/server";

export class Client {
  engine: Engine | null = null;
  identity: P.User | null = null;
  socket: Socket;
  status: "waiting" | "connected" | "disconnected" = "waiting";
  users: P.User[] = [];

  constructor(readonly url: string, public room: RoomID, public name: string) {
    this.socket = io(url);

    this.socket.on("connect", () => {
      this.status = "connected";
      this.socket.emit("join", room, name);
    });

    this.socket.on("join", (user) => this.join(user));
    this.socket.on("reset", (data) => this.reset(data));
    this.socket.on("event", (event) => this.update(event));
    this.socket.on("rename", (user, name) => this.rename(user, name));
    this.socket.on("leave", (user) => this.leave(user));
  }

  findUser(id: UserID): P.User | null {
    const res = this.users.filter((user) => user.id === id);
    return res.length === 1 ? res[0] : null;
  }

  join(user: P.User): void {
    if (this.socket.id === user.id) {
      this.identity = user;
    }
    this.users.push(user);
  }

  rename(user: P.User, name: string): void {
    const user_ = this.findUser(user.id);
    user_.name = name;
  }

  leave(user: P.User): void {
    const idx = this.users.findIndex((user_) => user_.id === user.id);
    this.users.splice(idx, 1);
    if (this.socket.id === user.id) {
      this.status = "disconnected";
    }
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

    this.engine.handOf = data.handOf;
    this.engine.handSize = data.handSize;

    this.engine.asker = data.asker;
    this.engine.askee = data.askee;
    this.engine.askedCard = data.askedCard;

    this.engine.declarer = data.declarer;
    this.engine.declaredSuit = data.declaredSuit;
  }

  // process event from server
  update(event: P.Event): void {
    switch (event.type) {
      case "addUser":
        this.engine.addUser(event.user);
        return;
      case "seatAt":
        this.engine.seatAt(event.user, event.seat);
        return;
      case "unseatAt":
        this.engine.unseatAt(event.seat);
        return;
      case "removeUser":
        this.engine.removeUser(event.user);
        return;
      case "startGame":
        this.engine.startGame(event.seat);
        return;
      case "startGameResponse":
        this.engine.startGameResponse(
          event.server,
          event.hand,
          event.handSizes
        );
        return;
      case "ask":
        this.engine.ask(event.asker, event.askee, event.card);
        return;
      case "answer":
        this.engine.answer(event.askee, event.response);
        return;
      case "initDeclare":
        this.engine.initDeclare(event.declarer, event.declaredSuit);
        return;
      case "declare":
        this.engine.declare(event.declarer, event.owners);
        return;
      case "declareResponse":
        this.engine.declareResponse(
          event.server,
          event.correct,
          event.handSizes
        );
        return;
    }
  }

  // we don't need to apply it to our own engine; server will update us
  attempt(event: P.Event): void {
    this.socket.emit("event", event);
  }
}
