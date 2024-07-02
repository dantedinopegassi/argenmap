class Geometry {
  
  constructor() {
    this._types = [
      "Geometry",
      "Point",
      "MultiPoint",
      "LineString",
      "MultilineString",
      "Polygon",
      "MultiPolygon",
    ];
  }

  isValidType = (geom) => {
    let match = this._types.filter((type) => type === geom);
    return match.length > 0;
  };
}

export { Geometry };
