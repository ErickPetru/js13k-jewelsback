/* global board HTMLElement */

function create (html, parent = document) {
  html = html.trim()
  const frag = document.createRange().createContextualFragment(html)
  const node = frag.childNodes.length > 1 ? frag.childNodes : frag.firstChild
  return parent.appendChild(node)
}

createBoard()

function createBoard () {
  const BOARD_SIZE = 9
  for (let y = 0; y < BOARD_SIZE; y++) {
    const row = create('<div class="row"></div>', board)
    row.style['grid-template-columns'] = `repeat(${BOARD_SIZE}, 1fr)`
    row.style['grid-template-rows'] = '1fr'
    for (let x = 0; x < BOARD_SIZE; x++) {
      const column = create('<div class="column"></div>', row)
      createJewel(column)
    }
  }
}

function createJewel (parent) {
  const jewel = create('<div class="jewel"></div>', parent)
  const SHAPES = ['square', 'diamond', 'circle', 'triangle']
  const shape = SHAPES[Math.round(Math.random() * (SHAPES.length - 1))]
  jewel.classList.add(shape)
}
