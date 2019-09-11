import Slot from './Slot'
import Jewel from './Jewel'
import MatchChecker from './MatchChecker'
import MoveChecker from './MoveChecker'

export default class Board extends HTMLElement {
  slots = []
  level = null
  height = null
  scoreMultiplier = 0

  constructor (game) {
    super()

    this.game = game
    this.matchChecker = new MatchChecker(this)
    this.moveChecker = new MoveChecker(this)

    document.addEventListener('click', (event) => {
      const outside = [document.documentElement, document.body]
      if (!event.target || outside.includes(event.target)) {
        event.stopPropagation()
        this.unselectAll()
      }
    })
  }

  connectedCallback () {
    this.height = this.offsetHeight
  }

  get grabbing () {
    return this.getAttribute('grabbing') === '' ? true : false
  }

  set grabbing (value) {
    const attr = 'grabbing'
    value ? this.setAttribute(attr, '') : this.removeAttribute(attr)
  }

  get animating () {
    return this.getAttribute('animating') === '' ? true : false
  }

  set animating (value) {
    const attr = 'animating'
    value ? this.setAttribute(attr, '') : this.removeAttribute(attr)
  }

  get jewels () {
    return this.occupiedSlots.map(s => s.firstChild)
  }

  get unlockedSlots () {
    return this.slots.filter(s => !s.locked)
  }

  get occupiedSlots () {
    return this.unlockedSlots.filter(s => s.jewel && !s.jewel.hasAttribute('hidden'))
  }

  get emptySlots () {
    return this.unlockedSlots.filter(s => !s.jewel ||
      s.jewel.hasAttribute('hidden') || s.jewel.classList.contains('moving'))
  }

  get emptySlotsGroupedByRow () {
    const empties = this.emptySlots.sort((a, b) => b.y - a.y || a.x - b.x)

    const groups = new Map()
    empties.forEach(slot => {
      const group = groups.get(slot.y)
      if (group) group.push(slot)
      else groups.set(slot.y, [slot])
    })

    return groups
  }

  findSlotByPosition(x, y) {
    return this.querySelector(`board-slot[x="${x}"][y="${y}"]`)
  }

  findUnlockedSlotBelow(jewel) {
    return this.unlockedSlots
      .filter(slot => slot.x === jewel.x && slot.y > jewel.y)
      .sort((a, b) => a.y - b.y).shift()
  }

  findJewelByPosition(x, y) {
    return this.querySelector(`jewel-piece[x="${x}"][y="${y}"]`)
  }

  findJewelSelected() {
    return this.querySelector(`board-slot[selected] > jewel-piece`)
  }

  findJewelsByType(type) {
    return this.querySelectorAll(`jewel-piece[type="${type}"]`)
  }

  findJewelsBySpecial(special) {
    return this.querySelectorAll(`jewel-piece[promoted="${special}"]`)
  }

  findJewelsPromoted() {
    return Array.from(this.querySelectorAll(`jewel-piece[promoted]`))
  }

  unselectAll () {
    for (let slot of this.unlockedSlots) {
      slot.targetable = false
      slot.selected = false
    }
  }

  updateTargetables (slot) {
    const jewels = this.moveChecker.findPossibleMoves(slot.jewel)
    for (let jewel of jewels) jewel.slot.targetable = true
  }

  async startLevel (level) {
    this.slots = []
    this.level = level
    this.style.gridTemplateColumns = this.style.gridTemplateRows = `repeat(${level.size}, 1fr)`

    for (let y = 0; y < level.size; y++) {
      for (let x = 0; x < level.size; x++) {
        const slot = new Slot(x, y)
        slot.locked = level.locks.some(l => l.x === x && l.y === y)
        this.append(slot)
        this.slots.push(slot)
      }
    }

    await this.game.delay(250)
    await this.fillEmptySlots()
  }

  async fillEmptySlots (arriving = true) {
    this.animating = true
    const rows = this.emptySlotsGroupedByRow
    for (let row of rows.keys()) {
      for (let slot of rows.get(row)) {
        if (slot.jewel) slot.jewel.remove()
        const shape = this.matchChecker.generateUnmatchableShape(slot.x, slot.y)
        const jewel = new Jewel(slot, shape)
        jewel.generateRandomPromotion(this.level.specials, this.findJewelsPromoted())
        jewel.move(arriving)
      }
      await this.game.delay(arriving ? 200 : 100)
    }
    this.animating = false
  }

  async flipJewels (current, destination) {
    if (!current || !destination) return

    this.animating = true
    this.scoreMultiplier = 0

    current.classList.add('flipping')
    destination.classList.add('flipping')
    const currentRect = current.getBoundingClientRect()
    const destinationRect = destination.getBoundingClientRect()

    if (current.x > destination.x) {
      current.style.transform = `translate3d(${-currentRect.width}px, 0, 0)`
      destination.style.transform = `translate3d(${destinationRect.width}px, 0, 0)`
    } else if (current.x < destination.x) {
      current.style.transform = `translate3d(${currentRect.width}px, 0, 0)`
      destination.style.transform = `translate3d(${-destinationRect.width}px, 0, 0)`
    } else if (current.y > destination.y) {
      current.style.transform = `translate3d(0, ${-currentRect.height}px, 0)`
      destination.style.transform = `translate3d(0, ${destinationRect.height}px, 0)`
    } else {
      current.style.transform = `translate3d(0, ${currentRect.height}px, 0)`
      destination.style.transform = `translate3d(0, ${-destinationRect.height}px, 0)`
    }

    await this.game.delay(150)
    current.classList.remove('flipping')
    destination.classList.remove('flipping')

    const slot1 = this.findSlotByPosition(destination.x, destination.y)
    const slot2 = this.findSlotByPosition(current.x, current.y)
    slot1.jewel = current
    slot2.jewel = destination

    if (current.promoted === Jewel.specials.nebula)
      this.explodeNebula(current, destination)
    else if (destination.promoted === Jewel.specials.nebula)
      this.explodeNebula(destination, current)
    else if (current.promoted === Jewel.specials.rainbow)
      this.explodeRainbow(current, destination)
    else if (destination.promoted === Jewel.specials.rainbow)
      this.explodeRainbow(destination, current)
    else
      this.explodeMatches()

    this.unselectAll()
  }

  async explodeNebula(nebula, neighbor) {
    const promotions = []
    const jewels = [nebula]

    jewels.push(...this.findJewelsByType(neighbor.type))
    jewels.forEach(j => {
      if (j.promoted && !j.futurePromotion) jewels.push(j)
      else promotions.push(j)
    })

    if (promotions.length > 0) {
      this.scoreMultiplier++

      promotions.forEach(j => {
        this.game.score += this.scoreMultiplier
        j.slot.classList.add('exploding')
        j.classList.add('exploding')
      })

      await this.game.delay(350)

      promotions.forEach(j => {
        j.classList.remove('exploding')
        j.promoted = Jewel.specials.rainbow
        j.futurePromotion = true
      })
    }

    this.finishExplosion(jewels)
  }

  async explodeRainbow(rainbow, neighbor) {
    const jewels = [rainbow]
    jewels.push(...this.findJewelsByType(neighbor.type))
    this.finishExplosion(jewels)
  }

  async explodeMatches () {
    const jewels = []
    for (let y = this.level.size - 1; y > -1; y--) {
      for (let x = 0; x < this.level.size; x++) {
        const jewel = this.findJewelByPosition(x, y)
        if (!jewel) continue

        // TODO: Improved explosions for special jewels.
        // TODO: Create special jewels caused by deep explosions.

        jewels.push(...this.matchChecker.findPossibleMatches(jewel))
      }
    }

    this.finishExplosion(jewels)
  }

  async finishExplosion (jewels) {
    if (jewels.length === 0) return

    this.animating = true
    this.scoreMultiplier++

    jewels.filter(j => !j.futurePromotion).forEach(j => {
      this.game.score += this.scoreMultiplier
      j.slot.classList.add('exploding')
      j.classList.add('exploding')
    })

    await this.game.delay(350)

    jewels.filter(j => !j.futurePromotion).forEach(jewel => {
      jewel.setAttribute('hidden', '')
      jewel.classList.remove('exploding')
    })

    await this.moveRows()
    await this.fillEmptySlots(false)
    await this.explodeMatches()

    jewels.filter(j => j.futurePromotion).forEach(j => j.futurePromotion = false)
    this.animating = false
  }

  async moveRows () {
    const alreadyChecked = []
    for (let y = this.level.size - 1; y > -1; y--) {
      let somethingMoved = false
      const row = this.emptySlots.filter(slot => slot.y === y)

      for (let empty of row) {
        const previous = this.occupiedSlots
          .filter(slot => alreadyChecked.indexOf(slot) === -1)
          .filter(slot => slot.x === empty.x && slot.y < empty.y)
          .sort((a, b) => b.y - a.y).shift()

        alreadyChecked.push(previous)
        if (!previous || !previous.jewel) continue

        somethingMoved = true
        empty.classList.remove('exploding')
        previous.jewel.futureSlot = empty
        previous.jewel.classList.add('moving')
        const deltaY = previous.getBoundingClientRect().height * (empty.y - previous.y)
        previous.jewel.style.transform = `translate3d(0, ${deltaY}px, 0)`
      }

      if (somethingMoved) {
        await this.game.delay(100)

        const moving = this.jewels
        .filter(j => j.classList.contains('moving'))
        .sort((a, b) => b.y - a.y)

        for (let jewel of moving) {
          const currentSlot = jewel.slot
          const destinationSlot = jewel.futureSlot
          const destinationJewel = destinationSlot.jewel
          currentSlot.jewel = destinationJewel
          destinationSlot.jewel = jewel
          delete jewel.futureSlot
        }
      }
    }
  }
}

customElements.define('game-board', Board)
