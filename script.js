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
    renderPokemon([data]); // Renderiza um por vez
    await new Promise(res => setTimeout(res, 10)); // 200ms entre cada
  }

  fillTypesDropdown();
}

function renderPokemon(pokemonList) {
  pokemonList.forEach(data => {
    const types = data.types.map(t => t.type.name).join(", ");
    const card = document.createElement("div");
    card.className = "pokemon-card";
    card.innerHTML = `
      <a href="pokemon.html?id=${data.id}">
        <img src="pokemon/${data.id}.png" alt="${data.name}" />
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

async function fillTypesDropdown() {
  try {
    const res = await fetch("https://pokeapi.co/api/v2/type");
    const data = await res.json();

    const validTypes = data.results.filter(type =>
      !["unknown", "shadow"].includes(type.name)
    );

    const dropdown = document.getElementById("typeDropdown");

    // Botão para "Todos"
    const allButton = document.createElement("button");
    allButton.textContent = "Todos";
    allButton.className = "type-button";
    allButton.onclick = () => {
      typeFilter.value = "";
      filterPokemon();
    };
    dropdown.appendChild(allButton);

    validTypes.forEach(type => {
      const button = document.createElement("button");
      button.className = "type-button";
      button.onclick = () => {
        typeFilter.value = type.name;
        filterPokemon();
      };

      const icon = document.createElement("img");
      icon.src = `types/generation-ix/scarlet-violet/Tera/${type.name}.png`;
      icon.alt = type.name;

      const label = document.createElement("span");
      label.textContent = type.name[0].toUpperCase() + type.name.slice(1);

      button.appendChild(icon);
      button.appendChild(label);
      dropdown.appendChild(button);
    });
  } catch (e) {
    console.error("Erro ao carregar os tipos:", e);
  }
}

fetchPokemons();
