// -------------------------------
// Constants for LocalStorage keys
// -------------------------------
const API_URL_KEY = 'todo_api_url';
const API_KEY_KEY = 'todo_api_key';

// -------------------------------
// Load settings into the UI
// -------------------------------
function loadSettings() {
  document.getElementById('todo-api-url-input').value =
    localStorage.getItem(API_URL_KEY) || '';

  document.getElementById('todo-api-key-input').value =
    localStorage.getItem(API_KEY_KEY) || '';
}

// -------------------------------
// Save settings from UI → LocalStorage
// -------------------------------
function saveSettings() {
  const url = document.getElementById('todo-api-url-input').value.trim();
  const key = document.getElementById('todo-api-key-input').value.trim();

  localStorage.setItem(API_URL_KEY, url);
  localStorage.setItem(API_KEY_KEY, key);
}

// -------------------------------
// Helper: get API config or throw
// -------------------------------
function getApiConfig() {
  const baseUrl = localStorage.getItem(API_URL_KEY);
  const apiKey = localStorage.getItem(API_KEY_KEY);

  if (!baseUrl || !apiKey) {
    throw new Error('API URL eller API Key saknas');
  }

  return { baseUrl, apiKey };
}

// -------------------------------
// Fetch all todos
// -------------------------------
async function fetchTodos() {
  let config;
  try {
    config = getApiConfig();
  } catch (err) {
    console.warn(err.message);
    return;
  }

  try {
    const res = await fetch(`${config.baseUrl}/todos`, {
      headers: { 'X-API-Key': config.apiKey }
    });

    if (!res.ok) {
      console.error('Fel vid hämtning av todos:', await res.text());
      return;
    }

    const todos = await res.json();
    renderTodos(todos);
  } catch (err) {
    console.error('Nätverksfel:', err);
  }
}

// -------------------------------
// Render list of todos
// -------------------------------
function renderTodos(todos) {
  const list = document.getElementById('todo-list');
  list.innerHTML = '';

  todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'todo-item';

    const textSpan = document.createElement('span');
    textSpan.textContent = todo.text;

    if (todo.done) {
      textSpan.classList.add('todo-done');
    }

    const doneBtn = document.createElement('button');
    doneBtn.textContent = todo.done ? 'Ångra' : 'Klar';
    doneBtn.addEventListener('click', () => toggleTodoDone(todo));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Radera';
    deleteBtn.addEventListener('click', () => deleteTodo(todo));

    li.appendChild(textSpan);
    li.appendChild(doneBtn);
    li.appendChild(deleteBtn);

    list.appendChild(li);
  });
}

// -------------------------------
// Create new todo
// -------------------------------
document.getElementById('todo-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const text = document.getElementById('todo-text-input').value.trim();
  const categoryId = document.getElementById('todo-category-select').value;

  if (!text) return;

  const { baseUrl, apiKey } = getApiConfig();

  const res = await fetch(`${baseUrl}/todos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey
    },
    body: JSON.stringify({
      text,
      category_id: Number(categoryId)
    })
  });

  if (res.ok) {
    document.getElementById('todo-text-input').value = '';
    fetchTodos();
  } else {
    console.error('Fel vid skapande:', await res.text());
  }
});

// -------------------------------
// Toggle done/undone
// -------------------------------
async function toggleTodoDone(todo) {
  const { baseUrl, apiKey } = getApiConfig();

  const res = await fetch(`${baseUrl}/todos/${todo.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey
    },
    body: JSON.stringify({
      text: todo.text,
      category_id: todo.category_id,
      done: !todo.done
    })
  });

  if (res.ok) {
    fetchTodos();
  } else {
    console.error('Fel vid uppdatering:', await res.text());
  }
}

// -------------------------------
// Delete todo
// -------------------------------
async function deleteTodo(todo) {
  if (!confirm(`Vill du radera "${todo.text}"?`)) return;

  const { baseUrl, apiKey } = getApiConfig();

  const res = await fetch(`${baseUrl}/todos/${todo.id}`, {
    method: 'DELETE',
    headers: { 'X-API-Key': apiKey }
  });

  if (res.ok) {
    fetchTodos();
  } else {
    console.error('Fel vid radering:', await res.text());
  }
}

// -------------------------------
// Init
// -------------------------------
document.getElementById('todo-save-settings').addEventListener('click', () => {
  saveSettings();
  fetchTodos();
});

window.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  fetchTodos();
});
