/* ==================== */
/* GLOBAL VARIABLES     */
/* ==================== */
const DJANGO_STATIC_URL = '{{ STATIC_URL }}';

/* ==================== */
/* DOM ELEMENTS         */
/* ==================== */
const modal_createPlaylist = document.getElementById('modal_createPlaylist'),
      modal_createPlaylist_open = document.getElementById('modal_createPlaylist_open'),
      modal_add_song = document.getElementById('modal_add_song'),
      Close_CreatePlaylist = document.getElementById('Close_CreatePlaylist'),
      Close_AddSong = document.getElementById('Close_AddSong'),
      btn_add_songs = document.getElementById('btn_add_songs'),
      burger_checkbox = document.getElementById('burger-checkbox'),
      header = document.querySelector('.header'),
      burger_menu = document.getElementById('burger_menu');

/* ==================== */
/* MODAL FUNCTIONS      */
/* ==================== */
try {
    burger_checkbox.addEventListener('click', () => {
        header.classList.toggle('hidden');
        burger_menu.classList.toggle('posfix');
    });
} catch (error) {
}

try {
    btn_add_songs.addEventListener('click', () => {
        modal_add_song.style.display = 'block';
    });
} catch (error) {
}

try {
    Close_CreatePlaylist.addEventListener('click', () => {
        modal_add_song.style.display = 'none';
    });
} catch (error) {
}

try {
    Close_AddSong.addEventListener('click', () => {
        modal_add_song.style.display = 'none';
    });
} catch (error) {
}

/* ==================== */
/* WINDOW EVENT HANDLERS */
/* ==================== */
try {
    window.onclick = function(event) {
        if (event.target === modal_add_song) {
            modal_add_song.style.display = "none";
        } else if (event.target === modal_createPlaylist) {
            modal_createPlaylist.style.display = 'none';
        }
    }
} catch (error) {
}

window.onkeydown = function(event) {
    if (event.key === "Escape") {
        try {
            modal_add_song.style.display = 'none';
        } catch {
            modal_createPlaylist.style.display = 'none';
        }
    }
}

/* ==================== */
/* SEARCH FUNCTIONALITY */
/* ==================== */
try {
    document.getElementById('searchInput').addEventListener('input', function() {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            document.getElementById('searchForm').submit();
        }, 900);
    });
} catch (error) {
}

/* ==================== */
/* MUSIC PLAYER         */
/* ==================== */
document.addEventListener("DOMContentLoaded", function() {
    // Player elements
    const audioPlayer = document.getElementById('audioPlayer'),
          playPauseBtn = document.getElementById('playPauseBtn'),
          progressBar = document.getElementById('progressBar'),
          currentTimeLabel = document.getElementById('currentTime'),
          totalDurationLabel = document.getElementById('totalDuration'),
          volumeControl = document.getElementById('volumeControl'),
          trackNameElement = document.querySelector('.footer_title div:first-child div:first-child'),
          trackArtistElement = document.querySelector('.footer_title div:first-child div:nth-child(2)'),
          trackCards = document.querySelectorAll('.card_author'),
          footer_player = document.getElementById('footer_player'),
          card_author_close = document.querySelectorAll('.card_author_close'),
          play_btn = document.getElementById('play_btn'),
          trackItem = document.querySelectorAll('.track-item'),
          nextTrackBtn = document.querySelector("img[alt='nextTrack']"),
          backTrackBtn = document.querySelector("img[alt='backTrack']"),
          repeatTrackBtn = document.querySelector("img[alt='repeatTrack']"),
          backButton = document.querySelector('.back-button'),
          forwardButton = document.querySelector('.forward-button');

    // Player state
    let tracks = [];
    let currentTrackIndex = 0;
    let repeatMode = 0; // 0 - no repeat, 1 - single, 2 - playlist
    let timeout = null;

    /* ==================== */
    /* HISTORY NAVIGATION   */
    /* ==================== */
    if (backButton) {
        backButton.addEventListener('click', goBack);
    }
    
    if (forwardButton) {
        forwardButton.addEventListener('click', goForward);
    }
    
    window.addEventListener('popstate', updateButtons);
    
    function goBack() {
        window.history.back();
    }
    
    function goForward() {
        window.history.forward();
    }
    
    function updateButtons() {
        if (forwardButton) {
            forwardButton.style.opacity = window.history.length > 1 ? '1' : '0.5';
            forwardButton.style.cursor = window.history.length > 1 ? 'pointer' : 'not-allowed';
        }
    }

    /* ==================== */
    /* TRACK MANAGEMENT     */
    /* ==================== */
    card_author_close.forEach(function(closeBtn) {
        closeBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            const cardAuthor = event.target.closest('.card_author');
            
            if (cardAuthor) {
                cardAuthor.remove();
                const trackUrl = cardAuthor.getAttribute('data-track-url');
                tracks = tracks.filter(track => track.url !== trackUrl);
                
                if (tracks.length === 0) {
                    footer_player.classList.add('hide');
                } else if (currentTrackIndex >= tracks.length) {
                    currentTrackIndex = Math.max(0, tracks.length - 1);
                }
            }
        });
    });

    trackCards.forEach(function(card, index) {
        const trackUrl = card.getAttribute('data-track-url'),
              trackName = card.getAttribute('data-track-name'),
              trackArtists = card.getAttribute('data-track-artists');

        if (trackUrl) {
            tracks.push({ url: trackUrl, name: trackName, artists: trackArtists });
        }

        if (document.querySelectorAll('.cards_author_search').length > 0) {
            card.addEventListener('click', function(event) {
                if (!event.target.closest('.form_likes')) {
                    playTrack(index);
                    footer_player.classList.remove('hide');
                }
            });
        } 
    });

    /* ==================== */
    /* PLAYER FUNCTIONS     */
    /* ==================== */

    const playButtons = document.querySelectorAll('.play_panel img[alt="Play"]');
    
    playButtons.forEach(playButton => {
        playButton.style.cursor = 'pointer';
        
        playButton.addEventListener('click', function() {
            if (tracks && tracks.length > 0) {
                playTrack(0);
                
                const footerPlayer = document.getElementById('footer_player');
                if (footerPlayer) {
                    footerPlayer.classList.remove('hide');
                }
            } else {
                console.log('Нет доступных треков для воспроизведения');
                alert('Добавьте треки для воспроизведения');
            }
        });
    });
    
    function playTrack(index) {
        if (index < 0 || index >= tracks.length) return;

        currentTrackIndex = index;
        const track = tracks[currentTrackIndex];

        audioPlayer.src = track.url;
        audioPlayer.play();
        playPauseBtn.style.backgroundImage = `url('${playPauseBtn.dataset.playIcon}')`;

        trackNameElement.textContent = track.name;
        trackArtistElement.textContent = track.artists;
    }

    function nextTrack() {
        if (tracks.length === 0) return;
        
        if (currentTrackIndex < tracks.length - 1) {
            playTrack(currentTrackIndex + 1);
        } else if (repeatMode === 2) {
            playTrack(0);
        }
    }

    function previousTrack() {
        if (tracks.length === 0) return;
        
        if (audioPlayer.currentTime > 5) {
            audioPlayer.currentTime = 0;
        } else if (currentTrackIndex > 0) {
            playTrack(currentTrackIndex - 1);
        }
    }

    function updateRepeatIcon() {
        if (repeatMode === 0) {
            repeatTrackBtn.style.opacity = "0.5";
            repeatTrackBtn.style.backgroundImage = 'none';
        } else if (repeatMode === 1) {
            repeatTrackBtn.style.opacity = "1";
            repeatTrackBtn.style.backgroundImage = `url('${repeatTrackBtn.dataset.reapetIcon}')`;
            repeatTrackBtn.style.backgroundRepeat = `no-repeat`;
        } else if (repeatMode === 2) {
            repeatTrackBtn.style.opacity = "0.9";
            repeatTrackBtn.style.backgroundImage = `url('${repeatTrackBtn.dataset.tracknextIcon}')`;
        }
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60),
              secondsLeft = Math.floor(seconds % 60);
        return `${minutes}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;
    }

    function loadAllFavoriteTracks() {
        tracks = [];
        
        document.querySelectorAll('.track-item').forEach(trackItem => {
            const trackUrl = trackItem.getAttribute('data-audio-url') || trackItem.getAttribute('data-preview'),
                  trackName = trackItem.getAttribute('data-track-name') || 
                             trackItem.querySelector('.songs_main_tracks_title > div > div:first-child').textContent,
                  trackArtists = trackItem.getAttribute('data-track-artists') || 
                                trackItem.querySelector('.songs_main_tracks_title > div > div:nth-child(2)').textContent;
            
            if (trackUrl && !trackUrl.includes('null')) {
                tracks.push({
                    url: trackUrl,
                    name: trackName,
                    artists: trackArtists
                });
            }
        });
         
        console.log("Loaded tracks:", tracks.length);
    }

    /* ==================== */
    /* EVENT LISTENERS      */
    /* ==================== */
    nextTrackBtn.addEventListener('click', nextTrack);
    backTrackBtn.addEventListener('click', previousTrack);

    repeatTrackBtn.addEventListener('click', function() {
        repeatMode = (repeatMode + 1) % 3;
        updateRepeatIcon();
    });

    audioPlayer.addEventListener('ended', function() {
        if (repeatMode === 1) {
            playTrack(currentTrackIndex);
        } else {
            nextTrack();
        }
    });

    audioPlayer.addEventListener('loadedmetadata', function() {
        totalDurationLabel.textContent = formatTime(audioPlayer.duration);
        progressBar.max = audioPlayer.duration;
    });

    audioPlayer.addEventListener('timeupdate', function() {
        currentTimeLabel.textContent = formatTime(audioPlayer.currentTime);
        progressBar.value = audioPlayer.currentTime;
    });

    playPauseBtn.addEventListener('click', function() {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPauseBtn.style.backgroundImage = `url('${playPauseBtn.dataset.playIcon}')`;
        } else {
            audioPlayer.pause();
            playPauseBtn.style.backgroundImage = `url('${playPauseBtn.dataset.pauseIcon}')`;
        }
    });

    progressBar.addEventListener('input', function() {
        audioPlayer.currentTime = progressBar.value;
    });

    volumeControl.addEventListener('input', function() {
        audioPlayer.volume = volumeControl.value;
    });

    document.querySelectorAll('.track-item').forEach(function(trackItem) {
        trackItem.addEventListener('click', function(event) {
            if (!event.target.closest('.songs_main_tracks_like')) {
                const trackUrl = this.getAttribute('data-audio-url'),
                      trackPreview = this.getAttribute('data-preview'),
                      trackTitleElement = this.querySelector('.songs_main_tracks_title > div > div:first-child'),
                      trackArtistElement = this.querySelector('.songs_main_tracks_title > div > div:nth-child(2)'),
                      trackName = trackTitleElement ? trackTitleElement.textContent : 'Unknown',
                      trackArtists = trackArtistElement ? trackArtistElement.textContent : 'Unknown',
                      audioSrc = (trackUrl && !trackUrl.includes('null')) ? trackUrl : 
                                (trackPreview && !trackPreview.includes('null')) ? trackPreview : null;
    
                if (!audioSrc) {
                    console.error('No valid audio URL found');
                    return;
                }
    
                const existingIndex = tracks.findIndex(t => t.url === audioSrc);
                
                if (existingIndex !== -1) {
                    playTrack(existingIndex);
                } else {
                    tracks.push({
                        url: audioSrc,
                        name: trackName,
                        artists: trackArtists
                    });
                    currentTrackIndex = tracks.length - 1;
                    playTrack(currentTrackIndex);
                }
    
                footer_player.classList.remove('hide');
            }
        });
    });

    if (document.querySelectorAll('.track-load').length > 0) {
        loadAllFavoriteTracks();
    }

    /* ==================== */
    /* ARTIST CARDS         */
    /* ==================== */
    try {
        const artistByCard = {
            'card_1': 'The+weeknd',
            'card_2': 'Playboi+Carti',
            'card_3': 'Rocket+Swag+Season',
            'card_4': 'Post+Malone',
            'card_5': 'Fendiglock',
            'card_6': 'August+365',
            'card_7': 'Og+Buda',
            'card_8': '163ONMYNECK',
            'card_9': 'kweensize',
            'card_10': 'Lil+Mosey',
            'card_11': '4n+Way',
            'card_12': 'RtFeat'
        };

        Object.keys(artistByCard).forEach(carId => {
            const card = document.getElementById(carId);
            if (card) {
                card.addEventListener('click', () => {
                    window.location.href = `/search?q=${artistByCard[carId]}`;
                });
                card.style.cursor = 'pointer';
            }
        });
    } catch (error) {
    }

    /* ==================== */
    /* TRACK UPLOAD         */
    /* ==================== */
    try {
        document.getElementById('uploadTrackForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            fetch('/upload_track/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': document.querySelector('#uploadTrackForm input[name="csrfmiddlewaretoken"]').value,
                },
            })
            .then(response => response.json())
            .then(data => {
                console.log("Server response:", data);
                if (data.success) {
                    alert('Track uploaded successfully!');
                    modal_add_song.style.display = 'none';
                    window.location.href = window.location.pathname + '?rand=' + Math.random();
                } else {
                    alert('Error: ' + (data.errors ? Object.values(data.errors).join(', ') : 'Unknown error'));
                }
            })
            .catch(error => {
            });
        });

        document.getElementById('coverImageInput').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    document.getElementById('coverPreview').src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        document.getElementById('coverPreview').addEventListener('click', function() {
            document.getElementById('coverImageInput').click();
        });
    } catch (error) {
    }
});

/* ==================== */
/* FAVORITES MANAGEMENT */
/* ==================== */
document.addEventListener("DOMContentLoaded", function() {
    const favoriteButtons = document.querySelectorAll(".favorite-btn"),
          likeButtons = document.querySelectorAll(".like-button");

    function getCSRFToken() {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.startsWith('csrftoken=')) {
                    cookieValue = decodeURIComponent(cookie.substring('csrftoken='.length));
                    break;
                }
            }
        }
        return cookieValue;
    }

    favoriteButtons.forEach(button => {
        button.addEventListener("click", function() {
            const trackId = this.dataset.trackId,
                  title = this.dataset.title,
                  artist = this.dataset.artist,
                  previewUrl = this.dataset.preview,
                  cover = this.dataset.cover,
                  album = this.dataset.album,
                  duration = this.dataset.duration;

            if (!trackId) {
                console.error("Error: track_id not found!");
                return;
            }

            fetch("/add_to_favorites/", {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCSRFToken(),
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({ 
                    track_id: trackId, 
                    title, 
                    artist, 
                    preview_url: previewUrl, 
                    cover, 
                    album, 
                    duration 
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    alert("Track added to favorites!");
                } else if (data.status === "exists") {
                    alert("This track is already in favorites.");
                } else {
                    alert("Error: " + data.message);
                }
            })
            .catch(error);
        });
    });

    try {
        likeButtons.forEach(button => {
            button.addEventListener("click", function(event) {
                event.preventDefault();
                const form = this.closest("form");
                if (!form) {
                    console.error("Error: Form not found!");
                    return;
                }
                
                let trackId = form.querySelector("[name=track_id]")?.value || this.dataset.trackId;
                if (!trackId) {
                    console.error("Error: track_id not found!");
                    return;
                }
                
                console.log("Removing track with ID:", trackId);
            
                fetch("/remove_from_favorites/", {
                    method: "POST",
                    headers: {
                        "X-CSRFToken": getCSRFToken(),
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: new URLSearchParams({ "track_id": trackId })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === "success") {
                        const card = form.closest(".track-item");
                        if (card) {
                            card.remove();
                        } else {
                            console.error("Error: Card not found for removal.");
                        }
                    } else {
                        alert("Error: " + data.message);
                    }
                })
                .catch(error => {
                    
                });
            });
        });

        if (likeButtons.length === 0) {
            const messageContainer = document.querySelector("#Add_your_favorites_tracks");
            messageContainer.textContent = "Add your favorite tracks to your favorites so you don't waste time searching!";
            document.messageContainer.prepend(messageContainer);
        } 
    } catch (error) {
    }
});

/* ==================== */
/* AVATAR UPLOAD        */
/* ==================== */
try {
    document.getElementById('avatar-input').addEventListener('change', function() {
        let formData = new FormData();
        formData.append('avatar', this.files[0]);

        fetch('/upload_avatar/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('profile-image').src = data.avatar_url;
            } else {
                alert('Avatar upload error');
            }
        })
        .catch(error => {
        });
    });

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
} catch (error) {
}