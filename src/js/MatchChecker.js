import Jewel from './Jewel'

export default class MatchChecker {
  constructor (board) {
    this.board = board
  }

  generateUnmatchableShape (x, y, undesired) {
    const shapes = Jewel.types.filter(item => item !== undesired)
    const random = Math.round(Math.random() * (shapes.length - 1))
    const shape = shapes[random]

    const previous = this.board.findJewelByPosition(x - 1, y)
    const above = this.board.findJewelByPosition(x, y - 1)
    const beforeAbovePrevious = this.board.findJewelByPosition(x - 1, y - 1)

    if (previous && above && beforeAbovePrevious &&
        above.type === shape && previous.type === shape && beforeAbovePrevious.type === shape)
      return this.generateUnmatchableShape(x, y, shape)

    const beforePrevious = this.board.findJewelByPosition(x - 2, y)
    if (previous && beforePrevious &&
        previous.type === shape && beforePrevious.type === shape)
      return this.generateUnmatchableShape(x, y, shape)

    const beforeAbove = this.board.findJewelByPosition(x, y - 2)
    if (above && beforeAbove &&
        above.type === shape && beforeAbove.type === shape)
      return this.generateUnmatchableShape(x, y, shape)

    return shape
  }

  findPossibleMatches () {
    const matches = []
    // TODO: Find possible matches.
    return matches.filter(m => m !== null)
  }
}
