interface Coordinates {
  lat?: number;
  lon?: number;
}

export function getDistance(coord1: Coordinates, coord2: Coordinates): number {
  if (!coord1?.lat || !coord1?.lon || !coord2?.lat || !coord2?.lon) {
    throw new Error("Missing lat/lon", { cause: { coord1, coord2 } });
  }

  const R = 6371; // Rayon de la Terre en kilomètres
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180); // Conversion des degrés en radians
  const dLon = (coord2.lon - coord1.lon) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(coord1.lat * (Math.PI / 180)) * Math.cos(coord2.lat * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance en kilomètres
  return distance;
}
