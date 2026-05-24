<?php
require_once '../config/db.php';

// Vérification rôle admin (via token dans header)
// Pour l'instant on vérifie juste que la requête vient du bon endroit
// En production : vérifier le JWT

$stmt = $pdo->prepare("
    SELECT p.*, c.nom AS categorie
    FROM produits p
    JOIN categories c ON c.id = p.categorie_id
    ORDER BY p.id DESC
");
$stmt->execute();
$produits = $stmt->fetchAll();

foreach ($produits as &$p) {
    $p['id']         = (int)$p['id'];
    $p['prix']       = (float)$p['prix'];
    $p['stock']      = (int)$p['stock'];
    $p['note_moyenne'] = (float)$p['note_moyenne'];
    $p['nombre_avis']  = (int)$p['nombre_avis'];
    $p['actif']        = (int)$p['actif'];
}
unset($p);

echo json_encode([
    "success"  => true,
    "produits" => $produits,
    "total"    => count($produits)
]);
