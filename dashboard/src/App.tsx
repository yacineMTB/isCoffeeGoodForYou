import React, {Component} from 'react';
import logo from './logo.svg';
import Board from './components/Board';
import './App.css';

type DashboardState = {
  lastUpdate: Date
  detectedBoardImages: {[key: string]: number}
}

type DashboardProps = {

}

const BASE_API_URL = 'http://localhost:8080';
const BOARDS = ['fit', 'g', 'sci', 's'];
const UPDATE_INTERVAL = 5000;

/**
 * Root level component, represents the whole dashboard. Responsible for
 * intially loading in the data
 */
export class Dashboard extends Component<{}, DashboardState> {
  constructor(props: DashboardProps) {
    super(props);
    this.state = {detectedBoardImages: {}, lastUpdate: new Date()};
  }

  async componentDidMount() {
    this.updateRoutine();
    setInterval(() => this.updateRoutine(), UPDATE_INTERVAL);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
          </p>
          <p>
            Last update: {this.state ? this.state.lastUpdate.toLocaleTimeString() : 'Have not updated yet'}
          </p>
          {
            Object.keys(this.state.detectedBoardImages).map((boardName, index) =>
              <React.Fragment key={index}>
                <Board numberOfPornographicImages={this.state.detectedBoardImages[boardName]} boardName={boardName}></Board>
              </React.Fragment>,
            )
          }
        </header>
      </div>
    );
  }

  updateRoutine() {
    for (const board of BOARDS) {
      fetch(`${BASE_API_URL}/board/${board}/count`)
          .then((response) => response.json())
          .then((data) => {
            this.setState({detectedBoardImages: {
              ...this.state.detectedBoardImages,
              [board]: data.detected_image_count,
            }});
          })
          .catch((error) => console.error(error)); // Just swallow the error
    }
    const currentTime: Date = new Date();
    this.setState({lastUpdate: currentTime});
  }
}

// Change file name to reflect
export default Dashboard;
