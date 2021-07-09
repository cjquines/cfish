import React from "react";

import { fishSuitToString } from "lib/cards";
import { CFish as C } from "lib/cfish";
import { Client } from "lib/client";
import { DeclareSelector } from "components/DeclareSelector";
import { SuitSelector } from "components/SuitSelector";

export namespace Action {
  export type Props = {
    client: Client;
  };

  export type State = {
    declaring: boolean;
  };
}

export class Action extends React.Component<Action.Props, Action.State> {
  constructor(props) {
    super(props);

    this.state = {
      declaring: false,
    };
  }

  renderText(): string {
    const { client } = this.props;
    const { engine } = client;
    const sfy = (key) => client.stringify(key);

    if (engine.phase === C.Phase.WAIT) {
      if (engine.numSeated < engine.rules.numPlayers) {
        return "waiting for all players to be seated";
      }
      if (engine.identity === engine.host) {
        return "";
      }
      return `waiting for ${client.nameOf(engine.host)} to start the game`;
    }

    if (client.log.length > 0) {
      return client.log[client.log.length - 1];
    }

    if (engine.phase === C.Phase.ASK) {
      return `${sfy("asker")} ${sfy("asker") === "you" ? "are" : "is"} asking`;
    } else if (engine.phase === C.Phase.ANSWER) {
      return `${sfy("asker")} asked ${sfy("askee")} for the ${sfy(
        "askedCard"
      )}`;
    } else if (engine.phase === C.Phase.DECLARE) {
      return `${sfy("declarer")} began declaring ${sfy("declaredSuit")}`;
    }

    return "";
  }

  renderTopButton(): JSX.Element | null {
    const { client } = this.props;
    const { engine } = client;

    if (
      engine.phase === C.Phase.WAIT &&
      engine.identity === engine.host &&
      engine.numSeated === engine.rules.numPlayers
    ) {
      return <button onClick={(e) => client.startGame()}>start game</button>;
    }

    if (
      engine.phase === C.Phase.ANSWER &&
      engine.ownSeat === engine.askee &&
      engine.handOf[engine.ownSeat]?.includes(engine.askedCard)
    ) {
      return <button onClick={(e) => client.answer(true)}>give card</button>;
    }

    if (
      engine.phase === C.Phase.ANSWER &&
      engine.ownSeat === engine.askee &&
      !engine.handOf[engine.ownSeat]?.includes(engine.askedCard)
    ) {
      return <button onClick={(e) => client.answer(false)}>say no</button>;
    }

    return null;
  }

  renderSortButton(): JSX.Element | null {
    const { client } = this.props;
    const { engine } = client;

    if (!engine.ownHand?.size) return null;

    const onClick = (e) => {
      engine.ownHand.sort();
      client.onUpdate(client);
    };

    return <button onClick={onClick}>sort</button>;
  }

  renderDeclareButton(): JSX.Element | null {
    const { client } = this.props;
    const { engine } = client;

    if (engine.ownSeat === null) return null;
    if (engine.phase !== C.Phase.ASK) return null;
    if (
      engine.rules.declare === C.DeclareRule.DURING_TURN &&
      engine.ownSeat !== engine.asker
    )
      return null;

    const onClick = (e) => this.setState({ declaring: true });

    return <button onClick={onClick}>declare</button>;
  }

  renderSuitSelector(): JSX.Element | null {
    const { client } = this.props;
    const { engine } = client;

    if (!this.state.declaring) return null;

    const close = () => this.setState({ declaring: false });
    const callback = (suit) => {
      client.initDeclare(suit);
      this.setState({ declaring: false });
    };

    return <SuitSelector callback={callback} close={close} />;
  }

  renderDeclareSelector(): JSX.Element | null {
    const { client } = this.props;
    const { engine } = client;

    if (engine.phase !== C.Phase.DECLARE || engine.ownSeat !== engine.declarer)
      return null;

    const seats = engine.seats.filter(
      (seat) => engine.teamOf(seat) === engine.teamOf(engine.declarer)
    );

    return (
      <DeclareSelector
        callback={(owners) => client.declare(owners)}
        client={client}
        suit={engine.declaredSuit}
        seats={seats}
      />
    );
  }

  render() {
    const { client } = this.props;
    const { engine } = client;

    return (
      <div className="action">
        <div>
          {this.renderText()} {this.renderTopButton()}
        </div>
        <div>
          {this.renderSortButton()}
          {this.renderDeclareButton()}
          {this.renderSuitSelector()}
        </div>
      </div>
    );
  }
}
