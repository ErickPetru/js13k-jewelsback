import Board from './Board'
import Jewel from './Jewel'

export default class Game {
  static locks = [
    [ { x: 2, y: 2 }, { x: 4, y: 4 } ],
    [ { x: 2, y: 2 }, { x: 6, y: 6 } ],
    [ { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 5, y: 5 }, { x: 6, y: 6 } ],
    [ { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 2 }, { x: 3, y: 3 },
      { x: 5, y: 5 }, { x: 5, y: 6 }, { x: 6, y: 5 }, { x: 6, y: 6 } ],
    [ { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 },
      { x: 5, y: 5 }, { x: 5, y: 6 }, { x: 6, y: 5 }, { x: 6, y: 6 } ],
    [ { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 1 }, { x: 2, y: 2 },
      { x: 1, y: 6 }, { x: 1, y: 7 }, { x: 2, y: 6 }, { x: 2, y: 7 }, { x: 4, y: 4 },
      { x: 6, y: 1 }, { x: 7, y: 1 }, { x: 6, y: 2 }, { x: 7, y: 2 },
      { x: 6, y: 6 }, { x: 6, y: 7 }, { x: 7, y: 6 }, { x: 7, y: 7 } ]
  ]

  levels = [
    {
      index: 0,
      name: 'Tutorial',
      description: 'Match three or more jewels of same shape, horizontally or vertically.',
      size: 3,
      milestone: 10,
      types: Jewel.allTypes.slice(0, 2)
    },

    {
      index: 1,
      size: 5,
      milestone: 300,
      types: Jewel.allTypes.slice(0, 3),
      locks: [ { x: 2, y: 2 } ]
    },

    {
      index: 2,
      size: 7,
      milestone: 600,
      types: Jewel.allTypes.slice(0, 3),
      locks: Game.locks[0]
    },

    {
      index: 3,
      size: 7,
      milestone: 1200,
      specials: { smoke: 0, fire: 1, star: 1, rainbow: 0, nebula: 0 },
      types: Jewel.allTypes.slice(0, 4)
    },

    {
      index: 4,
      size: 7,
      milestone: 1800,
      types: Jewel.allTypes.slice(0, 4),
      locks: Game.locks[0]
    },

    {
      index: 5,
      size: 9,
      milestone: 2500,
      types: Jewel.allTypes.slice(0, 5)
    },

    {
      index: 6,
      size: 9,
      milestone: 3500,
      types: Jewel.allTypes,
      specials: { smoke: 0, fire: 0, star: 0, rainbow: 1, nebula: 0 }
    },

    {
      index: 7,
      size: 9,
      milestone: 5000,
      types: Jewel.allTypes,
      specials: { smoke: 1, fire: 2, star: 2, rainbow: 0, nebula: 0 },
      locks: Game.locks[1]
    },

    {
      index: 8,
      size: 9,
      milestone: 6000,
      types: Jewel.allTypes,
      specials: { smoke: 0, fire: 1, star: 1, rainbow: 0, nebula: 0 },
      locks: Game.locks[1]
    },

    {
      index: 9,
      size: 9,
      milestone: 7000,
      types: Jewel.allTypes,
      specials: { smoke: 0, fire: 1, star: 0, rainbow: 0, nebula: 0 },
      locks: Game.locks[2]
    },

    {
      index: 10,
      size: 9,
      milestone: 9000,
      types: Jewel.allTypes,
      specials: { smoke: 0, fire: 0, star: 0, rainbow: 0, nebula: 1 },
      locks: Game.locks[2]
    },

    {
      index: 11,
      size: 9,
      milestone: 10000,
      types: Jewel.allTypes,
      locks: Game.locks[3]
    },

    {
      index: 12,
      size: 9,
      milestone: 11500,
      types: Jewel.allTypes,
      locks: Game.locks[4]
    },

    {
      index: 13,
      size: 9,
      milestone: 13000,
      types: Jewel.allTypes,
      locks: Game.locks[5]
    }
  ]

  _score = 0
  _message = null

  constructor () {
    this.board = new Board(this)
    document.querySelector('main').append(this.board)
  }

  start () {
    if (this.board) this.board.startLevel()
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
    const element = document.getElementById('score')
    element.textContent = value
    element.setAttribute('data-text', value)
  }

  get message () {
    return this._message
  }

  set message (value) {
    this._message = value
    const container = document.getElementById('message')
    const element = container.querySelector('span')
    if (value) {
      element.textContent = value
      element.setAttribute('data-text', value)
      container.style.transitionDuration = '1s'
      container.style.opacity = 1
      container.style.visibility = 'visible'
      container.style.pointerEvents = 'all'
    } else {
      element.textContent = ''
      element.setAttribute('data-text', '')
      container.style.transitionDuration = '1.5s'
      container.style.opacity = 0
      container.style.pointerEvents = 'none'
      this.delay(1000).then(() => container.style.visibility = 'hidden')
    }
  }
}
