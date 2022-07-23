from pyproj import Geod
from flask import Flask, jsonify, render_template, request, redirect
from flask_cors import CORS, cross_origin
import re
import rasterio

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/index.html')
def smth_went_wrong():
    return redirect('http://127.0.0.1:5000')

@app.get('/geoapi/calculate_orthodrome_line')
@cross_origin()
def processData():
    try:
        all_args = request.args.to_dict()

        geoid = Geod(ellps="WGS84")
        
        coord_point1 = re.findall('-?\d+(?:\.\d*)?', all_args['point1'])
        lat1, lon1 = list(map(float, coord_point1))

        coord_point2 = re.findall('-?\d+(?:\.\d*)?', all_args['point2'])
        lat2, lon2 = list(map(float, coord_point2))

        extra_points = geoid.npts(lon1, lat1, lon2, lat2, int(all_args["count"]))
        extra_points.insert(0, (lon1, lat1))
        extra_points.append((lon2, lat2))
        
        format_extra_points = list(map(lambda x: ' '.join([str(i) for i in reversed(x)]), extra_points))
        
        return "LINESTRING (" + ', '.join(format_extra_points) + ")", 200
    except Exception as e:
        print("printtttttttttttt", e)
        return str(e), 500


@app.get('/elevation')
@cross_origin()
def processData2():
    all_args = request.args.to_dict()
    elevation = 'static/source/srtm_N55E160.tif'
    coord_point = re.findall('-?\d+(?:\.\d*)?', all_args['wkt'])
    lat, lon = list(map(float, coord_point))

    coords = ([lon, lat],)
    LatLndHgt = [lat, lon]
    with rasterio.open(elevation) as src:
        vals = src.sample(coords)
        for val in vals:
            LatLndHgt.append(val[0])
    
    return "POINT (" + ' '.join(list(map(str, LatLndHgt))) + ")"


if __name__ == '__main__':    
    app.run(host='127.0.0.1', port=5000, debug=True)
