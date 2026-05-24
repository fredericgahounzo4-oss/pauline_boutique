import { useEffect, useState } from 'react';
import { apiUrl } from '../../utils/api';

export const AdminProduits = () => {
    const [produits, setProduits]   = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState('');
    const [showForm, setShowForm]   = useState(false);
    const [editItem, setEditItem]   = useState(null);
    const [form, setForm]           = useState({ nom:'', description:'', prix:'', stock:'', categorie_id:'', actif:1 });
    const [imageFile, setImageFile] = useState(null);
    const [saving, setSaving]       = useState(false);
    const [msg, setMsg]             = useState('');

    const load = () => {
        Promise.all([
            fetch(apiUrl('/api/admin/produits')).then(r => r.json()),
            fetch(apiUrl('/api/categories')).then(r => r.json()),
        ]).then(([p, c]) => {
            setProduits(p.produits || []);
            setCategories(c.categories || []);
            setLoading(false);
        }).catch(() => { setError('Erreur de chargement.'); setLoading(false); });
    };

    useEffect(() => { load(); }, []);

    const openAdd = () => {
        setEditItem(null);
        setForm({ nom:'', description:'', prix:'', stock:'', categorie_id: categories[0]?.id || '', actif:1 });
        setImageFile(null);
        setMsg('');
        setShowForm(true);
    };

    const openEdit = (p) => {
        setEditItem(p);
        setForm({ nom: p.nom, description: p.description||'', prix: p.prix, stock: p.stock, categorie_id: p.categorie_id, actif: p.actif ? 1 : 0 });
        setImageFile(null);
        setMsg('');
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Désactiver ce produit ?')) return;
        await fetch(apiUrl('/api/admin/produits/delete'), {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        load();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg('');
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        if (editItem) fd.append('id', editItem.id);
        if (imageFile) fd.append('image', imageFile);

        const url = editItem ? apiUrl('/api/admin/produits/edit') : apiUrl('/api/admin/produits/add');
        const res = await fetch(url, { method: 'POST', body: fd });
        const data = await res.json();
        setSaving(false);
        if (data.success) { setMsg('✅ ' + (editItem ? 'Modifié' : 'Ajouté') + ' avec succès !'); load(); setTimeout(() => setShowForm(false), 1500); }
        else setMsg('❌ ' + (data.error || 'Erreur'));
    };

    if (loading) return <div className="p-8 text-center text-text-muted">Chargement...</div>;
    if (error)   return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-serif font-bold text-text">Produits ({produits.length})</h1>
                <button onClick={openAdd} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90">+ Ajouter</button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-semibold mb-4">{editItem ? 'Modifier' : 'Ajouter'} un produit</h2>
                        {msg && <div className={`mb-3 p-2 rounded text-sm text-center ${msg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg}</div>}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input placeholder="Nom du produit" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})}
                                className="w-full border rounded-lg px-3 py-2 text-sm" required />
                            <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                                className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} />
                            <div className="grid grid-cols-2 gap-3">
                                <input type="number" placeholder="Prix (FCFA)" value={form.prix} onChange={e => setForm({...form, prix: e.target.value})}
                                    className="border rounded-lg px-3 py-2 text-sm" required />
                                <input type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})}
                                    className="border rounded-lg px-3 py-2 text-sm" required />
                            </div>
                            <select value={form.categorie_id} onChange={e => setForm({...form, categorie_id: e.target.value})}
                                className="w-full border rounded-lg px-3 py-2 text-sm">
                                {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                            </select>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Image produit</label>
                                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])}
                                    className="w-full text-sm" />
                            </div>
                            {editItem && (
                                <select value={form.actif} onChange={e => setForm({...form, actif: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2 text-sm">
                                    <option value={1}>Actif</option>
                                    <option value={0}>Inactif</option>
                                </select>
                            )}
                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={saving}
                                    className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-60">
                                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="flex-1 border border-gray-200 py-2 rounded-lg text-sm">Annuler</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-surface rounded-xl border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3 text-left">Produit</th>
                            <th className="px-4 py-3 text-left">Catégorie</th>
                            <th className="px-4 py-3 text-left">Prix</th>
                            <th className="px-4 py-3 text-left">Stock</th>
                            <th className="px-4 py-3 text-left">Statut</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {produits.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        {p.image_principale && <img src={p.image_principale} alt={p.nom} className="w-10 h-10 object-cover rounded-lg" />}
                                        <span className="font-medium">{p.nom}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-500">{p.categorie_nom}</td>
                                <td className="px-4 py-3 font-medium">{Number(p.prix).toLocaleString('fr-FR')} FCFA</td>
                                <td className="px-4 py-3">{p.stock}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {p.actif ? 'Actif' : 'Inactif'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(p)} className="text-xs text-blue-600 hover:underline">Modifier</button>
                                        <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:underline">Supprimer</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
