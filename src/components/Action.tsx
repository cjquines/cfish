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

    if (engine.phase === C.Phase.WAIT) {
      if (engine.numSeated < engine.rules.numPlayers) {
        return "waiting for all players to be seated";
      }
      if (engine.identity === engine.host) {
        return "";
      }
      return `waiting for ${client.nameOf(engine.host)} to start the game`;
    }

    if (engine.phase === C.Phase.ASK) {
      if (engine.lastResponse === "good declare") {
        return `${client.nameOf(
          engine.declarer
        )} correctly declared ${fishSuitToString(engine.declaredSuit)}`;
      }
      if (engine.lastResponse === "bad declare") {
        return `${client.nameOf(
          engine.declarer
        )} incorrectly declared ${fishSuitToString(engine.declaredSuit)}`;
      }
      if (engine.ownSeat === engine.asker) {
        return "ask someone";
      }
      if (engine.lastResponse === "good ask") {
        return `${client.nameOf(
          engine.askee
        )} gave the ${engine.askedCard.toString()} to ${client.nameOf(
          engine.asker
        )}`;
      }
      if (engine.lastResponse === "bad ask") {
        return `${client.nameOf(
          engine.askee
        )} did not have the ${engine.askedCard.toString()}`;
      }
      return `${client.nameOf(engine.asker)} is choosing someone to ask`;
    }

    if (engine.phase === C.Phase.ANSWER) {
      if (engine.ownSeat === engine.askee) {
        return `${client.nameOf(
          engine.asker
        )} asks: do you have the ${engine.askedCard.toString()}?`;
      }
      return `${client.nameOf(engine.asker)} asks ${client.nameOf(
        engine.askee
      )} for the ${engine.askedCard.toString()}`;
    }

    if (engine.phase === C.Phase.DECLARE) {
      if (engine.ownSeat === engine.declarer) {
        return `declaring ${fishSuitToString(engine.declaredSuit)}`;
      }
      return `${client.nameOf(engine.declarer)} is declaring ${fishSuitToString(
        engine.declaredSuit
      )}`;
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
      return <button onClick={(e) => client.answer(true)}>yes</button>;
    }

    if (
      engine.phase === C.Phase.ANSWER &&
      engine.ownSeat === engine.askee &&
      !engine.handOf[engine.ownSeat]?.includes(engine.askedCard)
    ) {
      return <button onClick={(e) => client.answer(false)}>no</button>;
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

    if (engine.phase !== C.Phase.ASK) return null;

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

    const users = client.users.filter(
      (user) =>
        engine.teamOf(engine.seatOf(user.id)) === engine.teamOf(engine.declarer)
    );

    return (
      <DeclareSelector
        callback={(owners) => client.declare(owners)}
        seatOf={(user) => engine.seatOf(user)}
        suit={engine.declaredSuit}
        users={users}
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
          {this.renderDeclareSelector()}
        </div>
      </div>
    );
  }
}
