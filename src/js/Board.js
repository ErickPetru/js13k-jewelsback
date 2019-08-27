import Slot from './Slot'
import Jewel from './Jewel'
import MatchChecker from './MatchChecker'
import MoveChecker from './MoveChecker'

export default class Board extends HTMLElement {
  slots = []

  constructor () {
    super()

    this.matchChecker = new MatchChecker(this)
    this.moveChecker = new MoveChecker(this)

    document.addEventListener('click', (event) => {
      const outside = [document.documentElement, document.body]
      if (!event.target || outside.indexOf(event.target) > -1) {
        event.stopPropagation()
        this.unselectAll()
      }
    })
  }

  get grabbing () {
    return this.getAttribute('grabbing') === '' ? true : false
  }

  set grabbing (value) {
    value ? this.setAttribute('grabbing', '') : this.removeAttribute('grabbing')
  }

  get jewels () {
    return this.slots.filter(s => !s.locked).map(s => s.firstChild)
  }

  get occupiedSlots () {
    return this.slots.filter(s => !s.locked)
  }

  startLevel (level) {
    this.slots = []

    this.style['grid-template-columns'] = `repeat(${level.size}, 1fr)`
    this.style['grid-template-rows'] = `repeat(${level.size}, 1fr)`

    for (let y = 0; y < level.size; y++) {
      for (let x = 0; x < level.size; x++) {
        const slot = new Slot(x, y)
        slot.locked = level.locks.some(l => l.x === x && l.y === y)

        if (!slot.locked) {
          let shape = this.matchChecker.generateUnmatchableShape(x, y)
          slot.append(new Jewel(x, y, shape))
        }

        this.append(slot)
        this.slots.push(slot)
      }
    }
  }

  findSlotByPosition(x, y) {
    return this.querySelector(`board-slot[x="${x}"][y="${y}"]`)
  }

  findJewelByPosition(x, y) {
    return this.querySelector(`jewel-piece[x="${x}"][y="${y}"]`)
  }

  findJewelSelected() {
    return this.querySelector(`board-slot[selected] > jewel-piece`)
  }

  getCSSVariable (key) {
    return getComputedStyle(document.documentElement).getPropertyValue(key)
  }

  unselectAll () {
    for (let slot of this.occupiedSlots) {
      slot.targetable = false
      slot.selected = false
    }
  }

  updateTargetables (slot) {
    const moves = this.moveChecker.findPossibleMoves(slot.jewel)
    for (let slot of moves) slot.targetable = true
  }

  flipJewels (target) {
    const selected = this.findJewelSelected()

    if (target.x > selected.x) {
      target.style.transform = `translateX(${-target.slot.offsetWidth}px)`
      selected.style.transform = `translateX(${selected.slot.offsetWidth}px)`
    } else if (target.x < selected.x) {
      target.style.transform = `translateX(${target.slot.offsetWidth}px)`
      selected.style.transform = `translateX(${-selected.slot.offsetWidth}px)`
    } else if (target.y > selected.y) {
      target.style.transform = `translateY(${-target.slot.offsetHeight}px)`
      selected.style.transform = `translateY(${selected.slot.offsetHeight}px)`
    } else {
      target.style.transform = `translateY(${target.slot.offsetHeight}px)`
      selected.style.transform = `translateY(${-selected.slot.offsetHeight}px)`
    }

    setTimeout((board, selected, target) => {
      const selectedSlot = board.findSlotByPosition(selected.x, selected.y)
      const targetSlot = board.findSlotByPosition(target.x, target.y)

      selectedSlot.jewel = target
      targetSlot.jewel = selected

      board.unselectAll()
      board.explodeMatches()
    }, 350, this, selected, target)
  }

  explodeMatches () {
    // TODO: Find matches and explode jewels.
    // TODO: Get new jewels.
    // TODO: Increase score/level up.
  }
}

customElements.define('game-board', Board)
