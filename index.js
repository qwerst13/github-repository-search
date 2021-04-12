const searchResults = document.querySelectorAll('.search-results'),
      searchEl = document.querySelector('.search'),
      input = document.querySelector('.input'),
      list = document.querySelector('.list'),
      emptyList = document.querySelector('.list__empty');

const debounceTimeMs = 350;

search = debounce(search, debounceTimeMs);
input.addEventListener('input', search);
searchEl.addEventListener('click', choose);
list.addEventListener('click', close);


function debounce(f, ms) {
  let timerId;

  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(()=>f.apply(this, args), ms);
  }
}

async function search(e) {
  let query = e.target.value,
      searchingResult = await fetch(`https://api.github.com/search/repositories?q=${query}&sort=stars&page=1&per_page=5`).catch((e)=>drawResults(null)).then((data)=>data.json());
  drawResults(searchingResult);
}

function choose(e) {
  if (!e.target.classList.contains('search-results') || e.target.textContent === 'Nothing found :(') return;
  hide(searchResults);
  input.value = '';
  emptyList.hidden = true;
  list.insertAdjacentHTML('beforeend', `
    <div class="list__item">
      <a target="_blank" href="${e.target.dataset.link}" class="list__cell">${e.target.textContent}</a>
      <div class="list__cell">${e.target.dataset.owner}</div>
      <div class="list__cell">${e.target.dataset.stars}</div>
      <div class="close"></div>
    </div>`);
}

function close(e) {
  if (!e.target.classList.contains('close')) return;
  e.target.parentElement.remove();
  if (!document.querySelector('.list__item')) emptyList.hidden = false;
}

function hide(arrayOfElements) {
  for (let item of arrayOfElements) item.hidden = true;
}

function drawResults(response) {
  hide(searchResults); //refreshing results
  if (!response.items || response===null) return;

  if (response.total_count === 0) {
    let [firstField] = searchResults;
    firstField.hidden = false;
    firstField.textContent = 'Nothing found :(';
  } else {
    searchResults.forEach((item, i)=>{
      if (response.items[i]!==undefined){
        item.hidden = false;
        item.textContent = response.items[i].name;
        item.dataset.owner = response.items[i].owner.login;
        item.dataset.stars = response.items[i].stargazers_count;
        item.dataset.link = response.items[i].html_url;
      }
    })
  }
}
