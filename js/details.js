const details = document.getElementById("pokemon-details");

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

// Mapeamento de tradução dos atributos da API
const traducoes = {
  "hp": "HP",
  "attack": "Ataque",
  "defense": "Defesa",
  "special-attack": "Ataque Especial",
  "special-defense": "Defesa Especial",
  "speed": "Velocidade"
};

// Mapeamento de tradução dos tipos
const tiposTraducao = {
  "normal": "Normal",
  "fighting": "Lutador",
  "flying": "Voador",
  "poison": "Veneno",
  "ground": "Terra",
  "rock": "Pedra",
  "bug": "Inseto",
  "ghost": "Fantasma",
  "steel": "Aço",
  "fire": "Fogo",
  "water": "Água",
  "grass": "Planta",
  "electric": "Elétrico",
  "psychic": "Psíquico",
  "ice": "Gelo",
  "dragon": "Dragão",
  "dark": "Sombrio",
  "fairy": "Fada"
};

function traduzirAtributo(nomeAtributo) {
  return traducoes[nomeAtributo] || nomeAtributo.toUpperCase();
}

function traduzirTipo(nomeTipo) {
  return tiposTraducao[nomeTipo] || nomeTipo.charAt(0).toUpperCase() + nomeTipo.slice(1);
}

async function getPokemonDetails(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await res.json();

  const types = data.types.map(t => traduzirTipo(t.type.name)).join(", ");
  const stats = data.stats.map(stat =>
    `<p>${traduzirAtributo(stat.stat.name)}: ${stat.base_stat}</p>`
  ).join("");

  details.innerHTML = `
    <div class="pokemon-info">
      <h1>#${data.id} ${data.name}</h1>
      <img src="pokemon/${data.id}.png" alt="${data.name}" />
      <p><strong>Tipo:</strong> ${types}</p>
      <p><strong>Altura:</strong> ${data.height / 10} m</p>
      <p><strong>Peso:</strong> ${data.weight / 10} kg</p>
      <div class="stats"><strong>Status:</strong>${stats}</div>
      <button id="favoriteBtn">Favoritar</button>
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
  if (btn) {
    const favorites = getFavorites();
    btn.textContent = favorites.includes(id) ? "Remover dos Favoritos" : "Favoritar";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));

  await getPokemonDetails(id);

  // Aguarda um pouco para garantir que o botão foi renderizado
  setTimeout(() => {
    const btn = document.getElementById("favoriteBtn");
    updateFavoriteButton(id);
    btn.addEventListener("click", () => toggleFavorite(id));
  }, 100);
});
