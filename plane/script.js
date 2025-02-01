// Custom coordinates for the airplane's path
const coordinates = [
    { latLng: [41.9040325,-87.886228], icon: 'person' }, // Melrose Park
    { latLng: [41.9441519,-87.9634196], icon: 'truck' }, // Chicago DHL
    { latLng: [42.6195968,-34.6810379], icon: 'plane' }, // Middle Point
    { latLng: [50.0255477,8.5649571], icon: 'plane' }, // Germany DHL
    { latLng: [43.8261891,18.3319466], icon: 'plane' }, // Sarajevo Airport
    { latLng: [43.8852861,18.3214711], icon: 'truck' }, // Sarajevo Customs
    { latLng: [44.2027567,17.8938998], icon: 'truck' }, // Zenica Post
    { latLng: [44.2024572,17.9208262], icon: 'person' } // Zenica Crkvice
];

// Initialize the map
const map = L.map('map').setView([51.505, -0.09], 2);

// Add a tile layer (you can use different map styles)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Create a polyline using the coordinates
const path = L.polyline(coordinates.map(coord => coord.latLng), { color: 'blue' }).addTo(map);

// Create a red overlay polyline (initially empty)
const traveledPath = L.polyline([], { color: 'red', weight: 3 }).addTo(map);

// Fit the map to the bounds of the path
map.fitBounds(path.getBounds());

// Function to calculate the distance between two LatLng points (in kilometers)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// Function to interpolate between two LatLng points
function interpolateLatLng(start, end, steps) {
    const latStep = (end[0] - start[0]) / steps;
    const lngStep = (end[1] - start[1]) / steps;
    const interpolatedPoints = [];

    for (let i = 0; i <= steps; i++) {
        interpolatedPoints.push([
            start[0] + latStep * i,
            start[1] + lngStep * i
        ]);
    }

    return interpolatedPoints;
}

// Function to animate the package along the path
function animatePackage(path, coordinates) {
    // Define icons for truck and plane
    const truckIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/71/71222.png', // Truck icon
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });
    
    const planeIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/8885/8885364.png', // Plane icon
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });
    
    const personIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/18109/18109917.png', // Plane icon
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });

    // Start with the truck icon
    const marker = L.marker(coordinates[0].latLng, { icon: personIcon }).addTo(map);

    let currentIndex = 0;
    let currentStep = 0;
    const stepsPerSegment = 100; // Number of steps between two coordinates
    const speed = 500; // Speed in km/h (adjust as needed)
    const delay = 50; // Delay between each step in milliseconds

    // Calculate the total distance of the path
    let totalDistance = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
        const [lat1, lon1] = coordinates[i].latLng;
        const [lat2, lon2] = coordinates[i + 1].latLng;
        totalDistance += calculateDistance(lat1, lon1, lat2, lon2);
    }

    // Calculate the total time for the animation based on speed
    const totalTime = (totalDistance / speed) * 3600 * 1000; // Convert to milliseconds

    // Function to move the package
    function move() {
        if (currentIndex < coordinates.length - 1) {
            const start = coordinates[currentIndex].latLng;
            const end = coordinates[currentIndex + 1].latLng;
            const interpolatedPoints = interpolateLatLng(start, end, stepsPerSegment);

            if (currentStep < interpolatedPoints.length) {
                // Update the package's position
                marker.setLatLng(interpolatedPoints[currentStep]);

                // Update the traveled path
                const traveledPoints = coordinates
                    .slice(0, currentIndex + 1)
                    .map(coord => coord.latLng);
                traveledPoints.push(interpolatedPoints[currentStep]);
                traveledPath.setLatLngs(traveledPoints);

                // Change the icon based on the current segment's mode of transportation
                const currentMode = coordinates[currentIndex + 1].icon;
                if (currentMode === 'truck') {
                    marker.setIcon(truckIcon);
                } else if (currentMode === 'plane') {
                    marker.setIcon(planeIcon);
                } else if (currentMode === 'person') {
                    marker.setIcon(personIcon);
                }

                currentStep++;
                setTimeout(move, delay);
            } else {
                currentIndex++;
                currentStep = 0;
                setTimeout(move, delay);
            }
        }
    }

    // Start the animation after a timeout (e.g., 3 seconds)
    setTimeout(() => {
        move();
    }, 3000); // 3-second delay before animation starts
}

// Start the animation
animatePackage(path, coordinates);