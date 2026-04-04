# Map Markers — Bug de troncature iOS et correctifs

## Le probleme

Sur iOS, les marqueurs custom dans `react-native-maps` (`<Marker>` avec des children React) sont captures en bitmap par la lib. Le bitmap est cree en pixels physiques (ex: 96px sur un ecran 2x pour une vue de 48pt) mais affiche en points logiques 1:1 (96pt au lieu de 48pt). Resultat : le marqueur apparait 2x trop grand et est tronque — on ne voit qu'un quart.

Ce bug touche **tout** child custom dans un `<Marker>`, pas seulement les images. Un simple `<View>` colore est aussi tronque.

### Ce qui ne fonctionne PAS

- `collapsable={false}` — Android only, pas d'effet sur iOS
- `renderToHardwareTextureAndroid` — idem
- `overflow: 'hidden'` — aggrave le probleme sur certains devices
- `viewBox` sur SVG — ne change rien au bitmap capture
- Augmenter `setTimeout` avant `tracksViewChanges={false}` — le probleme n'est pas le timing

## Solution retenue : react-native-view-shot

L'approche fiable est de **ne pas utiliser de children custom** dans `<Marker>`. A la place :

1. Rendre le `PhotoMarker` dans une vue **off-screen** (hors ecran, invisible)
2. Le capturer en PNG via `react-native-view-shot`
3. Passer l'URI du PNG a la prop `image` du `<Marker>`

Avec `image={{ uri }}`, react-native-maps gere correctement le scaling — pas de troncature, quelle que soit la taille.

### Architecture

```
MapScreen
├── offscreenContainer (position: absolute, top: -9999, opacity: 0)
│   └── OffscreenCapture (un par photo)
│       └── ViewShot ref → capture()
│           └── PhotoMarker (taille normale, ex: 56pt)
│               └── View (ring) + Image (photo circulaire)
│
└── MapView
    └── Marker (un par photo, affiche seulement quand le bitmap est pret)
        image={{ uri: capturedUris[photo.id] }}
        tracksViewChanges={false}
```

### Code cle — OffscreenCapture

```tsx
function OffscreenCapture({ photo, onCapture }: { photo: Photo; onCapture: (uri: string) => void }) {
  const shotRef = useRef<ViewShot>(null);

  const onImageLoad = useCallback(() => {
    setTimeout(() => {
      shotRef.current?.capture?.().then(onCapture);
    }, 100);
  }, [onCapture]);

  return (
    <ViewShot ref={shotRef} options={{ format: 'png', quality: 1 }} style={{ backgroundColor: 'transparent' }}>
      <PhotoMarker photo={photo} onLoad={onImageLoad} />
    </ViewShot>
  );
}
```

### Code cle — Markers sur la carte

```tsx
{photos
  .filter((photo) => capturedUris[photo.id])
  .map((photo) => (
    <Marker
      key={photo.id}
      coordinate={{ latitude: photo.latitude!, longitude: photo.longitude! }}
      tracksViewChanges={false}
      image={{ uri: capturedUris[photo.id] }}
    />
  ))}
```

### PhotoMarker.tsx — composant visuel

```tsx
export const MARKER_SIZE = 56;
const BORDER_WIDTH = 4;
const INNER_SIZE = MARKER_SIZE - BORDER_WIDTH * 2;

// Utiliser padding + backgroundColor au lieu de borderWidth pour eviter overflow:hidden
const styles = StyleSheet.create({
  ring: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    padding: BORDER_WIDTH,
    backgroundColor: colors.primary,  // sert de bordure
  },
  image: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,  // borderRadius sur l'Image directement, pas overflow:hidden
  },
});
```

Points importants pour `PhotoMarker` :
- **Pas de `overflow: 'hidden'`** — ca casse le rendu sur Android dans les markers
- **`borderRadius` sur l'Image elle-meme** — seule facon fiable de faire des images circulaires
- **`padding` + `backgroundColor`** au lieu de `borderWidth` — simule la bordure sans clipping

## Solution alternative : PixelRatio (si on ne veut pas de lib)

Si on veut eviter `react-native-view-shot`, on peut diviser les dimensions par `PixelRatio.get()` :

```tsx
import { PixelRatio } from 'react-native';
const ratio = PixelRatio.get();
const OUTER_SIZE = 56 / ratio;  // ~28pt sur 2x, ~19pt sur 3x
```

Limitation : la taille max affichable est ~100pt. Au-dela, la troncature revient a cause d'une limite du container natif iOS des annotations.

## Autres changements sur la carte

- `showsPointsOfInterest={false}` — masque boutiques, restaurants
- `showsBuildings={false}`, `showsTraffic={false}`, `showsIndoors={false}`
- POI et transit masques via `customMapStyle` (sauf les parcs)
- Bouton localiser custom (FAB en bas a droite, `bottom: 100` pour etre au-dessus de la tab bar)
- `showsMyLocationButton={false}` — remplace par le bouton custom

## Dependance

```
npm install react-native-view-shot --legacy-peer-deps
```

`--legacy-peer-deps` necessaire a cause d'un conflit react-dom/react dans le lock actuel.
