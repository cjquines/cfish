import React from "react";

import { Card, fishSuitToString } from "lib/cards";
import { CFish as C } from "lib/cfish";
import { Client } from "lib/client";

export namespace Users {
  export type Props = {
    active: boolean;
    client: Client;
  };
}

export class Users extends React.Component<Users.Props> {
  rename(): void {
    const { client } = this.props;

    const name = window.prompt("enter your name") || "no name";
    client.attemptRename(name);
  }

  renderTeam(team: C.Team) {
    const { client } = this.props;
    const { engine, users } = client;

    return (
      <div className="team">
        <div className="score">{engine.scoreOf(team)}</div>
        <p>members:</p>
        <ul>
          {engine.seats
            .filter((seat) => engine.teamOf(seat) === team)
            .map((seat) => (
              <li key={seat}>{client.nameOf(seat)}</li>
            ))}
        </ul>
        <p>suits:</p>
        <ul>
          {Card.FISH_SUITS.filter(
            (suit) => engine.declarerOf[suit] === team
          ).map((suit, i) => (
            <li key={i}>{fishSuitToString(suit)}</li>
          ))}
        </ul>
      </div>
    );
  }

  render() {
    const { active, client } = this.props;
    const { engine, users } = client;

    return (
      <div className={`info ${active ? "active" : ""}`}>
        <div className="users">
          <p>users:</p>
          <ul>
            {users.map((user) => (
              <li key={user.id}>
                {user.name}
                {client.identity.id === user.id ? (
                  <button onClick={(e) => this.rename()}>rename</button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
        <div className="teams">
          {this.renderTeam(C.Team.FIRST)}
          {this.renderTeam(C.Team.SECOND)}
        </div>
      </div>
    );
  }
}
