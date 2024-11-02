import axios from 'axios';

const API_KEY = '46731834-56edab6cfae067b8e4143ec91';
const BASE_URL = 'https://pixabay.com/api/';

export const fetchImages = async (query, page) => {
  const url = `${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(
    query
  )}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=15`;
  const response = await axios.get(url);
  return response.data.hits;
};
