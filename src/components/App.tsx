import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Room from "components/Room";
import Splash from "components/Splash";

export namespace App {
  export type Props = {
    url: string;
  };
}

export class App extends React.Component<App.Props> {
  render() {
    return (
      <div className="wrapper">
        <Router>
          <Switch>
            <Route exact path="/">
              <Splash />
            </Route>
            <Route path="/room/:room">
              <Room url={this.props.url} />
            </Route>
          </Switch>
        </Router>
      </div>
    );
  }
}
