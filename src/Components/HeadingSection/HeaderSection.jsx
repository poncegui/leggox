import './HeaderSection.css';

import React from 'react';
import { TextHeaderContainers } from '../../globalStyles';
import { WebDesignContainer } from './Paragraphs';

const HeaderSection = () => {
  const [windowWidth, setWindowWidth] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSmall = windowWidth <= 440;
  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth <= 1024;

  const titleFontSize = isSmall ? 60 : isMobile ? 70 : isTablet ? 90 : 120;

  return (
    <header style={styles.container} role="banner">
      <div style={styles.titleWrapper}>
        <h1
          style={{
            ...styles.title,
            fontSize: `${titleFontSize}px`,
          }}
        >
          /.LOLA GUN STUDIO
        </h1>
        <div className="elemento-con-texto" aria-hidden="true"></div>
      </div>

      <div style={styles.marginBottom} />

      <TextHeaderContainers>
        <h2>UNUM.</h2>
      </TextHeaderContainers>

      <div style={styles.marginBottomSmall} />

      <TextHeaderContainers>
        <h2>UNIQUE DESIGN.</h2>
      </TextHeaderContainers>

      <div style={styles.marginBottomSmall} />

      <nav aria-label="Studio services" style={styles.servicesContainer}>
        <WebDesignContainer />
        <div style={styles.marginBottomMedium} />
        <div style={styles.marginBottomMedium} />
      </nav>

      <div style={styles.marginBottom} />

      <button
        style={styles.button}
        aria-label="Scroll to next section"
        onClick={() => {
          const nextSection = document.querySelector('section');
          if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      >
        <div style={styles.plusIcon} aria-hidden="true">
          +
        </div>
      </button>
    </header>
  );
};

export default HeaderSection;

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '0 5%',
    margin: 0,
    background: 'var(--ch-bg, transparent)',
  },
  titleWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontFamily: 'APERCU, sans-serif',
    fontWeight: 'normal',
    letterSpacing: '-5px',
    margin: 0,
  },
  marginBottom: {
    height: '1rem',
  },
  marginBottomSmall: {
    height: '0.5rem',
  },
  marginBottomMedium: {
    height: '0.7rem',
  },
  servicesContainer: {
    marginTop: '3%',
  },
  button: {
    width: 50,
    height: 50,
    border: '1px solid black',
    backgroundColor: 'transparent',
    borderRadius: '50%',
    position: 'relative',
    cursor: 'pointer',
  },
  plusIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: 24,
    color: 'black',
  },
};
