// Flujo: registro de paciente nuevo
describe('Registro de paciente', () => {
  const email = `test_${Date.now()}@beautybook.com`;

  it('completa el registro y redirige al dashboard', () => {
    cy.visit('/register');

    cy.get('input[name="name"]').type('Paciente Cypress');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').first().type('Demo1234!');
    cy.get('input[name="password_confirmation"]').type('Demo1234!');

    cy.get('button[type="submit"]').click();

    cy.url({ timeout: 10000 }).should('include', '/paciente/dashboard');
    cy.contains('Bienvenido').should('exist');
  });

  it('rechaza registro con contraseña corta', () => {
    cy.visit('/register');

    cy.get('input[name="name"]').type('Test');
    cy.get('input[name="email"]').type(`otra_${Date.now()}@test.com`);
    cy.get('input[name="password"]').first().type('123');
    cy.get('input[name="password_confirmation"]').type('123');

    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/register');
  });
});
