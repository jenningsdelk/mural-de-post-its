const input = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const workspace = document.getElementById('workspace');

// Adiciona tarefa
addBtn.addEventListener('click', addTask);
input.addEventListener('keypress', e => {
  if (e.key === 'Enter') addTask();
});

document.addEventListener('DOMContentLoaded', loadTasks);

//Adiciona tarefa
function addTask() {
  const text = input.value.trim();
  if (!text) return;

  const { x, y } = getFreePosition();
  createTask(text, x, y);
  input.value = '';
  saveTasks();
}

function createTask(text, x = 50, y = 50, completed = false) {
  const task = document.createElement('div');
  task.className = 'task';
  if (completed) task.classList.add('completed');
  task.style.left = `${x}px`;
  task.style.top = `${y}px`;
  task.innerHTML = `
    <input type="checkbox" class="check" ${completed ? 'checked' : ''}>
    <span contenteditable="true">${text}</span>
    <button class="delete">✖</button>
  `;

  workspace.appendChild(task);
  enableDrag(task);

  // Apaga tarefa
  task.querySelector('.delete').addEventListener('click', () => {
    task.remove();
    saveTasks();
  });

  // Finaliza tarefa
  task.querySelector('.check').addEventListener('change', e => {
    task.classList.toggle('completed', e.target.checked);
    saveTasks();
  });

  // Edita tarefa 
  task.querySelector('span').addEventListener('input', saveTasks);

  task.animate([{ opacity: 0, transform: "scale(0.8)" }, { opacity: 1, transform: "scale(1)" }],
     { duration: 300, easing: "ease-out" });
}

// Arrastar tarefa
function enableDrag(task) {
  let offsetX, offsetY;

  task.addEventListener('mousedown', e => {
    // Impede arrastar ao clicar em elementos internos
    if (['INPUT', 'BUTTON', 'SPAN'].includes(e.target.tagName)) return;

    offsetX = e.clientX - task.offsetLeft;
    offsetY = e.clientY - task.offsetTop;
    task.classList.add('dragging');

    function moveAt(e) {
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;
      task.style.left = `${x}px`;
      task.style.top = `${y}px`;
    }

    function stopDrag() {
      task.classList.remove('dragging');
      document.removeEventListener('mousemove', moveAt);
      document.removeEventListener('mouseup', stopDrag);
      saveTasks();
    }

    document.addEventListener('mousemove', moveAt);
    document.addEventListener('mouseup', stopDrag);
  });
}

// Evita sobrepor ao criar tarefa
function getFreePosition() {
  const workspaceRect = workspace.getBoundingClientRect();
  const tasks = document.querySelectorAll('.task');
  const taskWidth = 200;
  const taskHeight = 70;

  let tries = 0;
  while (tries < 200) {
    const x = Math.random() * (workspaceRect.width - taskWidth);
    const y = Math.random() * (workspaceRect.height - taskHeight);

    let overlaps = false;
    tasks.forEach(t => {
      const tx = t.offsetLeft;
      const ty = t.offsetTop;
      if (
        x < tx + taskWidth &&
        x + taskWidth > tx &&
        y < ty + taskHeight &&
        y + taskHeight > ty
      ) {
        overlaps = true;
      }
    });

    if (!overlaps) return { x, y };
    tries++;
  }

  // fallback se o espaço estiver cheio
  return { x: Math.random() * 100, y: Math.random() * 100 };
}

// Salva e carrega as tarefas
function saveTasks() {
  const tasks = [];
  document.querySelectorAll('.task').forEach(task => {
    tasks.push({
      text: task.querySelector('span').textContent,
      x: task.offsetLeft,
      y: task.offsetTop,
      completed: task.querySelector('.check').checked
    });
  });
  localStorage.setItem('freeTasks', JSON.stringify(tasks));
}

function loadTasks() {
  const saved = JSON.parse(localStorage.getItem('freeTasks')) || [];
  saved.forEach(t => createTask(t.text, t.x, t.y, t.completed));
}

