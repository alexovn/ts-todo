import { Todo as TodoI } from "./interfaces/todo.interface"
import { uniqueId } from "./utils/uniqueId"

type ActiveFilterType = 'All' | 'Active' | 'Completed'

export class Todo {
  todo: string
  todos: TodoI[]
  selector: string
  activeFilter: ActiveFilterType

  constructor(selector: string) {
    this.selector = selector
    this.todo = ''
    this.todos = []
    this.activeFilter = 'All'

    this.init()
  }

  init(): void {
    const root = document.querySelector(this.selector)
    this.createInitialTemplate(root)
    this.createFilterListTemplate()
    this.renderFilteredListSentence()
    this.bindEvents()
  }

  createInitialTemplate(root: Element | null): void {
    if (!root) return
    root.innerHTML = `
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
    `
  }

  bindEvents() {
    const input = document.querySelector('.todo-app__header-input') as HTMLInputElement
    input.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value
      this.todo = value
    })
    input.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code === 'Enter') {
        this.addTodo()
      }
    })

    const addTodoBtn = document.querySelector('.todo-app__header-btn')
    addTodoBtn?.addEventListener('click', () => {
      this.addTodo()
    })
  }

  createTodo(todo: TodoI): HTMLElement {
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
      let isUpdated = false

      input.classList.add('todo-app__item-editor')
      input.value = name
      item.insertBefore(input, todoName)
      todoName.remove()
      input.focus()

      function updateTodo() {
        todoName.textContent = name

        if (!isUpdated) {
          isUpdated = true
          item.insertBefore(todoName, input)
          input.remove()
        }
      }

      // events
      input.addEventListener('change', (e) => {
        name = (e.target as HTMLInputElement).value
        this.todos = this.todos.map(t => {
          if (t.id !== todo.id) return t
          return {
            ...t,
            name
          }
        })
      })
      input.addEventListener('blur', () => {
        updateTodo()
      })
      input.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.code === 'Enter') {
          updateTodo()
        }
      })
    })

    const removeBtn = item.querySelector('.todo-app__remove-btn') as HTMLButtonElement
    removeBtn.addEventListener('click', () => {
      item.remove()
      this.todos = this.todos.filter(t => t.id !== todo.id)
      this.renderFilteredListSentence()
    })

    const completedCheckbox = item.querySelector('.todo-app__item-checkbox input') as HTMLInputElement
    completedCheckbox.checked = todo.completed

    if (completedCheckbox.checked) {
      todoName.classList.add('completed')
    }

    completedCheckbox.addEventListener('change', (e) => {
      const checked = (e.target as HTMLInputElement).checked

      if (checked) {
        todoName.classList.add('completed')
      } else {
        todoName.classList.remove('completed')
      }

      this.todos = this.todos.map(t => {
        if (t.id !== todo.id) return t
        return {
          ...t,
          completed: checked
        }
      })

      this.createTodoList()
      this.renderFilteredListSentence()
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

    const list = document.querySelector('.todo-app__list')
    const item = this.createTodo(_todo)
    list?.append(item)
    this.todos.push(_todo)
    this.renderFilteredListSentence()

    this.todo = ''
    const input = document.querySelector('.todo-app__header-input') as HTMLInputElement
    (input)!.value = ''
  }

  createTodoList() {
    const list = document.querySelector('.todo-app__list')
    const fragment = new DocumentFragment()

    for (const todo of this.filteredTodos) {
      const item = this.createTodo(todo)
      fragment.append(item)
    }
    list?.replaceChildren(fragment)
  }

  createFilterListTemplate() {
    const filterList = document.querySelector('.todo-app__filters') as HTMLElement
    const fragment = new DocumentFragment()
    const filters = [
      {
        label: 'All',
      },
      {
        label: 'Active',
      },
      {
        label: 'Completed',
      },
    ]

    for (const filter of filters) {
      const item = document.createElement('li')
      item.classList.add('todo-app__filters-item')
      item.innerHTML = `<a href="#!">${filter.label}</a>`

      if (filter.label === this.activeFilter) {
        (item.firstChild as HTMLElement).classList.add('selected')
      }

      item.addEventListener('click', () => {
        this.setActiveFilter(filter.label as ActiveFilterType)
        const filterItems = document.querySelectorAll('.todo-app__filters-item')
        for (const filterItem of filterItems) {
          // @ts-ignore
          filterItem.firstChild.classList.remove('selected')
          // @ts-ignore
          item.firstChild.classList.add('selected')
        }
      })
      fragment.append(item)
    }

    filterList.append(fragment)
  }

  setActiveFilter(type: ActiveFilterType) {
    if (type === 'All') {
      this.activeFilter = 'All'
    }
    if (type === 'Active') {
      this.activeFilter = 'Active'
    }
    if (type === 'Completed') {
      this.activeFilter = 'Completed'
    }
    this.createTodoList()
    this.renderFilteredListSentence()
  }

  get filteredTodos(): TodoI[] {
    if (this.activeFilter === 'All') {
      return this.todos
    }
    if (this.activeFilter === 'Active') {
      return this.todos.filter(todo => !todo.completed)
    }
    if (this.activeFilter === 'Completed') {
      return this.todos.filter(todo => todo.completed)
    }
    return []
  }

  renderFilteredListSentence() {
    const counter = document.querySelector('.todo-app__counter') as HTMLElement
    counter.textContent = `${this.filteredTodos.length} ${this.filteredTodos.length === 1 ? 'item' : 'items'} left`
  }
}