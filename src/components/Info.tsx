import React from "react";

import { SuitSpan } from "components/SuitSelector";
import { Card, fishSuitToString } from "lib/cards";
import { CFish as C } from "lib/cfish";
import { Client } from "lib/client";
import { Protocol as P } from "lib/protocol";

export namespace Info {
  export type Props = {
    active: boolean;
    client: Client;
    lone: boolean;
  };
}

export class Info extends React.Component<Info.Props> {
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
            <li key={i}>
              <SuitSpan suit={suit} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  renderUser(user: P.User) {
    const { client } = this.props;
    const host = client.engine.host === user.id;

    return (
      <li key={user.id}>
        {user.name}
        {host ? " (host)" : ""}
        {client.identity.id === user.id ? (
          <button onClick={(e) => this.rename()}>rename</button>
        ) : null}
      </li>
    );
  }

  render() {
    const { active, client, lone } = this.props;
    const { engine, users } = client;

    return (
      <div className={`info ${active ? "active" : ""} ${lone ? "lone" : ""}`}>
        <div className="users">
          <p>users:</p>
          <ul>{users.map((user) => this.renderUser(user))}</ul>
        </div>
        <div className="teams">
          {this.renderTeam(C.Team.FIRST)}
          {this.renderTeam(C.Team.SECOND)}
        </div>
      </div>
    );
  }
}
