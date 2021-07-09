import React, { useState } from "react";
import { usePopper } from "react-popper";

import { CardSelector } from "components/CardSelector";
import { Card } from "lib/cards";
import { CFish as C, SeatID } from "lib/cfish";
import { Client } from "lib/client";

const PlayerInt = (props: {
  askBtn: JSX.Element | null;
  cardSelector: (update: () => void) => JSX.Element | null;
  name: string;
  seatBtn: JSX.Element | null;
}) => {
  const [outRef, setOutRef] = useState<HTMLElement>(null);
  const [inRef, setInRef] = useState<HTMLElement>(null);
  const { styles, attributes, update } = usePopper(outRef, inRef, {
    placement: "bottom",
  });

  return (
    <div className="playerInt" ref={setOutRef}>
      {props.name}
      {props.seatBtn}
      {props.askBtn}
      <div
        className="popWrap"
        ref={setInRef}
        style={styles.popper}
        {...attributes.popper}
      >
        {props.cardSelector(update)}
      </div>
    </div>
  );
};

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

  renderName(seat: SeatID) {
    const { client } = this.props;
    const { engine } = client;

    const res = [];
    res.push(client.nameOf(seat));
    if (engine.handSize[seat] !== null) {
      res.push(`(${engine.handSize[seat]})`);
    }

    return res.join(" ");
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

    if (
      engine.phase === C.Phase.ASK &&
      engine.asker === engine.ownSeat &&
      engine.teamOf(seat) !== engine.teamOf(engine.ownSeat)
    )
      return null;

    const text = this.state.askee === null ? "ask" : "cancel";
    const askee = this.state.askee === null ? seat : null;

    return <button onClick={(e) => this.setState({ askee })}>{text}</button>;
  }

  renderCardSelector(seat: SeatID, update: () => void) {
    const { client } = this.props;
    const { engine } = client;

    const callback = (card) => {
      client.ask(seat, card);
      this.setState({ askee: null });
    };
    const disabled =
      engine.rules.bluff === C.BluffRule.YES ? [] : engine.ownHand?.cards;
    const suits = Card.FISH_SUITS.filter((suit) =>
      engine.ownHand?.hasSuit(suit)
    );

    return this.state.askee === seat ? (
      <CardSelector
        callback={callback}
        close={() => this.setState({ askee: null })}
        disabled={disabled}
        suits={suits}
        update={update}
      />
    ) : null;
  }

  render() {
    const { client } = this.props;
    const { engine, users } = client;

    return (
      <div className="players">
        {engine.seats.map((seat) => (
          <div className={`player rot-${seat}`} key={seat}>
            <PlayerInt
              askBtn={this.renderAskBtn(seat)}
              cardSelector={(update) => this.renderCardSelector(seat, update)}
              name={this.renderName(seat)}
              seatBtn={this.renderSeatBtn(seat)}
            />
          </div>
        ))}
      </div>
    );
  }
}
