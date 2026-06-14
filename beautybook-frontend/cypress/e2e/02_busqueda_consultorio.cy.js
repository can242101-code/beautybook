// Flujo: paciente busca consultorio y ve tratamientos
describe('Búsqueda de consultorio', () => {
  beforeEach(() => {
    cy.loginAs('paciente');
    cy.visit('/paciente/consultorios');
  });

  it('muestra el listado de consultorios activos', () => {
    cy.get('.card', { timeout: 8000 }).should('have.length.at.least', 1);
    cy.contains('Clínica Dental Ruiz').should('exist');
  });

  it('filtra por ciudad', () => {
    cy.get('input[placeholder*="ciudad"], input[placeholder*="buscar"], input[type="search"]')
      .first()
      .type('CDMX');
    cy.contains('Clínica Dental Ruiz').should('exist');
  });

  it('navega al detalle del consultorio y muestra tratamientos', () => {
    cy.contains('Clínica Dental Ruiz').click();
    cy.url({ timeout: 8000 }).should('match', /\/paciente\/consultorios\/\d+/);
    cy.contains('Limpieza dental', { timeout: 8000 }).should('exist');
  });
});
