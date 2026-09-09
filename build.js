/* Cayo Labs — build.js
 * Genera dist/index.html desde content/ (settings.json + colecciones).
 * Solo usa módulos nativos de Node (fs, path). Sin dependencias.
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const CONTENT = path.join(ROOT, 'content');
const DIST = path.join(ROOT, 'dist');

// ---------- Helpers ----------
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Parse frontmatter YAML simple (clave: valor) + body. Solo campos planos.
function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { fields: {}, body: text };
  const fields = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (kv) fields[kv[1]] = kv[2].replace(/^"(.*)"$/, '$1');
  }
  return { fields, body: m[2].trim() };
}

function readCollection(dir) {
  const abs = path.join(CONTENT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs)
    .filter(f => f.endsWith('.md'))
    .sort()
    .map(f => parseFrontmatter(fs.readFileSync(path.join(abs, f), 'utf8')).fields);
}

// ---------- Iconos SVG (por clave) ----------
const ICONS = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  code: '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  layers: '<path d="M12 2L2 7l10 5 10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>',
  shield: '<path d="M12 2L4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z"/>',
};
function iconSvg(key) {
  const inner = ICONS[key] || ICONS.grid;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

const PROJECT_COLORS = {
  teal: 'linear-gradient(135deg, var(--color-primary), #0a5d5c)',
  coral: 'linear-gradient(135deg, var(--color-accent), #8a3f2c)',
  navy: 'linear-gradient(135deg, #3d6b8c, #2a4d66)',
};

// ---------- Leer contenido ----------
const settings = JSON.parse(fs.readFileSync(path.join(CONTENT, 'settings.json'), 'utf8'));
const team = readCollection('team');
const services = readCollection('services');
const projects = readCollection('projects');

// ---------- Generar secciones ----------
const teamHtml = team.map(m => `
          <article class="card team__card">
            <div class="avatar" style="--a:${esc(m.avatar_color || '#0E7C7B')}">CL</div>
            <h3 class="team__name">${esc(m.name)}</h3>
            <p class="team__role">${esc(m.role)}</p>
            <p class="team__bio">${esc(m.bio)}</p>
          </article>`).join('');

const servicesHtml = services.map(s => `
          <article class="card service">
            <div class="service__icon" aria-hidden="true">${iconSvg(s.icon)}</div>
            <h3 class="service__title">${esc(s.title)}</h3>
            <p class="service__desc">${esc(s.description)}</p>
          </article>`).join('');

const projectsHtml = projects.map(p => `
          <article class="card work__item">
            <div class="work__thumb" style="background:${PROJECT_COLORS[p.color] || PROJECT_COLORS.teal}" aria-hidden="true"></div>
            <div class="work__body">
              <p class="work__tag">${esc(p.tag)}</p>
              <h3 class="work__title">${esc(p.title)}</h3>
              <p class="work__desc">${esc(p.description)}</p>
            </div>
          </article>`).join('');

const statsHtml = (settings.stats || []).map(s => `
            <li><span class="stats__num">${esc(s.num)}</span><span class="stats__label">${esc(s.label)}</span></li>`).join('');

const stackHtml = (settings.stack || []).map(t => `<li>${esc(t)}</li>`).join('');

// ---------- Plantilla HTML ----------
const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(settings.brand)} — Desarrollo de software hecho en Cuba</title>
  <meta name="description" content="${esc(settings.hero_lede)}" />
  <meta property="og:title" content="${esc(settings.brand)} — Software hecho en Cuba" />
  <meta property="og:description" content="${esc(settings.hero_lede)}" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="es_ES" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='13' fill='none' stroke='%230E7C7B' stroke-width='2.5'/%3E%3Cpath d='M4 16 Q16 26 28 16' fill='none' stroke='%230E7C7B' stroke-width='2.5'/%3E%3Ccircle cx='16' cy='9' r='3' fill='%230E7C7B'/%3E%3C/svg%3E" />
</head>
<body>
  <header class="header" id="header">
    <div class="container header__inner">
      <a href="#inicio" class="brand" aria-label="${esc(settings.brand)} — inicio">
        <svg class="brand__mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <circle cx="20" cy="20" r="17" stroke="currentColor" stroke-width="2.4" />
          <path d="M3 20 Q20 32 37 20" stroke="currentColor" stroke-width="2.4" fill="none" />
          <circle cx="20" cy="11" r="3.4" fill="currentColor" />
        </svg>
        <span class="brand__name">Cayo<span class="brand__dot">.</span>Labs</span>
      </a>
      <nav class="nav" aria-label="Navegación principal">
        <ul role="list" class="nav__list">
          <li><a href="#equipo" class="nav__link">Equipo</a></li>
          <li><a href="#servicios" class="nav__link">Servicios</a></li>
          <li><a href="#portafolio" class="nav__link">Portafolio</a></li>
          <li><a href="#contacto" class="nav__link">Contacto</a></li>
        </ul>
      </nav>
      <div class="header__actions">
        <button class="theme-toggle" data-theme-toggle aria-label="Cambiar modo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
        </button>
        <a href="#contacto" class="btn btn--primary btn--sm">Hablemos</a>
        <button class="menu-toggle" aria-label="Abrir menú" aria-expanded="false">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
      </div>
    </div>
  </header>

  <main>
    <section class="hero" id="inicio">
      <div class="hero__bg" aria-hidden="true">
        <svg class="hero__contours" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" fill="none">
          <g stroke="currentColor" stroke-width="1" opacity="0.5">
            <path d="M0,420 Q360,360 720,420 T1440,420" />
            <path d="M0,450 Q360,390 720,450 T1440,450" />
            <path d="M0,485 Q360,425 720,485 T1440,485" />
            <path d="M0,525 Q360,465 720,525 T1440,525" />
          </g>
          <g stroke="currentColor" stroke-width="1" opacity="0.18">
            <circle cx="720" cy="520" r="120" />
            <circle cx="720" cy="520" r="175" />
            <circle cx="720" cy="520" r="235" />
            <circle cx="720" cy="520" r="300" />
          </g>
        </svg>
      </div>
      <div class="container hero__inner">
        <p class="eyebrow">${esc(settings.hero_eyebrow)}</p>
        <h1 class="hero__title">${esc(settings.hero_title_pre)} <span class="hl">${esc(settings.hero_title_highlight)}</span> ${esc(settings.hero_title_post)}</h1>
        <p class="hero__lede">${esc(settings.hero_lede)}</p>
        <div class="hero__cta">
          <a href="#contacto" class="btn btn--primary">Iniciar un proyecto</a>
          <a href="#servicios" class="btn btn--ghost">Ver servicios</a>
        </div>
        <ul role="list" class="stats">${statsHtml}
        </ul>
      </div>
    </section>

    <section class="strip">
      <div class="container strip__inner">
        <p class="strip__label">Stack que dominamos</p>
        <ul role="list" class="stack">${stackHtml}
        </ul>
      </div>
    </section>

    <section class="section" id="equipo">
      <div class="container">
        <header class="section__head">
          <p class="eyebrow">Sobre nosotros</p>
          <h2 class="section__title">Un equipo pequeño, con experiencia grande.</h2>
          <p class="section__lede">Tres ingenieros en Informática y Ciencias de la Computación, con más de una década construyendo software juntos.</p>
        </header>
        <div class="team">${teamHtml}
        </div>
      </div>
    </section>

    <section class="section section--surface" id="servicios">
      <div class="container">
        <header class="section__head">
          <p class="eyebrow">Servicios</p>
          <h2 class="section__title">Lo que podemos construir contigo.</h2>
        </header>
        <div class="services">${servicesHtml}
        </div>
      </div>
    </section>

    <section class="section" id="portafolio">
      <div class="container">
        <header class="section__head">
          <p class="eyebrow">Portafolio</p>
          <h2 class="section__title">Proyectos de referencia.</h2>
          <p class="section__lede">Ejemplos del tipo de trabajo que realizamos.</p>
        </header>
        <div class="work">${projectsHtml}
        </div>
      </div>
    </section>

    <section class="section section--surface" id="contacto">
      <div class="container contact">
        <div class="contact__intro">
          <p class="eyebrow">Contacto</p>
          <h2 class="section__title">¿Tienes un proyecto en mente?</h2>
          <p class="section__lede">Cuéntanos qué necesitas y te respondemos con una propuesta clara.</p>
          <ul role="list" class="contact__list">
            <li>
              <span class="contact__ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 6l10 7 10-7"/></svg></span>
              <a href="mailto:${esc(settings.contact_email)}">${esc(settings.contact_email)}</a>
            </li>
            <li>
              <span class="contact__ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="M4 4l8 8 8-8"/></svg></span>
              <span>${esc(settings.contact_location)}</span>
            </li>
          </ul>
        </div>
        <form class="contact__form" action="https://formsubmit.co/${esc(settings.contact_email)}" method="POST" data-contact-email="${esc(settings.contact_email)}">
          <input type="hidden" name="_subject" value="Nuevo mensaje desde el sitio de ${esc(settings.brand)}" />
          <input type="hidden" name="_template" value="table" />
          <input type="hidden" name="_captcha" value="false" />
          <input type="text" name="_honey" class="form__honey" tabindex="-1" autocomplete="off" aria-hidden="true" />
          <div class="field"><label for="nombre">Nombre</label><input type="text" id="nombre" name="nombre" placeholder="Tu nombre" required /></div>
          <div class="field"><label for="email">Correo</label><input type="email" id="email" name="email" placeholder="tu@correo.com" required /></div>
          <div class="field"><label for="mensaje">Mensaje</label><textarea id="mensaje" name="mensaje" rows="4" placeholder="Cuéntanos sobre tu proyecto" required></textarea></div>
          <button type="submit" class="btn btn--primary btn--block">Enviar mensaje</button>
          <p class="form__status" role="status" aria-live="polite" hidden></p>
          <p class="form__note">Te responderemos al correo que indiques.</p>
        </form>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container footer__inner">
      <a href="#inicio" class="brand brand--footer" aria-label="${esc(settings.brand)} — inicio">
        <svg class="brand__mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <circle cx="20" cy="20" r="17" stroke="currentColor" stroke-width="2.4" />
          <path d="M3 20 Q20 32 37 20" stroke="currentColor" stroke-width="2.4" fill="none" />
          <circle cx="20" cy="11" r="3.4" fill="currentColor" />
        </svg>
        <span class="brand__name">Cayo<span class="brand__dot">.</span>Labs</span>
      </a>
      <p class="footer__tag">Desarrollo de software hecho en Cuba.</p>
      <nav aria-label="Enlaces del pie">
        <ul role="list" class="footer__nav">
          <li><a href="#equipo">Equipo</a></li>
          <li><a href="#servicios">Servicios</a></li>
          <li><a href="#portafolio">Portafolio</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>
      </nav>
      <p class="footer__copy">© <span id="year"></span> ${esc(settings.brand)}. Todos los derechos reservados.</p>
    </div>
  </footer>
  <script src="app.js"></script>
</body>
</html>
`;

// ---------- Escribir dist ----------
fs.mkdirSync(DIST, { recursive: true });
fs.copyFileSync(path.join(ROOT, 'styles.css'), path.join(DIST, 'styles.css'));
fs.copyFileSync(path.join(ROOT, 'app.js'), path.join(DIST, 'app.js'));
fs.writeFileSync(path.join(DIST, 'index.html'), html, 'utf8');
console.log('Build OK -> dist/index.html (' + team.length + ' equipo, ' + services.length + ' servicios, ' + projects.length + ' proyectos)');
