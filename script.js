let allPokemon = [];
let displayedPokemon = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchAllPokemon();
    fetchTypes();
});

async function fetchAllPokemon() {
    showLoading();
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
        const data = await response.json();
        const results = data.results;
        
        const pokemonDetails = await Promise.all(
            results.map(p => fetch(p.url).then(res => res.json()))
        );
        
        allPokemon = pokemonDetails.map(p => ({
            name: p.name,
            image: p.sprites.other['official-artwork'].front_default || p.sprites.front_default,
            types: p.types.map(t => t.type.name),
            abilities: p.abilities.map(a => a.ability.name),
            stats: p.stats.map(s => ({ name: s.stat.name, value: s.base_stat }))
        }));
        
        renderPokemon(allPokemon);
    } catch (error) {
        alert('Failed to fetch Pokémon data. Please try again later.');
    } finally {
        hideLoading();
    }
}

async function fetchTypes() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/type/');
        const data = await response.json();
        const types = data.results.filter(t => !['shadow', 'unknown'].includes(t.name));
        renderTypeButtons(types);
    } catch (error) {
        console.error('Error fetching types:', error);
    }
}

function renderTypeButtons(types) {
    const container = document.getElementById('type-buttons');
    container.innerHTML = types.map(type => `
        <button class="type-btn" data-type="${type.name}" style="background-color: ${getTypeColor(type.name)}">
            ${type.name}
        </button>
    `).join('');
    
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const filtered = allPokemon.filter(p => p.types.includes(type));
            renderPokemon(filtered);
        });
    });
}

function renderPokemon(pokemonList) {
    displayedPokemon = pokemonList;
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const filtered = pokemonList.filter(p => p.name.includes(searchQuery));
    
    const container = document.getElementById('pokemon-container');
    container.innerHTML = filtered.map(p => `
        <div class="pokemon-card" style="background-color: ${getTypeColor(p.types[0])}20">
            <img src="${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            <div class="types">
                ${p.types.map(t => `
                    <span class="type-badge" style="background-color: ${getTypeColor(t)}">
                        ${t}
                    </span>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    if (filtered.length === 0) {
        container.innerHTML = '<p class="no-results">No Pokémon found! Try a different search.</p>';
    }
    
    // Add click event for lightbox
    document.querySelectorAll('.pokemon-card').forEach(card => {
        card.addEventListener('click', () => {
            const pokemonName = card.querySelector('h3').textContent;
            const pokemon = allPokemon.find(p => p.name === pokemonName);
            openLightbox(pokemon);
        });
    });
}

function openLightbox(pokemon) {
    const lightbox = document.getElementById('lightbox');
    const lightboxDetails = document.getElementById('lightbox-details');
    
    lightboxDetails.innerHTML = `
        <img src="${pokemon.image}" alt="${pokemon.name}">
        <h2>${pokemon.name}</h2>
        <div class="types">
            ${pokemon.types.map(t => `
                <span class="type-badge" style="background-color: ${getTypeColor(t)}">
                    ${t}
                </span>
            `).join('')}
        </div>
        <div class="abilities">
            <h3>Abilities</h3>
            <p>${pokemon.abilities.join(', ')}</p>
        </div>
        <div class="stats">
        
            <h3>Stats</h3>
            ${pokemon.stats.map(s => `
                <div>${s.name}: ${s.value}</div>
            `).join('')}
        </div>
    `;
    
    lightbox.style.display = 'flex';
}

document.getElementById('search-input').addEventListener('input', (e) => {
    renderPokemon(displayedPokemon);
});

document.getElementById('reset-btn').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    renderPokemon(allPokemon);
});

document.querySelector('.close-btn').addEventListener('click', () => {
    document.getElementById('lightbox').style.display = 'none';
});
document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target === document.getElementById('lightbox')) {
        document.getElementById('lightbox').style.display = 'none';
    }
});
function getTypeColor(type) {
    const colors = {
        fire: '#FF4422',
        water: '#3399FF',
        grass: '#77CC55',
        electric: '#FFCC33',
        psychic: '#FF5599',
        ice: '#66CCFF',
        dragon: '#7766EE',
        dark: '#775544',
        fairy: '#EE99EE',
        normal: '#AAAA99',
        fighting: '#BB5544',
        flying: '#8899FF',
        poison: '#AA5599',
        ground: '#DDBB55',
        rock: '#BBAA66',
        bug: '#AABB22',
        ghost: '#6666BB',
        steel: '#AAAABB'
    };
    return colors[type] || '#68A090';
}

function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}