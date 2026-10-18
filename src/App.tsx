import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AccountLayout, MainLayout, RequireAuth } from '@/components/layout/Layouts'
import { PageLoader } from '@/components/ui/misc'
import HomePage from '@/pages/HomePage'

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

          <Route element={<RequireAuth />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/pedido/:id/pagamento" element={<OrderPaymentPage />} />
            <Route path="/painel" element={<AccountLayout />}>
              <Route index element={<Navigate to="meus-pedidos" replace />} />
              <Route path="meus-pedidos" element={<OrdersPage />} />
              <Route path="meus-pedidos/:id" element={<OrderDetailPage />} />
              <Route path="perfil" element={<ProfilePage />} />
              <Route path="enderecos" element={<AddressesPage />} />
              <Route path="notificacoes" element={<NotificationsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}