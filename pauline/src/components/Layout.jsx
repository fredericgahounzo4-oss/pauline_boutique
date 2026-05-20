import { Navbar } from './Navbar';
import { CartSidebar } from './CartSidebar';
import { Footer } from './Footer';

export const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-background text-text font-sans">
            <Navbar />
            <CartSidebar />
            <main className="pt-16">
                {children}
            </main>
            <Footer />
        </div>
    );
};
