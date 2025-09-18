describe('Account CRUD (e2e)', () => {
  const timestamp = Date.now();
  const testEmail = `e2e_user_${timestamp}@example.com`;
  const password = 'TestPass123!';

  it('creates, reads, updates and deletes an account via the UI', () => {
    // 1) Register
    cy.visit('http://localhost:3000/auth/register');
    cy.get('input[name="first_name"]').type('E2E');
    cy.get('input[name="last_name"]').type('User');
    cy.get('input[name="email"]').type(testEmail);
    cy.get('input[name="password"]').type(password);
    // If store/address selects are present, choose the first options if available
    cy.get('select[name="store_id"]').then($el => {
      if ($el.length && $el.find('option').length) cy.get('select[name="store_id"]').select($el.find('option').first().val());
    });
    cy.get('select[name="address_id"]').then($el => {
      if ($el.length && $el.find('option').length) cy.get('select[name="address_id"]').select($el.find('option').first().val());
    });
    cy.get('button[type="submit"]').contains(/registreren|Registreren/i).click();

  // After registration, should redirect to login with success flash
  cy.location('pathname').should('include', '/auth/login');

    // 2) Login
    cy.get('input[name="email"]').type(testEmail);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').contains(/log in|Log in|Inloggen/i).click();

    // After login, should be on /films (or at least set a token cookie)
    cy.location('pathname').should(path => {
      expect(['/films', '/']).to.include(path);
    });

    // 3) Read profile (rentals page shows user info)
    cy.visit('http://localhost:3000/profile/rentals');
    cy.contains('Mijn Huringen');

    // 4) Edit profile
    cy.visit('http://localhost:3000/profile/edit');
    cy.get('input[name="first_name"]').clear().type('E2E-Updated');
    cy.get('input[name="last_name"]').clear().type('User-Updated');
    cy.get('button[type="submit"]').contains(/opslaan|Opslaan|Save/i).click();

    // After update, redirect back to edit or profile; re-open edit form to assert values
    cy.visit('http://localhost:3000/profile/edit');
    cy.get('input[name="first_name"]').should('have.value', 'E2E-Updated');
    cy.get('input[name="last_name"]').should('have.value', 'User-Updated');

    // 5) Delete account
    // The delete is a POST form on /profile/delete; the UI has a button with confirmation. We'll trigger the form submit.
    cy.get('form[method="POST"][action="/profile/delete"]').then($form => {
      if ($form.length) {
        // Interact with the delete button
        cy.get('form[method="POST"][action="/profile/delete"] button[type="submit"]').click();
        // The app shows a confirmation JS dialog; confirm it
        cy.on('window:confirm', () => true);
      } else {
        // fallback: POST to endpoint to delete (requires cookie auth still present)
        cy.request('POST', '/profile/delete');
      }
    });

    // After deletion, should redirect to login
    cy.url().should('include', 'http://localhost:3000/auth/login');
  });
});