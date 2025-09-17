# Sakila Webapplicatie (Avans Leeruitkomst 1)

## Overzicht
Deze full-stack webapp ontsluit data uit de MySQL Sakila database. Gebouwd met Node.js, Express.js, en Pug. Gelaagde architectuur: Route → Middleware → Controller → Service → DAO → Database.

## Installatie
1. Vereisten: Node.js, MySQL Sakila database.
2. Clone dit project.
3. Zet `.env` met je database gegevens:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=JouwWachtwoord
   DB_DATABASE=sakila
   DB_PORT=3306
   ```
4. Installeer dependencies:
   ```
   npm install
   ```
5. Start de app:
   ```
   npm start
   ```

## Belangrijkste Routes
- `/films` — Overzicht van alle films
- `/films/:filmId/details` — Detailpagina van een film
- `/auth/login` — Loginpagina
- `/auth/register` — Registratiepagina
- `/profile/rentals` — Mijn Huringen (beveiligd)

## Testen
Testen staan in `/test`. Run met:
```
npx mocha
```

## CI/CD & Online Database
Voor CI/CD kun je GitHub Actions gebruiken. Voeg een `.github/workflows/nodejs.yml` toe die automatisch je tests draait bij elke push. Voor deployment kun je bijvoorbeeld Heroku, Vercel of een VPS gebruiken. Gebruik een online MySQL provider zoals PlanetScale of ClearDB voor je database.

Voorbeeld workflow:
```yaml
name: Node.js CI
on: [push]
jobs:
   build:
      runs-on: ubuntu-latest
      steps:
         - uses: actions/checkout@v2
         - name: Install dependencies
            run: npm install
         - name: Run tests
            run: npm test
```

## Rubric
- Custom error pagina's
- Flash messages
- Veilige wachtwoordopslag
- Registratie-flow
- Unit tests
- Documentatie
- CI/CD uitleg
- Online database uitleg
