import { should } from "chai";
import "chai/register-should";

import { Engine } from "lib/cfish";

describe("Engine", () => {
  it("handles seating", () => {
    const engine = new Engine(6);
    engine.addUser("a");
    engine.addUser("b");
    engine.addUser("c");
    engine.addUser("d");
    engine.addUser("e");
    engine.addUser("f");

    (() => engine.addUser("a")).should.throw();
    (() => engine.removeUser("g")).should.throw();

    engine.addUser("g");
    engine.removeUser("g");

    engine.users.size.should.equal(6);

    engine.seatAt("a", 0);
    engine.seatAt("b", 1);
    engine.seatAt("c", 2);
    engine.seatAt("d", 3);
    engine.seatAt("e", 4);

    (() => engine.seatAt("f", 0)).should.throw();
    (() => engine.seatAt("f", 6)).should.throw();
    (() => engine.seatAt("a", 1)).should.throw();
    (() => engine.seatAt("g", 5)).should.throw();
    (() => engine.startGame(0)).should.throw();

    engine.unseatAt(0);
    engine.seatAt("a", 0);
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
    engine.startGame(2);
  });
});
