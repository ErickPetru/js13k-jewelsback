export default class Slot extends HTMLElement {
  lastClick = null

  constructor (x, y) {
    super()

    this.x = x
    this.y = y

    this.addEventListener('mousedown', this.mousedown)
    this.addEventListener('touchstart', this.mousedown, true)
    this.addEventListener('mouseup', this.mouseup)
    this.addEventListener('touchend', this.mouseup, true)
    this.addEventListener('dragstart', (event) => event.preventDefault())
  }

  connectedCallback () {
    if (this.y === 0) this.classList.add('first-row')
    if (this.y === this.board.level.size - 1) this.classList.add('last-row')
    if (this.x === 0) this.classList.add('first-column')
    if (this.x === this.board.level.size - 1) this.classList.add('last-column')
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
    value.x = this.x
    value.y = this.y
    value.classList.remove('moving')
    value.style.transform = null
    this.append(value)
  }

  mousedown () {
    if (this.board.animating) return

    if (this.locked) return this.board.unselectAll()

    if (this.board.findJewelSelected() === null) {
      this.board.unselectAll()
      this.board.updateTargetables(this)
      this.board.grabbing = true
      this.selected = true
      this.lastClick = Date.now()
    }
  }

  mouseup (event) {
    if (this.board.animating) return
    this.board.grabbing = false

    event.preventDefault()
    event.stopPropagation()

    const target = event.changedTouches && event.changedTouches.length > 0 ?
      document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY) :
      this

    if (!target) return
    if (target.locked) return target.board.unselectAll()

    if (target.targetable) {
      const selected = target.board.findJewelSelected()
      return target.board.flipJewels(target.jewel, selected)
    }

    if (!target.lastClick || Date.now() - target.lastClick > 250)
      target.board.unselectAll()
  }
}

customElements.define('board-slot', Slot)
