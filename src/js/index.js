/* global game */
import Board from './Board'

new (class Game {
  ENV = 'prod' // || 'dev'

  levels = [
    {
      size: 9,
      specials: { smoke: 0, fire: 1, star: 1, rainbow: 0, nebula: 0 },
      locks: [ { x: 2, y: 2 }, { x: 6, y: 6 } ]
    }
  ]

  constructor () {
    if (document) document.documentElement.classList.add(this.ENV)

    this.board = new Board(this)
    document.querySelector('main').append(this.board)
    this.board.startLevel(this.levels[0])
  }

  delay (value = 0, ...args) {
    if (!value) return new Promise(r => requestAnimationFrame(r))
    else return new Promise(r => setTimeout(r, value, ...args))
  }

  setStylesWithTransition (element, styles) {
    return this.setStyles(element, styles, true)
  }

  setStyles (element, styles, transition = false) {
    if (!transition)
      this.enableTransitions(element, false)
    else
      this.enableTransitions(element, true)

    Object.keys(styles).forEach(k => element.style[k] = styles[k])
    element.offsetHeight // Force repaint

    if (transition) {
      return new Promise(resolve => {
        const handler = () => {
          element.removeEventListener('transitionend', handler)
          resolve()
        }

        element.addEventListener('transitionend', handler)
      })
    } else
      return this.delay()
  }

  enableTransitions (element, enabled = true) {
    if (enabled) element.classList.remove('transitions-off')
    else element.classList.add('transitions-off')
  }
})
