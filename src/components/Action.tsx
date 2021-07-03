import React from "react";

import { fishSuitToString } from "lib/cards";
import { CFish as C } from "lib/cfish";
import { Client } from "lib/client";

export namespace Action {
  export type Props = {
    client: Client;
  };
}

export class Action extends React.Component<Action.Props> {
  renderText(): string {
    const { client } = this.props;
    const { engine } = client;

    if (engine.phase === C.Phase.WAIT) {
      if (engine.numSeated < engine.numPlayers) {
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

  renderButton(): JSX.Element | null {
    const { client } = this.props;
    const { engine } = client;

    if (
      engine.phase === C.Phase.WAIT &&
      engine.identity === engine.host &&
      engine.numSeated === engine.numPlayers
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

  render() {
    const { client } = this.props;
    const { engine } = client;

    return (
      <div className="action">
        <span>{this.renderText()}</span>
        {this.renderButton()}
      </div>
    );
  }
}
