const pokedex = document.getElementById("pokedex");
const searchInput = document.getElementById("search");
const typeFilter = document.getElementById("typeFilter");

let allPokemon = [];

async function getPokemon(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  return await res.json();
}

async function fetchPokemons(limit = 1025) {
  for (let i = 1; i <= limit; i++) {
    const data = await getPokemon(i);
    allPokemon.push(data);
  }

  renderPokemon(allPokemon);
  fillTypesDropdown();
}

function renderPokemon(pokemonList) {
  pokedex.innerHTML = "";
  pokemonList.forEach(data => {
    const types = data.types.map(t => t.type.name).join(", ");
    const card = document.createElement("div");
    card.className = "pokemon-card";
    card.innerHTML = `
      <a href="pokemon.html?id=${data.id}">
        <img src="${data.sprites.front_default}" alt="${data.name}" />
        <div class="info">
          <h3>#${data.id} ${data.name}</h3>
          <p>${types}</p>
        </div>
      </a>
    `;
    pokedex.appendChild(card);
  });
}

function filterPokemon() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedType = typeFilter.value;

  const filtered = allPokemon.filter(p => {
    const matchesSearch = p.name.includes(searchTerm) || p.id.toString() === searchTerm;
    const matchesType = selectedType === "" || p.types.some(t => t.type.name === selectedType);
    return matchesSearch && matchesType;
  });

  renderPokemon(filtered);
}

searchInput.addEventListener("input", filterPokemon);
typeFilter.addEventListener("change", filterPokemon);

async function fillTypesDropdown() {
    fetch("https://pokeapi.co/api/v2/type")
      .then(res => res.json())
      .then(data => {
        data.results.forEach(type => {
          if (["stellar", "unknown"].includes(type.name)) return; // Ignora tipos inválidos
          const option = document.createElement("option");
          option.value = type.name;
          option.textContent = type.name[0].toUpperCase() + type.name.slice(1);
          typeFilter.appendChild(option);
        });
      });
  }
  

fetchPokemons();
