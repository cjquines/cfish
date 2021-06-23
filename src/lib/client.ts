import { assert } from "chai";
import { io, Socket } from "socket.io-client";

import { Engine } from "lib/cfish";
import { Protocol as P } from "lib/protocol";

export class Client {
  engine: Engine | null = null;
  me: P.User | null = null;
  status: "waiting" | "connected" | "disconnected" = "waiting";
  socket: Socket;
  users: P.User[] = [];

  constructor(readonly url: string, public name: string) {
    this.socket = io(url);
    this.socket.on("connect", () => {
      this.status = "connected";
    });
  }

  connect(): void {
    this.status = "connected";
    this.socket.on("event", (event: P.Event) => {
      switch (event.type) {
        case "addUser":
          return this.addUser(event);
      }
    });
  }

  addUser(event: P.AddUser): void {}
}
