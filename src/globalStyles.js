import styled, { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'ANONYMOUS', sans-serif !important;
  letter-spacing: 2px;
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
