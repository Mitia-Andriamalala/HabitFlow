# 🎨 Icônes PWA - HabitFlow

## Génération des icônes

Pour générer les icônes PWA nécessaires, suivez ces étapes :

### Méthode 1 : Générateur HTML (Recommandée)

1. Ouvrez le fichier `generate-icons.html` dans votre navigateur
2. Cliquez sur "Télécharger toutes les icônes"
3. Placez les fichiers téléchargés dans ce dossier (`assets/icons/`)

### Méthode 2 : Conversion manuelle du SVG

Utilisez le fichier `icon.svg` et convertissez-le aux tailles suivantes :

- **icon-512.png** : 512 × 512 pixels
- **icon-192.png** : 192 × 192 pixels
- **favicon.png** : 32 × 32 pixels (ou 16×16)

#### Outils de conversion recommandés :

**En ligne :**
- [CloudConvert](https://cloudconvert.com/svg-to-png)
- [SVG to PNG Converter](https://svgtopng.com/)
- [Online-Convert](https://www.online-convert.com/)

**Logiciels :**
- [Inkscape](https://inkscape.org/) (gratuit)
- Adobe Illustrator
- Figma

### Méthode 3 : Ligne de commande (avec ImageMagick)

```bash
# Installer ImageMagick si nécessaire
# Windows : choco install imagemagick
# Mac : brew install imagemagick
# Linux : sudo apt install imagemagick

# Générer les icônes
magick icon.svg -resize 512x512 icon-512.png
magick icon.svg -resize 192x192 icon-192.png
magick icon.svg -resize 32x32 favicon.png
```

## Fichiers requis

Une fois générées, ce dossier doit contenir :

- ✅ `icon-512.png` - Icône haute résolution (512×512)
- ✅ `icon-192.png` - Icône standard (192×192)
- ✅ `favicon.png` - Favicon (32×32 ou 16×16)
- 📄 `icon.svg` - Fichier source SVG
- 🛠️ `generate-icons.html` - Générateur d'icônes
- 📖 `README.md` - Ce fichier

## Vérification

Pour vérifier que vos icônes fonctionnent :

1. Ouvrez `index.html` dans un navigateur
2. Ouvrez les DevTools (F12)
3. Allez dans l'onglet "Application" (Chrome) ou "Stockage" (Firefox)
4. Vérifiez la section "Manifest" - les icônes doivent s'afficher

## Notes

- Les icônes utilisent le gradient officiel de HabitFlow (#6366f1 → #a855f7)
- Le logo est une étoile blanche centrée
- Les coins sont arrondis (rayon de 100px sur 512×512)
- Format recommandé : PNG avec transparence
