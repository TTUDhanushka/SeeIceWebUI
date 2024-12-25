// Maps
var map = L.map('map_view').setView([58.21843, 22.50949], 14);

function getOption(){
    const map_options = document.querySelector('#map_options');
    const selected_map_source = map_options.value;

    if (selected_map_source == 'nutimeri'){
        L.tileLayer.wms('https://gis.vta.ee/primar/wms_ip/TranspordiametNutimeri', 
            {
                layers: 'cells'
            }).addTo(map);
    }
    else{
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 20,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        L.tileLayer.wms('http://t1.openseamap.org/seamark/{z}/{x}/{y}.png', {
            maxZoom: 20,
            attribution: '&copy; <a href="http://www.openseamap.org/copyright">OpenSeaMap</a>',
            layers: 'seamark'
        }).addTo(map);
    }
}

function initialize_map(){
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    L.tileLayer.wms('http://t1.openseamap.org/seamark/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="http://www.openseamap.org/copyright">OpenSeaMap</a>',
        layers: 'seamark'
    }).addTo(map);
}

// L.tileLayer.wms('http://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps',
//     {layers: 'topo2'}
// ).addTo(map);

// L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
//     layers: 'SRTM30-Colored-Hillshade'
// }).addTo(map);

map.on('mousemove', function(e) {
    var lat = e.latlng.lat.toFixed(6);
    var lng = e.latlng.lng.toFixed(6);

    const lat_text = document.getElementById('lat');
    const lng_text = document.getElementById('lng');
    lat_text.innerHTML= lat;
    lng_text.innerHTML = lng;
});