import { Route, Routes } from "react-router-dom";

import LandingView from "./Views/LandingView";

// import ScrollToUp from "./Components/ScrollToUp";

// 🔄 CAMBIAR ENTRE VERSIONES:
// - LandingView = versión completa con todas las secciones
// - LandingViewAlt = versión simplificada solo con buscador
const ACTIVE_LANDING = LandingView; // Cambiar a LandingViewAlt para probar la alternativa

function App() {
  return (
    <>
      {/* <ScrollToUp smooth /> */}
      <Routes>
        <Route path="/" element={<ACTIVE_LANDING />} />
      </Routes>
    </>
  );
}

export default App;
