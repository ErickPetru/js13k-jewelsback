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
    value ? this.setAttribute('grabbing', '') : this.removeAttribute('grabbing')
  }

  get jewels () {
    return this.slots.filter(s => !s.locked).map(s => s.firstChild)
  }

  get occupiedSlots () {
    return this.slots.filter(s => !s.locked)
  }

  async startLevel (level) {
    this.slots = []
    this.level = level

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

    this.fillEmptySlots()
  }

  async fillEmptySlots () {
    function groupBy(list, keyGetter) {
      const map = new Map()
      list.forEach((item) => {
        const key = keyGetter(item)
        const collection = map.get(key)
        if (!collection) {
          map.set(key, [item])
        } else {
          collection.push(item)
        }
      })

      return map
    }

    let empties = this.slots.filter(s => !s.locked && !s.jewel)
    empties = empties.sort((a, b) => b.y - a.y || a.x - b.x)
    let rows = groupBy(empties, slot => slot.y)

    const spec = this.level.specials

    for (let row of rows) {
      for (let slot of row[1]) {
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
      await this.game.delay(this.GAME_ENV === 'prod' ? 300 : 1)
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

  findJewelsBySpecial(special) {
    return this.querySelectorAll(`jewel-piece[promoted="${special}"]`)
  }

  unselectAll () {
    for (let slot of this.occupiedSlots) {
      slot.targetable = false
      slot.selected = false
    }
  }

  updateTargetables (slot) {
    const jewels = this.moveChecker.findPossibleMoves(slot.jewel)
    for (let jewel of jewels) jewel.slot.targetable = true
  }

  async flipJewels (target) {
    const selected = this.findJewelSelected()

    if (target.x > selected.x) {
      this.game.setStylesWithTransition(target, {
        transform: `translateX(${-target.slot.offsetWidth}px)`
      })

      await this.game.setStylesWithTransition(selected, {
        transform: `translateX(${selected.slot.offsetWidth}px)`
      })
    } else if (target.x < selected.x) {
      this.game.setStylesWithTransition(target, {
        transform: `translateX(${target.slot.offsetWidth}px)`
      })

      await this.game.setStylesWithTransition(selected, {
        transform: `translateX(${-selected.slot.offsetWidth}px)`
      })
    } else if (target.y > selected.y) {
      this.game.setStylesWithTransition(target, {
        transform: `translateY(${-target.slot.offsetHeight}px)`
      })

      await this.game.setStylesWithTransition(selected, {
        transform: `translateY(${selected.slot.offsetHeight}px)`
      })
    } else {
      this.game.setStylesWithTransition(target, {
        transform: `translateY(${target.slot.offsetHeight}px)`
      })

      await this.game.setStylesWithTransition(selected, {
        transform: `translateY(${-selected.slot.offsetHeight}px)`
      })
    }

    const selectedSlot = this.findSlotByPosition(selected.x, selected.y)
    const targetSlot = this.findSlotByPosition(target.x, target.y)

    selectedSlot.jewel = target
    targetSlot.jewel = selected

    this.explodeMatches()
    this.unselectAll()
  }

  explodeMatches () {
    const jewels = []
    for (let y = this.level.size - 1; y > -1; y--) {
      for (let x = 0; x < this.level.size; x++) {
        const jewel = this.findJewelByPosition(x, y)
        if (!jewel) continue
        jewels.push(...this.matchChecker.findPossibleMatches(jewel))
      }
    }

    const normalJewels = jewels.filter(jewel => !jewel.promoted)
    for (let jewel of normalJewels)
      jewel.classList.add('exploding')

    // TODO: Improved explosions for special jewels.
    // TODO: Increase score/level up.

    setTimeout((board, normalJewels) => {
      normalJewels.forEach(jewel => jewel.remove())
      board.moveRows()
    }, 300, this, normalJewels)
  }

  moveRows () {
    // TODO: Move down the jewels of the same row.
    // TODO: Get new jewels and move then down.
  }
}

customElements.define('game-board', Board)
