// Comando para login rápido vía API (evita pasar por la UI en cada test)
Cypress.Commands.add('loginAs', (role) => {
  const cuentas = {
    paciente:    { email: 'demo_pac@beautybook.com',  password: 'Demo1234!' },
    consultorio: { email: 'demo_cons@beautybook.com', password: 'Demo1234!' },
    gestor:      { email: 'gestor@beautybook.com',      password: 'Gestor1234!'  },
  };

  const { email, password } = cuentas[role];

  cy.request('POST', 'http://localhost:8000/api/login', { email, password })
    .then(({ body }) => {
      window.localStorage.setItem('bb_token', body.token);
      window.localStorage.setItem('bb_user',  JSON.stringify(body.user));
    });
});
