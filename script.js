//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
   makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  for (let movie = 0; movie < getAllEpisodes().length; movie++) {
    const main = document.getElementById("root");
    // container
    const container = document.createElement("div");
    container.classList.add("container");
    main.appendChild(container);
  
    // title
    const heading = document.createElement("div");
    heading.classList.add("heading");
    const title = document.createElement("h2");
    title.textContent =
      getAllEpisodes()[movie].name +
      ` -S${String(getAllEpisodes()[movie].season).padStart(2, "0")}E${String(
        getAllEpisodes()[movie].number
      ).padStart(2, "0")}`;
  
    heading.appendChild(title);
    container.appendChild(heading);
  
    // image
    const link = document.createElement("a");
    link.href = getAllEpisodes()[movie].url;
    const image = document.createElement("img");
    image.src = getAllEpisodes()[movie].image.medium;
    image.alt = "Movie Image";
    link.appendChild(image);
    container.appendChild(link);
  
    // summary
    const summary = document.createElement("p");
    summary.innerHTML = getAllEpisodes()[movie].summary;
    container.appendChild(summary);
  }
}
// This function will run after the page has loaded
 window.onload = setup;
