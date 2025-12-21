import "./HeaderSection.css";

import React from "react";
import styled from "styled-components";

export const WebDesignContainer = () => {
  return (
    <>
      <WebDesingText>
        <strong> Choose on of us </strong> — Acrilict art —
        <strong> Design yours </strong> — handmade —
        <strong> Order now, be unique.</strong>
      </WebDesingText>
      <WebDesingText>
        <strong> Choose on of us </strong> — Acrilict art —
        <strong> Design yours </strong> — handmade —
        <strong> Order now, be unique.</strong>
      </WebDesingText>
      <WebDesingText>
        <strong> Choose on of us </strong> — Acrilict art —
        <strong> Design yours </strong> — handmade —
        <strong> Order now, be unique.</strong>
      </WebDesingText>
    </>
  );
};

// export const GraphicDesign = () => {
//   return (
//     <WebDesingText>
//       <strong> Branding </strong> — Identidad digital —
//       <strong> Diseño gráfico </strong>
//     </WebDesingText>
//   );
// };

// export const MarketingDigital = () => {
//   return (
//     <WebDesingText>
//       <strong>Asesoramiento en redes sociales</strong> — Publicaciones
//       personalizadas —<strong> Interacción con tu audiencia</strong>
//     </WebDesingText>
//   );
// };

const WebDesingText = styled.div`
  margin-top: 0.5%;
`;
WebDesingText.displayName = "Bloques de Textos";
