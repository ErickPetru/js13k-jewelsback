import Jewel from './Jewel'

export default class MoveChecker {
  constructor (board) {
    this.board = board
  }

  findPossibleMoves (jewel) {
    if (!jewel) return []
    return [
      ...this.findDirectMoves(jewel),
      ...this.findIndirectMoves(jewel)
    ]
  }

  findDirectMoves (jewel) {
    if (!jewel) return []
    return [
      ...this.findPossibleMovesTop(jewel),
      ...this.findPossibleMovesRight(jewel),
      ...this.findPossibleMovesBottom(jewel),
      ...this.findPossibleMovesLeft(jewel)
    ]
  }

  findIndirectMoves (jewel) {
    if (!jewel) return []

    const moves = [],
      { x, y } = jewel,
      top = this.board.findJewelByPosition(x, y - 1),
      right = this.board.findJewelByPosition(x + 1, y),
      bottom = this.board.findJewelByPosition(x, y + 1),
      left = this.board.findJewelByPosition(x - 1, y)

    if (top) moves.push(...this.findPossibleMovesBottom(top, true))
    if (right) moves.push(...this.findPossibleMovesLeft(right, true))
    if (bottom) moves.push(...this.findPossibleMovesTop(bottom, true))
    if (left) moves.push(...this.findPossibleMovesRight(left, true))

    return moves
  }

  checkMatchable (selected, target, reverse, ...neighbours) {
    if (selected.type === target.type) return null

    for (let jewel of neighbours) {
      if (!jewel || (selected.type !== jewel.type &&
        selected.promoted !== Jewel.specials.nebula &&
        selected.promoted !== Jewel.specials.rainbow &&
        target.promoted !== Jewel.specials.nebula &&
        target.promoted !== Jewel.specials.rainbow)) return null
    }

    return reverse ? selected : target
  }

  findPossibleMovesTop (jewel, reverse = false) {
    let moves = []
    const { x, y } = jewel,
      target = this.board.findJewelByPosition(x, y - 1) // 🌀
    if (!target || target.locked) return []

    if (!reverse && target && (Jewel.superSpecials.includes(jewel.promoted) ||
      Jewel.superSpecials.includes(target.promoted))) moves.push(target)

    /* 🌀💎💎
     * 💎 */
    moves.push(this.checkMatchable(jewel, target, reverse,
      this.board.findJewelByPosition(x + 1, y - 1),
      this.board.findJewelByPosition(x + 2, y - 1)))

    /* 💎💎🌀
     *      💎 */
    moves.push(this.checkMatchable(jewel, target, reverse,
      this.board.findJewelByPosition(x - 1, y - 1),
      this.board.findJewelByPosition(x - 2, y - 1)))

    /* 💎🌀💎
     *   💎 */
    moves.push(this.checkMatchable(jewel, target, reverse,
      this.board.findJewelByPosition(x - 1, y - 1),
      this.board.findJewelByPosition(x + 1, y - 1)))

    /* 💎
     * 💎
     * 🌀
     * 💎 */
    moves.push(this.checkMatchable(jewel, target, reverse,
      this.board.findJewelByPosition(x, y - 2),
      this.board.findJewelByPosition(x, y - 3)))

    /* 💎💎
     * 💎🌀
     *   💎 */
    moves.push(this.checkMatchable(jewel, target, reverse,
      this.board.findJewelByPosition(x - 1, y - 1),
      this.board.findJewelByPosition(x - 1, y - 2),
      this.board.findJewelByPosition(x, y - 2)))

    /* 💎💎
     * 🌀💎
     * 💎 */
    moves.push(this.checkMatchable(jewel, target, reverse,
      this.board.findJewelByPosition(x + 1, y - 1),
      this.board.findJewelByPosition(x + 1, y - 2),
      this.board.findJewelByPosition(x, y - 2)))

    moves = [...new Set(moves.filter(m => m !== null))]
    if (moves.length > 0) jewel.matchable = true
    return moves
  }

  findPossibleMovesRight (jewel, reverse = false) {
    let moves = []
    const { x, y } = jewel,
      target = this.board.findJewelByPosition(x + 1, y) // 🌀
    if (!target || target.locked) return []

    if (!reverse && target && (Jewel.superSpecials.includes(jewel.promoted) ||
      Jewel.superSpecials.includes(target.promoted))) moves.push(target)

    /* 💎🌀💎💎 */
    moves.push(this.checkMatchable(jewel, target, reverse,
      this.board.findJewelByPosition(x + 2, y),
      this.board.findJewelByPosition(x + 3, y)))

    /* 💎🌀
     *   💎
     *   💎 */
    moves.push(this.checkMatchable(jewel, target, reverse,
      this.board.findJewelByPosition(x + 1, y + 1),
      this.board.findJewelByPosition(x + 1, y + 2)))

    /*   💎
     *   💎
     * 💎🌀 */
    moves.push(this.checkMatchable(jewel, target, reverse,
      this.board.findJewelByPosition(x + 1, y - 1),
      this.board.findJewelByPosition(x + 1, y - 2)))

    /*   💎
     * 💎🌀
     *   💎 */
    moves.push(this.checkMatchable(jewel, target, reverse,
      this.board.findJewelByPosition(x + 1, y - 1),
      this.board.findJewelByPosition(x + 1, y + 1)))

    /*   💎💎
     * 💎🌀💎 */
    moves.push(this.checkMatchable(jewel, target, reverse,
      this.board.findJewelByPosition(x + 2, y),
      this.board.findJewelByPosition(x + 1, y - 1),
      this.board.findJewelByPosition(x + 2, y - 1)))

    /* 💎🌀💎
     *   💎💎 */
    moves.push(this.checkMatchable(jewel, target, reverse,
      this.board.findJewelByPosition(x + 2, y),
      this.board.findJewelByPosition(x + 1, y + 1),
      this.board.findJewelByPosition(x + 2, y + 1)))

    moves = [...new Set(moves.filter(m => m !== null))]
    if (moves.length > 0) jewel.matchable = true
    return moves
  }

  findPossibleMovesBottom (jewel, reverse = false) {
    let moves = []
    const { x, y } = jewel,
      target = this.board.findJewelByPosition(x, y + 1) // 🌀
    if (!target || target.locked) return []

    if (!reverse && target && (Jewel.superSpecials.includes(jewel.promoted) ||
      Jewel.superSpecials.includes(target.promoted))) moves.push(target)

    /* 💎
     * 🌀💎💎 */
    moves.push(this.checkMatchable(jewel, target, reverse,
      this.board.findJewelByPosition(x + 1, y + 1),
      this.board.findJewelByPosition(x + 2, y + 1)))

    /*      💎
     * 💎💎🌀 */
    moves.push(this.checkMatchable(jewel, target, reverse,
      this.board.findJewelByPosition(x - 1, y + 1),
      this.board.findJewelByPosition(x - 2, y + 1)))

    /*   💎
     * 💎🌀💎 */
    moves.push(this.checkMatchable(jewel, target, reverse,
      this.board.findJewelByPosition(x - 1, y + 1),
      this.board.findJewelByPosition(x + 1, y + 1)))

    /* 💎
     * 🌀
     * 💎
     * 💎 */
    moves.push(this.checkMatchable(jewel, target, reverse,
      this.board.findJewelByPosition(x, y + 2),
      this.board.findJewelByPosition(x, y + 3)))

    /*   💎
     * 💎🌀
     * 💎💎 */
    moves.push(this.checkMatchable(jewel, target, reverse,
      this.board.findJewelByPosition(x - 1, y + 1),
      this.board.findJewelByPosition(x - 1, y + 2),
      this.board.findJewelByPosition(x, y + 2)))

    /* 💎
     * 🌀💎
     * 💎💎 */
    moves.push(this.checkMatchable(jewel, target, reverse,
      this.board.findJewelByPosition(x + 1, y + 1),
      this.board.findJewelByPosition(x + 1, y + 2),
      this.board.findJewelByPosition(x, y + 2)))

    moves = [...new Set(moves.filter(m => m !== null))]
    if (moves.length > 0) jewel.matchable = true
    return moves
  }

  findPossibleMovesLeft (jewel, reverse = false) {
    let moves = []
    const { x, y } = jewel,
      target = this.board.findJewelByPosition(x - 1, y) // 🌀
    if (!target || target.locked) return []

    if (!reverse && target && (Jewel.superSpecials.includes(jewel.promoted) ||
      Jewel.superSpecials.includes(target.promoted))) moves.push(target)

    /* 💎💎🌀💎 */
    moves.push(this.checkMatchable(jewel, target, reverse,
      this.board.findJewelByPosition(x - 2, y),
      this.board.findJewelByPosition(x - 3, y)))

    /* 🌀💎
     * 💎
     * 💎 */
    moves.push(this.checkMatchable(jewel, target, reverse,
      this.board.findJewelByPosition(x - 1, y + 1),
      this.board.findJewelByPosition(x - 1, y + 2)))

    /* 💎
     * 💎
     * 🌀💎 */
    moves.push(this.checkMatchable(jewel, target, reverse,
      this.board.findJewelByPosition(x - 1, y - 1),
      this.board.findJewelByPosition(x - 1, y - 2)))

    /* 💎
     * 🌀💎
     * 💎 */
    moves.push(this.checkMatchable(jewel, target, reverse,
      this.board.findJewelByPosition(x - 1, y - 1),
      this.board.findJewelByPosition(x - 1, y + 1)))

    /* 💎💎
     * 💎🌀💎 */
    moves.push(this.checkMatchable(jewel, target, reverse,
      this.board.findJewelByPosition(x - 2, y),
      this.board.findJewelByPosition(x - 1, y - 1),
      this.board.findJewelByPosition(x - 2, y - 1)))

    /* 💎🌀💎
     * 💎💎 */
    moves.push(this.checkMatchable(jewel, target, reverse,
      this.board.findJewelByPosition(x - 2, y),
      this.board.findJewelByPosition(x - 1, y + 1),
      this.board.findJewelByPosition(x - 2, y + 1)))

    moves = [...new Set(moves.filter(m => m !== null))]
    if (moves.length > 0) jewel.matchable = true
    return moves
  }
}
