const fs = require('fs');

let css = fs.readFileSync('D:/Project/FE/src/index.css', 'utf8');
const startIdx = css.indexOf('/* LANDING PAGE STYLES');
const endIdx = css.indexOf('/* DASHBOARD STYLES');

if (startIdx > -1 && endIdx > -1) {
  const newCss = `/* LANDING PAGE STYLES                                                      */
/* ========================================================================= */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&family=Noto+Sans+JP:wght@400;500;700;900&display=swap');

:root {
  --loveable-bg: #FFFFFF;
  --loveable-indigo: #3B82F6;
  --loveable-indigo-dark: #2563EB;
  --loveable-text-dark: #0F172A;
  --loveable-text-gray: #475569;
  --loveable-border: #E2E8F0;
  --loveable-card-bg: #F8FAFC;
}

.landing-page-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background-color: var(--loveable-bg);
  color: var(--loveable-text-dark);
  font-family: 'Inter', sans-serif;
}

.landing-content-wrapper {
  position: relative;
  z-index: 10;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* --- Top Bar --- */
.top-bar {
  display: none; /* Hide top bar for cleaner look */
}

/* --- Main Header --- */
.main-header {
  background-color: transparent;
  padding: 16px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
  border-bottom: 1px solid var(--loveable-border);
}

.header-logo {
  margin-left: 120px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 24px;
}

.register-link {
  color: var(--loveable-text-dark);
  font-weight: 600;
  text-decoration: none;
  font-size: 1rem;
}

.register-link:hover {
  color: var(--loveable-indigo);
}

.login-btn-header {
  background: #0F172A;
  color: #FFFFFF;
  font-weight: 600;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 9999px;
  transition: all 0.3s ease;
}

.login-btn-header:hover {
  background: #1E293B;
}

/* --- Hero Section --- */
.hero-section {
  display: flex;
  max-width: 1300px;
  margin: 0 auto;
  padding: 80px 40px;
  width: 100%;
  align-items: center;
  min-height: calc(100vh - 80px);
  gap: 40px;
}

.hero-text-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: #EFF6FF;
  border: 1px solid #DBEAFE;
  padding: 8px 16px;
  border-radius: 9999px;
  margin-bottom: 32px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--loveable-text-gray);
}
.hero-badge .badge-highlight {
  color: var(--loveable-indigo);
  font-weight: 700;
  letter-spacing: 1px;
}

.hero-heading {
  font-size: 4rem;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 24px;
  letter-spacing: -2px;
  color: var(--loveable-text-dark);
}

.hero-heading .text-gradient {
  color: var(--loveable-indigo);
  background: none;
  -webkit-text-fill-color: initial;
}

.hero-description {
  list-style: none;
  margin-bottom: 40px;
  color: var(--loveable-text-gray);
  font-size: 1.25rem;
  line-height: 1.6;
  max-width: 90%;
  padding-left: 0;
}

.hero-description li {
  margin-bottom: 8px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.cta-button {
  background: var(--loveable-indigo);
  color: #FFFFFF;
  font-weight: 600;
  font-size: 1.1rem;
  text-decoration: none;
  padding: 16px 32px;
  border-radius: 9999px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.cta-button:hover {
  transform: translateY(-2px);
  background: var(--loveable-indigo-dark);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}

.hero-illustration {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.computer-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  animation: slowFloat 8s ease-in-out infinite alternate;
}

@media (max-width: 1024px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 40px 20px;
  }
  .hero-text-content {
    align-items: center;
  }
  .hero-heading {
    font-size: 3rem;
  }
  .hero-description {
    text-align: center;
    max-width: 100%;
  }
  .header-logo {
    margin-left: 20px;
  }
}

/* ========================================================================= */
`;
  css = css.substring(0, startIdx) + newCss + css.substring(endIdx);
  fs.writeFileSync('D:/Project/FE/src/index.css', css);
  console.log('Updated index.css');
} else {
  console.log('Could not find markers');
}
