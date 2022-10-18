import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

const squaresPerRow = 5;

function Square(props) {
  return (
    <button
      style={props.customStyle}
      className="square"
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        customStyle={
          this.props.squaresCausedWinIndexes.indexOf(i) !== -1
            ? { backgroundColor: "red" }
            : {}
        }
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    const rows = [];
    for (let i = 0; i < squaresPerRow; i++) {
      const squares = [];
      for (let j = i * squaresPerRow; j < (i + 1) * squaresPerRow; j++) {
        squares.push(this.renderSquare(j));
      }
      rows.push(<div className="board-row">{squares}</div>);
    }

    return <div>{rows}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      history: [
        {
          squares: Array(squaresPerRow * squaresPerRow).fill(null),
          location: {
            // Location of each move
            col: null,
            row: null,
          },
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      movesAscending: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (squares[i] || calculateWinner(squares, current.location).winner) return;
    squares[i] = this.state.xIsNext ? "X" : "O";

    // Calculate move's location
    const row = Math.floor(i / squaresPerRow);
    const col = i - row * squaresPerRow;
    this.setState({
      history: history.concat([
        {
          squares: squares,
          location: {
            col,
            row,
          },
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];

    const result = calculateWinner(current.squares, current.location);
    const winner = result.winner;

    const moves = history.map((step, move) => {
      const desc = move
        ? `Go to move #${move}. Location: (${history[move].location.col}, ${history[move].location.row})`
        : "Go to game start";
      return (
        <li key={move}>
          <button
            style={
              move === this.state.stepNumber // Bold current selected step
                ? { border: "3px solid black" }
                : {}
            }
            onClick={() => this.jumpTo(move)}
          >
            {desc}
          </button>
        </li>
      );
    });
    if (!this.state.movesAscending) moves.reverse();

    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else if (current.squares.indexOf(null) === -1) {
      status = "Draw";
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            squaresPerRow={squaresPerRow}
            squaresCausedWinIndexes={result.squaresCausedWinIndexes}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button
            onClick={() =>
              this.setState({ movesAscending: !this.state.movesAscending })
            }
          >
            {this.state.movesAscending ? "Sort Descending" : "Sort Ascending"}
          </button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares, currentMoveLocation) {
  if (currentMoveLocation.row === null || currentMoveLocation.col === null)
    return { winner: null, squaresCausedWinIndexes: [] };
  // Convert from 2d position to 1d position
  const currentMovePosition =
    currentMoveLocation.row * squaresPerRow + currentMoveLocation.col;
  const currentSquare = squares[currentMovePosition];

  let hasWinner = true;
  let squaresCausedWinIndexes = [];
  // Check all elements on the row
  for (let i = 0; i < squaresPerRow; i++) {
    // Convert from 2d index to 1d index
    const currentIndex = currentMoveLocation.row * squaresPerRow + i;
    if (currentIndex === currentMovePosition)
      // Exclude checking current move
      continue;
    if (currentSquare !== squares[currentIndex]) {
      hasWinner = false;
      break;
    }
    squaresCausedWinIndexes.push(currentIndex);
  }

  // Hasn't found out the winner yet
  if (!hasWinner) {
    hasWinner = true;
    squaresCausedWinIndexes = [];
    // Check all elements on the col
    for (let i = 0; i < squaresPerRow; i++) {
      // Convert from 2d index to 1d index
      const currentIndex = i * squaresPerRow + currentMoveLocation.col;
      if (currentIndex === currentMovePosition)
        // Exclude checking current move
        continue;
      if (currentSquare !== squares[currentIndex]) {
        hasWinner = false;
        break;
      }
      squaresCausedWinIndexes.push(currentIndex);
    }
  }

  // Hasn't found out the winner yet and the element is on the primary diagonal
  if (currentMoveLocation.row === currentMoveLocation.col && !hasWinner) {
    hasWinner = true;
    squaresCausedWinIndexes = [];

    outerLoop:
    // Check all elements on the primary diagonal
    for (let i = 0; i < squaresPerRow; i++) {
      for (let j = 0; j < squaresPerRow; j++) {
        // Check if the current position is on the primary diagonal
        if (i === j) {
          // Convert from 2d index to 1d index
          const currentIndex = i * squaresPerRow + j;
          if (currentIndex === currentMovePosition)
            // Exclude checking current move
            continue;
          if (currentSquare !== squares[currentIndex]) {
            hasWinner = false;
            break outerLoop;
          }
          squaresCausedWinIndexes.push(currentIndex);
        }
      }
    }
  }

  // Hasn't found out the winner yet and the element is on the secondary diagonal
  if (
    currentMoveLocation.row + currentMoveLocation.col === squaresPerRow - 1 &&
    !hasWinner
  ) {
    hasWinner = true;
    squaresCausedWinIndexes = [];
    // Check all elements on the secondary diagonal
    outerLoop:
    for (let i = 0; i < squaresPerRow; i++) {
      for (let j = 0; j < squaresPerRow; j++) {
        // Check if the current position is on the secondary diagonal
        if (i + j === squaresPerRow - 1) {
          // Convert from 2d index to 1d index
          const currentIndex = i * squaresPerRow + j;
          if (currentIndex === currentMovePosition)
            // Exclude checking current move
            continue;
          if (currentSquare !== squares[currentIndex]) {
            hasWinner = false;
            squaresCausedWinIndexes = [];
            break outerLoop;
          }
          squaresCausedWinIndexes.push(currentIndex);
        }
      }
    }
  }

  if (squaresCausedWinIndexes.length < squaresPerRow - 1)
    squaresCausedWinIndexes = [];
  if (squaresCausedWinIndexes.length > 0)
    squaresCausedWinIndexes.push(currentMovePosition);
  return {
    winner: hasWinner ? currentSquare : null,
    squaresCausedWinIndexes,
  };
}
