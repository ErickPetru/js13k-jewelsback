/* global board */

const BOARD_SIZE = 9
for (let y = 0; y < BOARD_SIZE; y++) {
  const row = document.createElement('div')
  row.className = 'row'
  row.style['grid-template-columns'] = `repeat(${BOARD_SIZE}, 1fr)`
  board.appendChild(row)
  for (let x = 0; x < BOARD_SIZE; x++) {
    row.innerHTML += '<div class="column"></div>'
  }
}
