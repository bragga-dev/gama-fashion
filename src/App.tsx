import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AccountLayout, MainLayout, PanelIndex, RequireAdmin, RequireClient } from '@/components/layout/Layouts'
import { PageLoader } from '@/components/ui/misc'
import HomePage from '@/pages/HomePage'
import { AdminLayout } from '@/components/admin/AdminLayout'

const CatalogPage = lazy(() => import('@/pages/CatalogPage'))
const ProductPage = lazy(() => import('@/pages/ProductPage'))
const CartPage = lazy(() => import('@/pages/CartPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const OrderPaymentPage = lazy(() => import('@/pages/OrderPaymentPage'))
const OrdersPage = lazy(() => import('@/pages/OrdersPage'))
const OrderDetailPage = lazy(() => import('@/pages/OrderDetailPage'))
const ProfilePage = lazy(() => import('@/pages/account/ProfilePage'))
const AddressesPage = lazy(() => import('@/pages/account/AddressesPage'))
const NotificationsPage = lazy(() => import('@/pages/account/NotificationsPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'))
const OrdersAdminPage = lazy(() => import('@/pages/admin/OrdersAdminPage'))
const OrderAdminDetailPage = lazy(() => import('@/pages/admin/OrderAdminDetailPage'))
const ProductsAdminPage = lazy(() => import('@/pages/admin/ProductsAdminPage'))
const ProductCreatePage = lazy(() => import('@/pages/admin/ProductCreatePage'))
const ProductEditPage = lazy(() => import('@/pages/admin/ProductEditPage'))
const CategoriesAdminPage = lazy(() => import('@/pages/admin/CategoriesAdminPage'))
const ReviewsAdminPage = lazy(() => import('@/pages/admin/ReviewsAdminPage'))
const CampaignsAdminPage = lazy(() => import('@/pages/admin/CampaignsAdminPage'))
const ContactsAdminPage = lazy(() => import('@/pages/admin/ContactsAdminPage'))
const UsersAdminPage = lazy(() => import('@/pages/admin/UsersAdminPage'))
const AdminProfilePage = lazy(() => import('@/pages/admin/AdminProfilePage'))
const NotificationsPageLazy = lazy(() => import('@/pages/account/NotificationsPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/PasswordPages').then((m) => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('@/pages/auth/PasswordPages').then((m) => ({ default: m.ResetPasswordPage })))
const EmailVerifiedPage = lazy(() => import('@/pages/auth/PasswordPages').then((m) => ({ default: m.EmailVerifiedPage })))

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/entrar" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
          {/* Rotas usadas pelos e-mails do back */}
          <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
          <Route path="/verificacao-concluida" element={<EmailVerifiedPage />} />
          <Route index element={<HomePage />} />
          <Route path="/produtos" element={<CatalogPage />} />
          <Route path="/produtos/:id" element={<ProductPage />} />
          <Route path="/comprar-mais" element={<Navigate to="/produtos?sort=recent" replace />} />
          <Route path="/carrinho" element={<CartPage />} />
          <Route path="/contato" element={<ContactPage />} />

          <Route path="/painel" element={<PanelIndex />} />
          <Route element={<RequireClient />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/pedido/:id/pagamento" element={<OrderPaymentPage />} />
            <Route element={<AccountLayout />}>
              <Route path="/painel/meus-pedidos" element={<OrdersPage />} />
              <Route path="/painel/meus-pedidos/:id" element={<OrderDetailPage />} />
              <Route path="/painel/perfil" element={<ProfilePage />} />
              <Route path="/painel/enderecos" element={<AddressesPage />} />
              <Route path="/painel/notificacoes" element={<NotificationsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route path="/painel/dashboard" element={<DashboardPage />} />
            <Route path="/painel/pedidos" element={<OrdersAdminPage />} />
            <Route path="/painel/pedidos/:id" element={<OrderAdminDetailPage />} />
            <Route path="/painel/produtos" element={<ProductsAdminPage />} />
            <Route path="/painel/produtos/novo" element={<ProductCreatePage />} />
            <Route path="/painel/produtos/:id" element={<ProductEditPage />} />
            <Route path="/painel/categorias" element={<CategoriesAdminPage />} />
            <Route path="/painel/avaliacoes" element={<ReviewsAdminPage />} />
            <Route path="/painel/campanhas" element={<CampaignsAdminPage />} />
            <Route path="/painel/mensagens" element={<ContactsAdminPage />} />
            <Route path="/painel/usuarios" element={<UsersAdminPage />} />
            <Route path="/painel/meu-perfil" element={<AdminProfilePage />} />
            <Route path="/painel/notificacoes-admin" element={<NotificationsPageLazy />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}