<?php
require_once '../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);
$id   = intval($data['id'] ?? 0);

if (!$id) {
    http_response_code(400);
    echo json_encode(["error" => "ID produit manquant."]);
    exit();
}

// Vérifier que le produit existe
$stmtCheck = $pdo->prepare("SELECT id FROM produits WHERE id = ?");
$stmtCheck->execute([$id]);
if (!$stmtCheck->fetch()) {
    http_response_code(404);
    echo json_encode(["error" => "Produit introuvable."]);
    exit();
}

// Désactiver plutôt que supprimer (pour garder l'historique des commandes)
$stmt = $pdo->prepare("UPDATE produits SET actif = 0 WHERE id = ?");
$stmt->execute([$id]);

echo json_encode([
    "success" => true,
    "message" => "Produit supprimé avec succès."
]);
