import { Link } from 'react-router-dom';

export const Footer = () => {
    return (
        <footer className="bg-primary-light text-text pt-16 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

                    {/* Column 1 */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg mb-2 text-text">Get to Know Us</h3>
                        <ul className="space-y-2 text-sm text-text-muted">
                            <li><Link to="/about" className="hover:underline hover:text-text">À propos de nous</Link></li>
                            <li><Link to="/careers" className="hover:underline hover:text-text">Rejoignez notre équipe</Link></li>
                            <li><Link to="/news" className="hover:underline hover:text-text">Actualités & Annonces</Link></li>
                            <li><Link to="/vision" className="hover:underline hover:text-text">Notre vision & Innovation</Link></li>
                        </ul>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg mb-2 text-text">Connect with Us</h3>
                        <ul className="space-y-2 text-sm text-text-muted">
                            <li><a href="https://www.facebook.com/photo/?fbid=664852992686938&set=a.112300087942234" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-text">Facebook</a></li>
                            <li><a href="https://www.tiktok.com/@paulineehli" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-text">TikTok</a></li>
                            <li><a href="https://wa.me/22879936418" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-text">WhatsApp</a></li>
                        </ul>
                    </div>

                    {/* Column 3 */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg mb-2 text-text">Let Us Help You</h3>
                        <ul className="space-y-2 text-sm text-text-muted">
                            <li><Link to="/login" className="hover:underline hover:text-text">Votre compte</Link></li>
                            <li><Link to="/orders" className="hover:underline hover:text-text">Centre de retours</Link></li>
                            <li><Link to="/shop" className="hover:underline hover:text-text">Protection des achats 100%</Link></li>
                            <li><a href="https://wa.me/22879936418" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-text">Aide & Support</a></li>
                        </ul>
                    </div>

                    {/* Column 4 */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg mb-2 text-text">Contact Us</h3>
                        <ul className="space-y-2 text-sm text-text-muted">
                            <li className="flex gap-2">
                                <span className="font-medium text-text">📍 Location:</span>
                                <span>Lomé, Togo</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-medium text-text">✉️ Email:</span>
                                <a href="mailto:paulineehli7@gmail.com" className="hover:underline hover:text-text">paulineehli7@gmail.com</a>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-medium text-text">📞 Tél:</span>
                                <a href="tel:+22879936418" className="hover:underline hover:text-text">+228 79 93 64 18</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="bg-primary-dark py-4 text-center text-xs text-white/90">
                <div className="max-w-7xl mx-auto px-4">
                    <p>© 2025 Pauline Boutique. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    );
};
