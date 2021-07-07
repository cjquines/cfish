import React from "react";

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

  render() {
    const { active, client } = this.props;
    const { engine, users } = client;

    return (
      <div className={`users ${active ? "active" : ""}`}>
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
    );
  }
}
