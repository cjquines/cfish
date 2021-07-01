import React from "react";

import { Client } from "lib/client";

export namespace Players {
  export type Props = {
    client: Client;
  };
}

export class Players extends React.Component<Players.Props> {
  render() {
    const { client } = this.props;
    const { engine, users } = client;

    // TODO rotate seats?
    return (
      <div className="players">
        <p>users: {users.map((user) => user.name).join(", ")}</p>
        {engine.seats.map((seat) => (
          <div className="player" key={seat}>
            <div className="playerInt">
              {`${client.nameOf(engine.userOf[seat]) ?? "empty"} (${
                engine.handSize[seat]
              })`}
              {engine.ownSeat !== null ? (
                engine.ownSeat === seat ? (
                  <button onClick={(e) => client.unseatAt()}>stand up</button>
                ) : null
              ) : engine.userOf[seat] !== null ? null : (
                <button onClick={(e) => client.seatAt(seat)}>sit down</button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
}
