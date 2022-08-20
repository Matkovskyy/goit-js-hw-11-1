import './sass/index.scss';
import fetchPictures from './fetchPictures';
import LoadMoreBtn from './load-more-btn';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';


const refs = {
  inputData: document.querySelector('#search-form input'),
  galleryDivStructure: document.querySelector('.gallery'),
  buttonSearch: document.querySelector('#search-form button'),
  loadMoreButton: document.querySelector('.load-more'),
};
let inputNextPage = '';
let numberNextPage = 1;
let showedMessage = true;

const { inputData, galleryDivStructure, buttonSearch, loadMoreButton } = refs;

const loadMoreBtn = new LoadMoreBtn({
  selector: '.load-more',
  hidden: true,
});

buttonSearch.addEventListener('click', onSearch);

function onSearch(event) {
  event.preventDefault();
  showedMessage = true;
  galleryDivStructure.innerHTML = '';
  loadMoreBtn.disable();

  let inputSearch = inputData.value.trim();
  inputNextPage = inputSearch;
  numberNextPage = 1;

  if (inputNextPage === '') {
    Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    loadMoreBtn.hide();
    inputData.value = '';
    return;
  }

  return fetchPictures(inputSearch, numberNextPage)
    .then(pictures => renderPictures(pictures))
    .catch(error => {
      console.log(error);
    });
}

function renderPictures(pictures) {
  let pictureCounter = pictures.data.hits.length;
  let totalPictures = pictures.data.totalHits;

  if (!pictureCounter) {
    Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    loadMoreBtn.hide();
    inputData.value = '';
    return;
  }

  if (pictureCounter > 0) {
    //После первого запроса при каждом новом поиске выводить уведомление
    //в котором будет написано сколько всего нашли изображений(свойство totalHits)
    if (showedMessage) {
      Notify.success(`Hooray! We found ${totalPictures} images.`);
      showedMessage = false;
    }

    loadMoreBtn.enable();
    loadMoreBtn.show();

    //add html structure
    const markupDivInfo = pictures.data.hits
      .map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
        return `
          <div class="photo-card">
          <a class="gallery__item" href="${largeImageURL}">
            <img src="${webformatURL}" alt="${tags}" width = "300" height = "200" loading="lazy"/></a>
            <div class="info">
                <p class="info-item">
                <b>Likes</b>
                <br>${likes}
                </p>
                <p class="info-item">
                <b>Views</b>
                <br>${views}
                </p>
                <p class="info-item">
                <b>Comments</b>
                <br>${comments}
                </p>
                <p class="info-item">
                <b>Downloads</b>
                <br>${downloads}
                </p>
                </div>
            </div>`;
      })
      .join('');
    galleryDivStructure.insertAdjacentHTML('beforeend', markupDivInfo);
    inputData.value = '';
    
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 0.25,
      behavior: 'smooth',
    });

    
    let lightbox = new SimpleLightbox('.photo-card a', {
      close: true,
      captions: true,
    });
  }
  if (pictureCounter < 40 && pictureCounter > 0) {
    loadMoreBtn.hide();
    Notify.info("We're sorry, but you've reached the end of search results.");
  }
}


loadMoreButton.addEventListener('click', loadMore);

function loadMore(event) {
  loadMoreBtn.disable();
  event.preventDefault();

  numberNextPage += 1;

  return fetchPictures(inputNextPage, numberNextPage)
    .then(pictures => renderPictures(pictures))
    .catch(error => {
      console.log(error);
    });
}
