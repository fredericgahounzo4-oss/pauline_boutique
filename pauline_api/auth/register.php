<?php
require_once '../config/db.php';

// Lire le JSON envoyé par React
$data = json_decode(file_get_contents("php://input"), true);

$nom      = trim($data['nom']      ?? '');
$email    = trim($data['email']    ?? '');
$password =      $data['password'] ?? '';

// ─── Validation ───────────────────────────────────────────────────────────────
$erreurs = [];

if (!$nom)
    $erreurs[] = "Le nom est requis.";

if (!$email)
    $erreurs[] = "L'e-mail est requis.";
elseif (!filter_var($email, FILTER_VALIDATE_EMAIL))
    $erreurs[] = "L'adresse e-mail est invalide.";

if (!$password)
    $erreurs[] = "Le mot de passe est requis.";
elseif (strlen($password) < 8)
    $erreurs[] = "Le mot de passe doit contenir au moins 8 caractères.";

if (!empty($erreurs)) {
    http_response_code(400);
    echo json_encode(["error" => implode(" ", $erreurs)]);
    exit();
}

// ─── Vérifier si l'e-mail existe déjà ────────────────────────────────────────
$stmt = $pdo->prepare("SELECT id FROM utilisateurs WHERE email = ?");
$stmt->execute([$email]);

if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(["error" => "Cet e-mail est déjà utilisé. Connectez-vous."]);
    exit();
}

// ─── Hacher le mot de passe (bcrypt) ─────────────────────────────────────────
$hash = password_hash($password, PASSWORD_BCRYPT);

// ─── Insérer l'utilisateur ────────────────────────────────────────────────────
$stmt = $pdo->prepare(
    "INSERT INTO utilisateurs (nom, email, mot_de_passe, role) VALUES (?, ?, ?, 'client')"
);
$stmt->execute([$nom, $email, $hash]);

$newId = $pdo->lastInsertId();

// ─── Réponse succès ───────────────────────────────────────────────────────────
http_response_code(201);
echo json_encode([
    "success" => true,
    "message" => "Compte créé avec succès !",
    "user" => [
        "id"    => (int)$newId,
        "nom"   => $nom,
        "email" => $email,
        "role"  => "client"
    ]
]);
