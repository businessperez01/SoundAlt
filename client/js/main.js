// DOM Elements
const soundsGrid = document.getElementById('soundsGrid');
const searchInput = document.getElementById('searchInput');
const tagsFilter = document.getElementById('tagsFilter');

// State
let sounds = [];
let filteredSounds = [];
let selectedTags = new Set();

// Fetch sounds from the API
async function fetchSounds() {
    try {
        const response = await fetch('/api/sounds');
        const data = await response.json();
        sounds = data;
        filteredSounds = [...sounds];
        renderSounds();
        updateTagsFilter();
    } catch (error) {
        console.error('Error fetching sounds:', error);
    }
}

// Render sounds to the grid
function renderSounds() {
    soundsGrid.innerHTML = '';
    filteredSounds.forEach(sound => {
        const soundCard = document.createElement('div');
        soundCard.className = 'sound-card';
        soundCard.id = `card-${sound._id}`;
        soundCard.innerHTML = `
            <h3>${sound.title}</h3>
            <div class="player-container">
                <button class="button play-button" onclick="togglePlay('${sound._id}', '${sound.fileUrl}')">
                    <i class="fas fa-play" id="play-icon-${sound._id}"></i>
                    <span id="play-text-${sound._id}">Play</span>
                </button>
                <div class="progress-container">
                    <div class="progress-bar" id="progress-${sound._id}">
                        <div class="progress-fill"></div>
                    </div>
                    <div class="time-display">
                        <span id="current-time-${sound._id}">0:00</span>
                        <span id="duration-${sound._id}">0:00</span>
                    </div>
                </div>
            </div>
            <div class="tags">
                ${sound.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        `;
        soundsGrid.appendChild(soundCard);
    });
}

// Audio player management
let currentAudio = null;
let currentSoundId = null;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateProgress(soundId, audio) {
    const progressBar = document.getElementById(`progress-${soundId}`);
    const currentTime = document.getElementById(`current-time-${soundId}`);
    const duration = document.getElementById(`duration-${soundId}`);
    const card = document.getElementById(`card-${soundId}`);
    
    // Update progress bar
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.style.setProperty('--progress', `${progress}%`);
    progressBar.querySelector('.progress-fill').style.width = `${progress}%`;
    
    // Update time display
    currentTime.textContent = formatTime(audio.currentTime);
    duration.textContent = formatTime(audio.duration);
}

function togglePlay(soundId, url) {
    const playIcon = document.getElementById(`play-icon-${soundId}`);
    const playText = document.getElementById(`play-text-${soundId}`);
    const card = document.getElementById(`card-${soundId}`);

    // If there's already a sound playing
    if (currentAudio) {
        currentAudio.pause();
        // Reset previous sound's UI
        const prevIcon = document.getElementById(`play-icon-${currentSoundId}`);
        const prevText = document.getElementById(`play-text-${currentSoundId}`);
        const prevCard = document.getElementById(`card-${currentSoundId}`);
        prevIcon.className = 'fas fa-play';
        prevText.textContent = 'Play';
        prevCard.classList.remove('playing');
        
        // If clicking the same sound, just stop it
        if (currentSoundId === soundId) {
            currentAudio = null;
            currentSoundId = null;
            return;
        }
    }

    // Play new sound
    const audio = new Audio(url);
    audio.addEventListener('timeupdate', () => updateProgress(soundId, audio));
    audio.addEventListener('ended', () => {
        playIcon.className = 'fas fa-play';
        playText.textContent = 'Play';
        card.classList.remove('playing');
        currentAudio = null;
        currentSoundId = null;
        // Reset progress bar and time display
        const progressBar = document.getElementById(`progress-${soundId}`);
        progressBar.style.setProperty('--progress', '0%');
        progressBar.querySelector('.progress-fill').style.width = '0%';
        document.getElementById(`current-time-${soundId}`).textContent = '0:00';
    });
    
    audio.play();
    currentAudio = audio;
    currentSoundId = soundId;
    
    // Update UI
    playIcon.className = 'fas fa-pause';
    playText.textContent = 'Pause';
    card.classList.add('playing');

    // Initialize duration once it's loaded
    audio.addEventListener('loadedmetadata', () => {
        document.getElementById(`duration-${soundId}`).textContent = formatTime(audio.duration);
    });
}

// Filter sounds based on search and tags
function filterSounds() {
    const searchTerm = searchInput.value.toLowerCase();
    filteredSounds = sounds.filter(sound => {
        const matchesSearch = sound.title.toLowerCase().includes(searchTerm);
        const matchesTags = selectedTags.size === 0 || 
            sound.tags.some(tag => selectedTags.has(tag));
        return matchesSearch && matchesTags;
    });
    renderSounds();
}

// Update tags filter
function updateTagsFilter() {
    const allTags = new Set();
    sounds.forEach(sound => {
        sound.tags.forEach(tag => allTags.add(tag));
    });

    tagsFilter.innerHTML = Array.from(allTags).map(tag => `
        <span class="tag ${selectedTags.size === 0 ? '' : (selectedTags.has(tag) ? 'active' : 'inactive')}"
              onclick="toggleTag('${tag}')">
            ${tag}
        </span>
    `).join('');
}

// Toggle tag selection
function toggleTag(tag) {
    // If clicking the active tag, clear all selections
    if (selectedTags.has(tag)) {
        selectedTags.clear();
    } else {
        // Clear previous selections and select only this tag
        selectedTags.clear();
        selectedTags.add(tag);
    }
    
    // Update UI and filter sounds
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tagElement => {
        if (selectedTags.size === 0) {
            tagElement.classList.remove('active', 'inactive');
        } else {
            const tagText = tagElement.textContent.trim();
            if (selectedTags.has(tagText)) {
                tagElement.classList.add('active');
                tagElement.classList.remove('inactive');
            } else {
                tagElement.classList.add('inactive');
                tagElement.classList.remove('active');
            }
        }
    });
    
    filterSounds();
}

// Event listeners
searchInput.addEventListener('input', filterSounds);

// Add click handler for progress bar
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('progress-bar') && currentAudio && currentSoundId) {
        const progressBar = e.target;
        const rect = progressBar.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const percentage = x / width;
        
        currentAudio.currentTime = currentAudio.duration * percentage;
        updateProgress(currentSoundId, currentAudio);
    }
});

// Initial load
fetchSounds();
