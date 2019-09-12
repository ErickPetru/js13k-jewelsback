export default class Jewel extends HTMLElement {
  futureSlot = null
  futurePromotion = false

  constructor (slot, type) {
    super()

    this.type = type
    this.checked = false
    this.x = slot.x
    this.y = slot.y

    this.setAttribute('hidden', '')
    const border = document.createElement('div')
    const shape = document.createElement('div')
    border.className = 'border'
    this.append(border)
    shape.className = 'shape'
    border.append(shape)
    slot.append(this)
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

  static superSpecials = [
    'rainbow', 'nebula'
  ]

  static get allTypes () {
    return Object.keys(Jewel.types)
  }

  static get allSpecials () {
    return Object.keys(Jewel.specials)
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

  get above () {
    return this.parentElement
  }

  get canBePromoted () {
    return this.matchable && !this.promoted
  }

  generateRandomPromotion (specials, jewels) {
    if (specials) {
      const promotions = []
      if (specials.smoke > jewels.filter(j => j.promoted === 'smoke').length)
        promotions.push('smoke')
      if (specials.fire > jewels.filter(j => j.promoted === 'fire').length)
        promotions.push('fire')
      if (specials.star > jewels.filter(j => j.promoted === 'star').length)
        promotions.push('star')
      if (specials.rainbow > jewels.filter(j => j.promoted === 'rainbow').length)
        promotions.push('rainbow')
      if (specials.nebula > jewels.filter(j => j.promoted === 'nebula').length)
        promotions.push('nebula')

      if (promotions.length > 0) {
        const length = Object.values(specials).reduce((a, b) => a + b)
        const chance = length + this.board.level.size * (this.board.level.size / 2)
        const rnd = Math.floor(Math.random() * chance)
        if (rnd < promotions.length) this.promoted = Object.values(promotions)[rnd]
      }
    }
  }

  async move (arriving = true) {
    this.removeAttribute('hidden')
    if (arriving) {
      this.classList.add('arriving')
      await this.game.delay(150)
      this.classList.remove('arriving')
    } else {
      const deltaY = this.slot.getBoundingClientRect().height * (this.y + 1)
      this.style.transform = `translate3d(0, ${-deltaY}px, 0)`
      await this.game.delay()
      this.classList.add('falling')
      this.style.transform = null
      await this.game.delay(150)
      this.classList.remove('falling')
    }
  }
}

customElements.define('jewel-piece', Jewel)
