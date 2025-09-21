# Sakila Film Verhuur

Een webapplicatie voor het huren van films. Gebruikers kunnen zich registreren, inloggen, films bekijken en huren.

## Wat doet het

- Inloggen en registreren
- Films bekijken en zoeken
- Films reserveren
- Profiel bewerken
- Account verwijderen

## Technologie

- Node.js + Express
- MySQL (Sakila database)
- Pug templates
- Bootstrap voor styling
- JWT voor authenticatie

## Setup

1. `npm install` (installeer alle dependencies)
2. Zorg dat je een `.env` bestand hebt met database gegevens:
   ```
   DB_HOST=localhost
   DB_USER=username
   DB_PASSWORD=password
   DB_DATABASE=sakila
   ```
3. `npm start` (start de server met nodemon)
4. Ga naar `http://localhost:3000`

## Tests

`npm run cypress:open` voor tests
Gemaakt door Stan Braks
