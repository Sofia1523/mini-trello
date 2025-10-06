import './style.css';

const board = document.querySelector('.board');
let state = JSON.parse(localStorage.getItem('board')) || [[], [], []];

function renderBoard() {
  document.querySelectorAll('.column').forEach((col, idx) => {
    const cardsContainer = col.querySelector('.cards');
    cardsContainer.innerHTML = '';

    state[idx].forEach((text, cardIdx) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.draggable = true;
      card.dataset.cardIdx = cardIdx;
      card.dataset.columnIdx = idx;

      // Текст карточки
      const textNode = document.createElement('span');
      textNode.textContent = text;
      card.appendChild(textNode);

      // Крестик для удаления
      const deleteBtn = document.createElement('span');
      deleteBtn.className = 'delete-btn';
      deleteBtn.innerHTML = '&times;'; // ×
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // не мешает drag
        state[idx].splice(cardIdx, 1);
        saveState();
        renderBoard();
      });
      card.appendChild(deleteBtn);

      // Drag & Drop
      card.addEventListener('dragstart', dragStart);
      card.addEventListener('dragend', dragEnd);

      cardsContainer.appendChild(card);
    });
  });
}

function saveState() {
  localStorage.setItem('board', JSON.stringify(state));
}

// Добавление новой карточки
document.querySelectorAll('.add-card').forEach((btn, idx) => {
  btn.addEventListener('click', () => {
    const text = prompt('Введите текст карточки:');
    if (text) {
      state[idx].push(text);
      saveState();
      renderBoard();
    }
  });
});

let draggedCard = null;

function dragStart(e) {
  draggedCard = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function dragEnd() {
  this.classList.remove('dragging');
  draggedCard = null;
  saveState();
}

document.querySelectorAll('.cards').forEach(container => {
  container.addEventListener('dragover', e => {
    e.preventDefault();
    const afterElement = getDragAfterElement(container, e.clientY);
    const fromCol = parseInt(draggedCard.dataset.columnIdx);
    const cardIdx = parseInt(draggedCard.dataset.cardIdx);

    let toCol = parseInt(container.parentElement.dataset.column);

    // Удаляем из старой позиции
    const movedText = state[fromCol].splice(cardIdx, 1)[0];

    if (afterElement == null) {
      container.appendChild(draggedCard);
      state[toCol].push(movedText);
    } else {
      const afterIdx = [...container.children].indexOf(afterElement);
      container.insertBefore(draggedCard, afterElement);
      state[toCol].splice(afterIdx, 0, movedText);
    }

    saveState();
    renderBoard();
  });
});

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.card:not(.dragging)')];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Инициализация доски
renderBoard();
