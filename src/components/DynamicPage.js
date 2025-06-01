import React, { useState, useEffect, useRef } from 'react';

const ImmersiveHomepage = ({ children }) => {
  const [scrollY, setScrollY] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const containerRef = useRef();

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollPosition = containerRef.current.scrollTop;
        setScrollY(scrollPosition);
        
        // Determine current section based on scroll position
        const sectionHeight = window.innerHeight;
        const section = Math.floor(scrollPosition / sectionHeight);
        setCurrentSection(Math.min(section, 4)); // 5 sections (0-4)
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // F1 Car silhouettes for different eras (simplified SVG paths)
  const carSilhouettes = {
    1950: "M10,20 L50,20 L55,15 L60,20 L90,20 L85,25 L5,25 Z", // Simple 1950s car
    1970: "M5,20 L15,15 L45,15 L55,20 L85,20 L80,25 L10,25 Z", // 1970s with basic wing
    1990: "M5,18 L20,12 L40,12 L60,18 L80,18 L75,26 L10,26 Z", // 1990s advanced aero
    2000: "M8,16 L25,10 L45,10 L62,16 L78,16 L73,28 L13,28 Z", // 2000s V10 era
    2020: "M10,15 L30,8 L50,8 L70,15 L75,15 L70,30 L15,30 Z"   // Modern hybrid
  };

  const sections = [
    {
      year: "1950",
      era: "The Beginning",
      title: "Formula 1 is Born",
      description: "The first Formula 1 World Championship begins at Silverstone. Simple, powerful machines with minimal aerodynamics race at incredible speeds.",
      car: carSilhouettes[1950],
      color: "#8B4513",
      speed: 1
    },
    {
      year: "1970s",
      era: "The Aero Revolution", 
      title: "Wings Change Everything",
      description: "Aerodynamic wings appear, fundamentally changing car design. Downforce becomes as important as horsepower in the pursuit of speed.",
      car: carSilhouettes[1970],
      color: "#FF6B35",
      speed: 1.3
    },
    {
      year: "1990s",
      era: "Technology Explosion",
      title: "Electronics Take Over",
      description: "Advanced electronics, active suspension, and sophisticated aerodynamics push lap times to new limits. Technology defines performance.",
      car: carSilhouettes[1990],
      color: "#4ECDC4",
      speed: 1.6
    },
    {
      year: "2000s",
      era: "V10 Perfection",
      title: "The Fastest Era",
      description: "V10 engines scream at 19,000 RPM. Many lap records set in this era still stand today. Pure speed reaches its peak.",
      car: carSilhouettes[2000],
      color: "#E74C3C",
      speed: 2.0
    },
    {
      year: "2014+",
      era: "Hybrid Future",
      title: "Power & Efficiency",
      description: "Hybrid power units combine incredible power with efficiency. Technology advances, but speed paradoxically decreases.",
      car: carSilhouettes[2020],
      color: "#2ECC71",
      speed: 1.8
    }
  ];
  
  return (
    <div 
      ref={containerRef}
      style={{
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        background: 'linear-gradient(135deg, #0f1419 0%, #1a252f 50%, #2d3748 100%)',
        color: 'white',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        scrollBehavior: 'smooth'
      }}
    >
      {/* Hero Section */}
      <section style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        background: `linear-gradient(45deg, #1a1a2e, #16213e, #0f3460)`,
        transform: `translateY(${scrollY * 0.5}px)` // Parallax effect
      }}>
        {/* Floating F1 cars background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          opacity: 0.1
        }}>
          {[...Array(5)].map((_, i) => (
            <svg 
              key={i}
              style={{
                position: 'absolute',
                top: `${20 + i * 15}%`,
                left: `${-20 + (scrollY * 0.1 * (i + 1)) % 120}%`,
                width: '100px',
                height: '40px',
                transform: `scale(${1 + i * 0.2})`,
                transition: 'all 0.3s ease'
              }}
              viewBox="0 0 100 40"
            >
              <path 
                d={Object.values(carSilhouettes)[i]} 
                fill="rgba(255,255,255,0.3)"
                transform="scale(1.2)"
              />
            </svg>
          ))}
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 6rem)',
          fontWeight: '900',
          textAlign: 'center',
          marginBottom: '2rem',
          background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: 'none',
          transform: `scale(${1 + scrollY * 0.0001})`,
          lineHeight: 1.1
        }}>
          The Evolution of Speed
        </h1>
        
        <p style={{
          fontSize: 'clamp(1.2rem, 3vw, 2rem)',
          textAlign: 'center',
          marginBottom: '3rem',
          opacity: Math.max(0, 1 - scrollY * 0.002),
          maxWidth: '800px',
          lineHeight: 1.4
        }}>
          How Formula 1 Lap Times Changed Over 75 Years
        </p>



        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
        `}</style>
      </section>

      {/* Era Sections */}
      {sections.map((section, index) => (
        <section 
          key={index}
          style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 10%',
            position: 'relative',
            background: `linear-gradient(135deg, ${section.color}15, ${section.color}05)`,
            transform: `translateY(${(scrollY - (index + 1) * window.innerHeight) * 0.3}px)`,
            opacity: currentSection >= index ? 1 : 0.3,
            transition: 'opacity 0.5s ease'
          }}
        >
          {/* Content Side */}
          <div style={{
            flex: 1,
            maxWidth: '600px',
            transform: `translateX(${currentSection === index + 1 ? '0' : '-50px'})`,
            opacity: currentSection === index + 1 ? 1 : 0.7,
            transition: 'all 0.6s ease'
          }}>
            <div style={{
              fontSize: '1.2rem',
              color: section.color,
              fontWeight: '600',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              {section.era}
            </div>
            
            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              fontWeight: '800',
              marginBottom: '1rem',
              color: 'white',
              lineHeight: 1.2
            }}>
              <span style={{ color: section.color }}>{section.year}</span>
              <br />
              {section.title}
            </h2>
            
            <p style={{
              fontSize: '1.3rem',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '2rem'
            }}>
              {section.description}
            </p>

            {/* Speed indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)' }}>
                Relative Speed:
              </span>
              <div style={{
                width: '200px',
                height: '8px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(section.speed / 2) * 100}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${section.color}, ${section.color}dd)`,
                  borderRadius: '4px',
                  transition: 'width 1s ease',
                  boxShadow: `0 0 10px ${section.color}66`
                }} />
              </div>
              <span style={{ 
                fontSize: '1.1rem', 
                fontWeight: 'bold',
                color: section.color 
              }}>
                {section.speed.toFixed(1)}x
              </span>
            </div>
          </div>

          {/* F1 Car Side */}
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}>
            <svg 
              style={{
                width: 'min(400px, 40vw)',
                height: 'min(200px, 20vw)',
                filter: `drop-shadow(0 0 20px ${section.color}66)`,
                transform: `
                  translateX(${currentSection === index + 1 ? '0' : '100px'}) 
                  scale(${currentSection === index + 1 ? 1 : 0.8})
                `,
                transition: 'all 0.8s ease'
              }}
              viewBox="0 0 100 40"
            >
              <defs>
                <linearGradient id={`carGradient${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={section.color} />
                  <stop offset="100%" stopColor={section.color + 'aa'} />
                </linearGradient>
              </defs>
              <path 
                d={section.car}
                fill={`url(#carGradient${index})`}
                stroke={section.color}
                strokeWidth="1"
                transform="scale(0.8)"
              />
              
              {/* Speed lines effect */}
              {[...Array(3)].map((_, i) => (
                <line
                  key={i}
                  x1={-10 - i * 5}
                  y1={15 + i * 3}
                  x2={5 - i * 5}
                  y2={15 + i * 3}
                  stroke={section.color}
                  strokeWidth="1"
                  opacity={currentSection === index + 1 ? 0.6 : 0}
                  style={{
                    animation: currentSection === index + 1 ? `speedLine 0.8s infinite` : 'none'
                  }}
                />
              ))}
            </svg>
          </div>

          <style jsx>{`
            @keyframes speedLine {
              0% { transform: translateX(0px); opacity: 0; }
              50% { opacity: 0.8; }
              100% { transform: translateX(-20px); opacity: 0; }
            }
          `}</style>
        </section>
      ))}

      {/* Call to Action Section */}
      <section style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(45deg, #1a1a2e, #16213e)',
        position: 'relative'
      }}>
        <h2 style={{
          fontSize: 'clamp(2rem, 6vw, 4rem)',
          fontWeight: '800',
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#4ecdc4'
        }}>
          Ready to Explore?
        </h2>
        
        <p style={{
          fontSize: '1.4rem',
          textAlign: 'center',
          marginBottom: '3rem',
          maxWidth: '600px',
          color: 'rgba(255,255,255,0.9)',
          lineHeight: 1.5
        }}>
          Dive into our interactive analysis of 14 qualifying circuits and discover how technology shaped the evolution of Formula 1 speed.
        </p>

        <div style={{
          fontSize: '1.2rem',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.8)',
          animation: 'pulse 2s infinite'
        }}>
          ↓ Continue scrolling to explore circuits ↓
        </div>
      </section>

      {/* WorldMap and CircuitInfo sections will be rendered here */}
      {children && (
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f1419 0%, #1a252f 50%, #2d3748 100%)',
          padding: '20px 0'
        }}>
          {children}
        </div>
      )}
    </div>
  );
};

export default ImmersiveHomepage;