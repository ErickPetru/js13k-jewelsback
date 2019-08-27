/* global game */
import Board from './Board'

const level = {
  size: 9,
  locks: [ { x: 2, y: 2 }, { x: 6, y: 6 } ]
}

const board = new Board()
game.append(board)
board.startLevel(level)
