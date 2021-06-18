import { should } from "chai";
import "chai/register-should";

import { Card, CardSuit, Rank } from "lib/cards";
import { Engine } from "lib/cfish";

describe("Engine", () => {
  const filledEngine = () => {
    const engine = new Engine(6);
    ["a", "b", "c", "d", "e", "f"].forEach((user, seat) => {
      engine.addUser(user);
      engine.seatAt(user, seat);
    });
    return engine;
  };

  it("handles seating", () => {
    const engine = filledEngine();

    (() => engine.addUser("a")).should.throw();
    (() => engine.removeUser("g")).should.throw();

    engine.addUser("g");
    engine.removeUser("g");
    engine.unseatAt(5);

    engine.users.size.should.equal(6);
    (() => engine.seatAt("f", 0)).should.throw();
    (() => engine.seatAt("f", 6)).should.throw();
    (() => engine.seatAt("a", 1)).should.throw();
    (() => engine.seatAt("g", 5)).should.throw();

    engine.seatAt("f", 5);
    engine.removeUser("a");
    engine.removeUser("b");

    engine.users.size.should.equal(4);
    engine.numSeated().should.equal(4);
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
    const engine = filledEngine();

    engine.startGame(0, false);
    engine.asker.should.equal(0);
    // some nicer stringification should be nice
    console.log(engine.toString());

    (() => engine.ask(0, 1, new Card(CardSuit.CLUBS, Rank.R2))).should.throw;

    engine.ask(0, 1, new Card(CardSuit.CLUBS, Rank.R3));
  });

  // handles removing/adding during a game
  // also somehow test protocol
});
