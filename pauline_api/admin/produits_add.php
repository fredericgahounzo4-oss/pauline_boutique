<?php
require_once '../config/db.php';

// ─── Gestion de l'image uploadée ─────────────────────────────────────────────
$imagePath = null;

if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $uploadDir  = __DIR__ . '/../../pauline/public/images/products/uploads/';

    // Créer le dossier si inexistant
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $ext       = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
    $allowed   = ['jpg', 'jpeg', 'png', 'webp'];

    if (!in_array($ext, $allowed)) {
        http_response_code(400);
        echo json_encode(["error" => "Format image non autorisé. Utilisez JPG, PNG ou WEBP."]);
        exit();
    }

    $filename  = 'prod_' . time() . '_' . rand(1000, 9999) . '.' . $ext;
    $destPath  = $uploadDir . $filename;

    if (move_uploaded_file($_FILES['image']['tmp_name'], $destPath)) {
        $imagePath = '/images/products/uploads/' . $filename;
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Impossible de sauvegarder l'image."]);
        exit();
    }
}

// ─── Données du formulaire ────────────────────────────────────────────────────
$nom          = trim($_POST['nom']          ?? '');
$description  = trim($_POST['description'] ?? '');
$prix         = floatval($_POST['prix']     ?? 0);
$stock        = intval($_POST['stock']      ?? 0);
$categorie_id = intval($_POST['categorie_id'] ?? 0);

// ─── Validation ───────────────────────────────────────────────────────────────
if (!$nom || $prix <= 0 || !$categorie_id) {
    http_response_code(400);
    echo json_encode(["error" => "Nom, prix et catégorie sont obligatoires."]);
    exit();
}

// Vérifier que la catégorie existe
$stmtCat = $pdo->prepare("SELECT id FROM categories WHERE id = ?");
$stmtCat->execute([$categorie_id]);
if (!$stmtCat->fetch()) {
    http_response_code(400);
    echo json_encode(["error" => "Catégorie invalide."]);
    exit();
}

// ─── Insérer le produit ───────────────────────────────────────────────────────
$stmt = $pdo->prepare("
    INSERT INTO produits (nom, description, prix, stock, categorie_id, image_principale, actif)
    VALUES (?, ?, ?, ?, ?, ?, 1)
");
$stmt->execute([$nom, $description, $prix, $stock, $categorie_id, $imagePath]);
$newId = $pdo->lastInsertId();

echo json_encode([
    "success" => true,
    "message" => "Produit ajouté avec succès.",
    "id"      => (int)$newId,
    "image"   => $imagePath
]);
