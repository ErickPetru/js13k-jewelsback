import './Background'
import Game from './Game'

document.getElementById('start').addEventListener('click', function () {
  document.querySelectorAll('main, section').forEach(el => el.removeAttribute('hidden'))
  this.remove()
  new Game().start()
})
