import React, { useCallback } from 'react';
import { useDragLayer } from 'react-dnd';

import { useChessboard } from '../context/chessboard-context';

export function CustomDragLayer() {
  const { boardWidth, chessPieces, customChessPieces, customChessPiecesPosition, id, snapToCursor } = useChessboard();

  const collectedProps = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    clientOffset: monitor.getClientOffset(),
    sourceClientOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging()
  }));

  const { isDragging, item, clientOffset, sourceClientOffset } = collectedProps;

  const layerStyles = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 10,
    left: 0,
    top: 0
  };

  const getItemStyle = useCallback(
    (clientOffset, sourceClientOffset) => {
      if (!clientOffset || !sourceClientOffset) return { display: 'none' };

      let { x, y } = snapToCursor ? clientOffset : sourceClientOffset;
      if (snapToCursor) {
        const halfSquareWidth = boardWidth / 8 / 2;
        x -= halfSquareWidth;
        y -= halfSquareWidth;
      }
      const transform = `translate(${x}px, ${y}px)`;

      return {
        transform,
        WebkitTransform: transform,
        touchAction: 'none'
      };
    },
    [boardWidth, snapToCursor]
  );
  const renderPiece = () => {
    if (
      customChessPiecesPosition[item.piece] &&
      customChessPiecesPosition[item.piece][item.square] &&
      typeof customChessPiecesPosition[item.piece][item.square] === 'function'
    ) {
      return customChessPiecesPosition[item.piece][item.square]({
        squareWidth: boardWidth / 8,
        isDragging: true
      });
    }
    if (typeof customChessPieces[item.piece] === 'function') {
      return customChessPieces[item.piece]({
        squareWidth: boardWidth / 8,
        isDragging: true
      });
    }
    return (
      <svg viewBox={'1 1 43 43'} width={boardWidth / 8} height={boardWidth / 8}>
        <g>{chessPieces[item.piece]}</g>
      </svg>
    );
  };

  return isDragging && item.id === id ? (
    <div style={layerStyles}>
      <div style={getItemStyle(clientOffset, sourceClientOffset)}>{renderPiece()}</div>
    </div>
  ) : null;
}
