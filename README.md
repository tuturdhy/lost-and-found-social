# 🔍 Lost & Found Social — Plateforme complète

> Plateforme web/mobile de mise en relation entre personnes ayant perdu ou trouvé un objet.
> Backend Spring Boot · Frontend React · Matching intelligent · Chat temps réel

🔗 **Repository GitHub :** [https://github.com/tuturdhy/lost-and-found-social](https://github.com/tuturdhy/lost-and-found-social)

---

## 🛠️ Stack Technique

### Backend
| Technologie | Version | Rôle |
|---|---|---|
| Java | 17 | Langage |
| Spring Boot | 3.2.0 | Framework |
| Spring Security | 6 | Sécurité |
| JWT (JJWT) | 0.11.5 | Authentification |
| Spring Data JPA | — | ORM |
| MySQL | 8+ | Base de données |
| WebSocket (STOMP) | — | Chat temps réel |
| Lombok | — | Réduction boilerplate |
| Maven | — | Build |

### Frontend
| Technologie | Version | Rôle |
|---|---|---|
| React | 18+ | Framework UI |
| Node.js | 18+ | Runtime |
| Vite | — | Build & dev server |
| React Router | — | Navigation SPA |
| Context API | — | Gestion d'état global |
| Axios | — | Appels HTTP vers l'API |

---

## 🚀 Installation & Lancement

### Prérequis

- Java 17+
- MySQL 8+
- Maven 3.8+
- Node.js 18+

---

### Backend

#### Étape 1 — Créer la base de données MySQL

```sql
CREATE DATABASE lost_and_found_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Étape 2 — Importer le schéma SQL

```bash
mysql -u root -p lost_and_found_db < lost_and_found_db.sql
```

> Les tables sont également créées automatiquement au premier lancement (`ddl-auto=update`), mais l'import SQL est recommandé pour un environnement de production.

#### Étape 3 — Configurer `application.properties`

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/lost_and_found_db
spring.datasource.username=TON_USERNAME
spring.datasource.password=TON_PASSWORD
```

#### Étape 4 — Lancer l'API

```bash
mvn spring-boot:run
```

L'API sera disponible sur : **http://localhost:8080**

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

L'interface sera disponible sur : **http://localhost:5173**

---

## 📁 Structure du projet

### Frontend

```
frontend/
├── src/
│   ├── api/
│   │   └── axios.js                   # Instance Axios + intercepteurs JWT
│   ├── components/
│   │   ├── ItemCard.jsx               # Carte d'affichage d'un objet
│   │   └── Navbar.jsx                 # Barre de navigation + badges dynamiques
│   ├── context/
│   │   └── AuthContext.jsx            # Contexte Auth global (token, user)
│   ├── pages/
│   │   ├── Chat.jsx                   # Interface de messagerie
│   │   ├── Home.jsx                   # Liste des objets + filtres
│   │   ├── ItemDetail.jsx             # Détail d'un objet + matchs
│   │   ├── Login.jsx                  # Connexion
│   │   ├── Profile.jsx                # Profil utilisateur
│   │   ├── PublishItem.jsx            # Publier un objet perdu/trouvé
│   │   └── Register.jsx              # Inscription
│   ├── App.jsx                        # Routes React Router
│   ├── main.jsx                       # Point d'entrée React
│   └── index.css                      # Styles globaux (Tailwind)
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

### Backend

```
src/main/java/com/lostandfound/
│
├── LostAndFoundApplication.java       # Point d'entrée
│
├── config/
│   ├── WebConfig.java                 # CORS et ressources statiques
│   ├── WebSocketConfig.java           # WebSocket STOMP
│   └── FileUploadConfig.java          # Gestion upload images
│
├── entity/
│   ├── User.java                      # Table users
│   ├── Item.java                      # Table items
│   ├── Match.java                     # Table matches
│   ├── Message.java                   # Table messages
│   └── Notification.java              # Table notifications
│
├── repository/
│   ├── UserRepository.java
│   ├── ItemRepository.java            # Avec requêtes GPS custom
│   ├── MatchRepository.java
│   ├── MessageRepository.java
│   └── NotificationRepository.java
│
├── service/
│   ├── AuthService.java               # Register / Login
│   ├── ItemService.java               # Publication, upload images, matching auto, objets résolus
│   ├── MatchingService.java           # Algorithme de matching (score)
│   ├── NotificationService.java       # Notifications in-app
│   └── ChatService.java               # Messagerie + WebSocket
│
├── controller/
│   ├── AuthController.java            # /api/auth/**
│   ├── ItemController.java            # /api/items/**
│   ├── ChatController.java            # /api/chat/**
│   ├── NotificationController.java    # /api/notifications/**
│   └── UserController.java            # /api/users/**
│
├── dto/
│   ├── request/
│   │   ├── RegisterRequest.java
│   │   ├── LoginRequest.java
│   │   ├── ItemRequest.java
│   │   └── MessageRequest.java
│   └── response/
│       ├── ApiResponse.java           # Wrapper générique
│       ├── AuthResponse.java
│       ├── ItemResponse.java
│       ├── MatchResponse.java
│       ├── MessageResponse.java
│       ├── NotificationResponse.java
│       └── UserResponse.java
│
├── security/
│   ├── SecurityConfig.java            # Configuration Spring Security
│   ├── JwtUtil.java                   # Génération + validation JWT
│   ├── JwtAuthFilter.java             # Filtre HTTP JWT
│   └── CustomUserDetailsService.java  # Chargement utilisateur depuis la BDD
│
└── exception/
    └── GlobalExceptionHandler.java    # Gestion globale des erreurs
```

---

## 🔐 Authentification JWT

Toutes les routes (sauf `/api/auth/**`) nécessitent un header :

```
Authorization: Bearer <token>
```

---

## 📡 API Endpoints

### 🔐 Auth — `/api/auth`

| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Créer un compte | ❌ |
| POST | `/api/auth/login` | Se connecter | ❌ |

**Register :**

```json
POST /api/auth/register
{
  "name": "Ahmed",
  "email": "ahmed@email.com",
  "password": "password123"
}
```

**Réponse :**

```json
{
  "success": true,
  "message": "Compte créé avec succès",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "type": "Bearer",
    "userId": 1,
    "name": "Ahmed",
    "email": "ahmed@email.com"
  }
}
```

---

### 📦 Items — `/api/items`

| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/items` | Publier un objet (multipart) | ✅ |
| GET | `/api/items` | Tous les objets actifs | ✅ |
| GET | `/api/items?type=LOST` | Filtrer par type | ✅ |
| GET | `/api/items/{id}` | Détail d'un objet | ✅ |
| GET | `/api/items/search?q=sac+noir` | Recherche intelligente | ❌ |
| GET | `/api/items/nearby?lat=18.07&lng=-15.95&radius=5` | Objets proches (GPS) | ✅ |
| GET | `/api/items/user/me` | Mes objets | ✅ |
| PATCH | `/api/items/{id}/resolve` | Marquer comme résolu | ✅ |

**Publier un objet (`multipart/form-data`) :**

```
POST /api/items
Content-Type: multipart/form-data

item: {
  "type": "LOST",
  "title": "Sac à dos noir Nike",
  "description": "Perdu près du marché central",
  "category": "sac",
  "keywords": ["noir", "Nike", "tissu", "sport"],
  "color": "noir",
  "latitude": 18.0735,
  "longitude": -15.9582,
  "address": "Marché central, Nouakchott"
}
photo: [fichier image]
```

> ⚠️ Les keywords sont saisis dans le frontend sous forme de texte séparé par des virgules : `noir,Nike,tissu,sport` — puis convertis automatiquement en tableau JSON par le backend.

**Réponse (avec matchs automatiques) :**

```json
{
  "success": true,
  "data": {
    "item": { "..." : "..." },
    "matches": [
      {
        "id": 1,
        "matchedItem": { "..." : "..." },
        "similarityScore": 75,
        "matchedKeywords": ["noir", "Nike"],
        "scoreLabel": "Forte"
      }
    ]
  }
}
```

---

### 💬 Chat — `/api/chat`

| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/chat/send` | Envoyer un message | ✅ |
| GET | `/api/chat` | Toutes mes conversations | ✅ |
| GET | `/api/chat/{otherUserId}` | Messages d'une conversation | ✅ |
| PATCH | `/api/chat/{chatId}/read` | Marquer comme lu | ✅ |

**Envoyer un message :**

```json
POST /api/chat/send
{
  "receiverId": 2,
  "itemId": 5,
  "content": "Bonjour, j'ai trouvé votre sac !"
}
```

---

### 🔔 Notifications — `/api/notifications`

| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/notifications` | Mes notifications | ✅ |
| GET | `/api/notifications/unread-count` | Nombre de non lues | ✅ |
| PATCH | `/api/notifications/{id}/read` | Marquer comme lue | ✅ |
| PATCH | `/api/notifications/read-all` | Tout marquer comme lu | ✅ |

> La navbar affiche en temps réel les compteurs de messages non lus et de notifications non lues.

---

### 👤 Users — `/api/users`

| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/users/me` | Mon profil | ✅ |
| GET | `/api/users/{id}` | Profil public | ✅ |

---

## 🔌 WebSocket — Chat temps réel

```javascript
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, () => {
  stompClient.subscribe('/user/queue/messages', (msg) => {
    const message = JSON.parse(msg.body);
    console.log('Nouveau message:', message);
  });
});
```

---

## 🗄️ Schéma Base de données

```
users         → id, name, email, password, avatar_url, reputation_score, ...
items         → id, user_id, type (LOST/FOUND), title, description, photo_url,
                category, keywords (JSON), color, latitude, longitude, address,
                status (ACTIVE/RESOLVED), created_at
matches       → id, item_id, matched_item_id, lost_user_id, found_user_id,
                similarity_score, matched_keywords, notified, created_at
messages      → id, sender_id, receiver_id, item_id, chat_id, content,
                is_read, created_at
notifications → id, user_id, title, body, type, item_id, is_read, created_at
```

---

## 🤖 Algorithme de Matching

Lors de la publication d'un objet, le système recherche automatiquement des correspondances :

```
Même catégorie  → +35 points
Même couleur    → +25 points
Keyword commun  → +8 points chacun (max 40)
Distance < 2km  → +10 points
Titre similaire → +5 points
─────────────────────────────
Total max       → 100 points

Score >= 80  →  "Très forte"
Score >= 60  →  "Forte"
Score >= 40  →  "Possible"
Score < 40   →  ignoré
```

**Règles d'exclusion (faux matchs évités) :**
- Les objets déjà marqués comme **résolus** sont ignorés
- Les objets appartenant au **même utilisateur** sont exclus
- Les objets de **catégories différentes** ne sont pas matchés
- Plusieurs mots-clés communs sont nécessaires pour déclencher un match significatif

---

## 📂 Gestion des uploads

Les images uploadées par les utilisateurs sont stockées dans le dossier `uploads/`.

Ce dossier est **ignoré par Git** via `.gitignore` afin d'éviter de pousser des fichiers binaires dans le dépôt :

```
# .gitignore
uploads/
```

---

## 🗃️ Export SQL

Le fichier `lost_and_found_db.sql` permet de recréer automatiquement la base de données MySQL avec toutes ses tables et relations :

```bash
mysql -u root -p lost_and_found_db < lost_and_found_db.sql
```

---

## ✅ Fonctionnalités validées

| Fonctionnalité | Statut |
|---|---|
| JWT Authentication | ✅ |
| Matching intelligent (score + exclusions) | ✅ |
| Chat temps réel (WebSocket STOMP) | ✅ |
| Notifications dynamiques avec badges | ✅ |
| Upload & affichage d'images | ✅ |
| Profils utilisateurs | ✅ |
| Géolocalisation (objets proches GPS) | ✅ |
| Marquage d'objets comme résolus | ✅ |

---

## 🧪 Tester avec Postman

1. Créer les requêtes manuellement dans Postman
2. Appeler `POST /api/auth/register` → récupérer le `token`
3. Dans chaque requête protégée : onglet **Authorization** → type **Bearer Token** → coller le token
4. Tester les endpoints dans l'ordre : auth → items → chat → notifications

---

## 📜 Bonnes pratiques Git

```bash
# Ne jamais committer les fichiers sensibles
uploads/
*.env
application-prod.properties

# Toujours travailler sur une branche feature
git checkout -b feature/mon-ajout
git push origin feature/mon-ajout
```

---

Développé avec ❤️ — Spring Boot · React · MySQL · JWT · WebSocket · Vite
