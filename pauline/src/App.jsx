import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';
import { Wishlist } from './pages/Wishlist';
import { Login } from './pages/Login';
import { HeroProduct } from './pages/HeroProduct';
import { Register } from './pages/Register';
import { About } from './pages/About';
import { Careers } from './pages/Careers';
import { News } from './pages/News';
import { Vision } from './pages/Vision';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

// ─── Pages Admin ──────────────────────────────────────────────────────────────
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProduits } from './pages/admin/AdminProduits';
import { AdminCommandes } from './pages/admin/AdminCommandes';
import { AdminGuard } from './components/admin/AdminGuard';

function App() {
  return (
    <Layout>
      <Routes>
        {/* ── Pages publiques ── */}
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Shop />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/hero-product" element={<HeroProduct />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Routes mot de passe ── */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/about" element={<About />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/news" element={<News />} />
        <Route path="/vision" element={<Vision />} />

        {/* ── Pages Admin (protégées) ── */}
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminDashboard />
            </AdminGuard>
          }
        />

        <Route
          path="/admin/produits"
          element={
            <AdminGuard>
              <AdminProduits />
            </AdminGuard>
          }
        />

        <Route
          path="/admin/commandes"
          element={
            <AdminGuard>
              <AdminCommandes />
            </AdminGuard>
          }
        />
      </Routes>
    </Layout>
  );
}

export default App;