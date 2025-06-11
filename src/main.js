import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://uegxvwvhocbfdwfijslb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZ3h2d3Zob2NiZmR3Zmlqc2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMDkzNjYsImV4cCI6MjA2NDc4NTM2Nn0.Z6TJ0gsMGJMFM1V4Gs6sKolzksfCBftiQaaPMUPmvcI";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const articlesList = document.getElementById('articles-list');
const addArticleBtn = document.getElementById('add-article-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginLink = document.getElementById('login-link');

const articleModal = document.getElementById('article-modal');
const articleForm = document.getElementById('article-form');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalTitle = document.getElementById('modal-title');

const articleIdInput = document.getElementById('article-id');
const articleTitleInput = document.getElementById('article-title');
const articleSubtitleInput = document.getElementById('article-subtitle');
const articleContentInput = document.getElementById('article-content');
const articleAuthorInput = document.getElementById('article-author');

const messageModal = document.getElementById('message-modal');
const messageText = document.getElementById('message-text');
const messageCloseBtn = document.getElementById('message-close-btn');

const confirmModal = document.getElementById('confirm-modal');
const confirmText = document.getElementById('confirm-text');
const confirmYesBtn = document.getElementById('confirm-yes-btn');
const confirmNoBtn = document.getElementById('confirm-no-btn');

let currentUser = null;

function showMessage(message) {
  messageText.textContent = message;
  messageModal.classList.remove('hidden');
}

function hideMessage() {
  messageModal.classList.add('hidden');
}

function showConfirm(message) {
  return new Promise((resolve) => {
    confirmText.textContent = message;
    confirmModal.classList.remove('hidden');

    const handleYes = () => {
      confirmModal.classList.add('hidden');
      confirmYesBtn.removeEventListener('click', handleYes);
      confirmNoBtn.removeEventListener('click', handleNo);
      resolve(true);
    };

    const handleNo = () => {
      confirmModal.classList.add('hidden');
      confirmYesBtn.removeEventListener('click', handleYes);
      confirmNoBtn.removeEventListener('click', handleNo);
      resolve(false);
    };

    confirmYesBtn.addEventListener('click', handleYes);
    confirmNoBtn.addEventListener('click', handleNo);
  });
}

async function checkUser() {
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;

  if (currentUser) {
    addArticleBtn.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    loginLink.classList.add('hidden');
  } else {
    addArticleBtn.classList.add('hidden');
    logoutBtn.classList.add('hidden');
    loginLink.classList.remove('hidden');
  }
}

async function loadArticles() {
  articlesList.innerHTML = '<h2 class="text-2xl font-bold text-gray-800 mb-4 col-span-full">Artykuły:</h2>';
  const { data, error } = await supabase
    .from('zadanie-13')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    articlesList.innerHTML += `<p class="text-red-600 text-center col-span-full">Błąd ładowania artykułów: ${error.message}</p>`;
    return;
  }

  if (data.length === 0) {
    articlesList.innerHTML += `<p class="text-center text-gray-600 col-span-full">Brak artykułów do wyświetlenia.</p>`;
    return;
  }

  data.forEach(article => {
    const articleEl = document.createElement('article');
    articleEl.className = 'bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between';
    articleEl.innerHTML = `
      <div>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">${article.title}</h3>
        <h4 class="text-xl font-semibold text-gray-600 mb-3">${article.subtitle}</h4>
        <p class="text-sm text-gray-500 mb-4">
          Autor: <span class="font-medium">${article.author}</span> | Data: ${new Date(article.created_at).toLocaleDateString()}
        </p>
        <p class="text-gray-700 leading-relaxed mb-4 line-clamp-4">${article.content}</p>
      </div>
      <div class="flex flex-wrap gap-3 mt-4" data-user-only></div>
    `;

    const userOnlyDiv = articleEl.querySelector('[data-user-only]');
    if (currentUser && currentUser.id === article.user_id) {
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edytuj';
      editBtn.className = 'flex-1 min-w-[120px] px-4 py-2 bg-yellow-500 text-white rounded-md font-semibold hover:bg-yellow-600 btn-hover-scale shadow-sm';
      editBtn.onclick = () => openEditModal(article);
      userOnlyDiv.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Usuń';
      deleteBtn.className = 'flex-1 min-w-[120px] px-4 py-2 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600 btn-hover-scale shadow-sm';
      deleteBtn.onclick = () => deleteArticle(article.id);
      userOnlyDiv.appendChild(deleteBtn);
    } else {
        userOnlyDiv.remove();
    }

    articlesList.appendChild(articleEl);
  });
}

function openEditModal(article = null) {
  articleModal.classList.remove('hidden');

  if (article) {
    modalTitle.textContent = 'Edytuj Artykuł';
    articleIdInput.value = article.id;
    articleTitleInput.value = article.title;
    articleSubtitleInput.value = article.subtitle;
    articleContentInput.value = article.content;
    articleAuthorInput.value = article.author;
  } else {
    modalTitle.textContent = 'Dodaj Nowy Artykuł';
    articleForm.reset();
    articleIdInput.value = '';
  }
}

function closeArticleModal() {
  articleModal.classList.add('hidden');
  articleForm.reset();
}

modalCloseBtn.onclick = closeArticleModal;

articleForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = articleIdInput.value;
  const title = articleTitleInput.value;
  const subtitle = articleSubtitleInput.value;
  const content = articleContentInput.value;
  const author = articleAuthorInput.value; // ZMIENIONO: zmienna 'author' zamiast 'author_name'
  const created_at = new Date().toISOString();

  if (!currentUser) {
    showMessage('Musisz być zalogowany, aby dodawać/edytować artykuły.');
    return;
  }

  if (id) {
    const { error } = await supabase
      .from('zadanie-13')
      .update({ title, subtitle, content, author, created_at }) // ZMIENIONO: używamy 'author'
      .eq('id', id)
      .eq('user_id', currentUser.id);

    if (error) {
      showMessage('Błąd aktualizacji artykułu: ' + error.message);
      return;
    }
    showMessage('Artykuł zaktualizowany pomyślnie!');
  } else {
    const { error } = await supabase
      .from('zadanie-13')
      .insert([{ title, subtitle, content, author, created_at, user_id: currentUser.id }]); // ZMIENIONO: używamy 'author'

    if (error) {
      showMessage('Błąd dodawania artykułu: ' + error.message);
      return;
    }
    showMessage('Artykuł dodany pomyślnie!');
  }

  closeArticleModal();
  await loadArticles();
});

async function deleteArticle(id) {
  const confirmed = await showConfirm('Na pewno chcesz usunąć ten artykuł?');
  if (!confirmed) return;

  if (!currentUser) {
    showMessage('Musisz być zalogowany, aby usuwać artykuły.');
    return;
  }

  const { error } = await supabase
    .from('zadanie-13')
    .delete()
    .eq('id', id)
    .eq('user_id', currentUser.id);

  if (error) {
    showMessage('Błąd usuwania artykułu: ' + error.message);
    return;
  }

  showMessage('Artykuł usunięty pomyślnie!');
  await loadArticles();
}

logoutBtn.onclick = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    showMessage('Błąd wylogowania: ' + error.message);
  } else {
    window.location.href = '/zadanie-13/login/';
  }
};

addArticleBtn.onclick = () => openEditModal();
messageCloseBtn.onclick = hideMessage;

async function init() {
  await checkUser();
  await loadArticles();
}

init();