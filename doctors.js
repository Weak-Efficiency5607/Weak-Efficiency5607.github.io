
(function() {
    function init() {
        // Ensure Leaflet is loaded
        if (typeof L === 'undefined') {
            setTimeout(init, 100);
            return;
        }

        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;

        // Initialize map
        const map = L.map('map').setView([48.8566, 2.3522], 13); // Default to Paris

        // Fix for Leaflet initialization issues with dynamic loading
        setTimeout(() => {
            map.invalidateSize();
        }, 400);

        // Tile layers
        const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        });

        const lightTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        });

        // Theme Management
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;
        
        let isDark = localStorage.getItem('theme') === 'dark';

        function setTheme(dark) {
            if (dark) {
                document.body.classList.remove('light-mode');
                if (map.hasLayer(lightTiles)) map.removeLayer(lightTiles);
                darkTiles.addTo(map);
                localStorage.setItem('theme', 'dark');
                themeToggle.textContent = '☀️ Light Mode';
            } else {
                document.body.classList.add('light-mode');
                if (map.hasLayer(darkTiles)) map.removeLayer(darkTiles);
                lightTiles.addTo(map);
                localStorage.setItem('theme', 'light');
                themeToggle.textContent = '🌙 Dark Mode';
            }
        }

        // Set initial theme
        setTheme(isDark);

        themeToggle.addEventListener('click', () => {
            isDark = !isDark;
            setTheme(isDark);
        });

        // Custom icon for doctors
        const doctorIcon = L.divIcon({
            className: 'custom-pin prominent-pin',
            html: '<div class="pin-inner pulse">⚕️</div>',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        // Group to hold markers
        let markersLayer = L.layerGroup().addTo(map);

        // Add custom legend control
        const legend = L.control({position: 'bottomright'});
        legend.onAdd = function (map) {
            const div = L.DomUtil.create('div', 'info legend');
            div.innerHTML = `
                <h4>Map Legend</h4>
                <div class="legend-item"><span class="legend-pin">⚕️</span> Doctors (Highlighted)</div>
            `;
            return div;
        };
        legend.addTo(map);
        let loading = false;

        // Function to fetch doctors from Overpass API
        async function fetchDoctors() {
            if (map.getZoom() < 12) {
                updateStatus('Zoom in closer to find doctors', 'warning');
                return;
            }
            
            if (loading) return;
            loading = true;
            updateStatus('Searching...', 'loading');

            const bounds = map.getBounds();
            const south = bounds.getSouth();
            const west = bounds.getWest();
            const north = bounds.getNorth();
            const east = bounds.getEast();

            const query = `
                [out:json][timeout:25];
                (
                    node["amenity"="doctors"](${south},${west},${north},${east});
                    node["healthcare"="doctor"](${south},${west},${north},${east});
                    node["office"="physician"](${south},${west},${north},${east});
                );
                out body;
                >;
                out skel qt;
            `;

            const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

            try {
                const response = await fetch(url);
                const data = await response.json();
                
                markersLayer.clearLayers();

                if (data.elements && data.elements.length > 0) {
                    data.elements.forEach(element => {
                        if (element.lat && element.lon) {
                            const name = element.tags.name || "Unknown Doctor";
                            const specialty = element.tags["healthcare:specialty"] || element.tags.specialty || "General Practice";
                            
                            L.marker([element.lat, element.lon], {icon: doctorIcon})
                                .bindPopup(`
                                    <div class="popup-content">
                                        <strong>${name}</strong><br>
                                        <span class="specialty">${specialty}</span>
                                    </div>
                                `)
                                .addTo(markersLayer);
                        }
                    });
                    updateStatus(`Found ${data.elements.length} doctors`, 'success');
                } else {
                    updateStatus('No doctors found in this area', 'info');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                updateStatus('Error fetching data', 'error');
            } finally {
                loading = false;
            }
        }

        function updateStatus(message, type) {
            const statusEl = document.getElementById('status-msg');
            if (statusEl) {
                statusEl.textContent = message;
                statusEl.className = 'status-msg ' + type;
            }
        }

        // Event listeners
        const findMeBtn = document.getElementById('find-me');
        if (findMeBtn) {
            findMeBtn.addEventListener('click', () => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(position => {
                        map.setView([position.coords.latitude, position.coords.longitude], 14);
                        setTimeout(fetchDoctors, 1000); 
                    }, () => {
                        fetchDoctors();
                    });
                } else {
                    fetchDoctors();
                }
            });
        }

        map.on('moveend', () => {
            if (map.getZoom() >= 14) {
                fetchDoctors();
            }
        });

        if (map.getZoom() >= 14) fetchDoctors();

        // Address Search Logic
        const addressInput = document.getElementById('address-input');
        const suggestionsList = document.getElementById('address-suggestions');
        let searchTimeout;

        if (addressInput && suggestionsList) {
            const inputHandler = () => {
                clearTimeout(searchTimeout);
                const query = addressInput.value.trim();
                
                if (query.length < 3) {
                    suggestionsList.style.display = 'none';
                    return;
                }

                searchTimeout = setTimeout(async () => {
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
                        const data = await response.json();
                        displaySuggestions(data);
                    } catch (error) {
                        console.error('Error fetching suggestions:', error);
                    }
                }, 500);
            };
            addressInput.addEventListener('input', inputHandler);

            function displaySuggestions(suggestions) {
                if (suggestions.length === 0) {
                    suggestionsList.style.display = 'none';
                    return;
                }

                suggestionsList.innerHTML = suggestions.map(item => `
                    <div class="suggestion-item" data-lat="${item.lat}" data-lon="${item.lon}">
                        <strong>${item.display_name.split(',')[0]}</strong>
                        <small>${item.display_name.split(',').slice(1).join(',')}</small>
                    </div>
                `).join('');
                
                suggestionsList.style.display = 'block';

                document.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const lat = item.getAttribute('data-lat');
                        const lon = item.getAttribute('data-lon');
                        const name = item.querySelector('strong').textContent;
                        selectAddress(lat, lon, name);
                    });
                });
            }

            function selectAddress(lat, lon, name) {
                addressInput.value = name;
                suggestionsList.style.display = 'none';
                const coords = [parseFloat(lat), parseFloat(lon)];
                map.setView(coords, 14);
                setTimeout(fetchDoctors, 500);
            }

            const keydownHandler = async (e) => {
                if (e.key === 'Enter') {
                    const query = addressInput.value.trim();
                    if (query.length === 0) return;
                    
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
                        const data = await response.json();
                        if (data && data.length > 0) {
                            selectAddress(data[0].lat, data[0].lon, data[0].display_name.split(',')[0]);
                        }
                    } catch (error) {
                        console.error('Error searching address:', error);
                    }
                }
            };
            addressInput.addEventListener('keydown', keydownHandler);

            const clickHandler = (e) => {
                const innerInput = document.getElementById('address-input');
                const innerList = document.getElementById('address-suggestions');
                if (innerInput && innerList && !innerInput.contains(e.target) && !innerList.contains(e.target)) {
                    innerList.style.display = 'none';
                }
            };

            if (window.doctorsPageClickHandler) {
                document.removeEventListener('click', window.doctorsPageClickHandler);
            }
            window.doctorsPageClickHandler = clickHandler;
            document.addEventListener('click', clickHandler);
        }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
