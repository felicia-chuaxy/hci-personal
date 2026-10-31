export const PLACES = {
  pickup: { name: 'Chinatown Point', lat: 1.2852, lng: 103.8449 },
  destination: { name: 'SGH Block 3', lat: 1.2789, lng: 103.8345 }
};

export async function lookupPlace(text) {
  const q = text.trim();
  if (!q) throw new Error('Enter a location for both fields.');
  const preset = Object.values(PLACES).find(p => p.name.toLowerCase() === q.toLowerCase());
  if (preset) return preset;
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', q.toLowerCase().includes('singapore') ? q : `${q}, Singapore`);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('countrycodes', 'sg');
  url.searchParams.set('limit', '1');
  const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Place search is temporarily unavailable. Please try again.');
  const matches = await res.json();
  if (!matches.length) throw new Error(`Could not locate “${q}”. Try a fuller Singapore address.`);
  return { name: q, lat: Number(matches[0].lat), lng: Number(matches[0].lon) };
}

const radians = d => d * Math.PI / 180;
export function distanceMeters(a, b) {
  const R = 6371000, dLat = radians(b[0] - a[0]), dLng = radians(b[1] - a[1]);
  const h = Math.sin(dLat/2)**2 + Math.cos(radians(a[0]))*Math.cos(radians(b[0]))*Math.sin(dLng/2)**2;
  return 2*R*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
}

export async function getDrivingRoute(from, to) {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Route not available');
    const data = await response.json();
    const route = data.routes?.[0];
    if (!route?.geometry?.coordinates?.length) throw new Error('Route not available');
    return {
      points: route.geometry.coordinates.map(([lng,lat]) => [lat,lng]),
      distance: route.distance,
      duration: route.duration,
      isApproximate: false
    };
  } catch {
    return { points: [[from.lat,from.lng],[to.lat,to.lng]], distance: distanceMeters([from.lat,from.lng],[to.lat,to.lng]), duration: null, isApproximate: true };
  }
}

export function atProgress(points, fraction) {
  if (!points || points.length < 2) return points?.[0] ?? null;
  const lengths = points.slice(1).map((p,i)=>distanceMeters(points[i],p));
  const total = lengths.reduce((a,b)=>a+b,0);
  let remaining = Math.max(0,Math.min(1,fraction)) * total;
  for (let i=0;i<lengths.length;i++) {
    if (remaining<=lengths[i] || i===lengths.length-1) {
      const t = lengths[i] ? Math.min(1,remaining/lengths[i]) : 1;
      return [points[i][0]+(points[i+1][0]-points[i][0])*t,points[i][1]+(points[i+1][1]-points[i][1])*t];
    }
    remaining -= lengths[i];
  }
  return points[points.length-1];
}
