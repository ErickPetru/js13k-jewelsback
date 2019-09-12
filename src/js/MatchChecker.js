import Jewel from './Jewel'

export default class MatchChecker {
  constructor (board) {
    this.board = board
  }

  generateUnmatchableShape (x, y, undesired) {
    let shapes = this.board.level.types ? this.board.level.types : Jewel.allTypes
    shapes = shapes.filter(k => k !== undesired)
    const shape = shapes[Math.random() * shapes.length << 0]

    const previous = this.board.findJewelByPosition(x - 1, y)
    const below = this.board.findJewelByPosition(x, y + 1)
    const beforeBelowPrevious = this.board.findJewelByPosition(x - 1, y + 1)

    if (previous && below && beforeBelowPrevious &&
        below.type === shape && previous.type === shape && beforeBelowPrevious.type === shape)
      return this.generateUnmatchableShape(x, y, shape)

    const beforePrevious = this.board.findJewelByPosition(x - 2, y)
    if (previous && beforePrevious &&
        previous.type === shape && beforePrevious.type === shape)
      return this.generateUnmatchableShape(x, y, shape)

    const beforeBelow = this.board.findJewelByPosition(x, y + 2)
    if (below && beforeBelow &&
        below.type === shape && beforeBelow.type === shape)
      return this.generateUnmatchableShape(x, y, shape)

    return shape
  }

  checkMatchables (current, ...neighbours) {
    for (let jewel of neighbours) {
      if (!jewel || current.type !== jewel.type) return []
    }

    return [current, ...neighbours]
  }

  findPossibleMatches (jewel) {
    if (!jewel) return []
    const matches = []
    let alreadyPromoted = false

    matches.push(...this.findMatchesForNebula(jewel, jewel.canBePromoted))
    if (matches.length > 0) alreadyPromoted = true

    matches.push(...this.findMatchesForRainbow(jewel, !alreadyPromoted && jewel.canBePromoted))
    if (matches.length > 0) alreadyPromoted = true

    matches.push(...this.findMatchesForStar(jewel, !alreadyPromoted && jewel.canBePromoted))
    if (matches.length > 0) alreadyPromoted = true

    matches.push(...this.findMatchesForFire(jewel, !alreadyPromoted && jewel.canBePromoted))
    if (matches.length > 0) alreadyPromoted = true

    matches.push(...this.findMatchesForSmoke(jewel, !alreadyPromoted && jewel.canBePromoted))
    if (matches.length > 0) alreadyPromoted = true

    matches.push(...this.findMatchesOfThree(jewel))
    matches.push(...this.findMatchesForSpecials(matches))

    for (let match of matches) match.checked = true
    return matches
  }

  findMatchesForSpecials (matches) {
    let explosions = [...matches]

    if (matches.length > 0 && matches.some(j => j.promoted && !j.futurePromotion)) {
      const jewels = matches.filter(j => j.promoted && !j.futurePromotion)
      for (let jewel of jewels) {
        const { x, y } = jewel

        if (jewel.promoted === Jewel.specials.smoke) {
          /* 💎💎💎
           * 💎🌀💎
           * 💎💎💎 */
          explosions.push(
            this.board.findJewelByPosition(x + 1, y),
            this.board.findJewelByPosition(x - 1, y),
            this.board.findJewelByPosition(x + 1, y + 1),
            this.board.findJewelByPosition(x + 1, y - 1),
            this.board.findJewelByPosition(x - 1, y + 1),
            this.board.findJewelByPosition(x - 1, y - 1),
            this.board.findJewelByPosition(x, y + 1),
            this.board.findJewelByPosition(x, y - 1)
          )
        } else if (jewel.promoted === Jewel.specials.fire) {
          /*      💎
           *   💎💎💎
           * 💎💎🌀💎💎
           *   💎💎💎
           *      💎 */
          explosions.push(
            this.board.findJewelByPosition(x + 1, y),
            this.board.findJewelByPosition(x - 1, y),
            this.board.findJewelByPosition(x + 1, y + 1),
            this.board.findJewelByPosition(x + 1, y - 1),
            this.board.findJewelByPosition(x - 1, y + 1),
            this.board.findJewelByPosition(x - 1, y - 1),
            this.board.findJewelByPosition(x, y + 1),
            this.board.findJewelByPosition(x, y - 1),
            this.board.findJewelByPosition(x + 2, y),
            this.board.findJewelByPosition(x - 2, y),
            this.board.findJewelByPosition(x, y + 2),
            this.board.findJewelByPosition(x, y - 2)
          )
        } else if (jewel.promoted === Jewel.specials.star) {
          /*    💎^
           * <💎🌀💎>
           *    💎⌄ */
          for (let i = 0; i < this.board.level.size; i++)
            explosions.push(this.board.findJewelByPosition(i, y))

          for (let i = 0; i < this.board.level.size; i++)
            explosions.push(this.board.findJewelByPosition(x, i))
        }
      }
    }

    if (explosions.length > 0) explosions = [...new Set(explosions.filter(j => j !== null))]
    return explosions
  }

  findMatchesForNebula (jewel, canPromote) {
    const { x, y } = jewel
    let matches = []

    /* 💎💎💎🌀💎💎 */
    matches.push(...this.checkMatchables(jewel,
      this.board.findJewelByPosition(x + 2, y),
      this.board.findJewelByPosition(x + 1, y),
      this.board.findJewelByPosition(x - 1, y),
      this.board.findJewelByPosition(x - 2, y),
      this.board.findJewelByPosition(x - 3, y)))

    /* 💎💎🌀💎💎💎 */
    matches.push(...this.checkMatchables(jewel,
      this.board.findJewelByPosition(x + 3, y),
      this.board.findJewelByPosition(x + 2, y),
      this.board.findJewelByPosition(x + 1, y),
      this.board.findJewelByPosition(x - 1, y),
      this.board.findJewelByPosition(x - 2, y)))

    /* 💎
     * 💎
     * 💎
     * 🌀
     * 💎
     * 💎 */
    matches.push(...this.checkMatchables(jewel,
      this.board.findJewelByPosition(x, y - 3),
      this.board.findJewelByPosition(x, y - 2),
      this.board.findJewelByPosition(x, y - 1),
      this.board.findJewelByPosition(x, y + 1),
      this.board.findJewelByPosition(x, y + 2)))

    /* 💎
     * 💎
     * 🌀
     * 💎
     * 💎
     * 💎 */
    matches.push(...this.checkMatchables(jewel,
      this.board.findJewelByPosition(x, y - 2),
      this.board.findJewelByPosition(x, y - 1),
      this.board.findJewelByPosition(x, y + 1),
      this.board.findJewelByPosition(x, y + 2),
      this.board.findJewelByPosition(x, y + 3)))

    return this.promote(canPromote, matches, jewel, Jewel.specials.nebula)
  }

  findMatchesForRainbow (jewel, canPromote) {
    const { x, y } = jewel
    let matches = []

    /* 💎💎🌀💎💎 */
    matches.push(...this.checkMatchables(jewel,
      this.board.findJewelByPosition(x + 2, y),
      this.board.findJewelByPosition(x + 1, y),
      this.board.findJewelByPosition(x - 1, y),
      this.board.findJewelByPosition(x - 2, y)))

    /* 💎
     * 💎
     * 🌀
     * 💎
     * 💎 */
    matches.push(...this.checkMatchables(jewel,
      this.board.findJewelByPosition(x, y - 2),
      this.board.findJewelByPosition(x, y - 1),
      this.board.findJewelByPosition(x, y + 1),
      this.board.findJewelByPosition(x, y + 2)))

    return this.promote(canPromote, matches, jewel, Jewel.specials.rainbow)
  }

  findMatchesForStar (jewel, canPromote) {
    const { x, y } = jewel
    let matches = []

    /* 💎
     * 🌀💎💎
     * 💎 */
    matches.push(...this.checkMatchables(jewel,
      this.board.findJewelByPosition(x, y - 1),
      this.board.findJewelByPosition(x + 1, y),
      this.board.findJewelByPosition(x + 2, y),
      this.board.findJewelByPosition(x, y + 1)))

    /*      💎
     * 💎💎🌀
     *      💎 */
    matches.push(...this.checkMatchables(jewel,
      this.board.findJewelByPosition(x, y - 1),
      this.board.findJewelByPosition(x - 1, y),
      this.board.findJewelByPosition(x - 2, y),
      this.board.findJewelByPosition(x, y + 1)))

    /*   💎
     *   💎
     * 💎🌀💎 */
    matches.push(...this.checkMatchables(jewel,
      this.board.findJewelByPosition(x - 1, y),
      this.board.findJewelByPosition(x + 1, y),
      this.board.findJewelByPosition(x, y - 1),
      this.board.findJewelByPosition(x, y - 2)))

    /* 💎🌀💎
     *   💎
     *   💎 */
    matches.push(...this.checkMatchables(jewel,
      this.board.findJewelByPosition(x - 1, y),
      this.board.findJewelByPosition(x + 1, y),
      this.board.findJewelByPosition(x, y + 1),
      this.board.findJewelByPosition(x, y + 2)))

    /* 💎💎🌀
     *     💎
     *     💎 */
    matches.push(...this.checkMatchables(jewel,
      this.board.findJewelByPosition(x - 1, y),
      this.board.findJewelByPosition(x - 2, y),
      this.board.findJewelByPosition(x, y + 1),
      this.board.findJewelByPosition(x, y + 2)))

    /* 🌀💎💎
     * 💎
     * 💎 */
    matches.push(...this.checkMatchables(jewel,
      this.board.findJewelByPosition(x + 1, y),
      this.board.findJewelByPosition(x + 2, y),
      this.board.findJewelByPosition(x, y + 1),
      this.board.findJewelByPosition(x, y + 2)))

    /*      💎
     *      💎
     * 💎💎🌀 */
    matches.push(...this.checkMatchables(jewel,
      this.board.findJewelByPosition(x - 1, y),
      this.board.findJewelByPosition(x - 2, y),
      this.board.findJewelByPosition(x, y - 1),
      this.board.findJewelByPosition(x, y - 2)))

    /* 💎
     * 💎
     * 🌀💎💎 */
    matches.push(...this.checkMatchables(jewel,
      this.board.findJewelByPosition(x + 1, y),
      this.board.findJewelByPosition(x + 2, y),
      this.board.findJewelByPosition(x, y - 1),
      this.board.findJewelByPosition(x, y - 2)))

    /*   💎
     * 💎🌀💎
     *   💎 */
    matches.push(...this.checkMatchables(jewel,
      this.board.findJewelByPosition(x - 1, y),
      this.board.findJewelByPosition(x + 1, y),
      this.board.findJewelByPosition(x, y - 1),
      this.board.findJewelByPosition(x, y + 1)))

    return this.promote(canPromote, matches, jewel, Jewel.specials.star)
  }

  findMatchesForFire (jewel, canPromote) {
    const { x, y } = jewel
    let matches = []

    /* 💎🌀💎💎 */
    matches.push(...this.checkMatchables(jewel,
      this.board.findJewelByPosition(x - 1, y),
      this.board.findJewelByPosition(x + 1, y),
      this.board.findJewelByPosition(x + 2, y)))

    /* 💎💎🌀💎 */
    matches.push(...this.checkMatchables(jewel,
      this.board.findJewelByPosition(x - 2, y),
      this.board.findJewelByPosition(x - 1, y),
      this.board.findJewelByPosition(x + 1, y)))

    /* 💎
     * 💎
     * 🌀
     * 💎 */
    matches.push(...this.checkMatchables(jewel,
      this.board.findJewelByPosition(x, y - 2),
      this.board.findJewelByPosition(x, y - 1),
      this.board.findJewelByPosition(x, y + 1)))

    /* 💎
     * 🌀
     * 💎
     * 💎 */
    matches.push(...this.checkMatchables(jewel,
      this.board.findJewelByPosition(x, y - 1),
      this.board.findJewelByPosition(x, y + 1),
      this.board.findJewelByPosition(x, y + 2)))

    return this.promote(canPromote, matches, jewel, Jewel.specials.fire)
  }

  findMatchesForSmoke (jewel, canPromote) {
    const { x, y } = jewel
    let matches = []

    /* 💎🌀
     * 💎💎 */
    matches.push(...this.checkMatchables(jewel,
      this.board.findJewelByPosition(x - 1, y),
      this.board.findJewelByPosition(x - 1, y + 1),
      this.board.findJewelByPosition(x, y + 1)))

    /* 🌀💎
     * 💎💎 */
    matches.push(...this.checkMatchables(jewel,
      this.board.findJewelByPosition(x + 1, y),
      this.board.findJewelByPosition(x + 1, y + 1),
      this.board.findJewelByPosition(x, y + 1)))

    /* 💎💎
     * 💎🌀 */
    matches.push(...this.checkMatchables(jewel,
      this.board.findJewelByPosition(x - 1, y - 1),
      this.board.findJewelByPosition(x - 1, y),
      this.board.findJewelByPosition(x, y - 1)))

    /* 💎💎
     * 🌀💎 */
    matches.push(...this.checkMatchables(jewel,
      this.board.findJewelByPosition(x + 1, y - 1),
      this.board.findJewelByPosition(x + 1, y),
      this.board.findJewelByPosition(x, y - 1)))

    return this.promote(canPromote, matches, jewel, Jewel.specials.smoke)
  }

  findMatchesOfThree (jewel) {
    const { x, y } = jewel
    let matches = []

    /* 💎🌀💎 */
    matches.push(...this.checkMatchables(jewel,
      this.board.findJewelByPosition(x - 1, y),
      this.board.findJewelByPosition(x + 1, y)))

    /* 💎
     * 🌀
     * 💎 */
    matches.push(...this.checkMatchables(jewel,
      this.board.findJewelByPosition(x, y - 1),
      this.board.findJewelByPosition(x, y + 1)))

    return matches.filter(m => m !== null)
  }

  promote (canPromote, matches, jewel, special) {
    matches = matches.filter(m => m !== null)
    if (canPromote && matches.length > 0) {
      jewel.futurePromotion = true
      jewel.promoted = special
    }
    return matches
  }
}
