// Flujo: login para los tres roles
describe('Inicio de sesión', () => {
  it('paciente inicia sesión y llega a su dashboard', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('demo_pac@beautybook.com');
    cy.get('input[name="password"]').type('Demo1234!');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('include', '/paciente/dashboard');
  });

  it('consultorio inicia sesión y llega a su dashboard', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('demo_cons@beautybook.com');
    cy.get('input[name="password"]').type('Demo1234!');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('include', '/consultorio/dashboard');
  });

  it('gestor inicia sesión y llega al panel admin', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('can242101@gmail.com');
    cy.get('input[name="password"]').type('23456789');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('include', '/admin/dashboard');
  });

  it('rechaza credenciales incorrectas', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('noexiste@beautybook.com');
    cy.get('input[name="password"]').type('contraseña_mala');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/login');
    cy.contains('Credenciales incorrectas').should('exist');
  });
});
