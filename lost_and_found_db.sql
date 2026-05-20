-- MySQL dump 10.13  Distrib 9.6.0, for macos26.3 (arm64)
--
-- Host: localhost    Database: lost_and_found_db
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'aca0f69c-3b50-11f1-b96c-2eafe671823b:1-186';

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `category` varchar(255) NOT NULL,
  `color` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `keywords` text,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `status` enum('ACTIVE','RESOLVED') DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `type` enum('LOST','FOUND') NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKft8pmhndq1kntvyfaqcybhxvx` (`user_id`),
  CONSTRAINT `FKft8pmhndq1kntvyfaqcybhxvx` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` VALUES (1,'route ndb','téléphone','noir','2026-05-20 01:09:27.031680','13 pro','[\"iphone\",\"apple\",\"noir\"]',18.112919,-15.999416,'/uploads/items/2/4c3689be-6737-4fd6-8ade-f9d9d372e75b_iphone-12-64-go-noir-reconditionne.jpg','ACTIVE','iPhone noir','LOST',2),(2,'route ndb','téléphone','noir','2026-05-20 01:12:15.522006','13 pro','[\"iphone\",\"apple\",\"noir\"]',18.111742,-15.999665,'/uploads/items/1/58722880-3844-44c6-9286-a94741a58637_iphone-12-64-go-noir-reconditionne.jpg','ACTIVE','iPhone Apple noir','FOUND',1),(3,'route ndb','sac','noir','2026-05-20 01:14:41.380396','sac','[\"sac\",\"adidas\",\"noir\"]',18.112726,-15.999534,'/uploads/items/2/28146f45-8058-4613-b3d0-c17c090a53a0_test.jpg','ACTIVE','Sac noir Adidas','LOST',2),(4,'route ndb','sac','noir','2026-05-20 01:15:39.650003','sac','[\"sac\",\"adidas\",\"noir\"]',18.112627,-15.999456,'/uploads/items/1/5347ab5c-e09d-4599-a128-890945633503_test.jpg','ACTIVE','Sac noir Adidas','FOUND',1);
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `matches`
--

DROP TABLE IF EXISTS `matches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matches` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `found_user_id` bigint DEFAULT NULL,
  `lost_user_id` bigint DEFAULT NULL,
  `matched_item_id` bigint DEFAULT NULL,
  `matched_keywords` text,
  `notified` bit(1) DEFAULT NULL,
  `similarity_score` int DEFAULT NULL,
  `item_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKoy8kpo5dq3jdsl81m5u4jrggu` (`item_id`),
  CONSTRAINT `FKoy8kpo5dq3jdsl81m5u4jrggu` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matches`
--

LOCK TABLES `matches` WRITE;
/*!40000 ALTER TABLE `matches` DISABLE KEYS */;
INSERT INTO `matches` VALUES (1,'2026-05-20 01:12:15.569238',1,2,1,'[\"iphone\",\"apple\",\"noir\"]',_binary '\0',99,2),(2,'2026-05-20 01:15:39.662364',1,2,3,'[\"sac\",\"adidas\",\"noir\"]',_binary '\0',99,4);
/*!40000 ALTER TABLE `matches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `chat_id` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `is_read` bit(1) DEFAULT NULL,
  `item_id` bigint DEFAULT NULL,
  `receiver_id` bigint NOT NULL,
  `sender_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,'1_2','hi','2026-05-19 21:56:16.169307',_binary '',1,2,1),(2,'1_2','bonjour','2026-05-19 22:06:58.001754',_binary '',0,1,2),(3,'1_2','est ce que tu as perdue un sac?','2026-05-19 22:28:56.220639',_binary '',0,1,2),(4,'1_2','oui','2026-05-19 22:40:36.625318',_binary '',0,2,1),(5,'1_2','je suis la','2026-05-20 01:16:16.201039',_binary '\0',0,2,1);
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `body` text NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `is_read` bit(1) DEFAULT NULL,
  `item_id` bigint DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK9y21adhxn0ayjhfocscqox7bh` (`user_id`),
  CONSTRAINT `FK9y21adhxn0ayjhfocscqox7bh` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'Ton objet \"iPhone Apple noir\" a une correspondance à 99% — Vérifie vite !','2026-05-20 01:12:15.591491',_binary '',1,'🔥 Correspondance trouvée !','MATCH',1),(2,'Ton objet \"Sac noir Adidas\" a une correspondance à 99% — Vérifie vite !','2026-05-20 01:15:39.667890',_binary '',3,'🔥 Correspondance trouvée !','MATCH',1),(3,'je suis la','2026-05-20 01:16:16.217954',_binary '\0',NULL,'💬 Nouveau message de toutou','MESSAGE',2);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `avatar_url` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `items_published` int DEFAULT NULL,
  `items_resolved` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `reputation_score` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,'2026-05-19 19:57:00.226558','tuturdhy@gmail.com',2,0,'toutou','$2a$10$XlfBO.4r9JxhQo51HpJWy.KtFhUSP6GkBRBgvgAjK/f..B6gT990G',0),(2,NULL,'2026-05-19 20:44:16.553589','khadi@gmail.com',2,0,'khadi','$2a$10$noeRlpzwunwUBqV/Bi8sseBMfc/MHxRWsGfZ3jKm30d9as1Fuz4MW',0),(3,NULL,'2026-05-19 21:16:00.866605','abdi@gmail.com',0,0,'abdi','$2a$10$uztxQUCAnPYFKQq/2Avix.zXsNqJQgJr69doWwhgVcFTnpTKDTsrq',0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-20 13:55:51
