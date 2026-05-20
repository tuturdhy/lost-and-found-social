# Lost & Found — Frontend React

Interface React moderne et colorée pour l'API Lost & Found.

## Démarrage rapide

```bash
cd frontend
npm install
npm run dev
```

L'application sera disponible sur **http://localhost:3000**

> Le backend Spring Boot doit tourner sur `localhost:8080`

## Stack

- **React 18** + **Vite**
- **Tailwind CSS** (thème custom violet/orange)
- **React Router v6**
- **Axios** (avec intercepteur JWT)
- **@stomp/stompjs + SockJS** (chat temps réel)
- **react-hot-toast** (notifications)
- **lucide-react** (icônes)
- **date-fns** (formatage des dates)

## Pages

| Route | Description |
|---|---|
| `/login` | Connexion |
| `/register` | Inscription |
| `/` | Liste des annonces avec filtres |
| `/publish` | Publier un objet perdu/trouvé |
| `/items/:id` | Détail d'une annonce |
| `/chat` | Messagerie en temps réel |
| `/profile` | Mon profil & mes annonces |
