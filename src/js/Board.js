import Slot from './Slot'
import Jewel from './Jewel'
import MatchChecker from './MatchChecker'
import MoveChecker from './MoveChecker'

export default class Board extends HTMLElement {
  slots = []
  level = null

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
    return this.unlockedSlots.filter(s => s.jewel)
  }

  get emptySlots () {
    return this.unlockedSlots.filter(s =>
      !s.jewel || s.jewel.classList.contains('moving'))
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

  async startLevel (level) {
    this.slots = []
    this.level = level

    this.animating = true
    this.game.setStyles(this, {
      opacity: 0, transform: 'scale(.75)',
      gridTemplateColumns: `repeat(${level.size}, 1fr)`,
      gridTemplateRows: `repeat(${level.size}, 1fr)`,
    })

    for (let y = 0; y < level.size; y++) {
      for (let x = 0; x < level.size; x++) {
        const slot = new Slot(x, y)
        slot.locked = level.locks.some(l => l.x === x && l.y === y)
        this.append(slot)
        this.slots.push(slot)
      }
    }

    await this.game.setStylesWithTransition(this, {
      opacity: 1, transform: 'scale(1)'
    })

    await this.fillEmptySlots()
    this.animating = false
  }

  async fillEmptySlots () {
    const rows = this.emptySlotsGroupedByRow
    const spec = this.level.specials

    for (let row of rows.keys()) {
      for (let slot of rows.get(row)) {
        const shape = this.matchChecker.generateUnmatchableShape(slot.x, slot.y)
        const jewel = new Jewel(slot.x, slot.y, shape)
        slot.append(jewel)

        if (spec) {
          const promotions = []

          if (spec.smoke > this.findJewelsBySpecial('smoke').length)
            promotions.push('smoke')
          if (spec.fire > this.findJewelsBySpecial('fire').length)
            promotions.push('fire')
          if (spec.star > this.findJewelsBySpecial('star').length)
            promotions.push('star')
          if (spec.rainbow > this.findJewelsBySpecial('rainbow').length)
            promotions.push('rainbow')
          if (spec.nebula > this.findJewelsBySpecial('nebula').length)
            promotions.push('nebula')

          jewel.promoted = jewel.generateRandomPromotion(promotions)
        }

        slot.jewel.arrive()
      }

      // TODO: Use CSS variables to better configure timing
      await this.game.delay(this.game.ENV === 'prod' ? 150 : 1)
    }
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

  findJewelsBySpecial(special) {
    return this.querySelectorAll(`jewel-piece[promoted="${special}"]`)
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

  async flipJewels (current, destination) {
    if (!current || !destination) return

    this.animating = true
    if (current.x > destination.x) {
      this.game.setStylesWithTransition(current, {
        transform: `translateX(${-current.slot.offsetWidth}px)`
      })

      await this.game.setStylesWithTransition(destination, {
        transform: `translateX(${destination.slot.offsetWidth}px)`
      })
    } else if (current.x < destination.x) {
      this.game.setStylesWithTransition(current, {
        transform: `translateX(${current.slot.offsetWidth}px)`
      })

      await this.game.setStylesWithTransition(destination, {
        transform: `translateX(${-destination.slot.offsetWidth}px)`
      })
    } else if (current.y > destination.y) {
      this.game.setStylesWithTransition(current, {
        transform: `translateY(${-current.slot.offsetHeight}px)`
      })

      await this.game.setStylesWithTransition(destination, {
        transform: `translateY(${destination.slot.offsetHeight}px)`
      })
    } else {
      this.game.setStylesWithTransition(current, {
        transform: `translateY(${current.slot.offsetHeight}px)`
      })

      await this.game.setStylesWithTransition(destination, {
        transform: `translateY(${-destination.slot.offsetHeight}px)`
      })
    }

    const slot1 = this.findSlotByPosition(destination.x, destination.y)
    const slot2 = this.findSlotByPosition(current.x, current.y)
    slot1.jewel = current
    slot2.jewel = destination

    this.explodeMatches()
    this.unselectAll()
  }

  async explodeMatches () {
    const jewels = []
    for (let y = this.level.size - 1; y > -1; y--) {
      for (let x = 0; x < this.level.size; x++) {
        const jewel = this.findJewelByPosition(x, y)
        if (!jewel) continue
        jewels.push(...this.matchChecker.findPossibleMatches(jewel))
        // TODO: Create special jewels caused by deep explosions.
      }
    }

    if (jewels.length === 0) return

    this.animating = true
    const normalJewels = jewels.filter(jewel => !jewel.promoted)
    for (let jewel of normalJewels) {
      jewel.slot.classList.add('exploding')
      jewel.classList.add('exploding')
    }

    // TODO: Improved explosions for special jewels.
    // TODO: Increase score/level up.

    await this.game.delay(100)
    normalJewels.forEach(jewel => jewel.remove())
    await this.moveRows()
    await this.fillEmptySlots()
    await this.explodeMatches()
    this.animating = false
  }

  async moveRows () {
    const alreadyChecked = []
    for (let y = this.level.size - 1; y > -1; y--) {
      const row = this.emptySlots.filter(slot => slot.y === y)
      for (let empty of row) {
        const previous = this.occupiedSlots
          .filter(slot => alreadyChecked.indexOf(slot) === -1)
          .filter(slot => slot.x === empty.x && slot.y < empty.y)
          .sort((a, b) => b.y - a.y).shift()

        alreadyChecked.push(previous)
        if (!previous || !previous.jewel) continue

        empty.classList.remove('exploding')
        previous.jewel.classList.add('moving')
        previous.jewel.future = empty

        const difference = empty.y - previous.y
        this.game.setStylesWithTransition(previous.jewel, {
          transform: `translateY(${previous.offsetHeight * difference}px)`
        })
      }

      await this.game.delay(125)
    }

    const moving = this.jewels
      .filter(j => j.classList.contains('moving'))
      .sort((a, b) => b.y - a.y)

    for (let jewel of moving) {
      const destination = jewel.future
      jewel.classList.remove('moving')
      this.game.setStyles(jewel, { transform: null })
      destination.append(jewel)
      jewel.x = destination.x
      jewel.y = destination.y
      delete jewel.future
    }
  }
}

customElements.define('game-board', Board)
