import Slot from './Slot'
import Jewel from './Jewel'
import MatchChecker from './MatchChecker'
import MoveChecker from './MoveChecker'
import Sounds from './Sounds'

export default class Board extends HTMLElement {
  slots = []
  level = null
  height = null
  scoreMultiplier = 0
  static startingLevel = 0

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

  async unselectAll () {
    for (let slot of this.unlockedSlots) {
      slot.targetable = false
      slot.selected = false
    }
  }

  updateTargetables (slot) {
    const jewels = this.moveChecker.findPossibleMoves(slot.jewel)
    for (let jewel of jewels) jewel.slot.targetable = true
  }

  async startLevel (level = Board.startingLevel) {
    if (this.game.levels.length - 1 < level) {
      Sounds.won.play()
      this.showGameEnd('Congratulations!', 'You won!')
      this.explodeAll(false)
      return
    }

    this.animating = true
    this.level = this.game.levels.filter(l => l.index === level).shift()
    this.slots.forEach(slot => slot.remove())
    this.slots = []
    this.scoreMultiplier = 0

    if (this.level.index === Board.startingLevel) {
      this.style.opacity = 0
      await this.game.delay(500)
    }

    this.style.gridTemplateColumns =
      this.style.gridTemplateRows = `repeat(${this.level.size}, 1fr)`

    for (let y = 0; y < this.level.size; y++) {
      for (let x = 0; x < this.level.size; x++) {
        const slot = new Slot(x, y)
        slot.locked = this.level.locks &&
          this.level.locks.some(l => l.x === x && l.y === y)
        this.append(slot)
        this.slots.push(slot)
      }
    }

    if (this.level.name) {
      Sounds.won.play()
      this.game.message = this.level.name
      await this.game.delay(2200)
      if (this.level.description) {
        this.game.message = this.level.description
        const time = this.level.description.split(' ').length * 250
        await this.game.delay(time)
      }
    } else {
      this.game.message = `Level ${this.level.index}`
      await this.game.delay(1500)
    }

    this.style.opacity = 1
    await this.game.delay(300)
    await this.fillEmptySlots()

    if (this.level.index === Board.startingLevel) {
      this.game.message = 'Let\'s go!'
      await this.game.delay(600)
    }

    delete this.level.specials
    this.game.message = ''
    this.animating = false

    if (!await this.hasPossibleMovesRemaining()) {
      this.animating = true
      await this.game.delay(300)
      Sounds.gameOver.play()
      return this.showGameEnd('Out of luck...', 'Game Over!')
    }
  }

  async fillEmptySlots (arriving = true) {
    const rows = this.emptySlotsGroupedByRow
    for (let row of rows.keys()) {
      for (let slot of rows.get(row)) {
        if (slot.jewel) slot.jewel.remove()

        let shape = null
        try {
          shape = this.matchChecker.generateUnmatchableShape(slot.x, slot.y)
        } catch {
          const shapes = Jewel.allTypes
          shape = shapes[Math.random() * shapes.length << 0]
        }

        const jewel = new Jewel(slot, shape)
        jewel.generateRandomPromotion(this.level.specials, this.findJewelsPromoted())
        jewel.move(arriving)
      }
      await this.game.delay(arriving ? 200 : 100)
    }
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

    if (current.promoted === Jewel.specials.nebula &&
      destination.promoted === Jewel.specials.nebula) {
      Sounds.gameOver.play()
      return this.showGameEnd('Greed is ugly...', 'Game Over!')
    } else if (current.promoted === Jewel.specials.rainbow &&
      destination.promoted === Jewel.specials.rainbow)
      await this.explodeAll()
    else if (current.promoted === Jewel.specials.nebula)
      await this.explodeNebula(current, destination)
    else if (destination.promoted === Jewel.specials.nebula)
      await this.explodeNebula(destination, current)
    else if (current.promoted === Jewel.specials.rainbow)
      await this.explodeRainbow(current, destination)
    else if (destination.promoted === Jewel.specials.rainbow)
      await this.explodeRainbow(destination, current)
    else
      await this.explodeMatches()

    await this.unselectAll()

    if (await this.isLevelCompleted()) {
      setTimeout(() => this.startLevel(this.level.index + 1), 150)
      return true
    } else if (await this.hasPossibleMovesRemaining()) {
      this.animating = false
      return true
    } else {
      Sounds.gameOver.play()
      this.showGameEnd('No more moves...', 'Game Over!')
      return false
    }
  }

  async showGameEnd (prephrase, phrase) {
    if (prephrase) {
      this.animating = true
      this.game.message = prephrase
      await this.game.delay(1500)
    }

    this.game.message = phrase
    if (this.game.score > 0) {
      const finalScore = document.getElementById('finalScore')
      finalScore.textContent = 'Final score: ' + this.game.score
      finalScore.removeAttribute('hidden')
    }
  }

  async explodeAll(refill = true) {
    await this.finishExplosion(this.jewels, refill)
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

    await this.finishExplosion(jewels)
  }

  async explodeRainbow(rainbow, neighbor) {
    const jewels = [rainbow]
    jewels.push(...this.findJewelsByType(neighbor.type))
    await this.finishExplosion(jewels)
  }

  async explodeMatches () {
    const jewels = []
    for (let y = this.level.size - 1; y > -1; y--) {
      for (let x = 0; x < this.level.size; x++) {
        const jewel = this.findJewelByPosition(x, y)
        if (!jewel) continue
        jewels.push(...this.matchChecker.findPossibleMatches(jewel))
      }
    }

    await this.finishExplosion(jewels)
  }

  async finishExplosion (jewels, refill = true) {
    if (jewels.length === 0) return

    Sounds.plop.play()
    this.animating = true
    this.scoreMultiplier++

    let explosions = [...new Set(jewels.filter(j => j !== null))]
    if (refill) explosions = explosions.filter(j => !j.futurePromotion)

    explosions.forEach(j => {
      this.game.score += this.scoreMultiplier
      j.slot.classList.add('exploding')
      j.classList.add('exploding')
    })

    await this.game.delay(350)

    explosions.forEach(j => {
      j.setAttribute('hidden', '')
      j.classList.remove('exploding')
    })

    if (refill) {
      await this.moveRows()
      await this.fillEmptySlots(false)
      await this.explodeMatches()
      jewels.filter(j => j.futurePromotion).forEach(j => j.futurePromotion = false)
    }

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

  async isLevelCompleted () {
    if (this.game.score >= this.level.milestone) {
      if (this.level.index !== this.game.levels.length - 1) {
        Sounds.levelUp.play()
        this.game.message = 'Level completed!'
        this.scoreMultiplier = -1
        await this.explodeAll(false)
        await this.game.delay(1500)
      }
      return true
    }

    return false
  }

  async hasPossibleMovesRemaining () {
    const moves = []
    for (let y = this.level.size - 1; y > -1; y--) {
      for (let x = 0; x < this.level.size; x++) {
        const jewel = this.findJewelByPosition(x, y)
        if (!jewel) continue
        moves.push(...this.moveChecker.findPossibleMoves(jewel))
      }
    }

    return moves.length > 0
  }
}

customElements.define('game-board', Board)
