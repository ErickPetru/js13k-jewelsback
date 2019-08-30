export default class Jewel extends HTMLElement {
  constructor (x, y, type) {
    super()

    this.type = type
    this.checked = false
    this.x = x
    this.y = y

    this.className = 'arriving transitions-off'

    const border = document.createElement('div')
    border.className = 'border'
    this.append(border)

    const shape = document.createElement('div')
    shape.className = 'shape'
    border.append(shape)
  }

  connectedCallback () {
    if (this.hasClass('arriving')) {
      const top = -this.offsetHeight - this.board.offsetTop - this.slot.offsetTop

      let duration = null
      if (this.board.GAME_ENV === 'prod')
        duration = `${+((this.y + 1) / (this.board.level.size * 1.25) + .1)}s`

      this.game.setStyles(this, {
        opacity: .5, transform: `translateY(${top}px)`,
        transitionDuration: duration
      })
    }
  }

  async arrive () {
    await this.game.setStylesWithTransition(this, {
      opacity: null, transform: null, transitionDuration: null
    })
    this.classList.remove('arriving')
  }

  static types = {
    square: 'square',
    heptagon: 'heptagon',
    triangle: 'triangle',
    diamond: 'diamond',
    hexagon: 'hexagon',
    circle: 'circle'
  }

  static specials = {
    smoke: 'smoke',
    fire: 'fire',
    star: 'star',
    rainbow: 'rainbow',
    nebula: 'nebula'
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

  get promoted () {
    return this.getAttribute('promoted')
  }

  set promoted (value) {
    const attr = 'promoted'
    value ? this.setAttribute(attr, value) : this.removeAttribute(attr)
  }

  get game () {
    return this.board.game
  }

  get board () {
    return this.slot.parentElement
  }

  get slot () {
    return this.parentElement
  }

  get canBePromoted () {
    return this.matchable && !this.promoted
  }

  generateRandomPromotion (specials) {
    const chance = specials.length +
      this.board.level.size * (this.board.level.size / 2)
    const rnd = Math.floor(Math.random() * chance)
    if (rnd < specials.length) return specials[rnd]
    else return null
  }
}

customElements.define('jewel-piece', Jewel)
