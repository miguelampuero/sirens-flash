# Sirens Flash — subirlo a Netlify desde el navegador (con los MP3)

Todo se hace en el navegador, sin instalar nada. Se usa GitHub como "caja" para los archivos
y Netlify los publica desde ahí (así funcionan también el ranking y la lista de jugadores en línea).

## 1. Subir la carpeta a GitHub
1. Entra a https://github.com y crea una cuenta si no tienes.
2. Arriba a la derecha: **+ → New repository**. Nombre: `sirens-flash`. Marca **Public** o **Private** y pulsa **Create repository**.
3. En la página del repositorio vacío, haz clic en **uploading an existing file**.
4. Abre la carpeta `Sleeping with sirens` en tu PC, selecciona TODO su contenido
   (index.html, LEEME.md, netlify.toml, package.json, .gitignore y las carpetas assets, netlify y songs)
   y arrástralo a la página de GitHub. Espera a que terminen de subir los MP3.
5. Abajo pulsa **Commit changes**.

## 2. Publicarlo en Netlify
1. Entra a https://app.netlify.com e inicia sesión con tu cuenta de GitHub.
2. **Add new project → Import an existing project → GitHub** y elige `sirens-flash`.
3. No cambies nada (Netlify lee `netlify.toml`) y pulsa **Deploy**.
4. En uno o dos minutos tendrás tu link `https://....netlify.app`. Puedes cambiar el nombre en
   **Project configuration → Change project name**.

Cada vez que subas un cambio al repositorio, Netlify actualiza el sitio solo.

## Por qué no arrastrar directo a Netlify Drop
Netlify Drop publica el juego y los MP3, pero no las funciones del ranking:
el juego funcionaría, pero sin TOP ni jugadores en línea.

## Estructura
- `index.html` — el juego
- `assets/` — logo, emblema y foto
- `songs/` — los MP3 (el nombre del archivo debe coincidir con el id de la canción)
- `netlify/functions/` — API del ranking (`/api/scores`) y de jugadores en línea (`/api/presence`)
