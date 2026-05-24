<?php
require_once '../config/db.php';

$data     = json_decode(file_get_contents("php://input"), true);
$email    = trim($data['email']    ?? '');
$password =      $data['password'] ?? '';

// ─── Validation basique ───────────────────────────────────────────────────────
if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(["error" => "E-mail et mot de passe requis."]);
    exit();
}

// ─── Chercher l'utilisateur ───────────────────────────────────────────────────
$stmt = $pdo->prepare("SELECT * FROM utilisateurs WHERE email = ? AND actif = 1");
$stmt->execute([$email]);
$user = $stmt->fetch();

// ─── Vérifier le mot de passe ─────────────────────────────────────────────────
if (!$user || !password_verify($password, $user['mot_de_passe'])) {
    http_response_code(401);
    echo json_encode(["error" => "E-mail ou mot de passe incorrect."]);
    exit();
}

// ─── Générer un token simple ──────────────────────────────────────────────────
// (En production : remplacer par JWT)
$token = bin2hex(random_bytes(32));

// ─── Sauvegarder le token en base ────────────────────────────────────────────
// On réutilise le champ mot_de_passe? Non — on ajoute une colonne token si besoin
// Pour l'instant, le token est retourné et stocké côté React (localStorage)

// ─── Réponse succès ───────────────────────────────────────────────────────────
echo json_encode([
    "success" => true,
    "token"   => $token,
    "user"    => [
        "id"    => (int)$user['id'],
        "nom"   => $user['nom'],
        "email" => $user['email'],
        "role"  => $user['role']
    ]
]);
