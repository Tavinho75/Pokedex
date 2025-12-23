const pokedex = document.getElementById("pokedex");
const searchInput = document.getElementById("search");
const typeFilter = document.getElementById("typeFilter");

let allPokemon = [];
let pokemonNameIndex = null; // cache da lista /pokemon?limit=... (apenas names + urls)
let namesLoaded = false;
const DEFAULT_CONCURRENCY = 12;

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

// Fetch lista com todos os nomes (usada para buscas por substring)
async function fetchAllPokemonNames() {
  if (namesLoaded && pokemonNameIndex) return pokemonNameIndex;
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20000');
  const json = await res.json();
  pokemonNameIndex = json.results || [];
  namesLoaded = true;
  return pokemonNameIndex;
}

async function fetchPokemons(limit = 10, fetchExtras = true) {
  for (let i = 1; i <= limit; i++) {
    const data = await getPokemon(i);
    allPokemon.push(data);
    // Só renderizamos automaticamente enquanto nenhum filtro/ pesquisa estiver ativo
    if (!activeFilter) renderPokemon([data]);
    await new Promise(res => setTimeout(res, 5));
  }

  fillTypesDropdown();
  fetchComplete = true;

  // Se não quisermos buscar forms/extras, interrompe aqui (carrega apenas os IDs iniciais)
  if (!fetchExtras) return;

  // Após carregar os IDs, trazemos também forms (megás/outros) para exibir versões
  // extras que não aparecem por ID (ex: charizard-mega-x). Aqui usamos o index
  // de nomes e buscamos por padrões comuns de formas. Limitamos a um número
  // razoável (500) para não sobrecarregar a API/local.
  try {
    const index = await fetchAllPokemonNames();
    const existingNames = new Set(allPokemon.map(p => p.name));
    const formCandidates = index
      .map(i => i.name)
      .filter(n => !existingNames.has(n))
      .filter(n => /-|mega|gmax|gigantamax|alola|galar|hisui|paldea|primal|origin|attack|defense|therian|incarnate/i.test(n));

    if (formCandidates.length) {
      const toFetch = formCandidates.slice(0, 500);
      for (let i = 0; i < toFetch.length; i += DEFAULT_CONCURRENCY) {
        const batch = toFetch.slice(i, i + DEFAULT_CONCURRENCY);
        const results = await Promise.all(batch.map(name => getPokemon(name).catch(() => null)));
        results.filter(Boolean).forEach(r => {
          allPokemon.push(r);
          if (!activeFilter) renderPokemon([r]);
        });
        await new Promise(res => setTimeout(res, 40));
      }
      fillTypesDropdown();
    }
  } catch (err) {
    console.warn('Erro ao carregar forms extras:', err);
  }
}

// Faz busca direta na API por query (nome/ID/substring)
async function searchDirectAPI(query, type = '') {
  // limpa e mostra loading
  clearPokedex();
  showLoading('Buscando...');

  // se o filtro por tipo também foi selecionado, usamos endpoint de type para reduzir resultados
  if (type) {
    // usa endpoint /type/<type>
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
      if (!res.ok) throw new Error('Tipo não encontrado na API');
      const json = await res.json();
      // json.pokemon é array { pokemon: { name, url }, slot }
      let candidates = json.pokemon.map(p => p.pokemon.name);
      // se houver query, filtra por substring
      if (query) {
        const q = query.toLowerCase();
        candidates = candidates.filter(n => n.includes(q));
      }
      // busca todos os candidatos correspondentes, mas em batches para evitar sobrecarga
      const total = candidates.length;
      const results = [];
      for (let i = 0; i < total; i += DEFAULT_CONCURRENCY) {
        const batch = candidates.slice(i, i + DEFAULT_CONCURRENCY);
        const resp = await Promise.all(batch.map(name => getPokemon(name).catch(() => null)));
        resp.filter(Boolean).forEach(r => results.push(r));
        showLoading(`Buscando: ${Math.min(results.length, total)}/${total}`);
        await new Promise(res => setTimeout(res, 30));
      }
      hideLoading();
      renderAll(results.filter(Boolean));
      return;
    } catch (err) {
      hideLoading();
      console.warn('Erro ao buscar por tipo:', err);
      return;
    }
  }

  // sem tipo: se a query é número exato ou nome exato, tenta buscar diretamente
  const trimmed = query.trim();
  const isNumber = /^[0-9]+$/.test(trimmed);
  if (isNumber || /^[a-zA-Z0-9\-]+$/.test(trimmed)) {
    // se for número, tenta por ID; se for nome, tenta nome direto
    try {
      const single = await getPokemon(trimmed);
      hideLoading();
      renderAll([single]);
      return;
    } catch (err) {
      // cai para busca por substring
    }
  }

  // busca por substring: usa index de nomes da API
  try {
    const index = await fetchAllPokemonNames();
    const q = query.toLowerCase();
    let matches = index.map(i => i.name).filter(n => n.includes(q));

    // busca todos os matches em batches para não explodir a API
    const total = matches.length;
    const results = [];
    for (let i = 0; i < total; i += DEFAULT_CONCURRENCY) {
      const batch = matches.slice(i, i + DEFAULT_CONCURRENCY);
      const resp = await Promise.all(batch.map(name => getPokemon(name).catch(() => null)));
      resp.filter(Boolean).forEach(r => results.push(r));
      showLoading(`Buscando: ${Math.min(results.length, total)}/${total}`);
      await new Promise(res => setTimeout(res, 20));
    }
    hideLoading();
    renderAll(results.filter(Boolean));
  } catch (err) {
    hideLoading();
    console.warn('Erro na busca direta por substring:', err);
  }
}

// Busca pokemons por tipo diretamente da API (sem depender de allPokemon local)
async function fetchPokemonsByType(type) {
  clearPokedex();
  showLoading('Carregando por tipo...');
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
    if (!res.ok) throw new Error('Erro ao carregar tipo');
    const json = await res.json();
    const names = json.pokemon.map(p => p.pokemon.name);
    // busca todos os nomes retornados, em batches
    const total = names.length;
    const results = [];
    for (let i = 0; i < total; i += DEFAULT_CONCURRENCY) {
      const batch = names.slice(i, i + DEFAULT_CONCURRENCY);
      const resp = await Promise.all(batch.map(name => getPokemon(name).catch(() => null)));
      resp.filter(Boolean).forEach(r => results.push(r));
      showLoading(`Carregando por tipo: ${Math.min(results.length, total)}/${total}`);
      await new Promise(res => setTimeout(res, 30));
    }
    hideLoading();
    renderAll(results.filter(Boolean));
  } catch (err) {
    hideLoading();
    console.warn('Erro ao buscar por tipo:', err);
  }
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

    const imgSrc = (data.sprites && (data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default)) || `pokemon/${data.id}.png`;

    card.innerHTML = `
    <div class="card-content">
      <a href="pokemon.html?id=${data.id}" class="pokemon">
        <img src="${imgSrc}" alt="${nomeFormatado}" class="pokemon-image" />
        <div class="info">
          <h3>${nomeFormatado}</h3>
          <p>${typesText}</p>
        </div>
      </a>
    </div>
  `;






    pokedex.appendChild(card);
  });
}

// -------------------------
// Pesquisa e filtro
// -------------------------
let activeFilter = null; // {search, type}
let fetchComplete = false;

function clearPokedex() {
  pokedex.innerHTML = "";
}

function renderAll(pokemonList) {
  clearPokedex();
  renderPokemon(pokemonList);
}

function filterAndRender() {

  const search = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const type = typeFilter ? typeFilter.value : "";

  // Atualiza estado do filtro ativo
  activeFilter = (search || type) ? { search, type } : null;

  // Se houver qualquer critério ativo, priorizamos consultas diretas à API
  if (search || type) {
    // se houver pesquisa (name/ID/substring) — consulta direta na API
    if (search) {
      searchDirectAPI(search, type);
      return;
    }

    // se apenas tipo
    if (type) {
      fetchPokemonsByType(type);
      return;
    }
  }

  if (!allPokemon.length) return;

  const filtered = allPokemon.filter(p => {
    let matchesSearch = true;
    if (search) {
      const name = p.name.toLowerCase();
      const idStr = String(p.id);
      const paddedId = String(p.id).padStart(3, "0");
      matchesSearch = name.includes(search) || idStr === search || paddedId.includes(search);
    }

    let matchesType = true;
    if (type) {
      matchesType = p.types.some(t => t.type.name === type);
    }

    return matchesSearch && matchesType;
  });

  renderAll(filtered);
}

// Debounce helper to avoid excessive filtering while typing
function debounce(fn, delay = 200) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

// Popula dropdown de tipos com os tipos únicos que aparecerem em allPokemon
function fillTypesDropdown() {
  if (!typeFilter) return;

  const tipos = new Set();
  allPokemon.forEach(p => p.types.forEach(t => tipos.add(t.type.name)));

  // Limpa e adiciona opção padrão
  typeFilter.innerHTML = "";
  const optAll = document.createElement("option");
  optAll.value = "";
  optAll.textContent = "Todos os tipos";
  typeFilter.appendChild(optAll);

  Array.from(tipos).sort().forEach(tipo => {
    const option = document.createElement("option");
    option.value = tipo;
    // mostra a tradução quando possível
    option.textContent = traduzirTipo(tipo);
    typeFilter.appendChild(option);
  });
}

// Escuta de eventos (com proteção caso elementos não existam em outras páginas)
if (searchInput) {
  searchInput.addEventListener("input", debounce(() => filterAndRender(), 180));
}

if (typeFilter) {
  typeFilter.addEventListener("change", () => filterAndRender());
}

// Simples indicador de carregamento (cria se não existir)
function showLoading(text = 'Carregando...') {
  let el = document.getElementById('loadingIndicator');
  if (!el) {
    el = document.createElement('div');
    el.id = 'loadingIndicator';
    el.style.padding = '8px';
    el.style.margin = '6px';
    el.style.background = 'rgba(255,255,255,0.9)';
    el.style.borderRadius = '6px';
    el.style.fontWeight = '600';
    el.style.boxShadow = '0 1px 2px rgba(0,0,0,0.2)';
    const controls = document.querySelector('.controls') || document.body;
    controls.appendChild(el);
  }
  el.textContent = text;
}

function hideLoading() {
  const el = document.getElementById('loadingIndicator');
  if (el) el.remove();
}



fetchPokemons(10, false);