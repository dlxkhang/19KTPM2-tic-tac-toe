function Square({ customStyle, onClick, value }) {
  return (
    <button
      style={customStyle}
      className="square"
      onClick={onClick}
    >
      {value}
    </button>
  );
}

export default Square;
