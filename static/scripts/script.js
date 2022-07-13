let orthodromyMap = new L.map('orthodromyMap', {
    center: [62.917302, 96.163184],
    zoom: 4
})
let layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
orthodromyMap.addLayer(layer)

let markerLayers = L.layerGroup()

let elevationMap = new L.map('elevationMap', {
    center: [55.5, 160.5],
    zoom: 7
})
let layer2 = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
elevationMap.addLayer(layer2)

let markerLayers2 = L.layerGroup()

function getOrthodromy(form){
    form.action = "index.html"
    let point1 = form.inputPoint1.value
    let point2 = form.inputPoint2.value
    let count =  form.inputCount.value ? form.inputCount.value : 10
    
    let theUrl = `http://127.0.0.1:5000/geoapi/calculate_orthodrome_line?point1=${point1}&point2=${point2}&count=${count}`
    let xmlHttp = new XMLHttpRequest()
    xmlHttp.open("GET", theUrl, false)
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

    markerLayers.removeFrom(orthodromyMap)
    markerLayers = L.layerGroup()

    var polyline = new L.Polyline(points, {
        color: 'red',
        weight: 3,
        opacity: 0.5,
        smoothFactor: 1
    })
    markerLayers.addLayer(polyline)

    const markers = []
    markers.push(L.marker(points[0]))
    markers.push(L.marker(points[points.length - 1]))

    const view = L.featureGroup(markers)
    markerLayers.addLayer(L.featureGroup(markers))
    markerLayers.addTo(orthodromyMap)

    orthodromyMap.fitBounds(view.getBounds())

    return false
}

function getElevation(form){
    form.action = "index.html"
    let point = form.inputPoint.value

    let theUrl = `http://127.0.0.1:5000/elevation?wkt=${point}`
    let xmlHttp = new XMLHttpRequest()
    xmlHttp.open("GET", theUrl, false)
    xmlHttp.send()
    a = xmlHttp.responseText
    const regex = /-?\d+(.\d+)? -?\d+(.\d+)? -?\d+/g
    const found = a.match(regex)

    const regex_ = /-?\d+(\.\d+)?/g
    let points = []
    let height = 0
    for (let i of found){
        let coords = i.match(regex_).map(function(v) { return parseFloat(v) })
        points.push(new L.LatLng(coords[0], coords[1]))
        height = coords[2]
    }

    markerLayers2.removeFrom(elevationMap)
    markerLayers2 = L.layerGroup()

    let popup = L.popup()
        .setLatLng(points[0])
        .setContent(`<p>Height equals ${height}</p>`)
        .openOn(elevationMap)
    return false
}

function addMarker(obj){
    orthodromyMap.on('click', function(e) {   

        let location = e.latlng
        const marker = L.marker(location)
        markerLayers.addLayer(marker)
        markerLayers.addTo(orthodromyMap)
        orthodromyMap.removeEventListener('click')  

        let inputId = "#inputPoint"
        let numButton = 0

        if (obj.id == "coordPoint1"){
            numButton = 1
        } else if (obj.id == "coordPoint2"){
            numButton = 2
        }

        inputId += numButton
        let input = document.querySelector(inputId)
        input.value = "POINT(" + location.lat.toFixed(5) + " " + location.lng.toFixed(5) + ")" 
    })
}

function addMarker2(obj){
    elevationMap.on('click', function(e) {   

        let location = e.latlng
        const marker = L.marker(location)
        markerLayers2.addLayer(marker)
        markerLayers2.addTo(elevationMap)
        elevationMap.removeEventListener('click')  

        let inputId = "#inputPoint"
        let numButton = 0

        let input = document.querySelector(inputId)
        input.value = "POINT(" + location.lat.toFixed(5) + " " + location.lng.toFixed(5) + ")" 
    })
}