# 🔊 Sons de notification - HabitFlow

## Fichiers requis

Ce dossier doit contenir les fichiers audio suivants :

- ✅ `notification.mp3` - Son court pour les rappels quotidiens
- ✅ `celebration.mp3` - Son joyeux pour les milestones (7, 21, 30, 100 jours)

## Recommandations

### Caractéristiques techniques :
- **Format** : MP3 (meilleure compatibilité navigateur)
- **Durée** :
  - notification.mp3 : 0.5-1 seconde
  - celebration.mp3 : 1-3 secondes
- **Taille** : < 100 Ko par fichier (pour performance)
- **Volume** : Normalisé, pas trop fort

## Sources de sons gratuits

### Sites recommandés (CC0 / Domaine public) :

1. **[Freesound.org](https://freesound.org/)** ⭐
   - Recherchez : "notification sound", "success sound", "achievement"
   - Licence : Vérifiez CC0 ou CC-BY
   - Excellent choix de qualité

2. **[Mixkit](https://mixkit.co/free-sound-effects/)** ⭐
   - Catégorie : "Notification Sounds"
   - 100% gratuit pour usage commercial
   - Sons courts et optimisés

3. **[Zapsplat](https://www.zapsplat.com/)**
   - Recherchez : "ui notification", "positive sound"
   - Inscription gratuite requise
   - Large bibliothèque

4. **[NotificationSounds.com](https://notificationsounds.com/)**
   - Spécialisé dans les sons de notification
   - Téléchargement direct en MP3
   - Gratuit pour usage personnel

5. **[SoundBible](https://soundbible.com/)**
   - Recherchez : "ding", "chime", "success"
   - Domaine public disponible

### Suggestions de recherche :

Pour **notification.mp3** :
- "subtle notification"
- "soft ping"
- "gentle chime"
- "light bell"
- "minimal alert"

Pour **celebration.mp3** :
- "success sound"
- "achievement unlock"
- "positive chime"
- "victory sound"
- "level up"
- "confetti sound"

## Génération de sons avec Web Audio API

Si vous préférez générer les sons programmatiquement, ouvrez `generate-sounds.html` dans votre navigateur (fichier à créer).

## Conversion de formats

Si vous avez des fichiers WAV, OGG, ou autres :

### En ligne :
- [CloudConvert](https://cloudconvert.com/)
- [Online Audio Converter](https://online-audio-converter.com/)

### Ligne de commande (FFmpeg) :
```bash
# Installer FFmpeg
# Windows : choco install ffmpeg
# Mac : brew install ffmpeg
# Linux : sudo apt install ffmpeg

# Convertir en MP3
ffmpeg -i input.wav -b:a 128k notification.mp3
ffmpeg -i input.wav -b:a 128k celebration.mp3

# Normaliser le volume
ffmpeg -i input.wav -af loudnorm notification.mp3
```

## Alternative : Sons générés en JavaScript

Si vous ne trouvez pas de sons adaptés, le fichier `js/notifications.js` contient des fonctions pour générer des sons simples avec l'API Web Audio :

```javascript
// Son de notification simple (déjà dans le code)
playSound() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.frequency.value = 800;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.5);
}
```

## Test des sons

Pour tester vos sons une fois ajoutés :

1. Ouvrez `index.html` dans votre navigateur
2. Ouvrez la console (F12)
3. Tapez : `Notifications.playSound()` ou `Notifications.playCelebrationSound()`

## Licences

⚠️ **Important** : Assurez-vous d'utiliser des sons avec des licences appropriées :
- **CC0** (Domaine public) : ✅ Utilisation libre sans attribution
- **CC-BY** : ✅ OK avec attribution de l'auteur
- **Usage personnel seulement** : ⚠️ Vérifiez si approprié pour votre usage

## Notes

- Les sons sont optionnels - l'application fonctionne sans
- Les utilisateurs peuvent désactiver les sons dans les paramètres
- Le service worker ne met pas en cache les sons pour réduire la taille
- Format alternatif supporté : OGG (pour Firefox)

## Taille actuelle du dossier

Une fois les sons ajoutés, le dossier devrait peser ~50-200 Ko au total.
