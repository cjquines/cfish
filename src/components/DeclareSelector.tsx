import React from "react";

import { Card, FishSuit, fishSuitToString, genFishSuit } from "lib/cards";
import { CFish as C, SeatID } from "lib/cfish";
import { Protocol as P } from "lib/protocol";
import { UserID } from "lib/server";

namespace DeclareRow {
  export type Props = {
    callback: (card: string, seat: SeatID) => void;
    card: Card;
    seatOf: (user: UserID) => SeatID | null;
    users: P.User[];
  };

  export type State = {
    owner: SeatID | null;
  };
}

class DeclareRow extends React.Component<
  DeclareRow.Props,
  DeclareRow.State
> {
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
    const { card, users, seatOf } = this.props;

    return (
      <div>
        <span>{card.toString()}</span>
        {users.map((user) => {
          const seat = seatOf(user.id);
          return (
            <span key={user.id}>
              <input
                checked={this.state.owner === seat}
                name={card.toString()}
                onChange={(e) => this.onChange(e)}
                type="radio"
                value={seat.toString()}
              />
              <label htmlFor={seat.toString()}>{user.name}</label>
            </span>
          );
        })}
      </div>
    );
  }
}

export namespace DeclareSelector {
  export type Props = {
    callback: (owners: Record<string, SeatID>) => void;
    seatOf: (user: UserID) => SeatID | null;
    suit: FishSuit;
    users: P.User[];
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
    const { callback, seatOf, suit, users } = this.props;

    return (
      <form onSubmit={(e) => this.onSubmit(e)}>
        {[...genFishSuit(suit)].map((card) => (
          <DeclareRow
            key={card.toString()}
            callback={(card, seat) => this.rowCallback(card, seat)}
            card={card}
            seatOf={(user) => seatOf(user)}
            users={users}
          />
        ))}
        <button type="submit">submit</button>
      </form>
    );
  }
}