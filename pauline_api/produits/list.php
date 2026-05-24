<?php
require_once '../config/db.php';

// ─── Paramètres optionnels ────────────────────────────────────────────────────
$categorie = $_GET['categorie'] ?? null;   // ex: ?categorie=chaussures
$search    = $_GET['search']    ?? null;   // ex: ?search=sandales

// ─── Construction de la requête dynamique ─────────────────────────────────────
$sql    = "SELECT p.*, c.nom AS categorie, c.slug AS categorie_slug
           FROM produits p
           JOIN categories c ON c.id = p.categorie_id
           WHERE p.actif = 1";
$params = [];

if ($categorie) {
    $sql    .= " AND c.slug = ?";
    $params[] = $categorie;
}

if ($search) {
    $sql    .= " AND (p.nom LIKE ? OR p.description LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

$sql .= " ORDER BY p.id ASC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$produits = $stmt->fetchAll();

// ─── Ajouter les images galerie pour chaque produit ───────────────────────────
$stmtImg = $pdo->prepare(
    "SELECT chemin FROM produit_images WHERE produit_id = ? ORDER BY ordre ASC"
);

foreach ($produits as &$produit) {
    $stmtImg->execute([$produit['id']]);
    $images = $stmtImg->fetchAll(PDO::FETCH_COLUMN);
    $produit['slides'] = !empty($images)
        ? $images
        : [$produit['image_principale']];

    // Renommer pour correspondre à la structure React
    $produit['id']          = (int)$produit['id'];
    $produit['price']       = (float)$produit['prix'];
    $produit['name']        = $produit['nom'];
    $produit['image']       = $produit['image_principale'];
    $produit['rating']      = (float)$produit['note_moyenne'];
    $produit['reviews']     = (int)$produit['nombre_avis'];
    $produit['category']    = $produit['categorie'];
    $produit['description'] = $produit['description'];
}
unset($produit);

echo json_encode([
    "success"  => true,
    "produits" => $produits,
    "total"    => count($produits)
]);
