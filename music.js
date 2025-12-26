class MusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.playlist = [

            {
                "title": "Kuytu Köşelerde",
                "artist": "Şanışer & Emre Aydın",
                "url": "sample_music/Şanışer Live Sessions - Kuytu Köşelerde (w Emre Aydın).m4a"
            },
            {
                "title": "Düştüm",
                "artist": "Şanışer & Cem Adrian",
                "url": "sample_music/Şanışer Live Sessions - Düştüm (w Cem Adrian).m4a"
            },
            {
                "title": "Hayat Bu İşte",
                "artist": "maNga",
                "url": "sample_music/Hayat Bu İşte.m4a"
            },
            {
                "title": "Yansın",
                "artist": "Çağan Şengül & Emre Aydın",
                "url": "sample_music/Çağan Şengül & emre aydın - Yansın.m4a"
            },
            {
                "title": "Çok Yazık",
                "artist": "Çağan Şengül",
                "url": "sample_music/Çağan Şengül - Çok Yazık.m4a"
            },
            {
                "title": "Bir Derdim Var",
                "artist": "mor ve ötesi",
                "url": "sample_music/Bir Derdim Var.m4a"
            },

        ];
        this.currentTrack = 0;
        this.isPlaying = false;
        this.isShuffled = false;
        this.shuffledIndices = [];
        this.isDragging = false;

        // DOM Elements
        this.playlistElement = document.getElementById('playlistItems');
        this.searchInput = document.getElementById('searchInput');
        this.playBtn = document.querySelector('.play-btn');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.shuffleBtn = document.querySelector('.shuffle-btn');
        this.forwardBtn = document.querySelector('.forward-btn');
        this.rewindBtn = document.querySelector('.rewind-btn');
        this.progressBar = document.querySelector('.progress');
        this.progressContainer = document.querySelector('.progress-bar');
        this.volumeSlider = document.querySelector('.volume-slider');
        this.currentTimeElement = document.querySelector('.current-time');
        this.durationElement = document.querySelector('.duration');
        this.songTitleElement = document.querySelector('.song-title');
        this.artistNameElement = document.querySelector('.artist-name');

        // Initialize the player
        this.initializeEventListeners();
        this.updatePlaylistUI();
    }

    initializeEventListeners() {
        // Player controls
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.playPrevious());
        this.nextBtn.addEventListener('click', () => this.playNext());
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.forwardBtn.addEventListener('click', () => this.seekTime(10));
        this.rewindBtn.addEventListener('click', () => this.seekTime(-10));
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));

        // Progress bar events
        this.progressContainer.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.updateProgressFromEvent(e);
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.updateProgressFromEvent(e);
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        // Search functionality
        this.searchInput.addEventListener('input', () => this.filterPlaylist());

        // Audio events
        this.audio.addEventListener('timeupdate', () => {
            if (!this.isDragging) {
                this.updateProgress();
            }
        });
        this.audio.addEventListener('ended', () => this.playNext());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
    }

    updatePlaylistUI() {
        this.playlistElement.innerHTML = '';
        this.playlist.forEach((song, index) => {
            const li = document.createElement('li');
            li.className = index === this.currentTrack ? 'active' : '';
            li.innerHTML = `${song.title}`;
            li.addEventListener('click', () => {
                this.currentTrack = index;
                this.loadAndPlayCurrentTrack();
                this.updatePlaylistUI();
            });
            this.playlistElement.appendChild(li);
        });
    }

    loadAndPlayCurrentTrack() {
        if (this.playlist.length === 0) return;

        const currentSong = this.playlist[this.currentTrack];
        this.audio.src = currentSong.url;
        this.audio.play();
        this.isPlaying = true;
        this.updatePlayButton();
        this.updateSongInfo();
    }

    updateSongInfo() {
        const song = this.playlist[this.currentTrack];
        this.songTitleElement.textContent = song.title;
        this.artistNameElement.textContent = song.artist;
    }

    togglePlay() {
        if (this.playlist.length === 0) return;

        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play();
        }
        this.isPlaying = !this.isPlaying;
        this.updatePlayButton();
    }

    playPrevious() {
        if (this.isShuffled) {
            const currentShuffleIndex = this.shuffledIndices.indexOf(this.currentTrack);
            const prevIndex = (currentShuffleIndex - 1 + this.shuffledIndices.length) % this.shuffledIndices.length;
            this.playSong(this.shuffledIndices[prevIndex]);
        } else {
            const newIndex = this.currentTrack - 1;
            if (newIndex >= 0) {
                this.playSong(newIndex);
            }
        }
    }

    playNext() {
        if (this.isShuffled) {
            const currentShuffleIndex = this.shuffledIndices.indexOf(this.currentTrack);
            const nextIndex = (currentShuffleIndex + 1) % this.shuffledIndices.length;
            this.playSong(this.shuffledIndices[nextIndex]);
        } else {
            const newIndex = this.currentTrack + 1;
            if (newIndex < this.playlist.length) {
                this.playSong(newIndex);
            }
        }
    }

    playSong(index) {
        if (index >= 0 && index < this.playlist.length) {
            this.currentTrack = index;
            const song = this.playlist[this.currentTrack];
            this.audio.src = song.url;
            this.audio.play();
            this.isPlaying = true;
            this.updatePlayButton();
            this.updatePlaylistUI();
            this.updateSongInfo();
        }
    }

    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        this.shuffleBtn.classList.toggle('active');

        if (this.isShuffled) {
            // Create shuffled playlist excluding current song
            const remainingSongs = Array.from({ length: this.playlist.length }, (_, i) => i)
                .filter(i => i !== this.currentTrack);

            // Shuffle remaining songs
            for (let i = remainingSongs.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [remainingSongs[i], remainingSongs[j]] = [remainingSongs[j], remainingSongs[i]];
            }

            // Put current song at the beginning
            this.shuffledIndices = [this.currentTrack, ...remainingSongs];
        }

        this.saveState();
    }

    updatePlayButton() {
        const icon = this.playBtn.querySelector('i');
        icon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }

    updateProgress() {
        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        this.progressBar.style.width = `${progress}%`;
        this.currentTimeElement.textContent = this.formatTime(this.audio.currentTime);
    }

    updateDuration() {
        this.durationElement.textContent = this.formatTime(this.audio.duration);
    }

    setVolume(value) {
        this.audio.volume = value / 100;
    }

    seekTime(seconds) {
        if (this.audio.src) {
            const newTime = this.audio.currentTime + seconds;
            this.audio.currentTime = Math.max(0, Math.min(newTime, this.audio.duration));
        }
    }

    filterPlaylist() {
        const searchTerm = this.normalizeText(this.searchInput.value.toLowerCase());
        const playlistItems = this.playlistElement.getElementsByTagName('li');

        Array.from(playlistItems).forEach(item => {
            const songName = this.normalizeText(item.textContent.toLowerCase());
            const matches = songName.includes(searchTerm);
            item.style.display = matches ? '' : 'none';
        });
    }

    normalizeText(text) {
        return text.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[ıİ]/g, 'i')
            .replace(/[şŞ]/g, 's')
            .replace(/[ğĞ]/g, 'g')
            .replace(/[üÜ]/g, 'u')
            .replace(/[öÖ]/g, 'o')
            .replace(/[çÇ]/g, 'c');
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    updateProgressFromEvent(e) {
        const rect = this.progressContainer.getBoundingClientRect();
        const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
        this.progressBar.style.width = `${percent * 100}%`;
        if (this.audio.duration) {
            this.audio.currentTime = percent * this.audio.duration;
        }
    }

    saveState() {
        const state = {
            playlist: this.playlist,
            currentTrack: this.currentTrack,
            isShuffled: this.isShuffled,
            shuffledIndices: this.shuffledIndices
        };
        localStorage.setItem('musicPlayerState', JSON.stringify(state));
    }

    loadSavedState() {
        const savedState = localStorage.getItem('musicPlayerState');
        if (savedState) {
            const state = JSON.parse(savedState);
            this.playlist = state.playlist || [];
            this.currentTrack = state.currentTrack || 0;
            this.isShuffled = state.isShuffled || false;
            this.shuffledIndices = state.shuffledIndices || [];

            // Restore playlist UI
            this.playlist.forEach((song, index) => {
                this.addSongToPlaylistUI(song, index);
            });

            // Restore shuffle state
            if (this.isShuffled) {
                this.shuffleBtn.classList.add('active');
            }

            // Restore current song
            if (this.playlist.length > 0) {
                const currentSong = this.playlist[this.currentTrack];
                if (currentSong) {
                    this.audio.src = currentSong.url;
                    this.updateSongInfo();
                }
            }
        }
    }

    addSongToPlaylistUI(song, index) {
        const li = document.createElement('li');
        li.innerHTML = `${song.title}`;
        li.addEventListener('click', () => {
            this.currentTrack = index;
            this.loadAndPlayCurrentTrack();
        });
        this.playlistElement.appendChild(li);
    }

    clearPlaylist() {
        this.playlist = [];
        this.playlistElement.innerHTML = '';
        this.audio.pause();
        this.isPlaying = false;
        this.currentTrack = 0;
        this.isShuffled = false;
        this.shuffledIndices = [];
        this.shuffleBtn.classList.remove('active');
        this.updatePlayButton();
        this.songTitleElement.textContent = 'No song playing';
        this.artistNameElement.textContent = '-';
        localStorage.removeItem('musicPlayerState');
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files).filter(file => file.type.startsWith('audio/'));
        let currentContent = '';

        // Read current script.js content
        fetch('script.js')
            .then(response => response.text())
            .then(content => {
                currentContent = content;

                // Generate new song entries
                const newSongs = files.map(file => {
                    const title = file.name.replace(/\.[^/.]+$/, "");
                    return `    {
        title: "${title}",
        artist: "Unknown Artist",
        url: "${file.name}"
    }`;
                }).join(',\n');

                // Find the playlist array in constructor
                const playlistMatch = currentContent.match(/this\.playlist\s*=\s*\[([\s\S]*?)\];/);
                if (playlistMatch) {
                    const existingPlaylist = playlistMatch[1].trim();
                    const newPlaylist = existingPlaylist ? `${existingPlaylist},\n${newSongs}` : newSongs;
                    const newContent = currentContent.replace(/this\.playlist\s*=\s*\[([\s\S]*?)\];/, `this.playlist = [\n${newPlaylist}\n];`);

                    // Save the modified content back to script.js
                    const blob = new Blob([newContent], { type: 'text/javascript' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = 'script.js';
                    a.click();
                }
            });

        // Reset file input
        this.fileInput.value = '';

        // Reload the page after a short delay to apply changes
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
}

// Initialize the music player
const player = new MusicPlayer();
