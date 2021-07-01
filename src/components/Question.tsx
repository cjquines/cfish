import React from "react";
import {
  ArcherContainer,
  ArcherElement,
  AnchorPosition,
  Relation,
  ValidLineStyles,
} from "react-archer";

import { SeatID } from "lib/cfish";
import { Client } from "lib/client";

// a target for react-archer

namespace PlayerTarget {
  export type Props = {
    id: string;
    relations: Relation[];
    [more: string]: any;
  };
}

class PlayerTarget extends React.Component<PlayerTarget.Props> {
  render() {
    const { id, relations, ...props } = this.props;

    return (
      <div className="playerTarget">
        <ArcherElement id={id} relations={relations} {...props}>
          <div className="playerTargetInt"></div>
        </ArcherElement>
      </div>
    );
  }
}

// an arrow labeled with a card or a response

export namespace Question {
  export type Props = {
    client: Client;
    [more: string]: any;
  };
}

export class Question extends React.Component<Question.Props> {
  render() {
    const { client, ...props } = this.props;
    const { engine } = client;

    const relations = (id: SeatID) =>
      id !== engine.asker || engine.askee === null
        ? []
        : [
            {
              targetId: String(engine.askee),
              targetAnchor: "top" as AnchorPosition,
              sourceAnchor: "top" as AnchorPosition,
              label: <div className="label">{engine.askedCard.toString()}</div>,
              style: {
                lineStyle: "straight" as ValidLineStyles,
              },
            },
          ];

    return (
      <div className="question">
        <ArcherContainer strokeColor="black">
          {engine.seats.map((seat) => (
            <PlayerTarget
              key={seat}
              id={String(seat)}
              relations={relations(seat)}
              {...props}
            />
          ))}
        </ArcherContainer>
      </div>
    );
  }
}
