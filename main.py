from pyproj import Geod
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
import re

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.get('/geoapi/calculate_orthodrome_line')
@cross_origin()
def processData():
    all_args = request.args.to_dict()

    geoid = Geod(ellps="WGS84")

    coord_point1 = re.findall('\d+.\d+', all_args['point1'])
    lat1, lon1 = list(map(float, coord_point1))

    coord_point2 = re.findall('\d+.\d+', all_args['point2'])
    lat2, lon2 = list(map(float, coord_point2))

    extra_points = geoid.npts(lon1, lat1, lon2, lat2, int(all_args["count"]))
    extra_points.insert(0, (lon1, lat1))
    extra_points.append((lon2, lat2))
    
    format_extra_points = list(map(lambda x: ' '.join([str(i) for i in reversed(x)]), extra_points)) #lat lon менять местами
    
    return "<success>LINESTRING (" + ', '.join(format_extra_points) + ")</success>"

if __name__ == '__main__':    
    app.run(host='127.0.0.1', port=5000, debug=True)
