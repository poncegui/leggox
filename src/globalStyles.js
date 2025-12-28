import styled, { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
  letter-spacing: 0;
}

html, body {
  overflow-x: hidden;
  max-width: 100vw;
  position: relative;
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
`;

export const TextHeaderContainers = styled.div`
  translate: none;
  rotate: none;
  scale: none;
`;

export const MarginBottom = styled.div`
  height: ${({ margin }) => (margin ? margin : "")};
`;
MarginBottom.displayName = "Margen Inferior";

export default GlobalStyle;
