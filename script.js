const state = {
  allEpisodes: [],
  filteredEpisodes: [],
  selectedEpisode: null,
  searchTerm: "",
};

function setup() {
  state.allEpisodes = getAllEpisodes();
  state.filteredEpisodes = [...state.allEpisodes];

  populateEpisodeSelector(state.allEpisodes);
  renderEpisodes(state.filteredEpisodes);

  const searchInput = document.getElementById("searchBar");
  searchInput.addEventListener("input", handleSearch);

  const episodeSelector = document.getElementById("episodeSelector");
  episodeSelector.addEventListener("change", handleSelect);
}

function handleSearch(event) {
  const term = event.target.value.toLowerCase();
  state.searchTerm = term;

  state.filteredEpisodes = state.allEpisodes.filter((ep) =>
    ep.name.toLowerCase().includes(term) ||
    ep.summary.toLowerCase().includes(term) ||
    ep.season.toString().includes(term) ||
    ep.number.toString().includes(term)
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
  const main = document.getElementById("root");
  main.innerHTML = "";

  episodes.forEach((ep) => {
    const container = document.createElement("div");
    container.classList.add("container");

    const heading = document.createElement("div");
    heading.classList.add("heading");

    const title = document.createElement("h2");
    title.textContent = `${ep.name} - S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")}`;

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
    option.textContent = `S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")} - ${ep.name}`;
    selector.appendChild(option);
  });
}

function getEpisodeOptionValue(episode) {
  return `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
}

window.onload = setup;
