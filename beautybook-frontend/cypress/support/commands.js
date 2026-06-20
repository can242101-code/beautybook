const CUENTAS = {
  paciente:    { email: 'demo_pac@beautybook.com',  password: 'Demo1234!' },
  consultorio: { email: 'demo_cons@beautybook.com', password: 'Demo1234!' },
  gestor:      { email: 'gestor@beautybook.com',    password: 'Gestor1234!' },
};

// Login rápido vía API — evita pasar por la UI en cada test
Cypress.Commands.add('loginAs', (role) => {
  const { email, password } = CUENTAS[role];
  const apiUrl = Cypress.env('API_URL') || 'http://localhost:8000/api';

  cy.request('POST', `${apiUrl}/login`, { email, password })
    .then(({ body }) => {
      localStorage.setItem('bb-token', body.token);
    });
});
