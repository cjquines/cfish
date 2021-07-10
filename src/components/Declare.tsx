import React from "react";
import {
  DragDropContext,
  Droppable,
  DroppableProvided,
  DroppableStateSnapshot,
  DropResult,
} from "react-beautiful-dnd";

import { Card } from "components/Card";
import {
  Card as CardT,
  FishSuit,
  fishSuitToString,
  genFishSuit,
} from "lib/cards";
import { CFish as C, SeatID } from "lib/cfish";
import { Client } from "lib/client";

namespace DeclareArea {
  export type Props = {
    cards: CardT[];
    disabled: boolean;
    provided: DroppableProvided;
    seat: SeatID | "unset";
    snapshot: DroppableStateSnapshot;
  };
}

class DeclareArea extends React.Component<DeclareArea.Props> {
  render() {
    const { cards, disabled, provided, seat, snapshot } = this.props;

    return (
      <div className={`declareArea rot-${seat}`}>
        <div
          className="declareInner"
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          {cards.map((card, i) => (
            <Card
              card={card}
              disabled={disabled}
              key={card.toString()}
              index={i}
            />
          ))}
          {provided.placeholder}
        </div>
      </div>
    );
  }
}

export namespace Declare {
  export type Props = {
    client: Client;
    seats: SeatID[];
    suit: FishSuit;
  };

  export type State = {
    cards: Record<SeatID | "unset", CardT[]>;
  };
}

export class Declare extends React.Component<Declare.Props, Declare.State> {
  constructor(props) {
    super(props);

    const { seats, suit } = this.props;

    let cards = { unset: [...genFishSuit(suit)] };
    for (const seat of seats) {
      cards[seat] = [];
    }

    this.state = { cards };
  }

  componentDidMount() {
    this.props.client.declareMoveHook = (
      srcId: string,
      srcIdx: number,
      destId: string,
      destIdx: number
    ) => this.move(srcId, srcIdx, destId, destIdx);
  }

  move(srcId: string, srcIdx: number, destId: string, destIdx: number) {
    const { cards } = this.state;
    const [card] = cards[srcId].splice(srcIdx, 1);
    const newCards = [...cards[destId]];
    newCards.splice(destIdx, 0, card);

    this.setState({
      cards: {
        ...cards,
        [destId]: newCards,
      },
    });
  }

  onDragEnd(result: DropResult) {
    const { source, destination } = result;
    if (!destination) return;

    const srcId = source.droppableId;
    const destId = destination.droppableId;
    const srcIdx = source.index;
    const destIdx = destination.index;

    this.props.client.declareMove(srcId, srcIdx, destId, destIdx);
    this.move(srcId, srcIdx, destId, destIdx);
  }

  submit() {
    let owners = {};
    for (const seat of this.props.seats) {
      for (const card of this.state.cards[seat]) {
        owners[card.toString()] = seat;
      }
    }
    this.props.client.declare(owners);
  }

  render() {
    const { client, seats, suit } = this.props;
    const { engine } = client;

    const ids: (number | "unset")[] = [...seats, "unset"];
    const disabled = this.state.cards["unset"].length > 0;
    const declaring = engine.declarer === engine.ownSeat;

    return (
      <div className="declare">
        <DragDropContext onDragEnd={(result) => this.onDragEnd(result)}>
          {ids.map((id) => (
            <Droppable
              direction="horizontal"
              droppableId={id.toString()}
              key={id}
            >
              {(provided, snapshot) => (
                <DeclareArea
                  cards={this.state.cards[id]}
                  disabled={!declaring}
                  provided={provided}
                  seat={id}
                  snapshot={snapshot}
                />
              )}
            </Droppable>
          ))}
        </DragDropContext>
        {declaring ? (
          <button disabled={disabled} onClick={(e) => this.submit()}>
            submit
          </button>
        ) : null}
      </div>
    );
  }
}
