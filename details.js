const details = document.getElementById("pokemon-details");

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

async function getPokemonDetails(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await res.json();
  
  const types = data.types.map(t => t.type.name).join(", ");
  const stats = data.stats.map(stat =>
    `<p>${stat.stat.name}: ${stat.base_stat}</p>`
  ).join("");

  details.innerHTML = `
    <div class="pokemon-info">
      <h1>#${data.id} ${data.name}</h1>
      <img src="${data.sprites.front_default}" alt="${data.name}" />
      <p><strong>Type:</strong> ${types}</p>
      <p><strong>Height:</strong> ${data.height / 10} m</p>
      <p><strong>Weight:</strong> ${data.weight / 10} kg</p>
      <div class="stats"><strong>Base Stats:</strong>${stats}</div>
    </div>
  `;
}

getPokemonDetails(id);

function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function toggleFavorite(id) {
  let favorites = getFavorites();
  if (favorites.includes(id)) {
    favorites = favorites.filter(favId => favId !== id);
  } else {
    favorites.push(id);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateFavoriteButton(id);
}

function updateFavoriteButton(id) {
  const btn = document.getElementById("favoriteBtn");
  const favorites = getFavorites();
  btn.textContent = favorites.includes(id) ? "Remover dos Favoritos" : "Favoritar";
}

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));

  const data = await getPokemonDetails(id);
  // ... exibir os dados ...

  const btn = document.getElementById("favoriteBtn");
  updateFavoriteButton(id);
  btn.addEventListener("click", () => toggleFavorite(id));
});
