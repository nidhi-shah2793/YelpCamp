mapboxgl.accessToken = mapbox_token;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: campground.geometry.coordinates,
    zoom: 4
});

const marker = new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(new mapboxgl.Popup().setHTML(`<h5 style="color: green" class="text-center">${campground.title}</h5><p class="text-center">${campground.location} </p>`)) // add popup
    .addTo(map);

const nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-left');

