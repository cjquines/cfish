import { assert } from "chai";
import { Server as HTTPServer } from "http";
import { Server as IOServer, Socket } from "socket.io";

import { Engine, SeatID } from "lib/cfish";
import { Protocol as P } from "lib/protocol";

export type RoomID = string;
export type UserID = string;

export class Room {
  engine: Engine;
  users: P.User[] = [];

  constructor(
    readonly id: RoomID,
    readonly socket: IOServer,
    public closeCallback: (RoomID) => void,
    numPlayers: number
  ) {
    this.engine = new Engine(numPlayers);
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
    this.closeCallback(this.id);
  }

  // forward redacted state to client
  reset(user: P.User): void {
    const data = this.engine.redactFor(user.id);
    this.socket.to(user.id).emit("reset", data);
  }

  // process event from client and broadcast
  update(user: P.User, event: P.Event): void {
    this.event(event);
    switch (event.type) {
      case "seatAt":
        this.engine.seatAt(event.user, event.seat);
        this.reset(this.findUser(event.user));
        return;
      case "unseatAt":
        this.engine.unseatAt(event.seat);
        return;
      case "startGame":
        this.engine.startGame(event.seat);
        this.event({
          type: "startGameResponse",
          server: null,
          hand: null,
          handSizes: this.engine.handSize,
        });
        for (const seat of this.engine.seats) {
          this.toSeat(seat, {
            type: "startGameResponse",
            server: null,
            hand: this.engine.handOf[seat],
            handSizes: this.engine.handSize,
          });
        }
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
        const correct = this.engine.declare(event.declarer, event.owners);
        this.event({
          type: "declareResponse",
          server: null,
          correct: correct,
          handSizes: this.engine.handSize,
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
      console.log(`join client ${client.id}`);

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
    user: P.User;
    room: RoomID;
  } {
    const room = this.roomOf[id];
    assert.notStrictEqual(this.rooms[room], undefined);
    const user = this.rooms[room].findUser(id);
    assert.notStrictEqual(user, null);
    return { user, room };
  }

  join(id: UserID, room: RoomID, name: string): void {
    const user: P.User = { id, name };
    if (this.rooms[room] === undefined) {
      this.rooms[room] = new Room(room, this.socket, this.close, 6);
    }
    this.clients[id].join(room);
    this.rooms[room].join(user);
    this.roomOf[id] = room;
  }

  reset(id: UserID): void {
    const { user, room } = this.userAndRoom(id);
    this.rooms[room].reset(user);
  }

  event(id: UserID, event: P.Event): void {
    const { user, room } = this.userAndRoom(id);
    this.rooms[room].update(user, event);
  }

  rename(id: UserID, name: string): void {
    const { user, room } = this.userAndRoom(id);
    this.rooms[room].rename(user, name);
  }

  leave(id: UserID): void {
    const { user, room } = this.userAndRoom(id);
    this.rooms[room].leave(user);
  }

  close(room: RoomID): void {
    assert.notStrictEqual(this.rooms[room], undefined);
    delete this.rooms[room];
  }
}
