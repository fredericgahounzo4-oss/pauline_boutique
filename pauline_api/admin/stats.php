<?php
require_once '../config/db.php';

// Nombre de produits actifs
$stmt = $pdo->query("SELECT COUNT(*) FROM produits WHERE actif = 1");
$nbProduits = (int)$stmt->fetchColumn();

// Nombre d'utilisateurs
$stmt = $pdo->query("SELECT COUNT(*) FROM utilisateurs WHERE role = 'client'");
$nbClients = (int)$stmt->fetchColumn();

// Nombre de commandes
$stmt = $pdo->query("SELECT COUNT(*) FROM commandes");
$nbCommandes = (int)$stmt->fetchColumn();

// Chiffre d'affaires total (commandes payées)
$stmt = $pdo->query("SELECT COALESCE(SUM(montant_total), 0) FROM commandes WHERE statut != 'annulee'");
$chiffreAffaires = (float)$stmt->fetchColumn();

// 5 dernières commandes
$stmt = $pdo->query("
    SELECT c.id, c.numero_commande, c.statut, c.montant_total, c.created_at,
           u.nom AS client_nom
    FROM commandes c
    LEFT JOIN utilisateurs u ON u.id = c.utilisateur_id
    ORDER BY c.created_at DESC
    LIMIT 5
");
$dernieresCommandes = $stmt->fetchAll();

echo json_encode([
    "success"             => true,
    "nb_produits"         => $nbProduits,
    "nb_clients"          => $nbClients,
    "nb_commandes"        => $nbCommandes,
    "chiffre_affaires"    => $chiffreAffaires,
    "dernieres_commandes" => $dernieresCommandes
]);
