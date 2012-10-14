exports.version = '0.0.5';

exports.defaults = {};

exports.parse = function(objects, params) {
  var geojson = baseObj();
  setGeom(params);

  objects.forEach(function(item){
    var feature = buildFeature(item, params);
    geojson.features.push(feature);
  });

  return geojson;
};

// Helper functions
var geoms = [
  'Point',
  'MultiPoint',
  'LineString',
  'MultiLineString',
  'Polygon',
  'MultiPolygon'
];

var geomAttrs = [];

function baseObj() {
  return {
    "type": "FeatureCollection",
    "features": []
  };
}

function setGeom(params) {
  params.geom = {};

  for(var param in params) {
    if(params.hasOwnProperty(param) && geoms.indexOf(param) !== -1){
      params.geom[param] = params[param];
      delete params[param];
    }
  }

  setGeomAttrList(params.geom);
}

function setGeomAttrList(params) {
  for(var param in params) {
    if(params.hasOwnProperty(param)) {
      if(typeof params[param] === 'string') {
        geomAttrs.push(params[param]);
      } else if (typeof params[param] === 'object') { // Array of coordinates for Point
        geomAttrs.push(params[param][0]);
        geomAttrs.push(params[param][1]);
      }
    }
  }
}

function buildFeature(item, params) {
  var feature = { "type": "Feature" };

  feature.geometry = buildGeom(item, params);
  feature.properties = buildProps(item, params);

  return feature;
}

function buildGeom(item, params) {
  var geom = {};

  for(var attr in item) {
    if(item.hasOwnProperty(attr) && geomAttrs.indexOf(attr) !== -1) {
      for(var gtype in params.geom) {
        if(params.geom.hasOwnProperty(gtype) &&
          (attr === params.geom[gtype] || attr === params.geom[gtype][0])) {
          geom.type = gtype;

          if (typeof params.geom[gtype] === 'string') {
            geom.coordinates = item[params.geom[gtype]];
          } else { // Point with geom stored in two attributes
            geom.coordinates = [item[params.geom[gtype][1]], item[params.geom[gtype][0]]];
          }

          return geom;
        }
      }
    }
  }
}

function buildProps(item, params) {
  var properties = {};

  if (!params.exclude && !params.include) {
    for(var attr in item) {
      if(item.hasOwnProperty(attr) && (geomAttrs.indexOf(attr) === -1)) {
          properties[attr] = item[attr];
        }
    }
  } else if (params.include) {
    params.include.forEach(function(attr){
      properties[attr] = item[attr];
    });
  } else if (params.exclude) {
    for(var attr in item) {
      if(item.hasOwnProperty(attr) && (geomAttrs.indexOf(attr) === -1) && (params.exclude.indexOf(attr) === -1)) {
        properties[attr] = item[attr];
      }
    }
  }

  return properties;
}