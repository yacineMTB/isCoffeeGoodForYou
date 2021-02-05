import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';

type DashboardState = {
  lastUpdate: Date
}

/**
 * Root level component, represents the whole dashboard. Responsible for
 * intially loading in the data
 */
export class Dashboard extends Component<{}, DashboardState> {
  componentDidMount() {
    const currentTime: Date = new Date();
    this.setState({lastUpdate: currentTime});
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Last update: {this.state ? this.state.lastUpdate.toLocaleTimeString() : 'Have not updated yet'}
          </a>
        </header>
      </div>
    );
  }
}

// Change file name to reflect
export default Dashboard;
