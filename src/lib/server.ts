import { assert } from "chai";
import { Server as HTTPServer } from "http";
import { Server as IOServer } from "socket.io";

import { Engine } from "lib/cfish";

export type UserID = string;

export class Room {
  engine: Engine;
}

export class Server {
  socket: IOServer;

  constructor(server: HTTPServer) {
    this.socket = new IOServer(server);
    this.socket.on("connect", () => {});
  }
}
