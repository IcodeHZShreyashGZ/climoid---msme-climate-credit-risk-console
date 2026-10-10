import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

let configured = false;
let mapsPromise: Promise<void> | null = null;

export function loadGoogleMaps(): Promise<void> {
  if (!mapsPromise) {
    if (!configured) {
      setOptions({
        key: (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) || '',
        v: 'weekly',
      });
      configured = true;
    }
    mapsPromise = importLibrary('maps').then(() => undefined);
  }
  return mapsPromise;
}

const PIN_PATH =
  'M 0,0 C -2,-2 -6,-6 -8,-11 C -10,-16 -10,-20 -8,-24 C -6,-28 -3,-30 0,-30 ' +
  'C 3,-30 6,-28 8,-24 C 10,-20 10,-16 8,-11 C 6,-6 2,-2 0,0 z';

export function bandPinSymbol(color: string, active = true): google.maps.Symbol {
  return {
    path: PIN_PATH,
    fillColor: color,
    fillOpacity: active ? 1 : 0.35,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: active ? 1.15 : 0.85,
    labelOrigin: new google.maps.Point(0, -19),
  };
}
