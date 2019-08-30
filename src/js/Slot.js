export default class Slot extends HTMLElement {
  lastClick = null

  constructor (x, y) {
    super()

    this.x = x
    this.y = y

    this.addEventListener('mousedown', this.mousedown)
    this.addEventListener('mouseup', this.mouseup)
    this.addEventListener('dragstart', (event) => event.preventDefault())
  }

  get locked () {
    return this.getAttribute('locked') === '' ? true : false
  }

  set locked (value) {
    const attr = 'locked'
    value ? this.setAttribute(attr, '') : this.removeAttribute(attr)
  }

  get selected () {
    return this.getAttribute('selected') === '' ? true : false
  }

  set selected (value) {
    const attr = 'selected'
    value ? this.setAttribute(attr, '') : this.removeAttribute(attr)
    if (this.jewel && !value) this.jewel.matchable = false
  }

  get targetable () {
    return this.getAttribute('targetable') === '' ? true : false
  }

  set targetable (value) {
    const attr = 'targetable'
    value ? this.setAttribute(attr, '') : this.removeAttribute(attr)
  }

  get x () {
    return +this.getAttribute('x')
  }

  set x (value) {
    this.setAttribute('x', value)
  }

  get y () {
    return +this.getAttribute('y')
  }

  set y (value) {
    this.setAttribute('y', value)
  }

  get game () {
    return this.board.game
  }

  get board () {
    return this.parentElement
  }

  get jewel () {
    return this.firstElementChild
  }

  set jewel (value) {
    this.game.enableTransitions(value, false)
    value.x = this.x
    value.y = this.y
    this.game.setStyles(value, { transform: null })
    this.appendChild(value)
    this.game.enableTransitions(value)
  }

  mousedown () {
    // TODO: Does nothing if any animation is playing.

    if (this.locked) return this.board.unselectAll()
    if (this.board.findJewelSelected() === null) {
      this.board.unselectAll()
      this.board.updateTargetables(this)
      this.board.grabbing = true
      this.selected = true
      this.lastClick = Date.now()
    }
  }

  mouseup () {
    // TODO: Does nothing if any animation is playing.

    this.board.grabbing = false
    if (this.locked) return this.board.unselectAll()
    if (this.targetable) return this.board.flipJewels(this.jewel)
    if (!this.lastClick || Date.now() - this.lastClick > 250)
      this.board.unselectAll()
  }
}

customElements.define('board-slot', Slot)
