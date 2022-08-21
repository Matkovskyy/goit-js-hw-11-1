import './sass/main.scss';
import fetchPictures from './fetchPictures';
import axios from "axios";
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
    //після першого запиту на кожен наcтупний виводиться повідомлення з кількістю фото (totalPictures)
    //
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

// --------VAR 2--------

// const refs = {
// input: document.querySelector('input'),
// form: document.querySelector('.search-form'),
// buttonLoad: document.querySelector('.load-more'),
// gallery: document.querySelector('.gallery'),
// alert: document.querySelector('.alert')
// }

// const BASE_URL = "https://pixabay.com/api/";

// refs.form.addEventListener('submit', (onFormSubmit));
// refs.buttonLoad.addEventListener('click', (onLoadMoreBtn))

// let isAlertVisible = false;
// let nameSearch = refs.input.value;
// let lightbox;
// let currentPage = 1;
// let perPage = 40;
// const totalPages = 500 / perPage;
// console.log(totalPages);


// refs.buttonLoad.classList.add('invisible');


// async function fetchImages() {
//     try {
//         const response = await axios.get(`${BASE_URL}?key=29395744-95b34d53a109031f8f7875032&image_type=photo&orientation=horizontal&safesearch=true&q=${nameSearch}&page=${currentPage}&per_page=${perPage}`);
//          const arrayImages = await response.data.hits;

//         if(arrayImages.length === 0) {
//             Notiflix.Notify.warning(
//             "Sorry, there are no images matching your search query. Please try again.")
//         } else if(arrayImages.length !== 0) {
//             refs.buttonLoad.classList.remove('invisible')
//         }
//         return {arrayImages,
//             totalHits: response.data.totalHits,}       
        
//     } catch(error) {
//         console.log(error)
//     }
// }

    
// function onFormSubmit(e) {    
// e.preventDefault()

//   refs.gallery.innerHTML = '';
//   nameSearch = refs.input.value;
//   nameSearch;
//   refs.buttonLoad.classList.add('invisible')

//   fetchImages() 
//     .then(images => {
//       insertMarkup(images);
//       currentPage += 1;
//     }).catch(error => (console.log(error)))

 
//     lightbox = new SimpleLightbox('.gallery a', {
//         captionsData: 'alt',
//         captionPosition: 'bottom',
//         captionDelay: 250,
//     });
// }


// function onLoadMoreBtn(){
//     if (currentPage > totalPages) {
//         refs.buttonLoad.classList.add('invisible');
//         return toggleAlertPopup()
//     }

//     nameSearch = refs.input.value;

//     fetchImages() 
//     .then(images => {
//       insertMarkup(images);   
//       currentPage += 1;})
//     .catch(error => (console.log(error)))
// }


// const createMarkup = img => `
//   <div class="photo-card">
//          <a href="${img.largeImageURL}" class="gallery_link">
//           <img class="gallery__image" src="${img.webformatURL}" alt="${img.tags}" width="370px" loading="lazy" />
//           </a>
//         <div class="info">
//               <p class="info-item">
//               <b>Likes<br>${img.likes}</b>
//               </p>
//               <p class="info-item">
//               <b>Views<br>${img.views}</b>
//               </p>
//               <p class="info-item">
//               <b>Comments<br>${img.comments}</b>
//               </p>
//               <p class="info-item">
//               <b>Downloads<br>${img.downloads}</b>
//               </p>
//         </div>
//     </div>
// `; 


// function generateMarkup(  { arrayImages, totalHits }) {
//     if (currentPage === 1) {
//         Notiflix.Notify.success(`Hoooray! We found ${totalHits} images!`);
//     }
//     return arrayImages.reduce((acc, img) => acc + createMarkup(img), "") 
// };


// function insertMarkup(arrayImages) {
//     const result = generateMarkup(arrayImages);   
//     refs.gallery.insertAdjacentHTML('beforeend', result);

//  lightbox.refresh();
// };


// function toggleAlertPopup() {
//     if (isAlertVisible) {
//       return;
//     }
//     isAlertVisible = true;
//     refs.alert.classList.add("is-visible");
//     setTimeout(() => {
//       refs.alert.classList.remove("is-visible");
//       isAlertVisible = false;
//     }, 3000);
// };
