import React, { Fragment } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './Home';
import Game from './Game';

import './style.css';

const App = () => {
  return (
    <Router>
      <Fragment>
        <Switch>
          <Route exact path='/' component={Home} />
          <Route exact path='/:room' component={Game} />
        </Switch>
      </Fragment>
    </Router>
  );
};

export default App;
