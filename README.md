# Cayo Labs — Sitio web

Sitio estático de Cayo Labs, equipo de desarrollo de software en Cuba. El contenido
se edita desde un panel web con **Pages CMS** y se despliega automáticamente en
**Vercel** cada vez que se hace un cambio.

## Estructura

```
content/
  settings.json     # Ajustes del sitio (hero, contacto, estadísticas, stack)
  team/*.md          # Miembros del equipo
  services/*.md      # Servicios
  projects/*.md      # Proyectos del portafolio
build.js             # Genera dist/index.html desde content/ (sin dependencias)
.pages.yml           # Configuración del panel de Pages CMS
vercel.json          # Configuración de despliegue en Vercel
```

## Cómo funciona

1. Editas el contenido en el panel web de Pages CMS (no tocas código).
2. Pages CMS guarda los cambios como commits en este repo de GitHub.
3. Vercel detecta el commit, ejecuta `node build.js` y publica el sitio actualizado.

## Editar contenido (panel web)

1. Entra en **https://app.pagescms.org** e inicia sesión con GitHub.
2. Autoriza la GitHub App de Pages CMS sobre este repositorio.
3. Selecciona el repo `cayolabs` y edita: Ajustes del sitio, Equipo, Servicios, Portafolio.
4. Guarda; en ~1 minuto el cambio estará en producción.

## Editar código localmente

```bash
npm run build      # genera dist/index.html
npx serve dist     # o abre dist/index.html en el navegador
```

## Despliegue

El proyecto está conectado a Vercel: cada push a `main` despliega automáticamente.
URL: https://cayolabs.vercel.app
