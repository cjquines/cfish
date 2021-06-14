import React from "react";
import {
  ArcherContainer,
  ArcherElement,
  AnchorPosition,
  Relation,
  ValidLineStyles,
} from "react-archer";

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
    from: string;
    to: string;
    label: string;
    [more: string]: any;
  };
}

export class Question extends React.Component<Question.Props> {
  render() {
    const { from, to, label, ...props } = this.props;

    const relations = (id: string) =>
      id !== from
        ? []
        : [
            {
              targetId: to,
              targetAnchor: "top" as AnchorPosition,
              sourceAnchor: "top" as AnchorPosition,
              label: <div className="label">{label}</div>,
              style: {
                lineStyle: "straight" as ValidLineStyles,
              },
            },
          ];

    return (
      <div className="question">
        <ArcherContainer strokeColor="black">
          {["p1", "p2", "p3", "p4", "p5", "p6"].map((id, i) => (
            <PlayerTarget
              key={i}
              id={id}
              relations={relations(id)}
              {...props}
            />
          ))}
        </ArcherContainer>
      </div>
    );
  }
}
