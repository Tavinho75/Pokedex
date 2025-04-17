function getFavorites() {
    return JSON.parse(localStorage.getItem("favorites")) || [];
  }
  
  async function getPokemon(id) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    return await res.json();
  }
  
  async function loadFavorites() {
    const container = document.getElementById("favoritesList");
    const favorites = getFavorites();
  
    for (const id of favorites) {
      const data = await getPokemon(id);
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
      container.appendChild(card);
    }
  
    if (favorites.length === 0) {
      container.innerHTML = "<p>Nenhum favorito ainda.</p>";
    }
  }
  
  loadFavorites();
  