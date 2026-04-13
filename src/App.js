import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";

import LandingView from "./Views/LandingView";
import { CartProvider } from "./context/CartContext";
import ShoppingCart from "./Components/ShoppingCart";
import CookieConsent from "./Components/CookieConsent";
import { initGoogleAnalytics } from "./utils/analytics";

// import ScrollToUp from "./Components/ScrollToUp";

// 🔄 CAMBIAR ENTRE VERSIONES:
// - LandingView = versión completa con todas las secciones
// - LandingViewAlt = versión simplificada solo con buscador
const ACTIVE_LANDING = LandingView; // Cambiar a LandingViewAlt para probar la alternativa

function App() {
  useEffect(() => {
    // Inicializar analytics si el usuario lo aceptó
    // Reemplaza "G-XXXXXXXXXX" con tu Google Analytics ID real
    // initGoogleAnalytics("G-XXXXXXXXXX");
  }, []);

  return (
    <CartProvider>
      <CookieConsent />
      {/* <ScrollToUp smooth /> */}
      <Routes>
        <Route path="/" element={<ACTIVE_LANDING />} />
      </Routes>
      <ShoppingCart />
    </CartProvider>
  );
}

export default App;
