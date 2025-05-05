var f=Object.defineProperty;var v=(r,e,i)=>e in r?f(r,e,{enumerable:!0,configurable:!0,writable:!0,value:i}):r[e]=i;var p=(r,e,i)=>v(r,typeof e!="symbol"?e+"":e,i);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))s(t);new MutationObserver(t=>{for(const o of t)if(o.type==="childList")for(const c of o.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function i(t){const o={};return t.integrity&&(o.integrity=t.integrity),t.referrerPolicy&&(o.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?o.credentials="include":t.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(t){if(t.ep)return;t.ep=!0;const o=i(t);fetch(t.href,o)}})();let _=0;function b(r){const e=++_;return r.toString()+e}class g{constructor(e){p(this,"todo");p(this,"todos");p(this,"selector");p(this,"activeFilter");this.selector=e,this.todo="",this.todos=[],this.activeFilter="All",this.init()}init(){const e=document.querySelector(this.selector);this.createInitialTemplate(e),this.createFilterListTemplate(),this.createFilteredListSentence(),this.bindInitialEvents()}createInitialTemplate(e){e&&(e.innerHTML=`
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
    `)}bindInitialEvents(){const e=document.querySelector(".todo-app__header-input");e.addEventListener("input",t=>{const o=t.target.value;this.todo=o}),e.addEventListener("keydown",t=>{t.code==="Enter"&&this.addTodo()});const i=document.querySelector(".todo-app__header-btn");i==null||i.addEventListener("click",()=>{this.addTodo()});const s=document.querySelector(".todo-app__clear-btn");s==null||s.addEventListener("click",()=>{this.todos.filter(t=>t.completed).length&&(this.todos=this.todos.filter(t=>!t.completed),this.updateApp())})}createTodo(e){const i=document.createElement("li");i.classList.add("todo-app__item"),i.innerHTML=`
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
    `;const s=i.querySelector(".todo-app__item-name");let t=e.name,o=new AbortController;s.textContent=t,s.addEventListener("dblclick",()=>{const n=document.createElement("input");let l=!1;n.classList.add("todo-app__item-editor"),n.value=t,i.insertBefore(n,s),s.remove(),n.focus();function d(){s.textContent=t,l||(l=!0,i.insertBefore(s,n),n.remove())}n.addEventListener("change",h=>{t=h.target.value,this.todos=this.todos.map(m=>m.id!==e.id?m:{...m,name:t})},{signal:o.signal}),n.addEventListener("blur",()=>{d()},{signal:o.signal}),n.addEventListener("keydown",h=>{h.code==="Enter"&&d()},{signal:o.signal})},{signal:o.signal}),i.querySelector(".todo-app__remove-btn").addEventListener("click",()=>{this.todos=this.todos.filter(n=>n.id!==e.id),this.createFilteredListSentence(),o.abort(),i.remove()},{signal:o.signal});const a=i.querySelector(".todo-app__item-checkbox input");a.checked=e.completed,a.checked&&s.classList.add("completed"),a.addEventListener("change",n=>{const l=n.target.checked;l?s.classList.add("completed"):s.classList.remove("completed"),this.todos=this.todos.map(d=>d.id!==e.id?d:{...d,completed:l}),this.updateApp()},{signal:o.signal});const u=i.querySelector(".todo-app__item-pin input");return u.checked=e.pinned,u.checked&&i.classList.add("pinned"),u.addEventListener("change",n=>{const l=n.target.checked;l?i.classList.add("pinned"):i.classList.remove("pinned"),this.todos=this.todos.map(d=>d.id!==e.id?d:{...d,pinned:l}),this.updateApp()},{signal:o.signal}),i}addTodo(){const e={id:b("todo-"),name:this.todo,completed:!1,pinned:!1};this.todos.push(e),this.todo="";const i=document.querySelector(".todo-app__header-input");i.value="",this.updateApp()}createTodoList(){const e=document.querySelector(".todo-app__list"),i=new DocumentFragment;if(this.filteredTodos.length)for(const s of this.filteredTodos){const t=this.createTodo(s);i.append(t)}e==null||e.replaceChildren(i)}createFilterListTemplate(){const e=document.querySelector(".todo-app__filters"),i=new DocumentFragment,s=[{label:"All"},{label:"Active"},{label:"Completed"}];for(const t of s){const o=document.createElement("li");o.classList.add("todo-app__filters-item"),o.innerHTML=`<a href="#!">${t.label}</a>`,t.label===this.activeFilter&&o.firstChild.classList.add("selected"),o.addEventListener("click",()=>{const c=document.querySelectorAll(".todo-app__filters-item");for(const a of c)a.firstChild.classList.remove("selected");o.firstChild.classList.add("selected"),this.setActiveFilter(t.label)}),i.append(o)}e.append(i)}setActiveFilter(e){e==="All"&&(this.activeFilter="All"),e==="Active"&&(this.activeFilter="Active"),e==="Completed"&&(this.activeFilter="Completed"),this.updateApp()}get filteredTodos(){return this.activeFilter==="All"?this.todos:this.activeFilter==="Active"?this.todos.filter(e=>!e.completed):this.activeFilter==="Completed"?this.todos.filter(e=>e.completed):[]}createFilteredListSentence(){const e=document.querySelector(".todo-app__counter");e.textContent=`${this.filteredTodos.length} ${this.filteredTodos.length===1?"item":"items"} left`}updateApp(){this.createTodoList(),this.createFilteredListSentence()}}document.querySelector("#app").innerHTML=`
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
`;new g("#todo");
