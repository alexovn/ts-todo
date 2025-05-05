import { Todo as TodoI } from "./interfaces/todo.interface"
import { uniqueId } from "./utils/uniqueId"

type ActiveFilterType = 'All' | 'Active' | 'Completed'

export class Todo {
  private todo: string
  private todos: TodoI[]
  private selector: string
  private activeFilter: ActiveFilterType
  private root: HTMLElement | null
  private input: HTMLInputElement | null

  constructor(selector: string) {
    this.selector = selector
    this.root = document.querySelector(this.selector) || null
    this.input = null
    this.todo = ''
    this.todos = []
    this.activeFilter = 'All'

    this.init()
  }

  private init(): void {
    this.createInitialTemplate()
    this.createFilterListTemplate()
    this.bindInitialEvents()
    this.getTodosFromLocalStorage()
    this.updateApp()
  }

  private createInitialTemplate(): void {
    if (!this.root) return
    this.root.innerHTML = `
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

  private bindInitialEvents(): void {
    this.input = this.root?.querySelector('.todo-app__header-input') || null
    this.input?.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value
      this.todo = value
    })
    this.input?.addEventListener('keydown', (e: KeyboardEvent) => {
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

  private createTodo(todo: TodoI): HTMLElement {
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
    const todoName = item.querySelector('.todo-app__item-name') || null
    let name = todo.name
    let itemEventController: AbortController = new AbortController()

    if (todoName) {
      todoName.textContent = name
    }

    todoName?.addEventListener('dblclick', () => {
      const input = document.createElement('input')
      let isUpdated = false

      input.classList.add('todo-app__item-editor')
      input.value = name
      item.insertBefore(input, todoName)
      todoName.remove()
      input.focus()

      function updateTodo() {
        if (!todoName) return
        todoName.textContent = name

        if (!isUpdated) {
          isUpdated = true
          item.insertBefore(todoName, input)
          input.remove()
        }
      }

      input.addEventListener('change', (e) => {
        name = (e.target as HTMLInputElement).value
        this.updateTodoProperty(todo.id, 'name', name)
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

    const removeBtn = item.querySelector('.todo-app__remove-btn')
    removeBtn?.addEventListener('click', () => {
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
      todoName?.classList.add('completed')
    }

    completedCheckbox.addEventListener('change', (e) => {
      const completed = (e.target as HTMLInputElement).checked

      todoName?.classList.toggle('completed', completed)
      this.updateTodoProperty(todo.id, 'completed', completed)
      this.updateApp()
    }, { signal: itemEventController.signal })

    const pinnedCheckbox = item.querySelector('.todo-app__item-pin input') as HTMLInputElement
    pinnedCheckbox.checked = todo.pinned

    if (pinnedCheckbox.checked) {
      item.classList.add('pinned')
    }

    pinnedCheckbox.addEventListener('change', (e) => {
      const pinned = (e.target as HTMLInputElement).checked

      item.classList.toggle('pinned', pinned)
      this.updateTodoProperty(todo.id, 'pinned', pinned)
      this.updateApp()
    }, { signal: itemEventController.signal })

    return item
  }

  private addTodo(): void {
    if (!this.todo.trim()) return

    const _todo = {
      id: uniqueId('todo-'),
      name: this.todo,
      completed: false,
      pinned: false
    }

    this.todos.push(_todo)
    this.setTodosToLocalStorage()

    this.todo = ''

    if (this.input) {
      this.input.value = ''
    }

    this.updateApp()
  }

  private createTodoList(): void {
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

  private createFilterListTemplate(): void {
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

  private setActiveFilter(type: ActiveFilterType): void {
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

  private get filteredTodos(): TodoI[] {
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

  private createFilteredListSentence(): void {
    const counter = document.querySelector('.todo-app__counter') as HTMLElement
    counter.textContent = `${this.filteredTodos.length} ${this.filteredTodos.length === 1 ? 'item' : 'items'} left`
  }

  private updateApp(): void {
    this.createTodoList()
    this.createFilteredListSentence()
  }

  private setTodosToLocalStorage(): void {
    localStorage.setItem('todos', JSON.stringify(this.todos))
  }

  private getTodosFromLocalStorage(): void {
    const todos = localStorage.getItem('todos')

    if (todos) {
      this.todos = JSON.parse(todos)
    } else {
      this.todos.push({
        id: uniqueId('todo-'),
        name: 'Walk with a dog 🐕',
        completed: false,
        pinned: false
      })
    }
  }

  private updateTodoProperty(todoId: string, property: keyof TodoI, value: any): void {
    this.todos = this.todos.map(t => t.id === todoId ? { ...t, [property]: value } : t)
    this.setTodosToLocalStorage()
  }
}