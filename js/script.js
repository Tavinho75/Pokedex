const pokedex = document.getElementById("pokedex");
const searchInput = document.getElementById("search");
const typeFilter = document.getElementById("typeFilter");

let allPokemon = [];

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

function traduzirTipo(nomeTipo) {
  return tiposTraducao[nomeTipo] || nomeTipo.charAt(0).toUpperCase() + nomeTipo.slice(1);
}

async function getPokemon(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  return await res.json();
}

async function fetchPokemons(limit = 1025) {
  for (let i = 1; i <= limit; i++) {
    const data = await getPokemon(i);
    allPokemon.push(data);
    renderPokemon([data]);
    await new Promise(res => setTimeout(res, 10));
  }

  fillTypesDropdown();
}

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
  fairy: "#D685AD"
};

function renderPokemon(pokemonList) {
  pokemonList.forEach(data => {
    const types = data.types.map(t => t.type.name);
    const typesText = types.map(t => traduzirTipo(t)).join(", ");
    const mainType = types[0];
    const nomeFormatado = data.name.charAt(0).toUpperCase() + data.name.slice(1);

    const card = document.createElement("div");
    card.className = "pokemon-card";
    card.style.backgroundColor = typeColors[mainType] || "#777"; // fallback para tipos desconhecidos

    card.innerHTML = `
    <div>
      <a href="pokemon.html?id=${data.id}" class="pokemon">
        <img src="pokemon/${data.id}.png" alt="${nomeFormatado}" />
        <div class="info">
          <h3>#${String(data.id).padStart(3, "0")} ${nomeFormatado}</h3>
          <p>${typesText}</p>
        </div>
      </a>
    </div>
  `;






    pokedex.appendChild(card);
  });
}



fetchPokemons();