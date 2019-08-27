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

  getMatchableMove (current, destination, reverse, ...jewels) {
    if (current.type === destination.type) return null
    for (let j of jewels) if (!j || current.type !== j.type) return null
    return reverse ? current.slot : destination.slot
  }

  findPossibleMovesTop (jewel, reverse = false) {
    let moves = []
    const { x, y } = jewel,
      destination = this.board.findJewelByPosition(x, y - 1) // 🌀
    if (!destination || destination.locked) return []

    /* 🌀💎💎
     * 💎 */
    moves.push(this.getMatchableMove(jewel, destination, reverse,
      this.board.findJewelByPosition(x + 1, y - 1),
      this.board.findJewelByPosition(x + 2, y - 1)))

    /* 💎💎🌀
     *      💎 */
    moves.push(this.getMatchableMove(jewel, destination, reverse,
      this.board.findJewelByPosition(x - 1, y - 1),
      this.board.findJewelByPosition(x - 2, y - 1)))

    /* 💎🌀💎
     *   💎 */
    moves.push(this.getMatchableMove(jewel, destination, reverse,
      this.board.findJewelByPosition(x - 1, y - 1),
      this.board.findJewelByPosition(x + 1, y - 1)))

    /* 💎
     * 💎
     * 🌀
     * 💎 */
    moves.push(this.getMatchableMove(jewel, destination, reverse,
      this.board.findJewelByPosition(x, y - 2),
      this.board.findJewelByPosition(x, y - 3)))

    /* 💎💎
     * 💎🌀
     *   💎 */
    moves.push(this.getMatchableMove(jewel, destination, reverse,
      this.board.findJewelByPosition(x - 1, y - 1),
      this.board.findJewelByPosition(x - 1, y - 2),
      this.board.findJewelByPosition(x, y - 2)))

    /* 💎💎
     * 🌀💎
     * 💎 */
    moves.push(this.getMatchableMove(jewel, destination, reverse,
      this.board.findJewelByPosition(x + 1, y - 1),
      this.board.findJewelByPosition(x + 1, y - 2),
      this.board.findJewelByPosition(x, y - 2)))

    moves = moves.filter(m => m !== null)
    if (moves.length > 0) jewel.matchable = true
    return moves
  }

  findPossibleMovesRight (jewel, reverse = false) {
    let moves = []
    const { x, y } = jewel,
      destination = this.board.findJewelByPosition(x + 1, y) // 🌀
    if (!destination || destination.locked) return []

    /* 💎🌀💎💎 */
    moves.push(this.getMatchableMove(jewel, destination, reverse,
      this.board.findJewelByPosition(x + 2, y),
      this.board.findJewelByPosition(x + 3, y)))

    /* 💎🌀
     *   💎
     *   💎 */
    moves.push(this.getMatchableMove(jewel, destination, reverse,
      this.board.findJewelByPosition(x + 1, y + 1),
      this.board.findJewelByPosition(x + 1, y + 2)))

    /*   💎
     *   💎
     * 💎🌀 */
    moves.push(this.getMatchableMove(jewel, destination, reverse,
      this.board.findJewelByPosition(x + 1, y - 1),
      this.board.findJewelByPosition(x + 1, y - 2)))

    /*   💎
     * 💎🌀
     *   💎 */
    moves.push(this.getMatchableMove(jewel, destination, reverse,
      this.board.findJewelByPosition(x + 1, y - 1),
      this.board.findJewelByPosition(x + 1, y + 1)))

    /*   💎💎
     * 💎🌀💎 */
    moves.push(this.getMatchableMove(jewel, destination, reverse,
      this.board.findJewelByPosition(x + 2, y),
      this.board.findJewelByPosition(x + 1, y - 1),
      this.board.findJewelByPosition(x + 2, y - 1)))

    /* 💎🌀💎
     *   💎💎 */
    moves.push(this.getMatchableMove(jewel, destination, reverse,
      this.board.findJewelByPosition(x + 2, y),
      this.board.findJewelByPosition(x + 1, y + 1),
      this.board.findJewelByPosition(x + 2, y + 1)))

    moves = moves.filter(m => m !== null)
    if (moves.length > 0) jewel.matchable = true
    return moves
  }

  findPossibleMovesBottom (jewel, reverse = false) {
    let moves = []
    const { x, y } = jewel,
      destination = this.board.findJewelByPosition(x, y + 1) // 🌀
    if (!destination || destination.locked) return []

    /* 💎
     * 🌀💎💎 */
    moves.push(this.getMatchableMove(jewel, destination, reverse,
      this.board.findJewelByPosition(x + 1, y + 1),
      this.board.findJewelByPosition(x + 2, y + 1)))

    /*      💎
     * 💎💎🌀 */
    moves.push(this.getMatchableMove(jewel, destination, reverse,
      this.board.findJewelByPosition(x - 1, y + 1),
      this.board.findJewelByPosition(x - 2, y + 1)))

    /*   💎
     * 💎🌀💎 */
    moves.push(this.getMatchableMove(jewel, destination, reverse,
      this.board.findJewelByPosition(x - 1, y + 1),
      this.board.findJewelByPosition(x + 1, y + 1)))

    /* 💎
     * 🌀
     * 💎
     * 💎 */
    moves.push(this.getMatchableMove(jewel, destination, reverse,
      this.board.findJewelByPosition(x, y + 2),
      this.board.findJewelByPosition(x, y + 3)))

    /*   💎
     * 💎🌀
     * 💎💎 */
    moves.push(this.getMatchableMove(jewel, destination, reverse,
      this.board.findJewelByPosition(x - 1, y + 1),
      this.board.findJewelByPosition(x - 1, y + 2),
      this.board.findJewelByPosition(x, y + 2)))

    /* 💎
     * 🌀💎
     * 💎💎 */
    moves.push(this.getMatchableMove(jewel, destination, reverse,
      this.board.findJewelByPosition(x + 1, y + 1),
      this.board.findJewelByPosition(x + 1, y + 2),
      this.board.findJewelByPosition(x, y + 2)))

    moves = moves.filter(m => m !== null)
    if (moves.length > 0) jewel.matchable = true
    return moves
  }

  findPossibleMovesLeft (jewel, reverse = false) {
    let moves = []
    const { x, y } = jewel,
      destination = this.board.findJewelByPosition(x - 1, y) // 🌀
    if (!destination || destination.locked) return []

    /* 💎💎🌀💎 */
    moves.push(this.getMatchableMove(jewel, destination, reverse,
      this.board.findJewelByPosition(x - 2, y),
      this.board.findJewelByPosition(x - 3, y)))

    /* 🌀💎
     * 💎
     * 💎 */
    moves.push(this.getMatchableMove(jewel, destination, reverse,
      this.board.findJewelByPosition(x - 1, y + 1),
      this.board.findJewelByPosition(x - 1, y + 2)))

    /* 💎
     * 💎
     * 🌀💎 */
    moves.push(this.getMatchableMove(jewel, destination, reverse,
      this.board.findJewelByPosition(x - 1, y - 1),
      this.board.findJewelByPosition(x - 1, y - 2)))

    /* 💎
     * 🌀💎
     * 💎 */
    moves.push(this.getMatchableMove(jewel, destination, reverse,
      this.board.findJewelByPosition(x - 1, y - 1),
      this.board.findJewelByPosition(x - 1, y + 1)))

    /* 💎💎
     * 💎🌀💎 */
    moves.push(this.getMatchableMove(jewel, destination, reverse,
      this.board.findJewelByPosition(x - 2, y),
      this.board.findJewelByPosition(x - 1, y - 1),
      this.board.findJewelByPosition(x - 2, y - 1)))

    /* 💎🌀💎
     * 💎💎 */
    moves.push(this.getMatchableMove(jewel, destination, reverse,
      this.board.findJewelByPosition(x - 2, y),
      this.board.findJewelByPosition(x - 1, y + 1),
      this.board.findJewelByPosition(x - 2, y + 1)))

    moves = moves.filter(m => m !== null)
    if (moves.length > 0) jewel.matchable = true
    return moves
  }
}
