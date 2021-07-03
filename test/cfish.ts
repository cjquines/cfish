import { should } from "chai";
import "chai/register-should";

import * as C from "./common";
import { FishSuit, genFishSuit } from "lib/cards";
import { CFish, Engine } from "lib/cfish";

describe("Engine", () => {
  let engine;

  beforeEach(() => {
    engine = new Engine(6);
    ["a", "b", "c", "d", "e", "f"].forEach((user, seat) => {
      engine.addUser(user);
      engine.seatAt(user, seat);
    });
  });

  it("handles seating", () => {
    (() => engine.addUser("a")).should.throw();
    (() => engine.removeUser("g")).should.throw();

    engine.addUser("g");
    engine.removeUser("g");
    engine.unseatAt(5);

    engine.users.length.should.equal(6);
    (() => engine.seatAt("f", 0)).should.throw();
    (() => engine.seatAt("f", 6)).should.throw();
    (() => engine.seatAt("a", 1)).should.throw();
    (() => engine.seatAt("g", 5)).should.throw();

    engine.seatAt("f", 5);
    engine.removeUser("a");
    engine.removeUser("b");

    engine.users.length.should.equal(4);
    engine.numSeated.should.equal(4);
    engine.host.should.equal("c");
    engine.seats.should.deep.equal([2, 3, 4, 5, 0, 1]);
    (() => engine.startGame(0)).should.throw();

    engine.addUser("a");
    engine.seatAt("a", 0);
    engine.addUser("b");
    engine.seatAt("b", 1);

    (() => engine.startGame(0)).should.throw();

    engine.startGame(2);

    (() => engine.startGame(2)).should.throw();
  });

  it("runs a basic game", () => {
    engine.startGame(0, false);
    engine.asker.should.equal(0);

    (() => engine.ask(1, 0, C.C_2)).should.throw;
    (() => engine.ask(0, 1, C.C_2)).should.throw;
    (() => engine.ask(0, 2, C.C_3)).should.throw;
    engine.ask(0, 1, C.C_3);
    (() => engine.answer(1, false)).should.throw;
    engine.answer(1, true);
    engine.lastResponse.should.equal("good ask");

    engine.ask(0, 1, C.C_4);
    (() => engine.answer(1, true)).should.throw;
    engine.answer(1, false);
    engine.lastResponse.should.equal("bad ask");

    (() => engine.ask(1, 0, C.C_2)).should.throw;
    engine.ask(1, 0, C.C_A);
    (() => engine.answer(1, true)).should.throw;
    engine.answer(0, true);

    engine.ask(1, 2, C.C_10);
    engine.answer(2, true);
    engine.ask(1, 4, C.C_Q);
    (() => engine.initDeclare(3, FishSuit.HIGH_CLUBS)).should.throw;
    engine.answer(4, true);

    let owners = {};
    engine.initDeclare(3, FishSuit.HIGH_CLUBS);
    (() => engine.declare(3, owners)).should.throw;
    owners[String(C.C_9)] = 1;
    owners[String(C.C_10)] = 1;
    owners[String(C.C_Q)] = 1;
    owners[String(C.C_A)] = 1;
    (() => engine.declare(3, owners)).should.throw;
    owners[String(C.C_J)] = 3;
    owners[String(C.C_K)] = 4;
    (() => engine.declare(3, owners)).should.throw;
    owners[String(C.C_K)] = 5;
    engine.declare(3, owners);

    engine.lastResponse.should.equal("good declare");
    engine.scoreOf(0).should.equal(0);
    engine.scoreOf(1).should.equal(1);

    owners = {};
    (() => engine.initDeclare(3, FishSuit.HIGH_CLUBS)).should.throw;

    const trashDeclare = (declarer, suit, owner) => {
      engine.initDeclare(declarer, suit);
      for (const card of genFishSuit(suit)) {
        owners[String(card)] = owner;
      }
      engine.declare(declarer, owners);
    };
    trashDeclare(3, FishSuit.LOW_CLUBS, 1);

    engine.lastResponse.should.equal("bad declare");
    engine.scoreOf(0).should.equal(1);
    engine.scoreOf(1).should.equal(1);

    trashDeclare(0, FishSuit.LOW_DIAMONDS, 0);
    trashDeclare(1, FishSuit.HIGH_DIAMONDS, 1);
    trashDeclare(0, FishSuit.LOW_SPADES, 0);
    trashDeclare(1, FishSuit.HIGH_SPADES, 1);
    trashDeclare(0, FishSuit.LOW_HEARTS, 0);
    trashDeclare(1, FishSuit.HIGH_HEARTS, 1);

    engine.scoreOf(0).should.equal(4);
    engine.scoreOf(1).should.equal(4);

    trashDeclare(0, FishSuit.EIGHTS, 0);

    engine.phase.should.equal(CFish.Phase.FINISH);
  });

  it("runs a game with people added/removed", () => {
    engine.startGame(0, false);
    engine.addUser("g");
    engine.unseatAt(5);
  });
});
