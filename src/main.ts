import { Todo } from './todo'
import './assets/styles/index.scss'

document.querySelector('#app')!.innerHTML = `
  <div class="wrapper">
    <div class="logo">
      <div class="logo-wrapper">
        <img
          src="./typescript.svg"
          alt="TypeScript logo"
        />
      </div>
    </div>
    <div id="todo"></div>
  </div>
`

new Todo('#todo')
