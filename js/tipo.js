const pokedex = document.getElementById("pokedex");
const titulo = document.getElementById("titulo");

// Tipos traduzidos
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
  stellar: "estelar",
  fairy: "fada"
};

// Cores por tipo
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

// Lê o tipo da URL
const urlParams = new URLSearchParams(window.location.search);
const tipo = urlParams.get("tipo");

if (!tipo) {
  titulo.textContent = "Tipo não especificado.";
} else {
  titulo.textContent = `Pokémons do tipo ${tipoTraduzido[tipo] || tipo}`;
  buscarPorTipo(tipo);
}

async function buscarPorTipo(tipo) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/type/${tipo}`);
    const data = await res.json();
    const lista = data.pokemon;

    for (let item of lista) {
      const pokeData = await fetch(item.pokemon.url).then(r => r.json());
      renderPokemon(pokeData);
      await new Promise(r => setTimeout(r, 10));
    }
  } catch (e) {
    titulo.textContent = "Erro ao carregar os pokémons.";
    console.error(e);
  }
}

function renderPokemon(data) {
  const tipos = data.types.map(t => t.type.name);
  const tipoPrincipal = tipos[0];
  const corFundo = typeColors[tipoPrincipal] || "#777";
  const tiposTraduzidos = tipos.map(t => tipoTraduzido[t] || t).join(", ");

  const card = document.createElement("div");
  card.className = "pokemon-card";
  if (corFundo === "rainbow") {
    card.style.background = "linear-gradient(135deg, red, orange, yellow, green, blue, indigo, violet)";
    card.style.color = "white";
  } else {
    card.style.backgroundColor = corFundo;
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

  pokedex.appendChild(card);
}
