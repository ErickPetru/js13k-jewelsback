/* global game */
import createBackground from './Background'
import Board from './Board'

createBackground()

new (class Game {
  levels = [
    {
      size: 9,
      specials: { smoke: 0, fire: 1, star: 1, rainbow: 0, nebula: 0 },
      locks: [ { x: 2, y: 2 }, { x: 6, y: 6 } ]
    }
  ]

  _score = 0

  constructor () {
    this.board = new Board(this)
    document.querySelector('main').append(this.board)
    this.board.startLevel(this.levels[0])
  }

  delay (value = 0, ...args) {
    if (!value) return new Promise(r => requestAnimationFrame(r))
    else return new Promise(r => setTimeout(r, value, ...args))
  }

  get score () {
    return this._score
  }

  set score (value) {
    this._score = value
    const el = document.getElementById('score')
    el.textContent = value
    el.setAttribute('data-text', value)
  }
})
