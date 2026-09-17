# ONE VIBE FEST - Plateforme Officielle 🚀

Bienvenue sur le dépôt de **ONE VIBE FEST**, l'événement multidisciplinaire de référence célébrant la musique, la créativité et l'innovation numérique à Kinshasa.

## 🌟 Vision du Projet
Cette application offre une immersion totale dans l'univers du festival. Elle permet aux visiteurs d'explorer le programme, de découvrir les artistes (Guests) et de réserver leurs accès, tandis que les organisateurs disposent d'un cockpit d'administration complet pour piloter l'événement en temps réel.

## 🛠 Stack Technique
- **Frontend** : [Next.js 15](https://nextjs.org/) (App Router, Turbopack)
- **Styling** : [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Backend** : [Firebase](https://firebase.google.com/) (Firestore, Authentication, App Hosting)
- **Médias** : [Cloudinary](https://cloudinary.com/) (Importation et optimisation dynamique d'images)
- **UI Components** : [ShadCN UI](https://ui.shadcn.com/)

## 🔐 Administration
L'accès au Cockpit Admin (`/admin`) est sécurisé et réservé à l'adresse autorisée. Il permet de modifier en temps réel :
- **Identité** : Nom, Slogan, Logo.
- **Réseaux Sociaux** : Liens Instagram, TikTok, Twitter, Facebook.
- **Programmation** : Agenda chronologique illustré.
- **Talents** : Liste dynamique des artistes et invités.
- **Médias** : Image Hero et liens vidéos/billetterie.

## 📦 Installation & Déploiement

### Développement Local
1. Cloner le dépôt :
   ```bash
   git clone https://github.com/christianrwemera7-max/onevibe-.git
   ```
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. Configurer les variables d'environnement dans un fichier `.env` (Cloudinary & Firebase).
4. Lancer le serveur :
   ```bash
   npm run dev
   ```

### Commandes Git
Pour mettre à jour le projet sur GitHub :
```bash
git add .
git commit -m "Description de vos modifications"
git push origin main
```

---
© 2027 ONE VIBE FEST • KINSHASA VIBE
