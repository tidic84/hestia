<p align="center">
  <img src="assets/icon.png" width="120" alt="Hestia icon" />
</p>

<h1 align="center">Hestia</h1>

<p align="center">
  <b>Une photo par jour. Ton journal visuel.</b>
  <br />
  Capture un moment chaque jour et construis ta collection de souvenirs.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-54-000020?logo=expo" alt="Expo SDK 54" />
  <img src="https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Platform-Android-3DDC84?logo=android" alt="Android" />
</p>

---

## Concept

Hestia t'invite a prendre **une seule photo par jour** -- pas de feed infini, pas de likes, juste toi et tes souvenirs. Au fil des jours, tu construis un calendrier visuel de ta vie quotidienne.

## Fonctionnalites

### Capture quotidienne
- Prise de photo avec la camera (avant/arriere)
- Apercu avant confirmation
- Une photo par jour, remplacement possible
- Geolocalisation automatique (optionnelle)

### Calendrier
- Vue mensuelle avec miniatures des photos
- Navigation mois par mois
- Acces rapide a chaque souvenir

### Carte
- Toutes tes photos geolocalisees sur une carte sombre
- Marqueurs personnalises avec apercu des photos
- Bouton de localisation

### Gamification
- **14 badges** a debloquer (series, defis, exploration...)
- Suivi des series consecutives (streak)
- **50+ defis quotidiens** : couleurs, nature, perspectives, emotions...
- Recap de tes statistiques

### Notifications
- Rappel quotidien aleatoire dans une fenetre horaire configurable
- Planification locale, aucun serveur

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | [Expo](https://expo.dev) SDK 54 + [Expo Router](https://expo.github.io/router) |
| UI | React Native 0.81, Reanimated, Gesture Handler |
| Base de donnees | expo-sqlite avec migrations |
| Camera | expo-camera |
| Carte | react-native-maps |
| Notifications | expo-notifications (lazy-loaded) |
| Langage | TypeScript (strict) |

## Architecture

```
app/                    # Ecrans (Expo Router file-based routing)
  (tabs)/               # Navigation par onglets
    index.tsx           #   Capture
    dashboard.tsx       #   Progres & badges
    calendar.tsx        #   Calendrier mensuel
    map.tsx             #   Carte
  photo/[id].tsx        # Detail photo (modal)
  recap.tsx             # Recap statistiques (modal)
  settings.tsx          # Reglages (modal)

src/
  components/           # Composants reutilisables
  constants/            # Badges, defis, theme
  db/                   # Client SQLite, migrations, requetes
  hooks/                # Hooks React (usePhoto, useStreak, useBadges...)
  services/             # Logique metier (photo, gamification, notifications)
  types/                # Types TypeScript
```

## Installation

```bash
# Cloner le repo
git clone https://github.com/tidic84/hestia.git
cd hestia

# Installer les dependances
npm install

# Lancer en dev (Expo Go)
npx expo start

# Build Android (APK)
npx --yes eas-cli build --platform android --profile preview
```

## Donnees & vie privee

- **100% local** : toutes les photos et donnees restent sur ton appareil
- **Aucun serveur** : pas de compte, pas de cloud, pas de tracking
- **EXIF stripping** : les metadonnees sensibles sont retirees des photos
- Les notifications sont planifiees localement

## License

MIT

---

<p align="center">
  <sub>Fait avec soin pour ceux qui veulent se souvenir de chaque jour.</sub>
</p>
