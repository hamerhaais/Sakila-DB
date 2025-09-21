describe('Account CRUD (e2e)', () => {
  const timestamp = Date.now();
  const testEmail = `e2e_user_${timestamp}@example.com`;
  const password = 'TestPass123!';

  it('creates, reads, updates and deletes an account', () => {
    cy.visit('/auth/register');
    cy.get('input[name="first_name"]').type('E2E');
    cy.get('input[name="last_name"]').type('User');
    cy.get('input[name="email"]').type(testEmail);
    cy.get('input[name="password"]').type(password);
    cy.get('select[name="store_id"]').select(0);
    cy.get('select[name="address_id"]').select(0);
    cy.get('button[type="submit"]').contains(/registreren|Registreren/i).click();

    cy.get('input[name="email"]').type(testEmail);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').contains(/log in|Log in|Inloggen/i).click();

    cy.visit('/profile/edit');
    cy.get('input[name="first_name"]').clear().type('E2E-Updated');
    cy.get('input[name="last_name"]').clear().type('User-Updated');
    cy.get('button[type="submit"]').contains(/opslaan|Opslaan|Save/i).click();
    
    cy.visit('/profile/edit');
    cy.get('input[name="first_name"]').should('have.value', 'E2E-Updated');
    cy.get('input[name="last_name"]').should('have.value', 'User-Updated');

    cy.get('form[method="POST"][action="/profile/delete"] button[type="submit"]').click();
    cy.on('window:confirm', () => true);
    cy.location('pathname').should('include', '/auth/login');
  });
});