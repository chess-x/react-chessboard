import React, { Fragment, useState, useRef, useEffect, useCallback } from 'react';

import { getRelativeCoords } from '../functions';
import { Notation } from './Notation';
import { Piece } from './Piece';
import { Square } from './Square';
import { Squares } from './Squares';
import { useChessboard } from '../context/chessboard-context';
import { WhiteKing } from './ErrorBoundary';

let pieceViews = {};

export function Board() {
  const boardRef = useRef();
  const [squares, setSquares] = useState({});

  const {
    arrows,
    boardOrientation,
    boardWidth,
    clearCurrentRightClickDown,
    customArrowColor,
    showBoardNotation,
    currentPosition,
    premoves,
    dropTarget,
    chessPieces,
    positionDifferences,
  } = useChessboard();

  useEffect(() => {
    pieceViews = {};

    function handleClickOutside(event) {
      if (boardRef.current && !boardRef.current.contains(event.target)) {
        clearCurrentRightClickDown();
      }
    }

    document.addEventListener('mouseup', handleClickOutside);
    return () => {
      document.removeEventListener('mouseup', handleClickOutside);
    };
  }, []);

  const definePreview = useCallback((chessPieces, square) => {
    let pieceView = (
      <svg viewBox={'1 1 43 43'} width={boardWidth / 8} height={boardWidth / 8}>
        <g>{chessPieces[square]}</g>
      </svg>
    );

    if (typeof chessPieces[square] === 'function') {
      pieceView = chessPieces[square]({
        squareWidth: boardWidth / 8,
        droppedPiece: dropTarget?.piece,
        targetSquare: dropTarget?.target,
        sourceSquare: dropTarget?.source
      })
    }

    return pieceView;
  }, [boardWidth, dropTarget]);

  return boardWidth ? (
    <div ref={boardRef} style={{ position: 'relative' }}>
      <Squares>
        {({ index, square, squareColor, col, row }) => {
          const squareHasPremove = premoves.find((p) => p.sourceSq === square || p.targetSq === square);
          const squareHasPremoveTarget = premoves.find((p) => p.targetSq === square);
          const previewIndexKey = `${index}_${square}`;
          const pieceView = definePreview(chessPieces, square);

          if (!pieceViews[previewIndexKey]) {
            pieceViews[previewIndexKey] = pieceView;
          }

          const { added, removed } = positionDifferences;
          const removedKeys = removed ? Object.keys(removed) : [];

          if (removed && removedKeys.length > 0 && added) {
            const addedKey = Object.keys(added)[0];
            const keyToUpdate = `${index}_${addedKey}`;
            const prevKeyToFind = removedKeys.filter(key => key != addedKey);
            const prevKey = Object.keys(pieceViews).find(k => k.split("_")[1] == prevKeyToFind);

            pieceViews[keyToUpdate] = pieceViews[prevKey];
          }
          return (
            <Square
              key={`${col}${row}`}
              square={square}
              squareColor={squareColor}
              setSquares={setSquares}
              squareHasPremove={squareHasPremove}
            >
              {currentPosition[square] && <Piece pieceView={pieceViews[previewIndexKey]} piece={currentPosition[square]} square={square} squares={squares} />}
              {squareHasPremoveTarget && (
                <Piece pieceView={pieceViews[previewIndexKey]} isPremovedPiece={true} piece={squareHasPremoveTarget.piece} square={square} squares={squares} />
              )}
              {showBoardNotation && <Notation row={row} col={col} />}
            </Square>
          );
        }}
      </Squares>
      <svg
        width={boardWidth}
        height={boardWidth}
        style={{ position: 'absolute', top: '0', left: '0', pointerEvents: 'none', zIndex: '10' }}
      >
        {arrows.map(arrow => {
          const from = getRelativeCoords(boardOrientation, boardWidth, arrow[0]);
          const to = getRelativeCoords(boardOrientation, boardWidth, arrow[1]);

          return (
            <Fragment key={`${arrow[0]}-${arrow[1]}`}>
              <defs>
                <marker id="arrowhead" markerWidth="2" markerHeight="2.5" refX="1.25" refY="1.25" orient="auto">
                  <polygon points="0 0, 2 1.25, 0 2.5" style={{ fill: customArrowColor }} />
                </marker>
              </defs>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                style={{ stroke: customArrowColor, strokeWidth: boardWidth / 36 }}
                markerEnd="url(#arrowhead)"
              />
            </Fragment>
          );
        })}
      </svg>
    </div>
  ) : (
    <WhiteKing />
  );
}
