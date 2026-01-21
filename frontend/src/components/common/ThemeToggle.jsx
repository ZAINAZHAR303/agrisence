import React from 'react';
import styled from 'styled-components';

const ThemeToggle = ({ theme, onToggle }) => {
  const isLightTheme = theme === 'light';

  return (
    <StyledWrapper>
      <label className="switch">
        <input
          type="checkbox"
          checked={isLightTheme}
          onChange={onToggle}
        />
        <span className="slider">
          {/* Dark Theme - Roots */}
          <svg className="roots" viewBox="0 0 512 512" fill="currentColor">
            <g>
              <path d="M256,450c-20,0-40-5-60-15c-15-8-30-18-45-30c-40-30-80-70-110-120c-10-15-15-30-20-45c-5-20-5-40,0-60 c5-15,10-30,20-40c5-5,10-10,15-15c10-10,20-15,30-20c20-10,40-15,60-15c20,0,40,5,60,15c10,5,20,10,30,20c5,5,10,10,15,15 c10,10,15,25,20,40c5,20,5,40,0,60c-5,15-10,30-20,45c-30,50-70,90-110,120C296,445,276,450,256,450z M256,80 c-15,0-30,5-45,10c-10,5-20,10-30,20c-5,5-10,10-15,15c-5,5-10,15-15,25c-5,15-5,30,0,45c5,10,10,20,15,30 c25,40,55,75,90,100c35-25,65-60,90-100c5-10,10-20,15-30c5-15,5-30,0-45c-5-10-10-20-15-25c-5-5-10-10-15-15 c-10-10-20-15-30-20C286,85,271,80,256,80z" />
              <path d="M256,320c-10,0-20-5-25-15c-5-5-5-10-5-15c0-5,0-10,5-15c5-10,15-15,25-15s20,5,25,15c5,5,5,10,5,15 c0,5,0,10-5,15C276,315,266,320,256,320z" />
              <path d="M206,280c-5,0-10-5-10-10v-40c0-5,5-10,10-10s10,5,10,10v40C216,275,211,280,206,280z" />
              <path d="M306,280c-5,0-10-5-10-10v-40c0-5,5-10,10-10s10,5,10,10v40C316,275,311,280,306,280z" />
              <path d="M256,240c-5,0-10-5-10-10v-40c0-5,5-10,10-10s10,5,10,10v40C266,235,261,240,256,240z" />
            </g>
          </svg>

          {/* Light Theme - Small Plant */}
          <svg className="plant" viewBox="0 0 512 512" fill="currentColor">
            <g>
              {/* Stem */}
              <path d="M256,400c-5,0-10-5-10-10V200c0-5,5-10,10-10s10,5,10,10v190C266,395,261,400,256,400z" />

              {/* Leaves */}
              <path d="M256,200c-5,0-10-5-10-10v-20c0-5,5-10,10-10s10,5,10,10v20C266,195,261,200,256,200z" />
              <path d="M236,220c-3,0-5-1-7-3c-4-4-4-10,0-14l20-20c4-4,10-4,14,0s4,10,0,14l-20,20C241,219,239,220,236,220z" />
              <path d="M276,220c-3,0-5-1-7-3l-20-20c-4-4-4-10,0-14s10-4,14,0l20,20c4,4,4,10,0,14C281,219,279,220,276,220z" />

              {/* Flower/Bud */}
              <path d="M256,170c-15,0-30-5-40-15c-10-10-15-25-15-40s5-30,15-40c10-10,25-15,40-15s30,5,40,15 c10,10,15,25,15,40s-5,30-15,40C286,165,271,170,256,170z M256,100c-5,0-10,5-15,10c-5,5-10,10-10,15s5,10,10,15 c5,5,10,10,15,10s10-5,15-10c5-5,10-10,10-15s-5-10-10-15C266,105,261,100,256,100z" />
            </g>
          </svg>

          {/* Soil/Sun Base */}
          <div className="base">
            <div className="soil"></div>
            <div className="sun"></div>
          </div>
        </span>
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  /* The switch - the box around the slider */
  .switch {
    font-size: 17px;
    position: relative;
    display: inline-block;
    width: 4em;
    height: 2.2em;
    --soil-color: #8B4513;
    --sun-color: #FFD700;
    --stem-color: #228B22;
    --roots-color: #5D4037;
  }

  /* Hide default HTML checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, #87CEEB 50%, var(--soil-color) 50%);
    transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    border-radius: 30px;
    overflow: hidden;
    border: 2px solid var(--soil-color);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .base {
    position: absolute;
    width: 100%;
    height: 50%;
    bottom: 0;
    left: 0;
  }

  .soil {
    position: absolute;
    width: 100%;
    height: 100%;
    background: var(--soil-color);
    border-top: 2px solid #654321;
  }

  .sun {
    position: absolute;
    width: 1.2em;
    height: 1.2em;
    background: var(--sun-color);
    border-radius: 50%;
    top: -0.6em;
    right: 0.5em;
    transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    box-shadow: 0 0 10px #FFD700;
  }

  .roots {
    position: absolute;
    width: 2.5em;
    height: 1.2em;
    color: var(--roots-color);
    bottom: 0.5em;
    left: 0.4em;
    z-index: 2;
    transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    transform: scale(1);
    opacity: 1;
    filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3));
  }

  .plant {
    position: absolute;
    width: 2.5em;
    height: 1.8em;
    color: var(--stem-color);
    bottom: 0.3em;
    left: 0.4em;
    z-index: 2;
    transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    transform: scale(0);
    opacity: 0;
    filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.2));
  }

  /* Dark theme - show roots, sun on left */
  .switch input:not(:checked) + .slider {
    background: linear-gradient(to bottom, #0F172A 50%, var(--soil-color) 50%);
    border-color: #4A3C31;
  }

  .switch input:not(:checked) + .slider .sun {
    right: auto;
    left: 0.5em;
    background: #CBD5E1;
    box-shadow: 0 0 10px #64748B;
  }

  .switch input:not(:checked) + .slider .roots {
    transform: scale(1) translateX(0);
    opacity: 1;
  }

  .switch input:not(:checked) + .slider .plant {
    transform: scale(0);
    opacity: 0;
  }

  /* Light theme - show plant, sun on right */
  .switch input:checked + .slider {
    background: linear-gradient(to bottom, #87CEEB 50%, var(--soil-color) 50%);
    border-color: var(--soil-color);
  }

  .switch input:checked + .slider .sun {
    right: 0.5em;
    left: auto;
    background: var(--sun-color);
    box-shadow: 0 0 10px #FFD700;
  }

  .switch input:checked + .slider .roots {
    transform: scale(0) translateX(1.5em);
    opacity: 0;
  }

  .switch input:checked + .slider .plant {
    animation: growPlant 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
  }

  @keyframes growPlant {
    0% {
      transform: scale(0) translateY(10px);
      opacity: 0;
    }
    50% {
      transform: scale(1.1) translateY(-5px);
      opacity: 0.8;
    }
    100% {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }

  /* Hover effects */
  .switch:hover .slider {
    border-color: #654321;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }

  .switch:hover .sun {
    animation: sunPulse 2s infinite;
  }

  @keyframes sunPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

export default ThemeToggle;