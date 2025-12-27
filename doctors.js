// Initialize map
const map = L.map('map').setView([48.8566, 2.3522], 13); // Default to Paris

// Add dark mode tiles (using CartoDB Dark Matter for that premium look)
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
}).addTo(map);

// Custom icon for doctors
const doctorIcon = L.divIcon({
	className: 'custom-pin',
	html: '<div class="pin-inner">⚕️</div>',
	iconSize: [30, 30],
	iconAnchor: [15, 30],
	popupAnchor: [0, -30]
});

// Group to hold markers
let markersLayer = L.layerGroup().addTo(map);
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

	// Overpass QL query
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
		
		// Clear existing markers
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
	statusEl.textContent = message;
	statusEl.className = 'status-msg ' + type;
}

// Event listeners
document.getElementById('find-me').addEventListener('click', () => {
    // First try geolocation to center map
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            map.setView([position.coords.latitude, position.coords.longitude], 14);
            setTimeout(fetchDoctors, 1000); // Wait for move to finish roughly
        }, () => {
             // If denied/error, just fetch for current view
             fetchDoctors();
        });
    } else {
        fetchDoctors();
    }
});

// Auto-fetch when moving map if zoomed in
map.on('moveend', () => {
    if (map.getZoom() >= 14) {
        fetchDoctors();
    }
});

// Initial check
if (map.getZoom() >= 14) fetchDoctors();
