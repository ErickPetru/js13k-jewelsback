export default class Jewel extends HTMLElement {
  static types = ['square', 'heptagon', 'triangle',
    'diamond', 'hexagon', 'circle']

  constructor (x, y, type = 'square') {
    super()

    this.type = type
    this.x = x
    this.y = y

    const border = document.createElement('div')
    border.className = 'border'
    this.append(border)

    const shape = document.createElement('div')
    shape.className = 'shape'
    border.append(shape)
  }

  get type () {
    return this.getAttribute('type')
  }

  set type (value) {
    this.setAttribute('type', value)
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

  get matchable () {
    return this.getAttribute('matchable') === '' ? true : false
  }

  set matchable (value) {
    const attr = 'matchable'
    value ? this.setAttribute(attr, '') : this.removeAttribute(attr)
  }

  get board () {
    return this.slot.parentElement
  }

  get slot () {
    return this.parentElement
  }
}

customElements.define('jewel-piece', Jewel)
