<?php
require_once '../config/db.php';

// Toutes les commandes avec le nom du client
$stmt = $pdo->prepare("
    SELECT
        c.*,
        u.nom    AS client_nom,
        u.email  AS client_email,
        COUNT(ci.id) AS nb_articles
    FROM commandes c
    LEFT JOIN utilisateurs u  ON u.id = c.utilisateur_id
    LEFT JOIN commande_items ci ON ci.commande_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at DESC
");
$stmt->execute();
$commandes = $stmt->fetchAll();

// Ajouter les articles de chaque commande
$stmtItems = $pdo->prepare("
    SELECT * FROM commande_items WHERE commande_id = ?
");

foreach ($commandes as &$cmd) {
    $stmtItems->execute([$cmd['id']]);
    $cmd['items']         = $stmtItems->fetchAll();
    $cmd['id']            = (int)$cmd['id'];
    $cmd['montant_total'] = (float)$cmd['montant_total'];
    $cmd['nb_articles']   = (int)$cmd['nb_articles'];

    // Décoder l'adresse JSON
    if ($cmd['adresse_livraison']) {
        $cmd['adresse_livraison'] = json_decode($cmd['adresse_livraison'], true);
    }
}
unset($cmd);

echo json_encode([
    "success"   => true,
    "commandes" => $commandes,
    "total"     => count($commandes)
]);
