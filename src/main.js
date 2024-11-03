import { fetchImages } from './js/pixabay-api.js';
import { renderImages } from './js/render-functions.js';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('#search-form');
const loader = document.querySelector('.loader');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.getElementById('load-more');

let currentPage = 1;
let currentQuery = '';
let totalHits = 0; // Храним общее количество изображений
const imagesPerPage = 15; // Количество изображений на странице

const lightbox = new SimpleLightbox('.gallery a');

const smoothScroll = () => {
  const photoCard = document.querySelector('.photo-card');
  if (photoCard) {
    const cardHeight = photoCard.getBoundingClientRect().height;
    window.scrollBy({ top: cardHeight * 2, behavior: 'smooth' });
  }
};

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
    const { totalHits: totalResults, hits: images } = await fetchImages(
      currentQuery,
      currentPage
    );
    totalHits = totalResults; // Сохраняем общее количество результатов
    renderImages(images);

    if (images.length > 0) {
      loadMoreBtn.classList.remove('hidden');
      lightbox.refresh();
    } else {
      iziToast.error({
        title: 'Error',
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      loadMoreBtn.classList.add('hidden');
    }
  } catch (error) {
    console.error('Error fetching images on submit:', error);
    iziToast.error({
      title: 'Error',
      message: 'Failed to fetch images. Please try again later.',
      position: 'topRight',
    });
  } finally {
    loader.classList.add('hidden');
    form.elements.query.value = '';
  }
});

loadMoreBtn.addEventListener('click', async () => {
  const maxPages = Math.ceil(totalHits / imagesPerPage); // Максимальное количество страниц

  if (currentPage >= maxPages) {
    iziToast.info({
      title: 'Info',
      message: "We're sorry, but you've reached the end of search results.",
      position: 'topRight',
    });
    loadMoreBtn.classList.add('hidden'); // Скрываем кнопку, если больше нет изображений
    return;
  }

  currentPage += 1;
  loader.classList.remove('hidden');

  try {
    const { hits: images } = await fetchImages(currentQuery, currentPage);

    if (images.length === 0) {
      iziToast.info({
        title: 'Info',
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
      loadMoreBtn.classList.add('hidden');
    } else {
      renderImages(images);
      lightbox.refresh();
      smoothScroll();
    }
  } catch (error) {
    console.error('Error fetching images on load more:', error);
    iziToast.error({
      title: 'Error',
      message: 'Failed to fetch images. Please try again later.',
      position: 'topRight',
    });
  } finally {
    loader.classList.add('hidden');
  }
});
