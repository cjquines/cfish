import React from "react";

import { CardSelector } from "components/CardSelector";
import { Card } from "lib/cards";
import { CFish as C, SeatID } from "lib/cfish";
import { Client } from "lib/client";

export namespace Players {
  export type Props = {
    client: Client;
  };

  export type State = {
    askee: number | null;
  };
}

export class Players extends React.Component<Players.Props, Players.State> {
  constructor(props) {
    super(props);

    this.state = {
      askee: null,
    };
  }

  renderSeatBtn(seat: SeatID) {
    const { client } = this.props;
    const { engine } = client;

    if (
      (engine.ownSeat !== null && engine.ownSeat !== seat) ||
      (engine.ownSeat === null && engine.userOf[seat] !== null)
    )
      return null;

    return engine.ownSeat !== null ? (
      <button onClick={(e) => client.unseatAt()}>stand up</button>
    ) : (
      <button onClick={(e) => client.seatAt(seat)}>sit down</button>
    );
  }

  renderAskBtn(seat: SeatID) {
    const { client } = this.props;
    const { engine } = client;

    return engine.phase === C.Phase.ASK &&
      engine.asker === engine.ownSeat &&
      engine.teamOf(seat) !== engine.teamOf(engine.ownSeat) ? (
      <button onClick={(e) => this.setState({ askee: seat })}>ask</button>
    ) : null;
  }

  renderCardSelector(seat: SeatID) {
    const { client } = this.props;
    const { engine } = client;

    const callback = (card) => {
      client.ask(seat, card);
      this.setState({ askee: null });
    };
    const disabled =
      engine.rules.bluff === C.BluffRule.YES ? [] : engine.ownHand.cards;
    const suits = Card.FISH_SUITS.filter((suit) =>
      engine.ownHand?.hasSuit(suit)
    );

    return this.state.askee === seat ? (
      <CardSelector
        callback={callback}
        close={() => this.setState({ askee: null })}
        disabled={disabled}
        suits={suits}
      />
    ) : null;
  }

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
              {`${client.nameOf(seat) ?? "empty"} (${
                engine.handSize[seat] === null ? "???" : engine.handSize[seat]
              })`}
              {this.renderSeatBtn(seat)}
              {this.renderAskBtn(seat)}
              {this.renderCardSelector(seat)}
            </div>
          </div>
        ))}
      </div>
    );
  }
}
