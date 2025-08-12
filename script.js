const state = {
  allEpisodes: [],
  filteredEpisodes: [],
  selectedEpisode: null,
  searchTerm: "",
};
const manyEpisodes = document.getElementById("manyEpisodes");

async function setup() {
  state.allEpisodes = await start();
  state.filteredEpisodes = [...state.allEpisodes];
  populateEpisodeSelector(state.allEpisodes);
  renderEpisodes(state.filteredEpisodes);

  const searchInput = document.getElementById("searchBar");
  searchInput.addEventListener("input", handleSearch);

  const episodeSelector = document.getElementById("episodeSelector");
  episodeSelector.addEventListener("change", handleSelect);
  tvShowType(state.allEpisodes)
}

function handleSearch(event) {
  const term = event.target.value.toLowerCase();
  state.searchTerm = term;

  state.filteredEpisodes = state.allEpisodes.filter((ep) =>
    ep.name.toLowerCase().includes(term) ||
    ep.summary.toLowerCase().includes(term)
    // ep.season.toString().includes(term) ||
    // ep.number. includes(term)

  );

  state.selectedEpisode = null;
  renderEpisodes(state.filteredEpisodes);
}

function handleSelect(event) {
  const value = event.target.value;

  if (value === "all") {
    state.selectedEpisode = null;
    renderEpisodes(state.filteredEpisodes);

  } else {
    state.selectedEpisode = state.allEpisodes.find(
      (ep) => getEpisodeOptionValue(ep) === value
    );
    renderEpisodes([state.selectedEpisode]);

  }
}

function renderEpisodes(episodes) {
  manyEpisodes.textContent = `${episodes.length} of ${state.allEpisodes.length}`;

  const main = document.getElementById("root");
  main.innerHTML = "";

  episodes.forEach((ep) => {
    const container = document.createElement("div");
    container.classList.add("container");

    const heading = document.createElement("div");
    heading.classList.add("heading");

    const title = document.createElement("h2");
    title.textContent = ep.number != null
      ? `${ep.name} - S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")}`
      : `${ep.name}  `;

    heading.appendChild(title);
    container.appendChild(heading);

    const link = document.createElement("a");
    link.href = ep.url;

    const image = document.createElement("img");
    image.src = ep.image.medium;
    image.alt = "Episode Image";

    link.appendChild(image);
    container.appendChild(link);

    const summary = document.createElement("p");
    summary.innerHTML = ep.summary;

    container.appendChild(summary);
    main.appendChild(container);
  });
}

// this is  a feature for level 400 
function tvShowType(episodes) {
  let selectedShow = [];
  let genresType = [];
  let showType = document.getElementById('showType');
  // create option elements 
  episodes.forEach(episode => {
    episode.genres.forEach(genre => {
      if (!genresType.includes(genre)) {
        genresType.push(genre)
        let option = document.createElement('option')
        option.value = genre
        option.textContent = genre
        showType.appendChild(option)
      }
    })
  })
  // render selected type
  showType.addEventListener('change', () => {
    selectedShow.splice(0, selectedShow.length)
    episodes.forEach(episode => {
      episode.genres.forEach(genre => {

        if (showType.value === genre) {
          selectedShow.push(episode)
        }
      })
      renderEpisodes(selectedShow)
    }
    )
    if (showType.value === 'all') {
      renderEpisodes(episodes)
    }
  }
  )
}
function populateEpisodeSelector(episodes) {
  const selector = document.getElementById("episodeSelector");
  selector.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = "Show All Episodes";
  selector.appendChild(defaultOption);

  episodes.forEach((ep) => {
    const option = document.createElement("option");
    option.value = getEpisodeOptionValue(ep);
    option.textContent = ep.number != null ? `S${String(ep.season).padStart(2, "0")}
    E${String(ep.number).padStart(2, "0")} - ${ep.name}`
      : ep.name;
    selector.appendChild(option);
  });
}

// 
function getEpisodeOptionValue(episode) {
  return episode.number != null ?
    `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`
    : episode.name;
}

// hide the bar when scrolling down
let preScroll = -1;
window.addEventListener("scroll", () => {
  let scroll = window.scrollY;
  if (scroll >= preScroll) {
    preScroll = scroll;
    document.getElementById("searchContainer").style.visibility = "hidden";
  } else {
    document.getElementById("searchContainer").style.visibility = "visible";
    preScroll = scroll
  }

});
// this list  is for episodes from the api
let Episodes = [];

// fetching the api 
window.onload = setup;
async function data() {
  try {
    const res = await fetch('https://api.tvmaze.com/shows/82/episodes')
    const response = await res.json()
    const loader = document.getElementById('loader')
    loader.style.display = 'block';
    Episodes = response
  }

  catch (error) {
    console.log('Error 404');
    document.getElementById('error404').style.display = 'block';
  } finally {
    loader.style.display = 'none'
  }
}
async function start() {
  await data()
  return Episodes
}
