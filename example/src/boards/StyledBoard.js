import { useRef, useState } from 'react';
import Chess from 'chess.js';

import { Chessboard } from 'react-chessboard';

export default function StyledBoard({ boardWidth }) {
  const chessboardRef = useRef();
  const [game, setGame] = useState(new Chess());

  function safeGameMutate(modify) {
    setGame((g) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  }

  function onDrop(sourceSquare, targetSquare) {
    const gameCopy = { ...game };
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // always promote to a queen for example simplicity
    });
    setGame(gameCopy);
    return move;
  }

  const pieces = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];
  const customPieces = () => {
    const returnPieces = {};
    pieces.forEach((p) => {
      returnPieces[p] = ({ squareWidth }) => (
        <div
          style={{
            width: squareWidth,
            height: squareWidth,
            backgroundImage: `url(/media/${p}.png)`,
            backgroundSize: '100%',
          }}
        />
      );
    });
    return returnPieces;
  };

  const piecesPosition = [
    {
      piece: 'bP',
      positionURL: {
        h7: `url(/media/custom/bP.png)`
      }
    },
    {
      piece: 'wP',
      positionURL: {
        b2: `url(/media/custom/wP.png)`,
        f2: `url(/media/custom/wP_1.png)`
      }
    },
    {
      piece: 'wB',
      positionURL: {
        c1: `url(/media/custom/wB.png)`
      }
    }
  ]

  const renderPiece = positionURL => {
    const renderObject = {}
    Object.keys(positionURL).forEach(ele => {
      renderObject[ele] = ({ squareWidth }) => (
        <div
          style={{
            width: squareWidth,
            height: squareWidth,
            backgroundImage: positionURL[ele],
            backgroundSize: '100%',
          }}
        />
      )
    })
    return renderObject
  }

  const customPiecesPosition = () => {
    const returnPieces = {}
    piecesPosition.forEach(p => {
      returnPieces[p.piece] = renderPiece(p.positionURL)
    })
    return returnPieces
  }

  return (
    <div>
      <Chessboard
        id="StyledBoard"
        animationDuration={200}
        boardOrientation="black"
        boardWidth={boardWidth}
        position={game.fen()}
        onPieceDrop={onDrop}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
        }}
        customDarkSquareStyle={{ backgroundColor: '#779952' }}
        customLightSquareStyle={{ backgroundColor: '#edeed1' }}
        customPieces={customPieces()}
        customPiecesPosition={customPiecesPosition()}
        ref={chessboardRef}
      />
      <button
        className="rc-button"
        onClick={() => {
          safeGameMutate((game) => {
            game.reset();
          });
        }}
      >
        reset
      </button>
      <button
        className="rc-button"
        onClick={() => {
          safeGameMutate((game) => {
            game.undo();
          });
        }}
      >
        undo
      </button>
    </div>
  );
}
