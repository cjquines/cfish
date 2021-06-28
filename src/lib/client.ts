import { assert } from "chai";
import { io, Socket } from "socket.io-client";

import { Data, Engine } from "lib/cfish";
import { Protocol as P } from "lib/protocol";
import { RoomID } from "lib/server";

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

  join(user: P.User): void {
    // is this me? if so, don and init engine
  }

  rename(user: P.User, name: string): void {}

  leave(user: P.User): void {}

  // get redacted state and initiate engine
  reset(data: Data): void {}

  // process event from server
  update(event: P.Event): void {}

  // attempt to enact an event
  attempt(event: P.Event): void {
    // we don't need to apply it to our own engine; server will update us
  }
}
