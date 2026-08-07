import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { CatalogProvider } from './context/CatalogContext'
import { ProductProvider } from './context/ProductContext'
import { LoginPage } from './pages/LoginPage'
import { MasterDataPage } from './pages/MasterDataPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { ProductsPage } from './pages/ProductsPage'

export default function App() {
  return (
    <AuthProvider>
      <CatalogProvider>
        <ProductProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/master-data" element={<MasterDataPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/products" replace />} />
            </Routes>
          </BrowserRouter>
        </ProductProvider>
      </CatalogProvider>
    </AuthProvider>
  )
}
