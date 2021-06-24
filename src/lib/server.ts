import { assert } from "chai";
import { Server as HTTPServer } from "http";
import { Server as IOServer, Socket } from "socket.io";

import { Engine } from "lib/cfish";
import { Protocol as P } from "lib/protocol";

export type RoomID = string;
export type UserID = string;

export class Room {
  engine: Engine;
  users: P.User[] = [];

  constructor(
    readonly id: RoomID,
    readonly socket: Socket,
    private closeCallback: (RoomID) => void,
    numPlayers: number
  ) {
    this.engine = new Engine(numPlayers);
  }

  // protocol actions
  // take client, broadcast P.User to client
  join(): void {}
  // remove client and broadcast
  kick(): void {}
  // rename client and broadcast
  rename(): void {}
  // destroy room
  close(): void {}

  // forward redacted state to client
  reset(): void {}
  // process event from client and broadcast
  update(): void {}
}

export class Server {
  clients: Record<UserID, Socket> = {} as any;
  roomOf: Record<UserID, Room> = {} as any;
  rooms: Record<RoomID, Room> = {} as any;
  socket: IOServer;

  constructor(server: HTTPServer) {
    this.socket = new IOServer(server);

    this.socket.on("connect", (socket) => {
      this.clients[socket.id] = socket;
      console.log(`join client ${socket.id}`);

      socket.on("join", (room) => this.join(socket.id, room));
      socket.on("rename", (name) => this.rename(socket.id, name));
      socket.on("event", (event) => this.event(socket.id, event));
      socket.on("disconnect", () => this.disconnect(socket.id));
    });
  }

  join(user: UserID, room: RoomID): void {}
  event(user: UserID, event: P.Event): void {}
  rename(user: UserID, name: string): void {}
  disconnect(user: UserID): void {}
  close(room: RoomID): void {}
}
