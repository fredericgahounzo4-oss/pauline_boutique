<?php
require_once '../config/db.php';

$id = intval($_POST['id'] ?? 0);
if (!$id) {
    http_response_code(400);
    echo json_encode(["error" => "ID produit manquant."]);
    exit();
}

// Vérifier que le produit existe
$stmtCheck = $pdo->prepare("SELECT * FROM produits WHERE id = ?");
$stmtCheck->execute([$id]);
$produit = $stmtCheck->fetch();
if (!$produit) {
    http_response_code(404);
    echo json_encode(["error" => "Produit introuvable."]);
    exit();
}

// ─── Gestion nouvelle image (optionnelle) ─────────────────────────────────────
$imagePath = $produit['image_principale']; // garder l'ancienne par défaut

if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . '/../../pauline/public/images/products/uploads/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

    $ext     = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'webp'];

    if (in_array($ext, $allowed)) {
        $filename  = 'prod_' . time() . '_' . rand(1000, 9999) . '.' . $ext;
        $destPath  = $uploadDir . $filename;
        if (move_uploaded_file($_FILES['image']['tmp_name'], $destPath)) {
            $imagePath = '/images/products/uploads/' . $filename;
        }
    }
}

// ─── Données modifiées ────────────────────────────────────────────────────────
$nom          = trim($_POST['nom']          ?? $produit['nom']);
$description  = trim($_POST['description'] ?? $produit['description']);
$prix         = floatval($_POST['prix']     ?? $produit['prix']);
$stock        = intval($_POST['stock']      ?? $produit['stock']);
$categorie_id = intval($_POST['categorie_id'] ?? $produit['categorie_id']);
$actif        = intval($_POST['actif']      ?? $produit['actif']);

// ─── Mettre à jour ────────────────────────────────────────────────────────────
$stmt = $pdo->prepare("
    UPDATE produits
    SET nom = ?, description = ?, prix = ?, stock = ?,
        categorie_id = ?, image_principale = ?, actif = ?
    WHERE id = ?
");
$stmt->execute([$nom, $description, $prix, $stock, $categorie_id, $imagePath, $actif, $id]);

echo json_encode([
    "success" => true,
    "message" => "Produit modifié avec succès.",
    "image"   => $imagePath
]);
