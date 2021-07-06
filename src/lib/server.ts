import { assert } from "chai";
import { Server as HTTPServer } from "http";
import { Server as IOServer, Socket } from "socket.io";

import { Card } from "lib/cards";
import { CFish as C, Engine, SeatID } from "lib/cfish";
import { Protocol as P } from "lib/protocol";

export type RoomID = string;
export type UserID = string;

export class Room {
  engine: Engine;
  users: P.User[] = [];

  constructor(
    readonly id: RoomID,
    readonly socket: IOServer,
    public closeCallback: () => void,
    rules: C.Rules
  ) {
    this.engine = new Engine(rules);
  }

  // helpers

  findUser(id: UserID): P.User | null {
    const res = this.users.filter((user) => user.id === id);
    return res.length === 1 ? res[0] : null;
  }

  // to be handled by client
  toAll(event: string, ...args: any[]): void {
    this.socket.to(this.id).emit(event, ...args);
  }

  // to be handled by client engine
  event(event: P.Event): void {
    this.toAll("event", event);
  }

  toSeat(seat: SeatID, event: P.Event): void {
    const id = this.engine.userOf[seat];
    assert.notStrictEqual(id, null);
    this.socket.to(id).emit("event", event);
  }

  // protocol actions

  join(user: P.User): void {
    assert.strictEqual(this.findUser(user.id), null);
    this.socket.to(user.id).emit("users", this.users);
    this.users.push(user);

    this.engine.addUser(user.id);
    this.toAll("join", user);
    this.event({
      type: "addUser",
      user: user.id,
    });
  }

  rename(user: P.User, name: string): void {
    const user_ = this.findUser(user.id);
    assert.notStrictEqual(user_, null);
    user_.name = name;

    this.toAll("rename", user, name);
  }

  leave(user: P.User): void {
    const idx = this.users.findIndex((user_) => user_.id === user.id);
    assert.notStrictEqual(idx, -1);
    this.users.splice(idx, 1);
    if (this.users.length === 0) {
      this.close();
    }

    this.engine.removeUser(user.id);
    this.toAll("leave", user);
    this.event({
      type: "removeUser",
      user: user.id,
    });
  }

  // destroy room
  close(): void {
    while (this.users.length > 0) {
      this.leave(this.users[0]);
    }
    this.closeCallback();
  }

  // forward redacted state to client
  reset(user: P.User): void {
    const data = this.engine.redactFor(user.id);
    this.socket.to(user.id).emit("reset", data);
  }

  // process event from client and broadcast
  update(user: P.User, event: P.Event): void {
    const seat = this.engine.seatOf(user.id);
    const publicHand = this.engine.rules.handSize === C.HandSizeRule.PUBLIC;

    this.event(event);

    switch (event.type) {
      case "seatAt":
        this.engine.seatAt(event.user, event.seat);
        this.reset(this.findUser(event.user));
        return;
      case "unseatAt":
        this.engine.unseatAt(event.seat);
        return;
      case "setRules":
        assert.strictEqual(user.id, event.user);
        this.engine.setRules(event.user, event.rules);
        return;
      case "startGame":
        assert.strictEqual(user.id, event.user);
        this.engine.startGame(event.user, event?.shuffle);
        this.event({
          type: "startGameResponse",
          server: null,
          hand: null,
          handSizes: publicHand ? this.engine.handSize : null,
        });
        for (const seat of this.engine.seats) {
          this.toSeat(seat, {
            type: "startGameResponse",
            server: null,
            hand: this.engine.handOf[seat],
            handSizes: publicHand ? this.engine.handSize : null,
          });
        }
        return;
      case "ask":
        assert.strictEqual(seat, event.asker);
        const card = new Card(event.card.cardSuit, event.card.rank);
        this.engine.ask(event.asker, event.askee, card);
        return;
      case "answer":
        assert.strictEqual(seat, event.askee);
        this.engine.answer(event.askee, event.response);
        return;
      case "initDeclare":
        assert.strictEqual(seat, event.declarer);
        this.engine.initDeclare(event.declarer, event.declaredSuit);
        return;
      case "declare":
        assert.strictEqual(seat, event.declarer);
        const correct = this.engine.declare(event.declarer, event.owners);
        this.event({
          type: "declareResponse",
          server: null,
          correct: correct,
          handSizes: publicHand ? this.engine.handSize : null,
        });
        return;
    }
  }
}

export class Server {
  clients: Record<UserID, Socket> = {} as any;
  roomOf: Record<UserID, RoomID> = {} as any;
  rooms: Record<RoomID, Room> = {} as any;
  socket: IOServer;

  constructor(server: HTTPServer) {
    this.socket = new IOServer(server);

    this.socket.on("connect", (client) => {
      this.clients[client.id] = client;

      client.on("join", (room, name) => this.join(client.id, room, name));
      client.on("reset", () => this.reset(client.id));
      client.on("event", (event) => this.event(client.id, event));
      client.on("rename", (name) => this.rename(client.id, name));
      client.on("disconnect", () => this.leave(client.id));
    });
  }

  userAndRoom(
    id: UserID
  ): {
    user: P.User | null;
    room: RoomID | null;
  } {
    const room = this.roomOf[id] ?? null;
    const user = this.rooms[room]?.findUser(id);
    return { user, room };
  }

  join(id: UserID, room: RoomID, name: string): void {
    const user: P.User = { id, name };
    if (this.rooms[room] === undefined) {
      this.rooms[room] = new Room(
        room,
        this.socket,
        () => this.close(room),
        C.defaultRules
      );
    }
    this.clients[id].join(room);
    this.rooms[room].join(user);
    this.roomOf[id] = room;
    this.reset(id);
  }

  reset(id: UserID): void {
    const { user, room } = this.userAndRoom(id);
    this.rooms[room]?.reset(user);
  }

  event(id: UserID, event: P.Event): void {
    const { user, room } = this.userAndRoom(id);
    this.rooms[room]?.update(user, event);
  }

  rename(id: UserID, name: string): void {
    const { user, room } = this.userAndRoom(id);
    this.rooms[room]?.rename(user, name);
  }

  leave(id: UserID): void {
    const { user, room } = this.userAndRoom(id);
    this.rooms[room]?.leave(user);
  }

  close(room: RoomID): void {
    assert.notStrictEqual(this.rooms[room], undefined);
    delete this.rooms[room];
  }
}
