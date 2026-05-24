-- ============================================================
--  BASE DE DONNÉES : Boutique Pauline
--  Projet : E-commerce mode (React + PHP + MySQL)
--  Encodage : UTF-8
-- ============================================================

CREATE DATABASE IF NOT EXISTS pauline_shop
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE pauline_shop;

-- ============================================================
-- TABLE : categories
-- ============================================================
CREATE TABLE categories (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom         VARCHAR(100)  NOT NULL,
    slug        VARCHAR(100)  NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (nom, slug, description) VALUES
('Chaussures',   'chaussures',   'Sandales, escarpins et modèles tendance'),
('Vêtements',    'vetements',    'Boubous, robes et tenues traditionnelles'),
('Accessoires',  'accessoires',  'Sacs, pochettes et maroquinerie');

-- ============================================================
-- TABLE : produits
-- ============================================================
CREATE TABLE produits (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom             VARCHAR(255)           NOT NULL,
    description     TEXT,
    prix            DECIMAL(10,2) UNSIGNED NOT NULL,
    stock           INT UNSIGNED DEFAULT 0,
    categorie_id    INT UNSIGNED NOT NULL,
    image_principale VARCHAR(300),
    note_moyenne    DECIMAL(3,2) DEFAULT 0.00,
    nombre_avis     INT UNSIGNED DEFAULT 0,
    actif           TINYINT(1) DEFAULT 1,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (categorie_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- ============================================================
-- TABLE : produit_images  (galerie / carousel)
-- ============================================================
CREATE TABLE produit_images (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    produit_id  INT UNSIGNED NOT NULL,
    chemin      VARCHAR(300) NOT NULL,
    ordre       TINYINT UNSIGNED DEFAULT 0,

    FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
);

-- ============================================================
-- Insertion des produits (depuis products.js)
-- ============================================================

-- CHAUSSURES
INSERT INTO produits (nom, description, prix, stock, categorie_id, image_principale, note_moyenne, nombre_avis) VALUES
('Sandales AJ-175',
 'Élégantes sandales pour fillettes avec fleurs en strass et petit talon, idéales pour les cérémonies.',
 2500, 30, 1, '/images/products/chaus/chaussure.jpeg', 4.6, 214),

('Escarpins Dorés Soirée',
 'Escarpins à talon aiguille dorés, parfaits pour vos soirées et mariages. Semelle confortable et bride cheville réglable.',
 3500, 20, 1, '/images/products/chaus/mode6.jpeg', 4.7, 189),

('Sandales Wisteria (JN-2573)',
 'Des claquettes élégantes avec deux brides croisées sur le dessus, agrémentées de petites boucles dorées décoratives.',
 1300, 50, 1, '/images/products/chaus/chaussure modele1.jpeg', 4.8, 302),

('Sandales Bijoux (F2420)',
 'Des sandales à talons bas et transparents (effet cristal). La bride avant est composée de plusieurs cordons entrelacés recouverts de strass brillants.',
 1500, 40, 1, '/images/products/chaus/chaussure modele3.jpeg', 4.5, 421),

('Sandales à découpe "H" (B2980)',
 'La semelle est agrémentée d\'une couture apparente contrastée tout autour du bord intérieur.',
 1500, 35, 1, '/images/products/chaus/chaussure1.jpeg', 4.3, 678),

('Sandale à bandeau Burberry',
 'Des claquettes décontractées avec une semelle épaisse et colorée.',
 1500, 25, 1, '/images/products/chaus/chaussure2.jpeg', 4.3, 678);

-- VÊTEMENTS
INSERT INTO produits (nom, description, prix, stock, categorie_id, image_principale, note_moyenne, nombre_avis) VALUES
('Modèle D.NO.95 (Style Paisley et Mandala)',
 'Un design très détaillé avec un grand médaillon central en forme de goutte (paisley) entouré de motifs circulaires.',
 2000, 15, 2, '/images/products/asus/Boubous avec foulard.jpeg', 4.9, 543),

('Modèle D.NO.111 (Style Royal et Rayonné)',
 'Ce boubou se distingue par un motif central majestueux qui ressemble à un chandelier ou une fleur de lys dorée.',
 2000, 12, 2, '/images/products/asus/Boubous7 avec foulard.jpeg', 4.8, 312),

('Modèle D.NO.97 (Style Géométrique Dashiki)',
 'Ce modèle présente une structure symétrique avec une grande croix centrale ornée de motifs circulaires et étoilés.',
 2000, 18, 2, '/images/products/asus/Boubous1 avec foulard.jpeg', 4.7, 198),

('Modèle D.NO.120 (Style Floral Baroque)',
 'Un boubou élégant mêlant des médaillons circulaires (type rosace) et des motifs floraux de lys.',
 2000, 10, 2, '/images/products/asus/Boubous2 avec foulard.jpeg', 4.6, 267),

('Modèle D.NO.118 (Style Abstrait et Lignes)',
 'L\'encolure est particulièrement travaillée avec une large broderie noire et dorée qui descend sur le buste.',
 2000, 8, 2, '/images/products/asus/Boubous6 avec foulard.jpeg', 4.9, 156),

('Modèle D.NO.88 (Style Arabesque Épuré)',
 'Un design sobre et graphique composé de rangées de petits motifs circulaires et de feuilles disposées en arcs.',
 2000, 14, 2, '/images/products/asus/Boubous3 avec foulard.jpeg', 4.9, 156);

-- ACCESSOIRES (SACS)
INSERT INTO produits (nom, description, prix, stock, categorie_id, image_principale, note_moyenne, nombre_avis) VALUES
('Le Dôme Matelassé',
 'Duo chic de sac à main géométrique et sa pochette assortie.',
 3000, 22, 3, '/images/products/buds/mode1.jpg', 4.8, 856),

('Le Tote',
 'Sac shopping spacieux à motifs géométriques avec anses contrastées. Livré avec une pochette de rangement interne.',
 4000, 18, 3, '/images/products/buds/sac chic.jpeg', 4.7, 423),

('Le Camélia Prestige',
 'Sac blanc matelassé avec motifs de fleurs en relief, bandoulière en chaîne dorée et foulard en soie décoratif.',
 2000, 30, 3, '/images/products/buds/sac modele2.jpeg', 4.6, 589),

('Tote Bag Wax Imprimé',
 'Grand tote bag en tissu wax avec doublure intérieure. Robuste, spacieux et coloré, idéal pour le marché ou le bureau.',
 4000, 25, 3, '/images/products/buds/sac_chic1.jpeg', 4.5, 712),

('Le Grand Cabas',
 'Sac fourre-tout haute capacité avec imprimés monogrammes variés et un élégant foulard noué à la anse.',
 2500, 16, 3, '/images/products/buds/sac5.jpg', 4.9, 334),

('Le Cabas Monogramme',
 'Grand sac trapèze bicolore mariant cuir uni et motifs imprimés. Accompagné d\'une pochette minimaliste.',
 4000, 12, 3, '/images/products/buds/mode3.jpg', 4.9, 334);

-- Images galerie (exemples pour quelques produits)
INSERT INTO produit_images (produit_id, chemin, ordre) VALUES
(1, '/images/products/chaus/chaussure.jpeg', 1),
(2, '/images/products/chaus/mode6.jpeg', 1),
(2, '/images/products/chaus/mode.jpeg', 2),
(15, '/images/products/buds/reed.jpeg', 1),
(15, '/images/products/buds/reed1.jpeg', 2),
(15, '/images/products/buds/reed2.jpeg', 3),
(15, '/images/products/buds/sac_3.jpeg', 4);

-- ============================================================
-- TABLE : utilisateurs
-- ============================================================
CREATE TABLE utilisateurs (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom             VARCHAR(150) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe    VARCHAR(255) NOT NULL,          -- bcrypt
    telephone       VARCHAR(20),
    role            ENUM('client','admin') DEFAULT 'client',
    actif           TINYINT(1) DEFAULT 1,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Exemple admin (mot de passe : Admin@1234)
INSERT INTO utilisateurs (nom, email, mot_de_passe, role) VALUES
('Admin Pauline', 'admin@pauline.com',
 '$2y$12$exampleHashedPasswordHere', 'admin');

-- ============================================================
-- TABLE : adresses_livraison
-- ============================================================
CREATE TABLE adresses_livraison (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id  INT UNSIGNED NOT NULL,
    prenom          VARCHAR(100) NOT NULL,
    nom             VARCHAR(100) NOT NULL,
    telephone       VARCHAR(20),
    adresse         VARCHAR(300) NOT NULL,
    ville           VARCHAR(100) NOT NULL,
    code_postal     VARCHAR(20),
    pays            VARCHAR(100) DEFAULT 'Togo',
    par_defaut      TINYINT(1) DEFAULT 0,

    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE : commandes
-- ============================================================
CREATE TABLE commandes (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id      INT UNSIGNED,               -- NULL si commande invité
    numero_commande     VARCHAR(50) NOT NULL UNIQUE, -- ex: CMD-2024-000001
    statut              ENUM('en_attente','payee','en_cours','livree','annulee') DEFAULT 'en_attente',
    montant_total       DECIMAL(10,2) UNSIGNED NOT NULL,
    frais_livraison     DECIMAL(10,2) UNSIGNED DEFAULT 0.00,
    methode_paiement    ENUM('mobile_money','carte','livraison') NOT NULL,
    operateur_mobile    VARCHAR(50),                -- TG-TMONEY, TG-FLOOZ, etc.
    transaction_id      VARCHAR(200),               -- ID CinetPay
    adresse_livraison   JSON,                       -- snapshot de l'adresse
    note_client         TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
);

-- ============================================================
-- TABLE : commande_items  (lignes de commande)
-- ============================================================
CREATE TABLE commande_items (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    commande_id INT UNSIGNED NOT NULL,
    produit_id  INT UNSIGNED,
    nom_produit VARCHAR(255) NOT NULL,      -- snapshot (si produit supprimé plus tard)
    prix_unit   DECIMAL(10,2) UNSIGNED NOT NULL,
    quantite    SMALLINT UNSIGNED NOT NULL,
    sous_total  DECIMAL(10,2) UNSIGNED GENERATED ALWAYS AS (prix_unit * quantite) STORED,

    FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
    FOREIGN KEY (produit_id)  REFERENCES produits(id)  ON DELETE SET NULL
);

-- ============================================================
-- TABLE : wishlist
-- ============================================================
CREATE TABLE wishlist (
    utilisateur_id  INT UNSIGNED NOT NULL,
    produit_id      INT UNSIGNED NOT NULL,
    added_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (utilisateur_id, produit_id),
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (produit_id)     REFERENCES produits(id)     ON DELETE CASCADE
);

-- ============================================================
-- TABLE : avis  (reviews)
-- ============================================================
CREATE TABLE avis (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    produit_id      INT UNSIGNED NOT NULL,
    utilisateur_id  INT UNSIGNED,
    note            TINYINT UNSIGNED NOT NULL CHECK (note BETWEEN 1 AND 5),
    commentaire     TEXT,
    valide          TINYINT(1) DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (produit_id)     REFERENCES produits(id)     ON DELETE CASCADE,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
);

-- ============================================================
-- VUES UTILES
-- ============================================================

-- Vue : produits avec catégorie
CREATE OR REPLACE VIEW v_produits AS
SELECT
    p.id,
    p.nom,
    p.description,
    p.prix,
    p.stock,
    p.image_principale,
    p.note_moyenne,
    p.nombre_avis,
    p.actif,
    c.nom        AS categorie,
    c.slug       AS categorie_slug
FROM produits p
JOIN categories c ON c.id = p.categorie_id
WHERE p.actif = 1;

-- Vue : total des ventes par produit
CREATE OR REPLACE VIEW v_ventes_produits AS
SELECT
    ci.produit_id,
    ci.nom_produit,
    SUM(ci.quantite)   AS total_vendus,
    SUM(ci.sous_total) AS chiffre_affaires
FROM commande_items ci
JOIN commandes cm ON cm.id = ci.commande_id
WHERE cm.statut NOT IN ('annulee')
GROUP BY ci.produit_id, ci.nom_produit;

-- ============================================================
-- INDEX pour les performances
-- ============================================================
CREATE INDEX idx_produits_categorie ON produits(categorie_id);
CREATE INDEX idx_commandes_user     ON commandes(utilisateur_id);
CREATE INDEX idx_commandes_statut   ON commandes(statut);
CREATE INDEX idx_avis_produit       ON avis(produit_id);
