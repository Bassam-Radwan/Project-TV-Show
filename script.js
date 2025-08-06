function setup() {
  const allEpisodes = getAllEpisodes();

  // Initial render
  makePageForEpisodes(allEpisodes);
  populateEpisodeSelector(allEpisodes);

  // Search functionality
  const episodeSearch = document.getElementById("searchBar");
  episodeSearch.addEventListener("input", (event) => {
    const searchTerm = event.target.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter((episode) =>
      episode.name.toLowerCase().includes(searchTerm) ||
      episode.summary.toLowerCase().includes(searchTerm) ||
      episode.season.toString().includes(searchTerm) ||
      episode.number.toString().includes(searchTerm)
    );

    makePageForEpisodes(filteredEpisodes);
  });

  // Select dropdown functionality
  const episodeSelector = document.getElementById("episodeSelector");
  episodeSelector.addEventListener("change", (event) => {
    const selectedValue = event.target.value;

    if (selectedValue === "all") {
      makePageForEpisodes(allEpisodes);
    } else {
      const selectedEpisode = allEpisodes.find(
        (ep) => getEpisodeOptionValue(ep) === selectedValue
      );
      if (selectedEpisode) {
        makePageForEpisodes([selectedEpisode]);
      }
    }
  });
}

function makePageForEpisodes(episodes) {
  const main = document.getElementById("root");
  main.innerHTML = "";

  for (let episode of episodes) {
    const container = document.createElement("div");
    container.classList.add("container");

    const heading = document.createElement("div");
    heading.classList.add("heading");

    const title = document.createElement("h2");
    title.textContent =
      episode.name +
      ` - S${String(episode.season).padStart(2, "0")}E${String(
        episode.number
      ).padStart(2, "0")}`;

    heading.appendChild(title);
    container.appendChild(heading);

    const link = document.createElement("a");
    link.href = episode.url;

    const image = document.createElement("img");
    image.src = episode.image.medium;
    image.alt = "Episode Image";

    link.appendChild(image);
    container.appendChild(link);

    const summary = document.createElement("p");
    summary.innerHTML = episode.summary;

    container.appendChild(summary);
    main.appendChild(container);
  }
}

function populateEpisodeSelector(episodes) {
  const selector = document.getElementById("episodeSelector");

  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = getEpisodeOptionValue(episode);
    option.textContent = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number
    ).padStart(2, "0")} - ${episode.name}`;
    selector.appendChild(option);
  });
}

function getEpisodeOptionValue(episode) {
  return `S${String(episode.season).padStart(2, "0")}E${String(
    episode.number
  ).padStart(2, "0")}`;
}

// Run setup when the page loads
window.onload = setup;
