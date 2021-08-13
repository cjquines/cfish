import React, { useState } from "react";
import { usePopper } from "react-popper";

import { LogItem } from "components/Log";
import { SuitSelector } from "components/SuitSelector";
import { Card, fishSuitToString } from "lib/cards";
import { CFish as C } from "lib/cfish";
import { Client } from "lib/client";

const ActionInt = (props: {
  declareBtn: JSX.Element | null;
  sortBtn: JSX.Element | null;
  suitSelector: (update: () => void) => JSX.Element | null;
}) => {
  const [outRef, setOutRef] = useState<HTMLElement>(null);
  const [inRef, setInRef] = useState<HTMLElement>(null);
  const { styles, attributes, update } = usePopper(outRef, inRef, {
    placement: "bottom",
  });

  return (
    <div className="actionInt" ref={setOutRef}>
      {props.sortBtn}
      {props.declareBtn}
      <div
        className="popWrap"
        ref={setInRef}
        style={styles.popper}
        {...attributes.popper}
      >
        {props.suitSelector(update)}
      </div>
    </div>
  );
};

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

  renderText() {
    const { client } = this.props;
    const { engine } = client;
    const sfy = (key) => {
      const res = client.stringify(key);
      return res.length > 12 ? res.slice(0, 10).concat("...") : res;
    };

    if (engine.winner !== null && client.log.length > 0) {
      return client.log[client.log.length - 1];
    } else if (engine.phase === C.Phase.WAIT) {
      if (engine.numSeated < engine.rules.numPlayers) {
        return "waiting for all players to be seated";
      }
      if (engine.identity === engine.host) {
        return "";
      }
      return `waiting for ${sfy("host")} to start the game`;
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

  renderTopButton() {
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

  renderSortButton() {
    const { client } = this.props;
    const { engine } = client;

    if (!engine.ownHand?.size) return null;

    const onClick = (e) => {
      engine.ownHand.sort();
      client.onUpdate(client);
    };

    return <button onClick={onClick}>sort</button>;
  }

  renderDeclareButton() {
    const { client } = this.props;
    const { engine } = client;

    if (
      engine.ownSeat === null ||
      (engine.phase !== C.Phase.ASK && engine.phase !== C.Phase.PASS) ||
      (engine.rules.declare === C.DeclareRule.DURING_TURN &&
        engine.ownSeat !== engine.asker &&
        engine.handSize[engine.asker] !== 0)
    )
      return null;

    const isDeclare = this.state.declaring === false;
    const text = isDeclare ? "declare" : "cancel";
    const declaring = isDeclare ? true : false;

    return (
      <button onClick={(e) => this.setState({ declaring })}>{text}</button>
    );
  }

  renderSuitSelector(update: () => void) {
    const { client } = this.props;
    const { engine } = client;

    if (!this.state.declaring) return null;

    const callback = (suit) => {
      client.initDeclare(suit);
      this.setState({ declaring: false });
    };
    const close = () => this.setState({ declaring: false });
    const disabled = Card.FISH_SUITS.filter(
      (suit) => engine.declarerOf[suit] !== undefined
    );

    return (
      <SuitSelector
        callback={callback}
        close={close}
        disabled={disabled}
        update={update}
      />
    );
  }

  render() {
    const { client } = this.props;
    const { engine } = client;

    return (
      <div className="action">
        <div>
          <LogItem item={this.renderText()} /> {this.renderTopButton()}
        </div>
        <ActionInt
          declareBtn={this.renderDeclareButton()}
          sortBtn={this.renderSortButton()}
          suitSelector={(update) => this.renderSuitSelector(update)}
        />
      </div>
    );
  }
}
