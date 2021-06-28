import { should } from "chai";
import "chai/register-should";
import { createServer } from "http";

import * as C from "./common";
import { Client } from "lib/client";
import { Server } from "lib/server";

describe("Client/Server", () => {
  let clients = [],
    server,
    url;

  before((done) => {
    const http = createServer();
    server = new Server(http);
    http.listen(() => {
      const port = (http.address() as any).port;
      url = `http://localhost:${port}`;
      clients.push(new Client(url, "test", "a"));
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
    clients.push(new Client(url, "test", "b"));
    clients.push(new Client(url, "test", "c"));
    clients.push(new Client(url, "test", "d"));
    clients.push(new Client(url, "test", "e"));
    clients.push(new Client(url, "test", "f"));

    let count = 1;
    clients[0].socket.on("join", () => {
      if (count === 6) return;
      count += 1;
      if (count === 6) done();
    });
  });

  it("starts games", (done) => {
    let count = 0;
    clients[0].socket.on("event", (event) => {
      if (event.type !== "seatAt") return;
      count += 1;
      if (count !== 6) return;
      clients[0].attempt({
        type: "startGame",
        seat: 0,
        shuffle: false,
      });
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
      console.log(event);
      run = true;
      console.log(clients[0].engine.toString());
      done();
    });

    clients[0].engine.handOf[0].cards[0].should.deep.equal(C.C_2);
    clients[0].attempt({
      type: "ask",
      asker: 0,
      askee: 1,
      card: C.C_3,
    });
  });
});
