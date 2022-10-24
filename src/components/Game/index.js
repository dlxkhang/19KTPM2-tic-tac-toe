import { useState } from "react";
import Board from "../Board";

function calculateWinner(squares, currentMoveLocation, squaresPerRow) {
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

    // Check all elements on the primary diagonal
    outerLoop: for (let i = 0; i < squaresPerRow; i++) {
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
    outerLoop: for (let i = 0; i < squaresPerRow; i++) {
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

function Game({ squaresPerRow }) {
  const [history, setHistory] = useState([
    {
      squares: Array(squaresPerRow * squaresPerRow).fill(null),
      location: {
        // Location of each move
        col: null,
        row: null,
      },
    },
  ]);
  const [stepNumber, setStepNumber] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);
  const [movesAscending, setMovesAscending] = useState(true);

  const handleClick = (i) => {
    const newHistory = history.slice(0, stepNumber + 1);
    const current = newHistory[newHistory.length - 1];
    const squares = current.squares.slice();

    if (
      squares[i] ||
      calculateWinner(squares, current.location, squaresPerRow).winner
    )
      return;
    squares[i] = xIsNext ? "X" : "O";

    // Calculate move's location
    const row = Math.floor(i / squaresPerRow);
    const col = i - row * squaresPerRow;

    setHistory(
      newHistory.concat([
        {
          squares: squares,
          location: {
            col,
            row,
          },
        },
      ])
    );
    setStepNumber(newHistory.length);
    setXIsNext(!xIsNext);
  };

  const jumpTo = (step) => {
    setStepNumber(step);
    setXIsNext(step % 2 === 0);
  };

  const newHistory = history;
  const current = newHistory[stepNumber];

  const result = calculateWinner(
    current.squares,
    current.location,
    squaresPerRow
  );
  const winner = result.winner;

  const moves = newHistory.map((step, move) => {
    const desc = move
      ? `Go to move #${move}. Location: (${newHistory[move].location.col}, ${newHistory[move].location.row})`
      : "Go to game start";
    return (
      <li key={move}>
        <button
          style={
            move === stepNumber // Bold current selected step
              ? { border: "3px solid black" }
              : {}
          }
          onClick={() => jumpTo(move)}
        >
          {desc}
        </button>
      </li>
    );
  });
  if (!movesAscending) moves.reverse();

  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else if (current.squares.indexOf(null) === -1) {
    status = "Draw";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board
          squares={current.squares}
          squaresPerRow={squaresPerRow}
          squaresCausedWinIndexes={result.squaresCausedWinIndexes}
          onClick={(i) => handleClick(i)}
        />
      </div>
      <div className="game-info">
        <div>{status}</div>
        <button
          onClick={() => {
            setMovesAscending(!movesAscending);
          }}
        >
          {movesAscending ? "Sort Descending" : "Sort Ascending"}
        </button>
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

export default Game;
