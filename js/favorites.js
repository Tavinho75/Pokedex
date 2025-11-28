const tipoTraduzido = {
  normal: "normal",
  fire: "fogo",
  water: "água",
  electric: "elétrico",
  grass: "planta",
  ice: "gelo",
  fighting: "lutador",
  poison: "veneno", 
  ground: "terra",
  flying: "voador",
  psychic: "psíquico",
  bug: "inseto",
  rock: "pedra",
  ghost: "fantasma",
  dragon: "dragão",
  dark: "noturno",
  steel: "aço",
  fairy: "fada",
  stellar: "estelar"
};

const typeColors = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
  stellar: "rainbow"
};

function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

async function getPokemon(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  return await res.json();
}

async function loadFavorites() {
  const container = document.getElementById("favoritesList");
  let favorites = getFavorites();

  if (favorites.length === 0) {
    container.innerHTML = "<p>Nenhum favorito ainda.</p>";
    return;
  }

  // Ordenar por ID numérico
  favorites.sort((a, b) => a - b);

  for (const id of favorites) {
    const data = await getPokemon(id);
    renderPokemon(data, container);
    await new Promise(r => setTimeout(r, 10));
  }
}

function renderPokemon(data, container) {
  const tipos = data.types.map(t => t.type.name);
  const tipoPrincipal = tipos[0];
  const cor = typeColors[tipoPrincipal] || "#777";
  const tiposTraduzidos = tipos.map(t => tipoTraduzido[t] || t).join(", ");

  const card = document.createElement("div");
  card.className = "pokemon-card";

  // Aplicar fundo com cor ou degradê
  if (cor === "rainbow") {
    card.style.background = "linear-gradient(135deg, red, orange, yellow, green, blue, indigo, violet)";
    card.style.color = "white";
  } else {
    card.style.backgroundColor = cor;
  }

  card.innerHTML = `
    <a href="pokemon.html?id=${data.id}">
      <img src="pokemon/${data.id}.png" alt="${data.name}" />
      <div class="info">
        <h3>#${String(data.id).padStart(3, "0")} ${data.name}</h3>
        <p>${tiposTraduzidos}</p>
      </div>
    </a>
  `;

  container.appendChild(card);
}

loadFavorites();
