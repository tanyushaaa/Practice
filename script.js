let map = new L.map('map', {
    center: [62.917302, 96.163184],
    zoom: 4
})

let layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
 
map.addLayer(layer)

let markerLayers = L.layerGroup()

function sendData(form){
    form.action = "index.html"
    let point1 = form.inputPoint1.value
    let point2 = form.inputPoint2.value
    let count = 10
    if (form.inputCount.value != '') { count = form.inputCount.value}
    // let count =  form.inputCount.value ? form.inputCount.value : 10
    
    let theUrl = `http://127.0.0.1:5000/geoapi/calculate_orthodrome_line?point1=${point1}&point2=${point2}&count=${count}`
    let xmlHttp = new XMLHttpRequest()
    xmlHttp.open("GET", theUrl, false) // false for synchronous request
    xmlHttp.send()
    a = xmlHttp.responseText
    const regex = /\d+.\d+ \d+.\d+/g
    const found = a.match(regex)

    const regex_ = /\d+.\d+/g
    let points = []
    for (let i of found){
        let coords = i.match(regex_).map(function(v) { return parseFloat(v) })
        points.push(new L.LatLng(coords[0], coords[1]))
    }

    markerLayers.removeFrom(map)
    markerLayers = L.layerGroup()

    var firstpolyline = new L.Polyline(points, {
        color: 'red',
        weight: 3,
        opacity: 0.5,
        smoothFactor: 1
    })
    markerLayers.addLayer(firstpolyline)

    const markers = []
    markers.push(L.marker(points[0]))
    markers.push(L.marker(points[points.length - 1]))

    const view = L.featureGroup(markers)
    markerLayers.addLayer(L.featureGroup(markers))
    markerLayers.addTo(map)

    map.fitBounds(view.getBounds())

    return false
}

function addMarker(obj){

}
