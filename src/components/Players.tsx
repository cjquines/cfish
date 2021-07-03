import React from "react";

import { Card, genDeck } from "lib/cards";
import { CFish as C } from "lib/cfish";
import { Client } from "lib/client";

export namespace CardSelector {
  export type Props = {
    callback: (card: Card) => void;
    close: () => void;
  };
}

export class CardSelector extends React.Component<CardSelector.Props> {
  render() {
    return (
      <div className="cardSelector">
        {[...genDeck()].map((card) => (
          <button onClick={(e) => this.props.callback(card)}>
            {card.toString()}
          </button>
        ))}
        <button onClick={(e) => this.props.close()}>cancel</button>
      </div>
    );
  }
}

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
              {`${client.nameOf(seat) ?? "empty"} (${engine.handSize[seat]})`}
              {engine.ownSeat !== null ? (
                engine.ownSeat === seat ? (
                  <button onClick={(e) => client.unseatAt()}>stand up</button>
                ) : null
              ) : engine.userOf[seat] !== null ? null : (
                <button onClick={(e) => client.seatAt(seat)}>sit down</button>
              )}
              {engine.phase === C.Phase.ASK &&
              engine.asker === engine.ownSeat &&
              engine.teamOf(seat) !== engine.teamOf(engine.ownSeat) ? (
                <button onClick={(e) => this.setState({ askee: seat })}>
                  ask
                </button>
              ) : null}
              {this.state.askee === seat ? (
                <CardSelector
                  callback={(card) => {
                    client.ask(seat, card);
                    this.setState({ askee: null });
                  }}
                  close={() => this.setState({ askee: null })}
                />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    );
  }
}
