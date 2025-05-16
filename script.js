// script.js

let origBoard;
const huPlayer = 'O';
const aiPlayer = 'X';
const winCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

const cells = document.querySelectorAll('.cell');
const overlay = document.querySelector('.modal-overlay');
const modalText = document.querySelector('.modal-text');
const replayBtn = document.querySelector('.btn.replay');

startGame();
replayBtn.addEventListener('click', startGame);

function startGame() {
  // reset board model
  origBoard = Array.from(Array(9).keys());

  // clear UI cells
  cells.forEach(cell => {
    cell.innerText = '';
    cell.classList.remove('x', 'o');
    cell.style.backgroundColor = '';
    cell.removeEventListener('click', turnClick);
    cell.addEventListener('click', turnClick, false);
  });

  // hide endgame modal
  overlay.classList.add('hidden');
}

function turnClick(evt) {
  const sqId = +evt.target.id;
  if (typeof origBoard[sqId] === 'number') {
    // human
    turn(sqId, huPlayer);

    // if human won or it's a tie, bail out
    if (checkWin(origBoard, huPlayer) || checkTie()) {
      return;
    }

    // AI
    turn(bestSpot(), aiPlayer);
    
    // after AI move, check for win/tie
    checkWin(origBoard, aiPlayer) || checkTie();
  }
}

function turn(squareId, player) {
  // update model
  origBoard[squareId] = player;
  // update UI
  const cell = document.getElementById(squareId);
  cell.innerText = player;
  cell.classList.add(player === huPlayer ? 'o' : 'x');

  // check for win
  const gameWon = checkWin(origBoard, player);
  if (gameWon) gameOver(gameWon);
}

function checkWin(board, player) {
  const plays = board
    .map((val, idx) => (val === player ? idx : null))
    .filter(v => v !== null);

  let gameWon = null;
  for (let [index, combo] of winCombos.entries()) {
    if (combo.every(pos => plays.includes(pos))) {
      gameWon = { index, player };
      break;
    }
  }
  return gameWon;
}

function gameOver(gameWon) {
  // highlight winning cells
  winCombos[gameWon.index].forEach(idx => {
    document.getElementById(idx)
      .style.backgroundColor = gameWon.player === huPlayer ? 'rgba(52,152,219,0.3)' 
                                                           : 'rgba(231,76,60,0.3)';
  });

  // disable further clicks
  cells.forEach(cell => cell.removeEventListener('click', turnClick));

  // show modal
  declareWinner(gameWon.player === huPlayer ? 'You win!' : 'You lose.');
}

function declareWinner(message) {
  modalText.innerText = message;
  overlay.classList.remove('hidden');
}

function emptySquares() {
  return origBoard.filter(s => typeof s === 'number');
}

function bestSpot() {
  return minimax(origBoard, aiPlayer).index;
}

function checkTie() {
  if (emptySquares().length === 0) {
    // color all cells
    cells.forEach(c => c.style.backgroundColor = 'rgba(46,204,113,0.3)');
    cells.forEach(c => c.removeEventListener('click', turnClick));
    declareWinner("It's a tie!");
    return true;
  }
  return false;
}

function minimax(newBoard, player) {
  const availSpots = newBoard.filter(s => typeof s === 'number');

  if (checkWin(newBoard, huPlayer)) return { score: -10 };
  if (checkWin(newBoard, aiPlayer)) return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };

  const moves = availSpots.map(idx => {
    const move = { index: newBoard[idx] };
    newBoard[idx] = player;

    const result = minimax(newBoard, player === aiPlayer ? huPlayer : aiPlayer);
    move.score = result.score;

    newBoard[idx] = move.index;
    return move;
  });

  let bestMove;
  if (player === aiPlayer) {
    let bestScore = -Infinity;
    moves.forEach((m, i) => {
      if (m.score > bestScore) {
        bestScore = m.score;
        bestMove = i;
      }
    });
  } else {
    let bestScore = Infinity;
    moves.forEach((m, i) => {
      if (m.score < bestScore) {
        bestScore = m.score;
        bestMove = i;
      }
    });
  }
  return moves[bestMove];
}
