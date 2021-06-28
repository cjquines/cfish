import { assert } from "chai";
import { io, Socket } from "socket.io-client";

import { Engine } from "lib/cfish";
import { Protocol as P } from "lib/protocol";
import { RoomID } from "lib/server";

export class Client {
  engine: Engine | null = null;
  identity: P.User | null = null;
  socket: Socket;
  status: "waiting" | "connected" | "disconnected" = "waiting";
  users: P.User[] = [];

  constructor(readonly url: string, public name: string) {
    this.socket = io(url);
    this.socket.on("connect", () => {
      this.status = "connected";
    });
  }

  join(room: RoomID): void {
    this.socket.emit("");
  }

  leave(): void {}

  rename(): void {}

  // on connect, say hi and don the identity
  // protocol actions are join, leave, rename
  // take reset from above
  // take events from above
  // send events
}
