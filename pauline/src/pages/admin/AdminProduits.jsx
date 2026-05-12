import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react';

const CATEGORIES = [
    { id: 1, nom: 'Chaussures' },
    { id: 2, nom: 'Vêtements' },
    { id: 3, nom: 'Accessoires' },
];

const initialForm = {
    nom: '', description: '', prix: '', stock: '', categorie_id: '1', image: null, actif: 1
};

export const AdminProduits = () => {
    const [produits, setProduits]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState('');
    const [success, setSuccess]     = useState('');

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId]       = useState(null);
    const [form, setForm]           = useState(initialForm);
    const [preview, setPreview]     = useState(null);
    const [saving, setSaving]       = useState(false);

    // Filtre
    const [search, setSearch]       = useState('');

    const loadProduits = () => {
        setLoading(true);
        fetch('/api/admin/produits_list.php')
            .then(r => r.json())
            .then(data => { if (data.success) setProduits(data.produits); })
            .catch(() => setError('Erreur réseau.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadProduits(); }, []);

    const openAdd = () => {
        setEditId(null);
        setForm(initialForm);
        setPreview(null);
        setShowModal(true);
    };

    const openEdit = (p) => {
        setEditId(p.id);
        setForm({
            nom:          p.nom,
            description:  p.description || '',
            prix:         p.prix,
            stock:        p.stock,
            categorie_id: p.categorie_id,
            image:        null,
            actif:        p.actif
        });
        setPreview(p.image_principale);
        setShowModal(true);
    };

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setForm(f => ({ ...f, image: file }));
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        const fd = new FormData();
        fd.append('nom',          form.nom);
        fd.append('description',  form.description);
        fd.append('prix',         form.prix);
        fd.append('stock',        form.stock);
        fd.append('categorie_id', form.categorie_id);
        fd.append('actif',        form.actif);
        if (form.image) fd.append('image', form.image);
        if (editId)     fd.append('id', editId);

        const url = editId
            ? '/api/admin/produits_edit.php'
            : '/api/admin/produits_add.php';

        try {
            const res  = await fetch(url, { method: 'POST', body: fd });
            const data = await res.json();
            if (data.success) {
                setSuccess(editId ? 'Produit modifié !' : 'Produit ajouté !');
                setShowModal(false);
                loadProduits();
            } else {
                setError(data.error || 'Erreur.');
            }
        } catch {
            setError('Erreur réseau.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, nom) => {
        if (!confirm(`Supprimer "${nom}" ?`)) return;
        try {
            const res  = await fetch('/api/admin/produits_delete.php', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ id })
            });
            const data = await res.json();
            if (data.success) { setSuccess('Produit supprimé.'); loadProduits(); }
            else setError(data.error);
        } catch { setError('Erreur réseau.'); }
    };

    const filtered = produits.filter(p =>
        p.nom.toLowerCase().includes(search.toLowerCase()) ||
        p.categorie.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="pt-8 pb-20 px-4 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-text">Produits</h1>
                    <p className="text-text-muted text-sm mt-1">{produits.length} produits au total</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/admin" className="border border-gray-200 text-text-muted px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                        ← Dashboard
                    </Link>
                    <button onClick={openAdd}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                        <Plus size={16} /> Ajouter un produit
                    </button>
                </div>
            </div>

            {/* Messages */}
            {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">✅ {success}</div>}
            {error   && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">❌ {error}</div>}

            {/* Recherche */}
            <input
                type="text"
                placeholder="Rechercher par nom ou catégorie..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full mb-6 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary"
            />

            {/* Table */}
            {loading ? (
                <div className="text-center py-20 text-text-muted">Chargement...</div>
            ) : (
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-4 py-3 text-text-muted font-medium">Image</th>
                                <th className="text-left px-4 py-3 text-text-muted font-medium">Nom</th>
                                <th className="text-left px-4 py-3 text-text-muted font-medium">Catégorie</th>
                                <th className="text-left px-4 py-3 text-text-muted font-medium">Prix</th>
                                <th className="text-left px-4 py-3 text-text-muted font-medium">Stock</th>
                                <th className="text-left px-4 py-3 text-text-muted font-medium">Statut</th>
                                <th className="text-left px-4 py-3 text-text-muted font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 && (
                                <tr><td colSpan={7} className="text-center py-10 text-text-muted">Aucun produit trouvé.</td></tr>
                            )}
                            {filtered.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                            {p.image_principale
                                                ? <img src={p.image_principale} alt={p.nom} className="w-full h-full object-cover" />
                                                : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">N/A</div>
                                            }
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-text">{p.nom}</p>
                                        <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{p.description}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">{p.categorie}</span>
                                    </td>
                                    <td className="px-4 py-3 font-medium">{p.prix.toLocaleString('fr-FR')} FCFA</td>
                                    <td className="px-4 py-3">
                                        <span className={p.stock > 0 ? 'text-green-600' : 'text-red-500'}>
                                            {p.stock}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {p.actif ? 'Actif' : 'Masqué'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(p)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Pencil size={15} />
                                            </button>
                                            <button onClick={() => handleDelete(p.id, p.nom)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Ajouter / Modifier */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-medium text-text">
                                {editId ? 'Modifier le produit' : 'Ajouter un produit'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">

                            {/* Image */}
                            <div>
                                <label className="block text-sm font-medium text-text mb-1">Image du produit</label>
                                <div className="flex items-center gap-4">
                                    {preview && (
                                        <img src={preview} alt="preview" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                                    )}
                                    <label className="cursor-pointer border-2 border-dashed border-gray-200 rounded-lg px-4 py-3 text-sm text-text-muted hover:border-primary transition-colors">
                                        Choisir une image
                                        <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                                    </label>
                                </div>
                            </div>

                            {/* Nom */}
                            <div>
                                <label className="block text-sm font-medium text-text mb-1">Nom du produit *</label>
                                <input type="text" required value={form.nom}
                                    onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                                    placeholder="Ex: Sandales AJ-175"
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-text mb-1">Description</label>
                                <textarea rows={3} value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Description du produit..."
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary resize-none" />
                            </div>

                            {/* Prix + Stock */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text mb-1">Prix (FCFA) *</label>
                                    <input type="number" required min="1" value={form.prix}
                                        onChange={e => setForm(f => ({ ...f, prix: e.target.value }))}
                                        placeholder="2500"
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text mb-1">Stock</label>
                                    <input type="number" min="0" value={form.stock}
                                        onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                                        placeholder="10"
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" />
                                </div>
                            </div>

                            {/* Catégorie */}
                            <div>
                                <label className="block text-sm font-medium text-text mb-1">Catégorie *</label>
                                <select value={form.categorie_id}
                                    onChange={e => setForm(f => ({ ...f, categorie_id: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary">
                                    {CATEGORIES.map(c => (
                                        <option key={c.id} value={c.id}>{c.nom}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Actif */}
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="actif" checked={form.actif === 1}
                                    onChange={e => setForm(f => ({ ...f, actif: e.target.checked ? 1 : 0 }))}
                                    className="h-4 w-4 text-primary rounded" />
                                <label htmlFor="actif" className="text-sm text-text">Visible dans la boutique</label>
                            </div>

                            {error && <p className="text-sm text-red-500">❌ {error}</p>}

                            {/* Boutons */}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 border border-gray-200 text-text-muted py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                                    Annuler
                                </button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark disabled:opacity-60 transition-colors">
                                    {saving ? 'Enregistrement...' : <><Check size={15} /> {editId ? 'Modifier' : 'Ajouter'}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
