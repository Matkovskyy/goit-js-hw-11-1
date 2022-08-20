export default async function fetchPictures(name, pageNumber) {
  const axios = require('axios');

  const API_KEY = '29395744-95b34d53a109031f8f7875032';

  const URL = `https://pixabay.com/api/?key=${API_KEY}&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${pageNumber}`;

  const pictures = await axios.get(URL);

  return pictures;
}