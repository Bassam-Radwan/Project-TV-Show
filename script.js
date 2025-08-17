/**
 * Reflection:
 * - Compared to Salah's code, mine uses more modular rendering functions.
 * - I prefer my use of fetch caching; he used raw fetch().
 * - I liked how he used event delegation to simplify event handling.
 * - I learned about better error handling and rendering defaults.
 */
// ---------- Global state ----------
const state = {
  shows: [],              // full show list
  currentShowId: null,    // active show id
  allEpisodes: [],        // episodes of active show
  filteredEpisodes: [],
  selectedEpisode: null,
  searchTerm: "",
};

const manyEpisodes = document.getElementById("manyEpisodes");
const loader = document.getElementById("loader");
const error404 = document.getElementById("error404");
const root = document.getElementById("root");
const showSelector = document.getElementById("showSelector");
const episodeSelector = document.getElementById("episodeSelector");
const searchInput = document.getElementById("searchBar");

// ---------- One-visit fetch cache ----------
const fetchCache = new Map();

function fetchWithCache(url) {
  if (fetchCache.has(url)) return fetchCache.get(url);
  const p = fetch(url).then(r => {
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.json();
  });
  fetchCache.set(url, p);
  return p;
}

// ---------- Utilities ----------
function showLoader(on) { loader.style.display = on ? "block" : "none"; }
function safeHtml(str) { return String(str ?? "").trim(); }
function episodeCode(ep) {
  if (ep.number == null || ep.season == null) return ep.name ?? "Episode";
  return `S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")}`;
}
function optionLabel(ep) {
  return ep.number != null && ep.season != null
    ? `${episodeCode(ep)} - ${ep.name}`
    : ep.name ?? "Episode";
}
function sortShowsAlpha(shows) {
  return [...shows].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
}

function renderShows(shows) {
  manyEpisodes.textContent = `${shows.length} shows of ${state.shows.length}`
  root.innerHTML = ''
  shows.forEach((show) => {
    const root = document.getElementById('root')
    const bar = document.createElement('div')
    bar.classList.add('bar')
    const head = document.createElement('h2')
    head.id = show.id
    head.innerHTML = show.name
    if (show.url) {
      bar.appendChild(head)
      const rightPart = document.createElement('div')
      rightPart.classList.add('rightPart')
      // image
      const image = document.createElement('img')
      image.src = show.image.medium
      image.alt = show.name
      rightPart.appendChild(image)
      // rating
      const rate = document.createElement('p')
      rate.innerHTML = `<span class = 'bold'> Rating: <br> </span>  ${show.rating.average}`
      rightPart.appendChild(rate)

      // genres
      const runtime = document.createElement('p')
      runtime.innerHTML = ` <span class = 'bold'> RunTime: <br> </span> ${show.runtime}`
      rightPart.appendChild(runtime)

      // status 
      const status = document.createElement('p')
      status.innerHTML = `<span class = 'bold'> Status:<br> </span> ${show.status}`
      rightPart.appendChild(status)
      // genres
      const genre = document.createElement('p')
      genre.innerHTML = `<span class = 'bold'> Genre:<br> </span>   ${show.genres.join('|')}`
      rightPart.appendChild(genre)

      // summary
      const leftPart = document.createElement('div')
      leftPart.classList.add('leftPart')
      const summary = document.createElement('p')
      summary.innerHTML = show.summary
      leftPart.appendChild(summary)
      bar.appendChild(rightPart);
      bar.appendChild(leftPart)
      root.appendChild(bar)
    }

  })

}

// ---------- Rendering ----------
function renderEpisodes(episodes) {
  manyEpisodes.textContent = `${episodes.length} of ${state.allEpisodes.length} Episodes`;
  root.innerHTML = "";

  episodes.forEach(ep => {
    const container = document.createElement("div");
    container.classList.add("container");

    const heading = document.createElement("div");
    heading.classList.add("heading");

    const title = document.createElement("h2");
    title.textContent = ep.number != null && ep.season != null
      ? `${ep.name} - ${episodeCode(ep)}`
      : `${ep.name ?? "Episode"}`;
    heading.appendChild(title);
    container.appendChild(heading)

    const img = document.createElement("img");
    // handle missing images
    const src = ep.image?.medium || ep.image?.original || "https://via.placeholder.com/210x295?text=No+Image";
    img.src = src;
    img.alt = ep.name ?? "Episode Image";
    container.appendChild(img)

    const summary = document.createElement("p");
    summary.innerHTML = safeHtml(ep.summary) || "No summary available.";

    container.appendChild(summary);
    root.appendChild(container);



  });
}

function populateEpisodeSelector(episodes) {
  episodeSelector.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = "Show All Episodes";
  episodeSelector.appendChild(defaultOption);

  episodes.forEach(ep => {
    const opt = document.createElement("option");
    opt.value = episodeCode(ep);
    opt.textContent = optionLabel(ep);
    episodeSelector.appendChild(opt);
  });
}

function populateShowSelector(shows) {
  showSelector.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a show…";
  showSelector.appendChild(placeholder);

  sortShowsAlpha(shows).forEach(show => {
    const opt = document.createElement("option");
    opt.value = String(show.id);
    opt.textContent = show.name;
    showSelector.appendChild(opt);

  });
}

// ---------- Data flows ----------
async function loadShows() {
  // Requirement: fetch list of available shows once
  // Using the base endpoint per spec (page 0)
  const url = `https://api.tvmaze.com/shows `;
  return fetchWithCache(url);
}
function oneShow(show) {
  root.innerHTML = ''
  const url = `https://api.tvmaze.com/shows/${show} `;
  return fetchWithCache(url);
}

async function loadEpisodesForShow(showId) {
  const url = `https://api.tvmaze.com/shows/${showId}/episodes`;
  return fetchWithCache(url);
}

async function setActiveShow(showId) {
  try {
    showLoader(true);
    state.currentShowId = showId;

    const episodes = await loadEpisodesForShow(showId);
    state.allEpisodes = episodes;
    state.filteredEpisodes = state.allEpisodes;
    state.selectedEpisode = null;

    // Reset search and selectors
    searchInput.value = "";
    populateEpisodeSelector(episodes);
  } catch (e) {
    console.error(e);
    error404.style.display = "block";
  } finally {
    showLoader(false);
  }
}

// ---------- Event handlers ----------
function handleSearch(e) {
  const term = e.target.value.toLowerCase();
  state.searchTerm = term;
  if (!state.currentShowId) {
    const filteredShows = state.shows.filter(show => {
      const name = show.name?.toLowerCase() ?? "";
      const summary = show.summary ? show.summary.replace(/<[^>]*>/g, "").toLowerCase() : "";
      return name.includes(term) || summary.includes(term);
    });
    renderShows(filteredShows);
  } else {

    state.filteredEpisodes = state.allEpisodes.filter(ep => {
      const name = ep.name?.toLowerCase() ?? "";
      const summary = ep.summary ? ep.summary.replace(/<[^>]*>/g, "").toLowerCase() : "";
      const code = episodeCode(ep).toLowerCase();
      return name.includes(term) || summary.includes(term) || code.includes(term);
    });

    state.selectedEpisode = null;
    episodeSelector.value = "all";
    renderEpisodes(state.filteredEpisodes);
  }
}

function handleEpisodeSelect(e) {
  const value = e.target.value;
  if (value === "all") {
    state.selectedEpisode = null;
    renderEpisodes(state.allEpisodes);
    return;
  }
  const match = state.allEpisodes.find(ep => episodeCode(ep) === value);
  state.selectedEpisode = match ?? null;
  renderEpisodes(match ? [match] : []);
}

async function handleShowSelect(e) {
  root.innerHTML = ''
  const id = e.value;
  if (!id) return;
  await setActiveShow(id);
}

// Hide the bar when scrolling down
let preScroll = -1;
window.addEventListener("scroll", () => {
  const sc = window.scrollY;
  const el = document.getElementById("searchContainer");
  if (sc >= preScroll) {
    el.style.visibility = "hidden";
  } else {
    el.style.visibility = "visible";
  }
  preScroll = sc;
});

// ---------- Init ----------
async function setup() {
  try {
    showLoader(true);

    // 1) Load shows list (cached)
    const shows = await loadShows();

    state.shows = shows;
    renderShows(shows)
    populateShowSelector(shows);
    // 2) Pick a default show (first alphabetically)
    searchInput.addEventListener("input", handleSearch);
    episodeSelector.addEventListener("change", handleEpisodeSelect);
    showSelector.addEventListener("change", async () => {
      const show = await oneShow(showSelector.value)
      await setActiveShow(showSelector.value)
      searchInput.addEventListener("input", handleSearch);
      episodeSelector.addEventListener("change", handleEpisodeSelect);
      renderShows([show])
      getShow()
    });
    getShow()
    // 3) Wire events
    function getShow() {
      document.querySelectorAll('h2').forEach(async (head) => {
        const episodes = await loadEpisodesForShow(head.id)
        head.addEventListener('click', () => {
          shows.forEach(async show => {
            if (show.id == head.id) {
              await setActiveShow(head.id)
              searchInput.addEventListener("input", handleSearch);
              episodeSelector.addEventListener("change", handleEpisodeSelect);
              showSelector.addEventListener("change", handleShowSelect);
              renderEpisodes(episodes)
            }
          })
        })
      })
    }
    // back to all shows
    const backBtn = document.createElement("button");
    backBtn.classList.add('back')
    backBtn.textContent = "Back to Shows";
    backBtn.addEventListener("click", () => {
      renderShows(shows)
      showSelector.value = ''
      episodeSelector.value = 'all'
    });
    document.body.prepend(backBtn);
    backBtn.addEventListener('click', async () => {
      episodeSelector.addEventListener("change", handleEpisodeSelect);
    })

  } catch (e) {
    console.error(e);
    error404.style.display = "block";
  } finally {
    showLoader(false);
  }
}


window.onload = setup;
