<?php
require_once '../config/db.php';

$data   = json_decode(file_get_contents("php://input"), true);
$id     = intval($data['id']     ?? 0);
$statut = trim($data['statut']   ?? '');

$statutsValides = ['en_attente', 'payee', 'en_cours', 'livree', 'annulee'];

if (!$id || !in_array($statut, $statutsValides)) {
    http_response_code(400);
    echo json_encode(["error" => "ID ou statut invalide."]);
    exit();
}

$stmt = $pdo->prepare("UPDATE commandes SET statut = ? WHERE id = ?");
$stmt->execute([$statut, $id]);

echo json_encode([
    "success" => true,
    "message" => "Statut mis à jour : $statut"
]);
