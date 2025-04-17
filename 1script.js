const url = 'https://pokeapi.co/api/v2/pokemon/800/';

// Use o fetch para fazer o pedido

fetch(url)

 .then(response => response.json()) // Converte a resposta em JSON

 .then(data => {

  // Agora 'data' contém as informações do Pokémon
  console.log('ID do Pokémon:', data.id);

  console.log('Nome do Pokémon:', data.name);

  console.log('Altura do Pokémon:', data.height);
 })

 .catch(error => {

  console.error('Ocorreu um erro:', error);

 });