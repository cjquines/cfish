import React from "react";

import { CardArea } from "components/CardArea";
import { Card, FishSuit } from "lib/cards";
import { CFish as C, SeatID } from "lib/cfish";
import { Client } from "lib/client";

export namespace DeclareSelector {
  export type Props = {
    callback: (owners: Record<string, SeatID>) => void;
  };
}

export class DeclareSelector extends React.Component<DeclareSelector.Props> {
  render() {
    return <div>TODO</div>;
  }
}

export namespace SuitSelector {
  export type Props = {
    callback: (suit: FishSuit) => void;
    close: () => void;
  };
}

export class SuitSelector extends React.Component<SuitSelector.Props> {
  render() {
    return (
      <div className="suitSelector">
        {Card.FISH_SUITS.map((suit) => (
          <button onClick={(e) => this.props.callback(suit)}>
            {suit.toString()}
          </button>
        ))}
        <button onClick={(e) => this.props.close()}>close</button>
      </div>
    );
  }
}

export namespace PlayArea {
  export type Props = {
    client: Client;
  };

  export type State = {
    declaring: boolean;
  };
}

export class PlayArea extends React.Component<PlayArea.Props, PlayArea.State> {
  constructor(props) {
    super(props);

    this.state = {
      declaring: false,
    };
  }

  render() {
    const { client } = this.props;
    const { engine } = client;

    return (
      <div className="playArea">
        {engine.ownHand.size ? (
          <button
            onClick={(e) => {
              engine.ownHand.sort();
              client.onUpdate(client);
            }}
          >
            sort
          </button>
        ) : null}
        {engine.phase === C.Phase.ASK ? (
          <button onClick={(e) => this.setState({ declaring: true })}>
            declare
          </button>
        ) : null}
        {this.state.declaring ? (
          <SuitSelector
            callback={(suit) => {
              client.initDeclare(suit);
              this.setState({ declaring: false });
            }}
            close={() => this.setState({ declaring: false })}
          />
        ) : null}
        {engine.phase === C.Phase.DECLARE &&
        engine.ownSeat === engine.declarer ? (
          <DeclareSelector callback={(owners) => client.declare(owners)} />
        ) : null}
        <CardArea client={client} />
      </div>
    );
  }
}
