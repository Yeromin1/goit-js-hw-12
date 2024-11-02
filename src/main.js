import { fetchImages } from './js/pixabay-api.js';
import { renderImages } from './js/render-functions.js';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('#search-form');
const loader = document.querySelector('.loader');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.getElementById('load-more');

let currentPage = 1;
let currentQuery = '';

form.addEventListener('submit', async event => {
  event.preventDefault();

  currentQuery = form.elements.query.value.trim();
  currentPage = 1;

  if (currentQuery === '') {
    iziToast.error({
      title: 'Error',
      message: 'Please enter a search term.',
      position: 'topRight',
    });
    return;
  }

  loader.classList.remove('hidden');
  gallery.innerHTML = '';

  try {
    const images = await fetchImages(currentQuery, currentPage);
    renderImages(images);

    if (images.length > 0) {
      loadMoreBtn.classList.remove('hidden');
    } else {
      iziToast.error({
        title: 'Error',
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });

      loadMoreBtn.classList.add('hidden'); // Скрыть кнопку если нет изображений
    }
  } catch (error) {
    console.error(error);
    iziToast.error({
      title: 'Error',
      message: 'Failed to fetch images.',
      position: 'topRight',
    });
  } finally {
    loader.classList.add('hidden');
    form.elements.query.value = '';
  }
});

loadMoreBtn.addEventListener('click', async () => {
  currentPage += 1;
  loader.classList.remove('hidden');

  try {
    const images = await fetchImages(currentQuery, currentPage);
    renderImages(images);

    // Получение размеров и позиции галереи после добавления новых изображений
    const galleryRect = gallery.getBoundingClientRect();
    console.log(galleryRect);

    if (images.length === 0) {
      loadMoreBtn.classList.add('hidden');
      iziToast.info({
        title: 'Info',
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    } else {
      // Высота одной карточки
      const photoCard = document.querySelector('.photo-card');
      if (photoCard) {
        const cardHeight = photoCard.getBoundingClientRect().height;
        window.scrollBy({ top: cardHeight * 2, behavior: 'smooth' });
      }
    }
  } catch (error) {
    console.error(error);
    iziToast.error({
      title: 'Error',
      message: 'Failed to fetch images.',
      position: 'topRight',
    });
  } finally {
    loader.classList.add('hidden');
  }
});
