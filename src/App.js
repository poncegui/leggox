import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";

import LandingView from "./Views/LandingView";
import ProductDetailView from "./Views/ProductDetailView";
import { CartProvider, useCart } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import ShoppingCart from "./Components/ShoppingCart";
import AddToCartModal from "./Components/AddToCartModal";
import AuthModal from "./Components/AuthModal";
import CookieConsent from "./Components/CookieConsent";
import { initGoogleAnalytics } from "./utils/analytics";

// import ScrollToUp from "./Components/ScrollToUp";

// 🔄 CAMBIAR ENTRE VERSIONES:
// - LandingView = versión completa con todas las secciones
// - LandingViewAlt = versión simplificada solo con buscador
const ACTIVE_LANDING = LandingView; // Cambiar a LandingViewAlt para probar la alternativa

// Componente interno para usar el contexto del carrito
function AppContent() {
  const {
    isAddToCartModalOpen,
    setIsAddToCartModalOpen,
    lastAddedProduct,
    getItemCount,
    getTotal,
    setIsCartOpen,
  } = useCart();

  const handleModalClose = () => {
    setIsAddToCartModalOpen(false);
  };

  const handleProceedToCheckout = () => {
    setIsAddToCartModalOpen(false);
    setIsCartOpen(true); // Abrir el carrito lateral
  };

  return (
    <>
      <CookieConsent />
      {/* <ScrollToUp smooth /> */}
      <Routes>
        <Route path="/" element={<ACTIVE_LANDING />} />
        <Route path="/product/:productId" element={<ProductDetailView />} />
      </Routes>
      <ShoppingCart />
      <AddToCartModal
        isOpen={isAddToCartModalOpen}
        onClose={handleModalClose}
        product={lastAddedProduct}
        cartCount={getItemCount()}
        cartTotal={getTotal()}
        onProceedToCheckout={handleProceedToCheckout}
      />
      <AuthModal />
    </>
  );
}

function App() {
  useEffect(() => {
    // Inicializar analytics si el usuario lo aceptó
    // Reemplaza "G-XXXXXXXXXX" con tu Google Analytics ID real
    // initGoogleAnalytics("G-XXXXXXXXXX");
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
