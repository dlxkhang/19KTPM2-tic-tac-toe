import Square from "../Square";

function Board({ squaresCausedWinIndexes, squares, onClick, squaresPerRow }) {
  const renderSquare = (i) => {
    return (
      <Square
        customStyle={
          squaresCausedWinIndexes.indexOf(i) !== -1
            ? { backgroundColor: "red" }
            : {}
        }
        value={squares[i]}
        onClick={() => onClick(i)}
      />
    );
  };

  const rows = [];
  for (let i = 0; i < squaresPerRow; i++) {
    const squares = [];
    for (let j = i * squaresPerRow; j < (i + 1) * squaresPerRow; j++) {
      squares.push(renderSquare(j));
    }
    rows.push(<div className="board-row">{squares}</div>);
  }

  return <div>{rows}</div>;
}

export default Board;
