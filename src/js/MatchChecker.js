import Jewel from './Jewel'

export default class MatchChecker {
  constructor (board) {
    this.board = board
  }

  generateUnmatchableShape (x, y, undesired) {
    const shapes = Object.keys(Jewel.types).filter(k => k !== undesired)
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

    matches.push(...this.findMatchesForNebula(jewel, jewel.canBePromoted))
    if (matches.length > 0) return matches

    matches.push(...this.findMatchesForRainbow(jewel, jewel.canBePromoted))
    if (matches.length > 0) return matches

    matches.push(...this.findMatchesForStar(jewel, jewel.canBePromoted))
    if (matches.length > 0) return matches

    matches.push(...this.findMatchesForFire(jewel, jewel.canBePromoted))
    if (matches.length > 0) return matches

    matches.push(...this.findMatchesForSmoke(jewel, jewel.canBePromoted))

    matches.push(...this.findMatchesOfThree(jewel))

    for (let match of matches) match.checked = true
    return matches
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
