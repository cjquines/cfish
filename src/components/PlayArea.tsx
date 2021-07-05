import React from "react";

import { CardArea } from "components/CardArea";
import { DeclareSelector } from "components/DeclareSelector";
import { SuitSelector } from "components/SuitSelector";
import { Card, FishSuit, fishSuitToString } from "lib/cards";
import { CFish as C } from "lib/cfish";
import { Client } from "lib/client";

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
        {engine.ownHand?.size ? (
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
          <DeclareSelector
            callback={(owners) => client.declare(owners)}
            seatOf={(user) => engine.seatOf(user)}
            suit={engine.declaredSuit}
            users={client.users.filter(
              (user) =>
                engine.teamOf(engine.seatOf(user.id)) ===
                engine.teamOf(engine.declarer)
            )}
          />
        ) : null}
        <CardArea client={client} />
      </div>
    );
  }
}
