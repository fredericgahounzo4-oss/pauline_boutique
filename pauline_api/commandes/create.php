<?php
require_once '../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

// ─── Récupérer les données envoyées par React ─────────────────────────────────
$items          = $data['items']             ?? [];
$montant        = floatval($data['montant_total']    ?? 0);
$methode        = $data['methode_paiement']  ?? '';
$operateur      = $data['operateur_mobile']  ?? null;
$transaction_id = $data['transaction_id']    ?? null;
$adresse        = $data['adresse_livraison'] ?? [];
$utilisateur_id = $data['utilisateur_id']    ?? null;

// ─── Validation ───────────────────────────────────────────────────────────────
if (empty($items) || $montant <= 0 || !$methode) {
    http_response_code(400);
    echo json_encode(["error" => "Données de commande incomplètes."]);
    exit();
}

// ─── Générer un numéro de commande unique ─────────────────────────────────────
$numero = 'CMD-' . date('Y') . '-' . strtoupper(substr(md5(uniqid()), 0, 8));

// ─── Insérer la commande (transaction pour éviter les données partielles) ─────
try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        INSERT INTO commandes
            (utilisateur_id, numero_commande, montant_total,
             methode_paiement, operateur_mobile, transaction_id,
             adresse_livraison, statut)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'payee')
    ");
    $stmt->execute([
        $utilisateur_id ?: null,
        $numero,
        $montant,
        $methode,
        $operateur,
        $transaction_id,
        json_encode($adresse, JSON_UNESCAPED_UNICODE)
    ]);
    $commande_id = $pdo->lastInsertId();

    // ─── Insérer chaque article commandé ──────────────────────────────────────
    $stmtItem = $pdo->prepare("
        INSERT INTO commande_items
            (commande_id, produit_id, nom_produit, prix_unit, quantite)
        VALUES (?, ?, ?, ?, ?)
    ");
    foreach ($items as $item) {
        $stmtItem->execute([
            $commande_id,
            (int)($item['id']       ?? 0),
            $item['name']           ?? 'Produit',
            floatval($item['price'] ?? 0),
            intval($item['quantity'] ?? 1)
        ]);
    }

    $pdo->commit();

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["error" => "Erreur lors de l'enregistrement : " . $e->getMessage()]);
    exit();
}

// ─── Réponse succès ───────────────────────────────────────────────────────────
echo json_encode([
    "success"         => true,
    "commande_id"     => (int)$commande_id,
    "numero_commande" => $numero,
    "message"         => "Commande enregistrée avec succès."
]);
