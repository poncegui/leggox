import React from "react";
import styled from "styled-components";

const ColorsSection = ({ colors, typ }) => {
  return (
    <ColorsContainer>
      <ColorsTitle>
        <h2>/. ACT I — ONLY 7</h2>
        <p className="subtitle">Stamped and numbered · 1/7</p>
        <div className="elemento-con-texto"></div>
      </ColorsTitle>
      <ColorsText>
        <div className="rgba">
          <p className="rgba-text">#F5F5F5</p>
          <p className="colorA">no 1/.7</p>
        </div>
        <div className="rgba">
          <p className="rgba-text">#CCCCCC</p>
          <p className="colorB">no 2/.7</p>
        </div>
        <div className="rgba">
          <p className="rgba-text">#999999</p>
          <p className="colorC">no 3/.7</p>
        </div>
        <div className="rgba">
          <p className="rgba-text">#666666</p>
          <p className="colorD">no 4/.7</p>
        </div>
        <div className="rgba">
          <p className="rgba-text">#444444</p>
          <p className="colorE">no 5/.7</p>
        </div>
        <div className="rgba">
          <p className="rgba-text">#222222</p>
          <p className="colorF">no 6/.7</p>
        </div>
        <div className="rgba">
          <p className="rgba-text">#000000</p>
          <p className="colorG">no 7/.7</p>
        </div>
        <div className="ActoContainerBlue">Act I.</div>
      </ColorsText>
    </ColorsContainer>
  );
};
export default ColorsSection;

const ColorsContainer = styled.section`
  margin: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  background-color: #333;
  justify-content: center;
  flex-direction: row-reverse;
  gap: 7rem;

  @media (max-width: 1024px) {
    gap: 3rem;
    height: auto;
    min-height: 100vh;
    padding: 3rem 1rem;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
  }

  @media (max-width: 440px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3rem;
  }
`;

const ColorsTitle = styled.div`
  text-align: right;
  width: 70%;
  /* display: flex;
  flex-direction:column-gap; */

  h2 {
    font-size: 80px;
    font-family: "APERCU";
    color: #f9efe4;
    padding: 3% 5%;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    font-size: 18px;
    font-family: "APERCU";
    color: #f9efe4;
    padding: 0 5%;
    margin: 0;
    opacity: 0.9;
  }

  @media (max-width: 1024px) {
    h2 {
      font-size: 60px;
    }
    .subtitle {
      font-size: 16px;
    }
  }

  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
    h2 {
      font-size: 50px;
      padding: 2% 3%;
    }
    .subtitle {
      font-size: 15px;
      padding: 0 3%;
    }
  }

  @media (max-width: 440px) {
    h2 {
      font-size: 40px;
      white-space: wrap;
    }
    .subtitle {
      font-size: 14px;
    }
  }
`;

const ColorsText = styled.div`
  display: flex;
  width: 30%;
  text-transform: uppercase;
  display: flex;
  flex-direction: column;
  background-color: #f9efe4;
  justify-content: center;
  align-items: center;

  h1 {
    text-align: left;
  }

  p {
    font-family: "APERCU";
    font-size: 42px;
    text-indent: 1rem;
  }

  @media (max-width: 1024px) {
    width: 40%;
    p {
      font-size: 38px;
    }
  }

  @media (max-width: 860px) {
    p {
      font-size: 48px;
    }
  }

  @media (max-width: 768px) {
    width: 90%;
    padding: 2rem 1rem;
  }

  @media (max-width: 440px) {
    flex-direction: column;
    width: 100%;
    p {
      font-size: 40px;
    }
  }
  .colorA {
    color: #e8e8e8;
    font-family: "APERCU";
  }
  .rgba-text {
    color: RGBA(0, 0, 0, 1);
    font-size: 1rem;
  }
  .rgba {
    text-align: start;
    margin-bottom: 0.5rem;
  }
  .colorB {
    color: #cccccc;
    font-family: "APERCU";
  }
  .colorC {
    color: #999999;
    font-family: "APERCU";
  }
  .colorD {
    color: #666666;
    font-family: "APERCU";
  }
  .colorE {
    color: #444444;
    font-family: "APERCU";
  }
  .colorF {
    color: #222222;
    font-family: "APERCU";
  }
  .colorG {
    color: #000000;
    font-family: "APERCU";
  }
  .typA {
    font-family: "Dancing Script", cursive;
  }
  .typB {
    font-family: "Roboto", sans-serif;
  }
  .typC {
    font-family: "APERCU";
  }
  .typD {
    font-family: "Montserrat Alternates", sans-serif;
  }
  .typE {
    font-family: "Quicksand", sans-serif;
  }
`;
