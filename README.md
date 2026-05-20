# 🔍 Lost & Found Social — Spring Boot API

API REST complète pour l'application Lost & Found Social.
Même concept que l'app Flutter, mais côté backend Java.

---

## 🛠️ Stack Technique

| Technologie | Version | Rôle |
|---|---|---|
| Java | 17 | Langage |
| Spring Boot | 3.2.0 | Framework |
| Spring Security | 6 | Sécurité |
| JWT (JJWT) | 0.11.5 | Authentification |
| Spring Data JPA | - | ORM |
| MySQL | 8+ | Base de données |
| WebSocket (STOMP) | - | Chat temps réel |
| Lombok | - | Réduction boilerplate |
| Maven | - | Build |

---

## 🚀 Installation & Lancement

### Prérequis
- Java 17+
- MySQL 8+
- Maven 3.8+

### Étape 1 — Créer la base de données MySQL

```sql
CREATE DATABASE lost_and_found_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Étape 2 — Configurer `application.properties`

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/lost_and_found_db
spring.datasource.username=TON_USERNAME
spring.datasource.password=TON_PASSWORD
```

### Étape 3 — Lancer l'application

```bash
mvn spring-boot:run
```

L'API sera disponible sur : **http://localhost:8080**

Les tables MySQL sont créées **automatiquement** au premier lancement (`ddl-auto=update`).

---

## 📁 Structure du projet

```
src/main/java/com/lostandfound/
│
├── LostAndFoundApplication.java     # Point d'entrée
│
├── config/
│   ├── SecurityConfig.java          # Spring Security + JWT + CORS
│   ├── WebSocketConfig.java         # WebSocket STOMP
│   └── FileUploadConfig.java        # Servir les photos uploadées
│
├── entity/
│   ├── User.java                    # Table users
│   ├── Item.java                    # Table items
│   ├── Match.java                   # Table matches
│   ├── Message.java                 # Table messages
│   └── Notification.java            # Table notifications
│
├── repository/
│   ├── UserRepository.java
│   ├── ItemRepository.java          # Avec requêtes GPS custom
│   ├── MatchRepository.java
│   ├── MessageRepository.java
│   └── NotificationRepository.java
│
├── service/
│   ├── AuthService.java             # Register / Login
│   ├── ItemService.java             # CRUD + upload photo + trigger matching
│   ├── MatchingService.java         # Algorithme de matching (score)
│   ├── NotificationService.java     # Notifications in-app
│   └── ChatService.java             # Messagerie + WebSocket
│
├── controller/
│   ├── AuthController.java          # /api/auth/**
│   ├── ItemController.java          # /api/items/**
│   ├── ChatController.java          # /api/chat/**
│   ├── NotificationController.java  # /api/notifications/**
│   └── UserController.java          # /api/users/**
│
├── dto/
│   ├── request/
│   │   ├── RegisterRequest.java
│   │   ├── LoginRequest.java
│   │   ├── ItemRequest.java
│   │   └── MessageRequest.java
│   └── response/
│       ├── ApiResponse.java         # Wrapper générique
│       ├── AuthResponse.java
│       ├── ItemResponse.java
│       ├── MatchResponse.java
│       ├── MessageResponse.java
│       ├── NotificationResponse.java
│       └── UserResponse.java
│
├── security/
│   ├── JwtUtil.java                 # Génération + validation JWT
│   └── JwtAuthFilter.java           # Filtre HTTP JWT
│
└── exception/
    └── GlobalExceptionHandler.java  # Gestion globale des erreurs
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
| GET | `/api/items/nearby?lat=18.07&lng=-15.95&radius=5` | Objets proches | ✅ |
| GET | `/api/items/user/me` | Mes objets | ✅ |
| PATCH | `/api/items/{id}/resolve` | Marquer comme résolu | ✅ |

**Publier un objet (multipart/form-data) :**
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

**Réponse (avec matchs automatiques) :**
```json
{
  "success": true,
  "data": {
    "item": { ... },
    "matches": [
      {
        "id": 1,
        "matchedItem": { ... },
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

---

### 👤 Users — `/api/users`

| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/users/me` | Mon profil | ✅ |
| GET | `/api/users/{id}` | Profil public | ✅ |

---

## 🔌 WebSocket (Chat temps réel)

**Connexion :**
```javascript
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, () => {
  // S'abonner aux messages privés
  stompClient.subscribe('/user/queue/messages', (msg) => {
    const message = JSON.parse(msg.body);
    console.log('Nouveau message:', message);
  });
});
```

---

## 🗄️ Schéma Base de données

```sql
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

Quand un objet est publié → le système cherche automatiquement des correspondances :

```
Même catégorie  → +35 points
Même couleur    → +25 points
Keyword commun  → +8 points chacun (max 40)
Distance < 2km  → +10 points
Titre similaire → +5 points
─────────────────────────────
Total max       → 100 points

Score >= 80 → "Très forte"
Score >= 60 → "Forte"
Score >= 40 → "Possible"
Score < 40  → "Faible" (ignoré)
```

---

## 🧪 Tester avec Postman

1. Importe la collection Postman (crée manuellement les requêtes)
2. Register → récupère le token
3. Ajoute le token dans **Authorization → Bearer Token**
4. Teste les endpoints

---

**Développé avec ❤️ Spring Boot + MySQL + JWT**
