import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const STATUTS = ['en_attente', 'payee', 'en_cours', 'livree', 'annulee'];

const statutColor = (s) => ({
    'en_attente': 'bg-yellow-100 text-yellow-700',
    'payee':      'bg-blue-100 text-blue-700',
    'en_cours':   'bg-orange-100 text-orange-700',
    'livree':     'bg-green-100 text-green-700',
    'annulee':    'bg-red-100 text-red-700',
}[s] || 'bg-gray-100 text-gray-600');

export const AdminCommandes = () => {
    const [commandes, setCommandes] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState('');
    const [success, setSuccess]     = useState('');
    const [open, setOpen]           = useState(null); // id commande ouverte

    const loadCommandes = () => {
        setLoading(true);
        fetch('/api/admin/commandes')
            .then(r => r.json())
            .then(data => { if (data.success) setCommandes(data.commandes); })
            .catch(() => setError('Erreur réseau.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadCommandes(); }, []);

    const updateStatut = async (id, statut) => {
        try {
            const res  = await fetch('/api/admin/commande-statut', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ id, statut })
            });
            const data = await res.json();
            if (data.success) {
                setSuccess('Statut mis à jour !');
                setCommandes(prev => prev.map(c => c.id === id ? { ...c, statut } : c));
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.error);
            }
        } catch { setError('Erreur réseau.'); }
    };

    return (
        <div className="pt-8 pb-20 px-4 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-text">Commandes</h1>
                    <p className="text-text-muted text-sm mt-1">{commandes.length} commandes au total</p>
                </div>
                <Link to="/admin" className="border border-gray-200 text-text-muted px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                    ← Dashboard
                </Link>
            </div>

            {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">✅ {success}</div>}
            {error   && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">❌ {error}</div>}

            {loading ? (
                <div className="text-center py-20 text-text-muted">Chargement...</div>
            ) : (
                <div className="space-y-4">
                    {commandes.length === 0 && (
                        <p className="text-center text-text-muted py-16">Aucune commande pour le moment.</p>
                    )}

                    {commandes.map(cmd => (
                        <div key={cmd.id} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">

                            {/* Ligne principale */}
                            <div
                                className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => setOpen(open === cmd.id ? null : cmd.id)}>

                                <div>
                                    <p className="font-medium text-text">{cmd.numero_commande}</p>
                                    <p className="text-xs text-text-muted mt-0.5">
                                        {cmd.client_nom || 'Client invité'} — {cmd.client_email || ''}
                                    </p>
                                    <p className="text-xs text-text-muted">
                                        {new Date(cmd.created_at).toLocaleDateString('fr-FR', {
                                            day: '2-digit', month: 'long', year: 'numeric'
                                        })}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="font-bold text-text">{parseFloat(cmd.montant_total).toLocaleString('fr-FR')} FCFA</p>
                                        <p className="text-xs text-text-muted">{cmd.nb_articles} article(s) — {cmd.methode_paiement}</p>
                                    </div>

                                    {/* Sélecteur statut */}
                                    <select
                                        value={cmd.statut}
                                        onChange={e => { e.stopPropagation(); updateStatut(cmd.id, e.target.value); }}
                                        onClick={e => e.stopPropagation()}
                                        className={`text-xs font-medium px-3 py-1.5 rounded-full border-0 outline-none cursor-pointer ${statutColor(cmd.statut)}`}>
                                        {STATUTS.map(s => (
                                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                        ))}
                                    </select>

                                    <span className="text-gray-400 text-lg">{open === cmd.id ? '▲' : '▼'}</span>
                                </div>
                            </div>

                            {/* Détails dépliables */}
                            {open === cmd.id && (
                                <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">

                                    {/* Adresse */}
                                    {cmd.adresse_livraison && (
                                        <div className="mb-4">
                                            <p className="text-xs font-medium text-text-muted uppercase mb-1">Adresse de livraison</p>
                                            <p className="text-sm text-text">
                                                {cmd.adresse_livraison.prenom} {cmd.adresse_livraison.nom} — {cmd.adresse_livraison.telephone}
                                            </p>
                                            <p className="text-sm text-text-muted">
                                                {cmd.adresse_livraison.adresse}, {cmd.adresse_livraison.ville} {cmd.adresse_livraison.code_postal}
                                            </p>
                                        </div>
                                    )}

                                    {/* Articles */}
                                    <p className="text-xs font-medium text-text-muted uppercase mb-2">Articles commandés</p>
                                    <div className="space-y-2">
                                        {cmd.items?.map((item, i) => (
                                            <div key={i} className="flex justify-between text-sm">
                                                <span className="text-text">{item.nom_produit} × {item.quantite}</span>
                                                <span className="font-medium">{parseFloat(item.sous_total).toLocaleString('fr-FR')} FCFA</span>
                                            </div>
                                        ))}
                                    </div>

                                    {cmd.transaction_id && (
                                        <p className="text-xs text-text-muted mt-3">
                                            Transaction ID : <code className="font-mono">{cmd.transaction_id}</code>
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
