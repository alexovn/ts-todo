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
    this.bindInitialEvents()
    this.getTodosFromLocalStorage()
    this.updateApp()
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

  bindInitialEvents() {
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

    const removeCompletedTodosBtn = document.querySelector('.todo-app__clear-btn')
    removeCompletedTodosBtn?.addEventListener('click', () => {
      if (!this.todos.filter(todo => todo.completed).length) return
      this.todos = this.todos.filter(todo => !todo.completed)
      this.setTodosToLocalStorage()
      this.updateApp()
    })
  }

  createTodo(todo: TodoI): HTMLElement {
    const item = document.createElement('li')
    item.classList.add('todo-app__item')
    item.innerHTML = `
        <label class="todo-app__item-pin">
          <input
            type="checkbox"
            class="pin-checkbox"
          />
          <span class="todo-app__item-pin-icon">
            <i class="fas fa-thumbtack"></i>
          </span>
        </label>

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
    let itemEventController: AbortController = new AbortController()

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

      input.addEventListener('change', (e) => {
        name = (e.target as HTMLInputElement).value
        this.todos = this.todos.map(t => {
          if (t.id !== todo.id) return t
          return {
            ...t,
            name
          }
        })
        this.setTodosToLocalStorage()
      }, { signal: itemEventController.signal })
      input.addEventListener('blur', () => {
        updateTodo()
      }, { signal: itemEventController.signal })
      input.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.code === 'Enter') {
          updateTodo()
        }
      }, { signal: itemEventController.signal })
    }, { signal: itemEventController.signal })

    const removeBtn = item.querySelector('.todo-app__remove-btn') as HTMLButtonElement
    removeBtn.addEventListener('click', () => {
      this.todos = this.todos.filter(t => t.id !== todo.id)
      this.setTodosToLocalStorage()
      this.createFilteredListSentence()
      itemEventController.abort()
      item.remove()
    }, {
      signal: itemEventController.signal,
    })

    const completedCheckbox = item.querySelector('.todo-app__item-checkbox input') as HTMLInputElement
    completedCheckbox.checked = todo.completed

    if (completedCheckbox.checked) {
      todoName.classList.add('completed')
    }

    completedCheckbox.addEventListener('change', (e) => {
      const completed = (e.target as HTMLInputElement).checked

      if (completed) {
        todoName.classList.add('completed')
      } else {
        todoName.classList.remove('completed')
      }

      this.todos = this.todos.map(t => {
        if (t.id !== todo.id) return t
        return {
          ...t,
          completed
        }
      })

      this.setTodosToLocalStorage()
      this.updateApp()
    }, { signal: itemEventController.signal })

    const pinnedCheckbox = item.querySelector('.todo-app__item-pin input') as HTMLInputElement
    pinnedCheckbox.checked = todo.pinned

    if (pinnedCheckbox.checked) {
      item.classList.add('pinned')
    }

    pinnedCheckbox.addEventListener('change', (e) => {
      const pinned = (e.target as HTMLInputElement).checked

      if (pinned) {
        item.classList.add('pinned')
      } else {
        item.classList.remove('pinned')
      }

      this.todos = this.todos.map(t => {
        if (t.id !== todo.id) return t
        return {
          ...t,
          pinned
        }
      })

      this.setTodosToLocalStorage()
      this.updateApp()
    }, { signal: itemEventController.signal })

    return item
  }

  addTodo(): void {
    const _todo = {
      id: uniqueId('todo-'),
      name: this.todo,
      completed: false,
      pinned: false
    }

    this.todos.push(_todo)
    this.setTodosToLocalStorage()

    this.todo = ''
    const input = document.querySelector('.todo-app__header-input') as HTMLInputElement
    input.value = ''

    this.updateApp()
  }

  createTodoList() {
    const list = document.querySelector('.todo-app__list')
    const fragment = new DocumentFragment()

    if (this.filteredTodos.length) {
      for (const todo of this.filteredTodos) {
        const item = this.createTodo(todo)
        fragment.append(item)
      }
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
        const filterItems = document.querySelectorAll('.todo-app__filters-item')

        for (const filterItem of filterItems) {
          // @ts-ignore
          filterItem.firstChild.classList.remove('selected')
        }
        // @ts-ignore
        item.firstChild.classList.add('selected')
        this.setActiveFilter(filter.label as ActiveFilterType)
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
    this.updateApp()
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

  createFilteredListSentence() {
    const counter = document.querySelector('.todo-app__counter') as HTMLElement
    counter.textContent = `${this.filteredTodos.length} ${this.filteredTodos.length === 1 ? 'item' : 'items'} left`
  }

  updateApp(): void {
    this.createTodoList()
    this.createFilteredListSentence()
  }

  setTodosToLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(this.todos))
  }

  getTodosFromLocalStorage() {
    const todos = localStorage.getItem('todos')

    if (todos) {
      this.todos = JSON.parse(todos)
    } else {
      this.todos.push({
        id: 'todo-0',
        name: 'Walk with a dog 🐕',
        completed: false,
        pinned: false
      })
    }
  }
}