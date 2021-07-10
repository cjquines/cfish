import { should } from "chai";
import "chai/register-should";
import { createServer } from "http";

import * as C from "./common";
import { CFish } from "lib/cfish";
import { Client } from "lib/client";
import { Server } from "lib/server";

describe("Client/Server", () => {
  let clients: Client[] = [],
    server,
    url;

  before((done) => {
    const http = createServer();
    server = new Server(http);
    http.listen(() => {
      const port = (http.address() as any).port;
      url = `http://localhost:${port}`;
      clients.push(new Client(url, "test" as any, "a"));
      clients[0].connect();
      clients[0].socket.on("connect", () => done());
    });
  });

  it("connects", (done) => {
    let run = false;
    clients[0].socket.on("join", () => {
      if (run) return;

      clients[0].identity.name.should.equal("a");
      server.rooms["test"].id.should.equal("test");

      run = true;
      done();
    });
  });

  it("has rooms", (done) => {
    clients[0].socket.on("test", (msg) => {
      msg.should.equal("hi");
      done();
    });
    server.rooms["test"].toAll("test", "hi");
  });

  it("connects more clients", (done) => {
    let count = 1;
    clients[0].socket.on("join", () => {
      if (count === 6) return;
      count += 1;
      if (count === 6) done();
    });

    clients.push(new Client(url, "test" as any, "b"));
    clients.push(new Client(url, "test" as any, "c"));
    clients.push(new Client(url, "test" as any, "d"));
    clients.push(new Client(url, "test" as any, "e"));
    clients.push(new Client(url, "test" as any, "f"));
    for (let i = 1; i < 6; i++) {
      clients[i].connect();
    }
  });

  it("changes rules", (done) => {
    let run = false;
    clients[1].socket.on("event", (event) => {
      if (run) return;
      run = true;
      done();
    });

    clients[0].setRules({
      ...clients[0].engine.rules,
      bluff: CFish.BluffRule.YES,
      declare: CFish.DeclareRule.DURING_TURN,
    });
  });

  it("starts games", (done) => {
    let count = 0;
    clients[0].socket.on("event", (event) => {
      if (event.type !== "seatAt") return;
      count += 1;
      if (count !== 6) return;
      clients[0].startGame(false);
    });

    let count1 = 0;
    clients[0].socket.on("event", (event) => {
      if (event.type !== "startGameResponse") return;
      count1 += 1;
      if (count1 !== 2) return;
      done();
    });

    for (let i = 0; i < 6; i++) {
      clients[i].attempt({
        type: "seatAt",
        user: clients[i].identity.id,
        seat: i,
      });
    }
  });

  it("runs a question", (done) => {
    let run = false;
    clients[0].socket.on("event", (event) => {
      if (run) return;
      run = true;
      done();
    });

    clients[0].attempt({
      type: "ask",
      asker: 0,
      askee: 1,
      card: C.C_3,
    });
  });

  it("runs an answer", (done) => {
    let run = false;
    clients[2].socket.on("event", (event) => {
      if (run) return;
      run = true;
      done();
    });

    clients[1].attempt({
      type: "answer",
      askee: 1,
      response: true,
    });
  });

  it("enforces rules", (done) => {
    let run = false;
    clients[0].socket.on("event", (event) => {
      if (run) return;
      run = true;
      done();
    });

    // allowing bluffs
    clients[0].engine.handOf[0].cards[0].should.deep.equal(C.C_2);
    clients[0].attempt({
      type: "ask",
      asker: 0,
      askee: 1,
      card: C.C_2,
    });
  });

  it("runs an answer correctly", () => {
    clients[0].engine.handOf[0].cards[9].should.deep.equal(C.C_3);
    clients[1].engine.handOf[1].cards[0].should.deep.equal(C.C_9);
    clients[2].engine.handSize[0].should.equal(10);
    clients[2].engine.handSize[1].should.equal(8);
  });
});
