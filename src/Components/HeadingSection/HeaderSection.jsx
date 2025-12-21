import {
  GraphicDesign,
  MarketingDigital,
  WebDesignContainer,
} from "./Paragraphs";
import { MarginBottom, TextHeaderContainers } from "../../globalStyles";

import ApercuFont from "../../Assets/Fonts/Apercu/Apercu-Regular.otf";
import React from "react";
import styled from "styled-components";

const HeaderSection = () => {
  return (
    <HeaderContainer>
      <HeaderTitle>
        <h1>/.LOLA GUN STUDIO</h1>
        <div className="elemento-con-texto"></div>
      </HeaderTitle>
      <MarginBottom margin="1rem" />
      <TextHeaderContainers>
        <h2>UNIQUE DESIGN.</h2>
      </TextHeaderContainers>
      <MarginBottom margin="0.5rem" />
      <TextHeaderContainers>
        <h2>UNIQUE DESIGN.</h2>
      </TextHeaderContainers>
      <MarginBottom margin="0.5rem" />
      <TextHeaderContainers>
        <h2>UNIQUE DESIGN.</h2>
      </TextHeaderContainers>
      <ServicesTextContainer>
        <WebDesignContainer />
        <MarginBottom margin="0.7rem" />
        {/* <GraphicDesign />
        <GraphicDesign />
        <GraphicDesign />
        <MarginBottom margin="0.7rem" />
        <MarketingDigital />
        <MarketingDigital />
        <MarketingDigital /> */}
        <MarginBottom margin="0.7rem" />
      </ServicesTextContainer>
      <MarginBottom margin="1rem" />
      <button className="boton">
        <div className="equis">+</div>
      </button>
    </HeaderContainer>
  );
};

export default HeaderSection;

const HeaderContainer = styled.section`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 5%;
  margin: 0;
  background: var(--ch-bg, transparent);

  &:hover h2 {
    transition: 0.5s all ease;
  }

  h2 {
    position: relative;
    display: inline-block;
    cursor: pointer;
  }

  h2:hover::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 2px;
    background-color: lightblue;
    top: 50%;
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.3s ease-out;
  }

  h2:hover::before {
    transform-origin: left;
    transform: scaleX(1);
  }

  .boton {
    width: 50px;
    height: 50px;
    border: 1px solid black;
    background-color: transparent;
    border-radius: 50%;
    position: relative;
    cursor: pointer;
  }

  .equis {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 24px;
    color: black;
  }
`;
const HeaderTitle = styled.div`
  @font-face {
    font-family: "APERCU";
    src: url(${ApercuFont}) format("otf");
    font-style: normal;
    font-weight: normal;
    letter-spacing: -5px;
  }
  h1 {
    font-size: 120px;
    font-family: "APERCU";
  }

  @media (max-width: 1024px) {
    h1 {
      font-size: 90px;
    }
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 70px;
    }
  }

  @media (max-width: 440px) {
    h1 {
      font-size: 60px;
      white-space: wrap;
    }
  }
`;

const ServicesTextContainer = styled.div`
  margin-top: 3%;
`;
