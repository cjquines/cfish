import React from "react";

import { Card, FishSuit, fishSuitToString, genFishSuit } from "lib/cards";
import { CFish as C, SeatID } from "lib/cfish";
import { Client } from "lib/client";

namespace DeclareRow {
  export type Props = {
    callback: (card: string, seat: SeatID) => void;
    client: Client;
    card: Card;
    seats: SeatID[];
  };

  export type State = {
    owner: SeatID | null;
  };
}

class DeclareRow extends React.Component<DeclareRow.Props, DeclareRow.State> {
  constructor(props) {
    super(props);

    this.state = {
      owner: null,
    };
  }

  onChange(e) {
    const { callback, card } = this.props;
    const seat = Number(e.target.value);

    this.setState({ owner: seat });
    callback(card.toString(), seat);
  }

  render() {
    const { card, client, seats } = this.props;

    return (
      <div>
        <span>{card.toString()}</span>
        {seats.map((seat) => (
          <span key={seat}>
            <input
              checked={this.state.owner === seat}
              name={card.toString()}
              onChange={(e) => this.onChange(e)}
              type="radio"
              value={seat.toString()}
            />
            <label htmlFor={seat.toString()}>{client.nameOf(seat)}</label>
          </span>
        ))}
      </div>
    );
  }
}

export namespace DeclareSelector {
  export type Props = {
    callback: (owners: Record<string, SeatID>) => void;
    client: Client;
    seats: SeatID[];
    suit: FishSuit;
  };

  export type State = {
    owners: Record<string, SeatID>;
  };
}

export class DeclareSelector extends React.Component<
  DeclareSelector.Props,
  DeclareSelector.State
> {
  constructor(props) {
    super(props);

    this.state = {
      owners: {} as any,
    };
  }

  rowCallback(card: string, seat: SeatID): void {
    this.setState((state, props) => ({
      owners: {
        ...state.owners,
        [card]: seat,
      },
    }));
  }

  onSubmit(e): void {
    e.preventDefault();
    e.stopPropagation();
    console.log(this.state.owners);
    this.props.callback(this.state.owners);
  }

  render() {
    const { callback, client, seats, suit } = this.props;

    return (
      <form onSubmit={(e) => this.onSubmit(e)}>
        {[...genFishSuit(suit)].map((card) => (
          <DeclareRow
            key={card.toString()}
            callback={(card, seat) => this.rowCallback(card, seat)}
            card={card}
            client={client}
            seats={seats}
          />
        ))}
        <button type="submit">submit</button>
      </form>
    );
  }
}
