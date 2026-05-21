import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export const Register = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirm: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // ✅ IMPORTANT FIX (Render safe)
    const API_URL = import.meta.env.VITE_API_URL || "https://hub-shop.onrender.com";

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = "Le nom est requis.";
        if (!form.email) errs.email = "L'e-mail est requis.";
        if (!form.password) errs.password = "Le mot de passe est requis.";
        if (form.password !== form.confirm) errs.confirm = "Les mots de passe ne correspondent pas.";
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const res = await fetch(`${API_URL}/api/auth/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    password: form.password
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setErrors({ general: data.error || "Erreur lors de l'inscription" });
                return;
            }

            setSuccess(true);

            setTimeout(() => {
                navigate('/login');
            }, 1500);

        } catch (err) {
            setErrors({
                general: "Erreur réseau ou backend indisponible"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/" className="flex justify-center items-center gap-2 text-text-muted hover:text-primary mb-8">
                    <ArrowLeft size={16} /> Retour
                </Link>

                <h2 className="text-center text-3xl font-bold text-text">
                    Créer un compte
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">

                <div className="bg-surface p-6 rounded-lg shadow">

                    {errors.general && (
                        <p className="text-red-600 text-sm mb-3">{errors.general}</p>
                    )}

                    {success && (
                        <p className="text-green-600 text-sm mb-3">
                            Compte créé avec succès !
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        <input
                            type="text"
                            placeholder="Nom"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full p-2 border rounded"
                        />

                        <input
                            type="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full p-2 border rounded"
                        />

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Mot de passe"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-2 text-gray-500">
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        <input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Confirmer mot de passe"
                            value={form.confirm}
                            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                            className="w-full p-2 border rounded"
                        />

                        <Button className="w-full">
                            {isLoading ? "Création..." : "Créer un compte"}
                        </Button>

                    </form>
                </div>
            </div>
        </div>
    );
};