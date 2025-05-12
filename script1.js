const pokedex = document.getElementById("pokedex");
const searchInput = document.getElementById("search");
const typeFilter = document.getElementById("typeFilter");

let allPokemon = [];
let offset = 0;
const limit = 50;
const maxParallel = 10; // quantas requisições simultâneas

async function fetchPokemons() {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
    const data = await res.json();
    const urls = data.results.map(p => p.url);

    await fetchInParallel(urls, maxParallel);

    offset += limit;

    if (data.next) {
      setTimeout(fetchPokemons, 300); // controle de velocidade
    } else {
      fillTypesDropdown();
    }

  } catch (error) {
    console.error("Erro ao carregar Pokémon:", error);
  }
}

async function fetchInParallel(urls, maxAtOnce) {
  let i = 0;
  while (i < urls.length) {
    const chunk = urls.slice(i, i + maxAtOnce);
    await Promise.all(chunk.map(async (url) => {
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.sprites.front_default) {
          allPokemon.push(data);
          renderPokemon([data]);
        }
      } catch (e) {
        console.warn("Erro ao buscar:", url);
      }
    }));
    i += maxAtOnce;
  }
}

function renderPokemon(pokemonList) {
  pokemonList.forEach(data => {
    const types = data.types.map(t => t.type.name).join(", ");
    const card = document.createElement("div");
    card.className = "pokemon-card";
    card.innerHTML = `
      <a href="pokemon.html?id=${data.id}">
        <img src="pokemon/${data.id}.png" alt="${data.name}" onerror="this.src='fallback.png'" />
q
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

  pokedex.innerHTML = "";
  renderPokemon(filtered);
}

searchInput.addEventListener("input", filterPokemon);
typeFilter.addEventListener("change", filterPokemon);

function fillTypesDropdown() {
  fetch("https://pokeapi.co/api/v2/type")
    .then(res => res.json())
    .then(data => {
      data.results.forEach(type => {
        if (["stellar", "unknown"].includes(type.name)) return;
        const option = document.createElement("option");
        option.value = type.name;
        option.textContent = type.name[0].toUpperCase() + type.name.slice(1);
        typeFilter.appendChild(option);
      });
    });
}

fetchPokemons();
