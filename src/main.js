import { fetchImages } from './js/pixabay-api.js'; // Импорт функции для получения изображений из API
import { renderImages } from './js/render-functions.js'; // Импорт функции для отображения изображений
import iziToast from 'izitoast'; // Импорт библиотеки для отображения уведомлений
import 'izitoast/dist/css/iziToast.min.css'; // Импорт стилей для уведомлений

// Получение необходимых элементов из DOM
const form = document.querySelector('#search-form'); // Форма поиска
const loader = document.querySelector('.loader'); // Индикатор загрузки
const gallery = document.querySelector('.gallery'); // Галерея для отображения изображений
const loadMoreBtn = document.getElementById('load-more'); // Кнопка "Загрузить еще"

let currentPage = 1; // Текущая страница для пагинации
let currentQuery = ''; // Запрос пользователя для поиска изображений

// Обработчик события отправки формы
form.addEventListener('submit', async event => {
  event.preventDefault(); // Предотвращение перезагрузки страницы

  currentQuery = form.elements.query.value.trim(); // Получение и обрезка значения из поля ввода
  currentPage = 1; // Сброс на первую страницу

  // Проверка, пустой ли запрос
  if (currentQuery === '') {
    iziToast.error({
      title: 'Error',
      message: 'Please enter a search term.', // Сообщение об ошибке, если запрос пустой
      position: 'topRight',
    });
    return; // Выход из функции
  }

  loader.classList.remove('hidden'); // Показать индикатор загрузки
  gallery.innerHTML = ''; // Очистка предыдущих результатов в галерее

  try {
    const images = await fetchImages(currentQuery, currentPage); // Запрос изображений по текущему запросу и странице
    renderImages(images); // Отображение полученных изображений
    if (images.length > 0) {
      loadMoreBtn.classList.remove('hidden'); // Показываем кнопку "Загрузить еще", если есть изображения
    } else {
      iziToast.error({
        title: 'Error',
        message:
          'Sorry, there are no images matching your search query. Please try again!', // Сообщение, если не найдены изображения
        position: 'topRight',
      });
      loadMoreBtn.classList.add('hidden'); // Скрываем кнопку "Загрузить еще", если нет изображений
    }
  } catch (error) {
    console.error(error); // Логирование ошибки в консоль
    iziToast.error({
      title: 'Error',
      message: 'Failed to fetch images.', // Сообщение об ошибке, если запрос не удался
      position: 'topRight',
    });
  } finally {
    loader.classList.add('hidden'); // Скрыть индикатор загрузки
    form.elements.query.value = ''; // Очистка поля ввода после отправки
  }
});

// Обработчик события нажатия на кнопку "Загрузить еще"
loadMoreBtn.addEventListener('click', async () => {
  currentPage += 1; // Увеличиваем номер страницы
  loader.classList.remove('hidden'); // Показать индикатор загрузки

  try {
    const images = await fetchImages(currentQuery, currentPage); // Запрос изображений для следующей страницы
    renderImages(images); // Отображение новых изображений

    // Получение размеров и позиции галереи после добавления новых изображений
    const galleryRect = gallery.getBoundingClientRect();
    console.log(galleryRect); // Вывод информации о позиции и размере галереи после загрузки

    // Проверка, достигли ли мы конца результатов
    if (images.length === 0) {
      loadMoreBtn.classList.add('hidden'); // Скрываем кнопку, если больше нет изображений
      iziToast.info({
        title: 'Info',
        message: "We're sorry, but you've reached the end of search results.", // Сообщение, если больше нечего загружать
        position: 'topRight',
      });
    } else {
      // Получаем высоту одной карточки галереи
      const photoCard = document.querySelector('.photo-card'); // Предполагается, что .photo-card - это класс карточки
      if (photoCard) {
        const cardHeight = photoCard.getBoundingClientRect().height; // Получаем высоту карточки
        window.scrollBy({ top: cardHeight * 2, behavior: 'smooth' }); // Прокручиваем на две высоты карточки
      }
    }
  } catch (error) {
    console.error(error); // Логирование ошибки в консоль
    iziToast.error({
      title: 'Error',
      message: 'Failed to fetch images.', // Сообщение об ошибке, если запрос не удался
      position: 'topRight',
    });
  } finally {
    loader.classList.add('hidden'); // Скрыть индикатор загрузки
  }
});
