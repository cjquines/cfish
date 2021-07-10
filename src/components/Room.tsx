import React from "react";
import { withRouter } from "react-router-dom";
import { RouteComponentProps } from "react-router";

import { Action } from "components/Action";
import { CardArea } from "components/CardArea";
import { Config } from "components/Config";
import { Declare } from "components/Declare";
import { Info } from "components/Info";
import { Log } from "components/Log";
import { Players } from "components/Players";
import { Question } from "components/Question";
import { CFish as C } from "lib/cfish";
import { Client } from "lib/client";

export namespace Room {
  export type Match = {
    room: string;
  };

  export type Props = RouteComponentProps<Match> & {
    url: string;
  };

  export type State = {
    client: Client | null;
    name: string;
    room: string;
    sidebar: "closed" | "info" | "log";
  };
}

class Room extends React.Component<Room.Props, Room.State> {
  constructor(props) {
    super(props);

    this.state = {
      client: null,
      name: this.getName(),
      room: this.props.match.params.room,
      sidebar: "closed",
    };
  }

  componentDidMount() {
    const { client: client_, name, room } = this.state;
    if (client_ !== null) return;

    const client = new Client(this.props.url, room, name);
    client.onUpdate = (client: Client) => this.setState({ client });
    client.connect();
    this.setState({ client });
  }

  getName() {
    const name =
      window.localStorage.getItem("name") ??
      (window.prompt("enter your name") || "no name");
    window.localStorage.setItem("name", name);
    return name;
  }

  renderDeclare() {
    const { client } = this.state;
    const { engine } = client;

    if (engine.phase !== C.Phase.DECLARE) return null;

    const seats = engine.seats.filter(
      (seat) => engine.teamOf(seat) === engine.teamOf(engine.declarer)
    );

    return <Declare client={client} suit={engine.declaredSuit} seats={seats} />;
  }

  renderSubaction() {
    const { client, sidebar } = this.state;
    const { engine } = client;

    if (engine.phase === C.Phase.WAIT) return <Config client={client} />;
    if (engine.ownHand !== null) return <CardArea client={client} />;
    return null;
  }

  renderToggle(pane: "info" | "log") {
    const { client, sidebar } = this.state;
    const { engine } = client;
    const label = sidebar !== pane ? `show ${pane}` : `hide ${pane}`;

    const onClick = (e) => {
      if (sidebar === pane) {
        this.setState({ ...this.state, sidebar: "closed" });
      } else {
        this.setState({ ...this.state, sidebar: pane });
      }
    };

    return <button onClick={onClick}>{label}</button>;
  }

  renderSidebar() {
    const { client, sidebar } = this.state;
    const { engine } = client;
    const logvis = engine.rules.log === C.LogRule.EVERYTHING;

    return (
      <>
        <Info active={sidebar === "info"} client={client} lone={!logvis} />
        {logvis ? <Log active={sidebar === "log"} client={client} /> : null}
        <div
          className={`toggles ${
            this.state.sidebar === "closed" ? "" : "active"
          }`}
        >
          {this.renderToggle("info")}
          {logvis ? this.renderToggle("log") : null}
        </div>
      </>
    );
  }

  render() {
    const { client } = this.state;

    if (!client) {
      return <div className="game">loading...</div>;
    }

    const { engine } = client;

    if (client?.status === "disconnected") {
      return (
        <div className="game">
          you've been disconnected! reload the page to rejoin the game
        </div>
      );
    }
    if (!client?.engine) {
      return <div className="game">loading...</div>;
    }

    return (
      <div className="room">
        <div className="game">
          <div className="table">
            <Players client={client} />
            <Question client={client} />
            {this.renderDeclare()}
          </div>
          <Action client={client} />
          {this.renderSubaction()}
        </div>
        {this.renderSidebar()}
      </div>
    );
  }
}

export default withRouter(Room);
