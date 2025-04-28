import { Todo as TodoI } from "./interfaces/todo.interface"
import { uniqueId } from "./utils/uniqueId"

export class Todo {
  todo: string
  todos: TodoI[]
  selector: string

  constructor(selector: string) {
    this.selector = selector
    this.todo = ''
    this.todos = []

    this.init()
  }

  init(): void {
    const root = document.querySelector(this.selector)
    this.createInitialTemplate(root)
    this.bindEvents()
  }

  createInitialTemplate(root: Element | null): void {
    if (!root) return
    root.innerHTML = `
    <div class="wrapper">
      <div class="logo">
        <div class="logo-wrapper">
          <img
            src="./typescript.svg"
            alt="TypeScript logo"
          />
        </div>
      </div>

      <div class="todo-app">
        <div class="todo-app__header">
          <input class="todo-app__header-input" type="text" placeholder="New ToDo">
          <button class="todo-app__header-btn btn" type="button">
            Add
          </button>
        </div>

        <div class="todo-app__main">
          <ul class="todo-app__list"></ul>
        </div>

        <div class="todo-app__footer">
          <div class="todo-app__counter"></div>

          <ul class="todo-app__filters"></ul>

          <button class="btn todo-app__clear-btn" type="button">
            Clear completed
          </button>
        </div>
      </div>
    </div>
    `
  }

  bindEvents() {
    const input = document.querySelector('.todo-app__header-input')
    input?.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value
      this.todo = value
    })

    const addTodoBtn = document.querySelector('.todo-app__header-btn')
    addTodoBtn?.addEventListener('click', () => {
      this.addTodo()
    })
  }

  // createList(): void {
  //   const list = document.querySelector('.todo-app__list')
  //   list!.innerHTML = ''

  //   if (this.todos.length) {
  //     const listFragment = new DocumentFragment()

  //     for (const todo of this.todos) {
  //       const item = this.createItem(todo)
  //       listFragment.append(item)
  //     }

  //     list?.append(listFragment)
  //   }
  // }

  createItem(todo: TodoI): HTMLElement {
    const item = document.createElement('li')
    item.classList.add('todo-app__item')
    item.innerHTML = `
        <label class="todo-app__item-checkbox">
          <input
            class="checkbox"
            type="checkbox"
          />
          <span></span>
        </label>

        <label class="todo-app__item-name"></label>

        <button
          class="todo-app__remove-btn"
          type="button"
        >
        </button>
    `
    const todoName = item.querySelector('.todo-app__item-name') as HTMLLabelElement
    let name = todo.name
    todoName.textContent = name
    todoName.addEventListener('dblclick', () => {
      const input = document.createElement('input')
      input.classList.add('todo-app__item-editor')
      input.value = name
      item.insertBefore(input, todoName)
      todoName.remove()
      input.focus()

      // events
      input.addEventListener('change', (e) => {
        name = (e.target as HTMLInputElement).value
      })
      input.addEventListener('blur', () => {
        item.insertBefore(todoName, input)
        todoName.textContent = name
        input.remove()
      })
    })

    const removeBtn = item.querySelector('.todo-app__remove-btn') as HTMLButtonElement
    removeBtn.addEventListener('click', () => {
      // this.todos = this.todos.filter(t => t.id !== todo.id)
      item.remove()
    })

    const completedCheckbox = item.querySelector('.todo-app__item-checkbox input') as HTMLInputElement
    completedCheckbox.checked = todo.completed
    completedCheckbox.addEventListener('change', (e) => {
      const checked = (e.target as HTMLInputElement).checked
      // this.todos = this.todos.map(t => ({
      //   ...t,
      //   completed: t.id === todo.id ? checked : t.completed
      // }))

      if (checked) {
        todoName.classList.add('completed')
      } else {
        todoName.classList.remove('completed')
      }
    })

    return item
  }

  addTodo(): void {
    const _todo = {
      id: uniqueId('todo-'),
      name: this.todo,
      completed: false,
      pinned: false
    }
    // this.todos.push(_todo)

    const list = document.querySelector('.todo-app__list')
    const item = this.createItem(_todo)
    list?.append(item)

    this.todo = ''
    const input = document.querySelector('.todo-app__header-input') as HTMLInputElement
    (input)!.value = ''
  }
}