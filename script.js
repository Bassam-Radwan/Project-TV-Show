// ---------- Global state ----------
const state = {
  shows: [],              // full show list
  currentShowId: null,    // active show id
  allEpisodes: [],        // episodes of active show
  filteredEpisodes: [],
  selectedEpisode: null,
  searchTerm: ""
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
/**
 * Never fetch the same URL more than once per visit.
 * Caches the Promise so parallel calls share the same request.
 */
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

// ---------- Rendering ----------
function renderEpisodes(episodes) {
  manyEpisodes.textContent = `${episodes.length} of ${state.allEpisodes.length}`;
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
    container.appendChild(heading);

    if (ep.url) {
      const link = document.createElement("a");
      link.href = ep.url;
      link.target = "_blank";

      const img = document.createElement("img");
      // handle missing images
      const src = ep.image?.medium || ep.image?.original || "https://via.placeholder.com/210x295?text=No+Image";
      img.src = src;
      img.alt = ep.name ?? "Episode Image";

      link.appendChild(img);
      container.appendChild(link);
    }

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
  const url = "https://api.tvmaze.com/shows";
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
    state.filteredEpisodes = [...episodes];
    state.selectedEpisode = null;

    // Reset search and selectors
    searchInput.value = "";
    populateEpisodeSelector(episodes);
    renderEpisodes(state.filteredEpisodes);
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

function handleEpisodeSelect(e) {
  const value = e.target.value;
  if (value === "all") {
    state.selectedEpisode = null;
    renderEpisodes(state.filteredEpisodes);
    return;
  }
  const match = state.allEpisodes.find(ep => episodeCode(ep) === value);
  state.selectedEpisode = match ?? null;
  renderEpisodes(match ? [match] : []);
}

async function handleShowSelect(e) {
  const id = e.target.value;
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
    populateShowSelector(shows);

    // 2) Pick a default show (first alphabetically)
    const defaultShow = sortShowsAlpha(shows)[0];
    if (defaultShow) {
      showSelector.value = String(defaultShow.id);
      await setActiveShow(defaultShow.id);
    }

    // 3) Wire events
    searchInput.addEventListener("input", handleSearch);
    episodeSelector.addEventListener("change", handleEpisodeSelect);
    showSelector.addEventListener("change", handleShowSelect);
  } catch (e) {
    console.error(e);
    error404.style.display = "block";
  } finally {
    showLoader(false);
  }
}

window.onload = setup;
