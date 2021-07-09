import React from "react";
import {
  ArcherContainer,
  ArcherElement,
  AnchorPosition,
  Relation,
  ValidLineStyles,
} from "react-archer";

import { CardSpan } from "components/Card";
import { CFish as C, SeatID } from "lib/cfish";
import { Client } from "lib/client";

namespace PlayerTarget {
  export type Props = {
    id: string;
    relations: Relation[];
    seat: SeatID;
  };
}

class PlayerTarget extends React.Component<PlayerTarget.Props> {
  render() {
    const { id, relations, seat } = this.props;

    return (
      <div className={`playerTarget rot-${seat}`}>
        <ArcherElement id={id} relations={relations}>
          <div className="playerTargetInt"></div>
        </ArcherElement>
      </div>
    );
  }
}

export namespace Question {
  export type Props = {
    client: Client;
  };
}

export class Question extends React.Component<Question.Props> {
  render() {
    const { client } = this.props;
    const { engine } = client;

    const label = (
      <div className="label">
        <CardSpan card={engine.askedCard} />
      </div>
    );

    const relations = (id: SeatID) => {
      if (engine.phase !== C.Phase.ANSWER || id !== engine.asker) return [];
      const obj = {
        targetId: engine.askee.toString(),
        targetAnchor: "top" as AnchorPosition,
        sourceAnchor: "top" as AnchorPosition,
        label: label,
        style: {
          lineStyle: "straight" as ValidLineStyles,
        },
      };
      return [obj];
    };

    return (
      <div className="question">
        <ArcherContainer strokeColor="black">
          {engine.seats.map((seat) => (
            <PlayerTarget
              key={seat}
              id={seat.toString()}
              seat={seat}
              relations={relations(seat)}
            />
          ))}
        </ArcherContainer>
      </div>
    );
  }
}
