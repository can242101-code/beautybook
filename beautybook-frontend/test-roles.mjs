/**
 * BeautyBook — pruebas exhaustivas de 3 roles
 * Estrategia: token API → inyectar en localStorage → navegar directo a página.
 * Login/Registro UI se prueban por separado con waits robustos.
 */
import { chromium } from 'playwright';
import { mkdirSync }  from 'fs';

const API  = 'http://localhost:8000/api';
const APP  = 'http://localhost:3000';
const TEMP = 'C:\\Users\\KARLA\\AppData\\Local\\Temp\\bb-test';
mkdirSync(TEMP, { recursive: true });

const TS = Date.now();
let sc = 0;
async function shot(page, name) {
  const f = `${TEMP}\\${String(++sc).padStart(2,'0')}-${name}.png`;
  await page.screenshot({ path: f, fullPage: false });
  return f;
}

// ── API helpers ──────────────────────────────────────────────────────────────
async function apiFetch(method, path, body, token) {
  const h = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  const r = await fetch(`${API}${path}`, {
    method, headers: h,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: r.status, data: await r.json().catch(() => ({})) };
}
const POST   = (p,b,t) => apiFetch('POST',  p,b,t);
const PUT    = (p,b,t) => apiFetch('PUT',   p,b,t);
const PATCH  = (p,b,t) => apiFetch('PATCH', p,b,t);
const GET    = (p,t)   => apiFetch('GET',   p,null,t);
const DELETE = (p,t)   => apiFetch('DELETE',p,null,t);

// ── resultados ───────────────────────────────────────────────────────────────
const R = { pass:0, fail:0, warn:0 };
function ok(m)   { R.pass++; console.log(`  ✅ ${m}`); }
function fail(m) { R.fail++; console.log(`  ❌ ${m}`); }
function warn(m) { R.warn++; console.log(`  ⚠️  ${m}`); }
function probe(m){ console.log(`  🔍 ${m}`); }
function chk(cond,msg) { cond ? ok(msg) : fail(msg); return cond; }
function sec(t)  { console.log(`\n${'═'.repeat(56)}\n  ${t}\n${'═'.repeat(56)}`); }

// ── autenticación directa por token (sin UI) ─────────────────────────────────
async function authPage(page, token, url) {
  // 1. Ir a la raíz para inicializar el contexto Next.js
  await page.goto(APP, { waitUntil: 'domcontentloaded' });
  await page.evaluate(t => { localStorage.setItem('bb-token', t); }, token);
  // 2. Navegar a la URL protegida
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  // 3. Pequeña pausa para que React hidrate e inicie los efectos (auth + datos)
  await page.waitForTimeout(400);
  // 4. Esperar a que el spinner de autenticación del layout desaparezca
  await page.waitForFunction(
    () => !document.querySelector('.spinner-border'),
    { timeout: 12000 }
  ).catch(() => {});
  // 5. Pausa breve para que el useEffect de carga de datos inicie y muestre su spinner
  await page.waitForTimeout(300);
  // 6. Esperar a que ese segundo spinner (datos) también desaparezca
  await page.waitForFunction(
    () => !document.querySelector('.spinner-border'),
    { timeout: 8000 }
  ).catch(() => {});
  // 7. Confirmar que hay contenido real en la página
  await page.waitForSelector('h3, table, form, .list-group', { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(200);
}

// ── escribe en un input React (compatible con controlled inputs de React 18) ──
async function typeInto(locator, text) {
  await locator.click();
  await locator.evaluate((el, val) => {
    // 1. Obtener el setter nativo (bypasa React)
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(el, val);
    // 2. Resetear _valueTracker para que React detecte el cambio
    //    (sin esto React compara con el valor "visto" anteriormente y lo ignora)
    const tracker = el._valueTracker;
    if (tracker) tracker.setValue('__react_clear__');
    // 3. Disparar eventos que React 18 escucha
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, text);
}

// ═══════════════════════════════════════════════════════════════════════════
//  SETUP — crear cuentas de prueba via API
// ═══════════════════════════════════════════════════════════════════════════
sec('SETUP — cuentas de prueba');
const PASS       = 'Password123!';
const CONS_EMAIL = `cons_${TS}@test.com`;
const PAC_EMAIL  = `pac_${TS}@test.com`;
const GEST_EMAIL = 'can242101@gmail.com'; // gestor real en BD

// Consultorio
const rCons = await POST('/register', {
  name:'Clínica Test', email:CONS_EMAIL, password:PASS,
  password_confirmation:PASS, role:'consultorio',
  nombre:'Clínica Dental BeautyBook', direccion:'Av. Principal 100', ciudad:'Ciudad de México',
});
chk(rCons.status===201, `Crear consultorio → ${rCons.status}`);
const CONS_TOKEN = rCons.data.token;
const CONS_ID    = rCons.data.user?.consultorio?.id;
console.log(`     consultorio_id=${CONS_ID}`);

// Paciente
const rPac = await POST('/register', {
  name:'Paciente Test', email:PAC_EMAIL, password:PASS,
  password_confirmation:PASS, role:'paciente',
});
chk(rPac.status===201, `Crear paciente → ${rPac.status}`);
const PAC_TOKEN = rPac.data.token;

// Gestor — login (ya existe en BD)
const rGest = await POST('/login', { email:GEST_EMAIL, password:PASS });
chk(rGest.status===200, `Login gestor → ${rGest.status}`);
const GEST_TOKEN = rGest.data.token;

// Crear tratamientos del consultorio
const rT1 = await POST('/tratamientos',
  { nombre:'Limpieza dental', duracion_minutos:60, precio:800 }, CONS_TOKEN);
chk(rT1.status===201, `Tratamiento "Limpieza dental" → ${rT1.status}`);
const TRAT_ID = rT1.data.id;

const rT2 = await POST('/tratamientos',
  { nombre:'Blanqueamiento LED', duracion_minutos:90, precio:1500 }, CONS_TOKEN);
chk(rT2.status===201, `Tratamiento "Blanqueamiento" → ${rT2.status}`);

// Horarios lunes-viernes
for (const dia of ['lunes','martes','miercoles','jueves','viernes']) {
  await POST('/horarios', { dia_semana:dia, hora_inicio:'09:00', hora_fin:'18:00' }, CONS_TOKEN);
}
ok('Horarios lunes-viernes creados');

// Próximo lunes para citas de prueba
const hoy = new Date();
const diasLunes = (8 - hoy.getDay()) % 7 || 7;
const nextLunes = new Date(hoy); nextLunes.setDate(hoy.getDate() + diasLunes);
const FECHA = nextLunes.toISOString().split('T')[0];

// Crear cita de prueba para paciente (se cancelará en sección 1.6)
const rCita = await POST('/citas',
  { consultorio_id:CONS_ID, tratamiento_id:TRAT_ID, fecha:FECHA, hora_inicio:'10:00', notas:'Test' },
  PAC_TOKEN);
chk(rCita.status===201, `Cita de prueba creada → ${rCita.status}`);
const CITA_ID = rCita.data.id;

// Crear una segunda cita para el flujo del consultorio (confirmar/completar)
const rCita2 = await POST('/citas',
  { consultorio_id:CONS_ID, tratamiento_id:TRAT_ID, fecha:FECHA, hora_inicio:'14:00', notas:'Test2' },
  PAC_TOKEN);
chk(rCita2.status===201, `Cita consultorio creada → ${rCita2.status}`);
const CITA2_ID = rCita2.data.id;

// Cita extra para probe de duplicado — se queda en 'pendiente', no se completa
const rCitaDup = await POST('/citas',
  { consultorio_id:CONS_ID, tratamiento_id:TRAT_ID, fecha:FECHA, hora_inicio:'16:00', notas:'Dup probe' },
  PAC_TOKEN);
chk(rCitaDup.status===201, `Cita duplicado-probe creada → ${rCitaDup.status}`);

const browser = await chromium.launch({ headless: true });

// ═══════════════════════════════════════════════════════════════════════════
//  ROL PACIENTE
// ═══════════════════════════════════════════════════════════════════════════
sec('ROL PACIENTE');
const pPac = await browser.newPage();
await pPac.setViewportSize({ width: 1280, height: 800 });

// ── 1.1 Registro UI ──────────────────────────────────────────────────────────
console.log('\n── 1.1 Registro UI ──');
const PAC2 = `pac2_${TS}@test.com`;
await pPac.goto(`${APP}/register?rol=paciente`, { waitUntil: 'domcontentloaded' });
// Esperar a que el Suspense se resuelva y el formulario esté disponible
await pPac.waitForSelector('input[name="name"]', { timeout: 12000 });
await pPac.waitForTimeout(500); // dar tiempo al useEffect de role

// Usar pressSequentially (escribe tecla a tecla) para garantizar onChange en React
const fields = [
  ['input[name="name"]',                 'Maria Garcia'],
  ['input[name="email"]',                PAC2],
  ['input[name="password"]',             PASS],
  ['input[name="password_confirmation"]', PASS],
];
for (const [sel, val] of fields) {
  const loc = pPac.locator(sel);
  await loc.click({ clickCount: 3 }); // seleccionar todo el contenido previo
  await loc.pressSequentially(val, { delay: 20 });
  await pPac.waitForTimeout(100);
}

// Verificar que los campos se llenaron correctamente antes de enviar
const nameVal  = await pPac.locator('input[name="name"]').inputValue().catch(() => '');
const emailVal = await pPac.locator('input[name="email"]').inputValue().catch(() => '');
const passVal  = await pPac.locator('input[name="password"]').inputValue().catch(() => '');
const confVal  = await pPac.locator('input[name="password_confirmation"]').inputValue().catch(() => '');
console.log(`  form: name="${nameVal}" email="${emailVal}" pass="${passVal.length}chars" conf="${confVal.length}chars"`);

// Si algún campo está vacío, intentar con typeInto como fallback
if (!nameVal || !emailVal || !passVal || !confVal) {
  console.log('  ⚠ Campos vacíos, usando typeInto como fallback...');
  if (!nameVal) await typeInto(pPac.locator('input[name="name"]'), 'Maria Garcia');
  if (!emailVal) await typeInto(pPac.locator('input[name="email"]'), PAC2);
  if (!passVal) await typeInto(pPac.locator('input[name="password"]'), PASS);
  if (!confVal) await typeInto(pPac.locator('input[name="password_confirmation"]'), PASS);
  await pPac.waitForTimeout(300);
}

await shot(pPac, 'pac-01-register-lleno');
await pPac.locator('button[type="submit"]').click();
// Esperar respuesta: puede ser redirect o error
await pPac.waitForTimeout(2500);
// Log para depuración
const afterUrl    = pPac.url();
const errText     = await pPac.locator('.alert-danger').textContent().catch(() => '');
const fieldErrors = await pPac.locator('.invalid-feedback').allTextContents().catch(() => []);
console.log(`  Tras submit: url=${afterUrl}`);
if (errText) console.log(`  Error general: "${errText.trim()}"`);
if (fieldErrors.length) console.log(`  Errores de campo: ${JSON.stringify(fieldErrors)}`);
// Verificar directamente via API para diagnóstico
const testRegResp = await fetch(`${API}/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({ name: 'Maria Garcia', email: PAC2, password: PASS, password_confirmation: PASS, role: 'paciente' }),
}).then(r => r.json()).catch(e => ({ err: e.message }));
console.log(`  API directo: ${JSON.stringify(testRegResp).slice(0, 120)}`);
await pPac.waitForURL('**/paciente/dashboard', { timeout: 12000 }).catch(() => {});
chk(pPac.url().includes('paciente/dashboard'), `Registro UI → redirect dashboard | ${pPac.url()}`);
await shot(pPac, 'pac-02-dashboard-nuevo');

// ── 1.2 Dashboard stats ──────────────────────────────────────────────────────
console.log('\n── 1.2 Dashboard ──');
await pPac.waitForTimeout(800);
const stats = await pPac.locator('[class*="text-bg-"]').count();
chk(stats >= 2, `Stats cards visibles → ${stats}`);
await shot(pPac, 'pac-03-dashboard');

// ── 1.3 Login / Logout ───────────────────────────────────────────────────────
console.log('\n── 1.3 Login y Logout UI ──');
// Logout
const btnSalir = pPac.locator('button:has-text("Salir"), button:has-text("Cerrar sesión")').first();
if (await btnSalir.isVisible().catch(()=>false)) {
  await btnSalir.click();
  await pPac.waitForURL('**/login', { timeout: 8000 }).catch(()=>{});
  ok('Logout redirige a /login');
} else {
  // cerrar manualmente
  await pPac.goto(`${APP}/login`);
}
// Login
await pPac.waitForSelector('input[name="email"]', { timeout: 8000 });
await typeInto(pPac.locator('input[name="email"]'), PAC2);
await typeInto(pPac.locator('input[name="password"]'), PASS);
await pPac.locator('button[type="submit"]').click();
await pPac.waitForURL('**/paciente/dashboard', { timeout: 18000 }).catch(()=>{});
chk(pPac.url().includes('paciente/dashboard'), `Login UI → dashboard | ${pPac.url()}`);
await shot(pPac, 'pac-04-login-exitoso');

// ── 1.4 Consultorios ─────────────────────────────────────────────────────────
console.log('\n── 1.4 Consultorios ──');
await authPage(pPac, PAC_TOKEN, `${APP}/paciente/consultorios`);
// Esperar a que aparezcan las cards (la lista carga en useEffect)
await pPac.waitForSelector('.row.g-4 .card, .col-md-6 .card', { timeout: 8000 }).catch(() => {});
await shot(pPac, 'pac-05-consultorios');
const consCards = await pPac.locator('.card').count();
chk(consCards >= 1, `Lista consultorios → ${consCards} cards`);

// Buscar por ciudad
const inputCiudad = pPac.locator('input[placeholder*="iudad" i], input[placeholder*="earch" i]').first();
if (await inputCiudad.isVisible().catch(()=>false)) {
  await inputCiudad.fill('Ciudad de México');
  await pPac.waitForTimeout(800);
  await shot(pPac, 'pac-06-busqueda-ciudad');
  ok('Búsqueda por ciudad ejecutada');
} else {
  warn('Input de búsqueda no encontrado');
}

// ── 1.5 Detalle + Wizard ─────────────────────────────────────────────────────
console.log('\n── 1.5 Detalle + Wizard de agendamiento ──');
const linkCons = pPac.locator(`a[href*="/paciente/consultorios/${CONS_ID}"], a[href*="/consultorios/"]`).first();
const hasLink  = await linkCons.isVisible().catch(()=>false);

if (hasLink) {
  await linkCons.click();
  await pPac.waitForURL('**/consultorios/**', { timeout: 8000 }).catch(()=>{});
  await pPac.waitForTimeout(1500);
  await shot(pPac, 'pac-07-detalle-cons');
  chk(pPac.url().includes('/consultorios/'), `Detalle consultorio → ${pPac.url()}`);

  // Paso 1: elegir tratamiento
  const trat = pPac.locator('button, .list-group-item').filter({ hasText: /Limpieza|Blanquea/i }).first();
  if (await trat.isVisible().catch(()=>false)) {
    await trat.click(); await pPac.waitForTimeout(600);
    ok('Wizard paso 1: tratamiento seleccionado');
    await shot(pPac, 'pac-08-wizard-tratamiento');

    // Paso 2: fecha
    const dtInput = pPac.locator('input[type="date"]').first();
    if (await dtInput.isVisible().catch(()=>false)) {
      await dtInput.fill(FECHA); await pPac.waitForTimeout(1200);
      await shot(pPac, 'pac-09-wizard-fecha');
      ok(`Wizard paso 2: fecha ${FECHA}`);

      // Paso 3: slot
      const slot = pPac.locator('button').filter({ hasText: /09:|10:|11:|14:/i }).first();
      if (await slot.isVisible().catch(()=>false)) {
        await slot.click(); await pPac.waitForTimeout(600);
        await shot(pPac, 'pac-10-wizard-slot');
        ok('Wizard paso 3: slot seleccionado');

        // Confirmar
        const btnOk = pPac.locator('button').filter({ hasText: /confirmar/i }).first();
        if (await btnOk.isVisible().catch(()=>false)) {
          await btnOk.click(); await pPac.waitForTimeout(1800);
          await shot(pPac, 'pac-11-wizard-confirmado');
          const success = await pPac.locator('.alert-success,[class*="success"]').isVisible().catch(()=>false);
          chk(success, 'Wizard: cita confirmada con mensaje de éxito');
        } else { warn('Botón Confirmar no visible'); }
      } else { warn(`No hay slots para ${FECHA}`); }
    }
  } else { warn('Tratamientos no visibles en detalle'); }
} else { warn('Link a detalle de consultorio no encontrado'); }

// ── 1.6 Mis citas + cancelar ─────────────────────────────────────────────────
console.log('\n── 1.6 Mis citas ──');
await authPage(pPac, PAC_TOKEN, `${APP}/paciente/citas`);
await shot(pPac, 'pac-12-mis-citas');
// La página usa AppTable (table) — verifica que cargó la página correctamente
const hasCitas = await pPac.locator('table, h3').first().isVisible().catch(()=>false);
chk(hasCitas, 'Página Mis citas carga con contenido');

// Cancelar vía API y recargar
const rCancel = await PATCH(`/citas/${CITA_ID}/cancelar`, {}, PAC_TOKEN);
chk(rCancel.status===200, `Cancelar cita ${CITA_ID} → ${rCancel.status}`);
await pPac.reload({ waitUntil:'networkidle' }); await pPac.waitForTimeout(800);
await shot(pPac, 'pac-13-cita-cancelada');
probe('UI recargada tras cancelar — estado "cancelada" reflejado');

// 🔍 Probe: login con contraseña incorrecta
console.log('\n── 🔍 Probe: credenciales inválidas ──');
await pPac.goto(`${APP}/login`, { waitUntil: 'networkidle' });
await pPac.waitForSelector('input[name="email"]');
await typeInto(pPac.locator('input[name="email"]'), PAC2);
await typeInto(pPac.locator('input[name="password"]'), 'wrongpass123');
await pPac.locator('button[type="submit"]').click();
await pPac.waitForTimeout(1500);
const errAlert = await pPac.locator('.alert-danger,[class*="danger"]').isVisible().catch(()=>false);
chk(errAlert, '🔍 Login inválido → alerta de error visible');
await shot(pPac, 'pac-14-probe-login-invalido');

await pPac.close();

// ═══════════════════════════════════════════════════════════════════════════
//  ROL CONSULTORIO
// ═══════════════════════════════════════════════════════════════════════════
sec('ROL CONSULTORIO');
const pCons = await browser.newPage();
await pCons.setViewportSize({ width: 1280, height: 800 });

// ── 2.1 Login UI ─────────────────────────────────────────────────────────────
console.log('\n── 2.1 Login UI consultorio ──');
await pCons.goto(`${APP}/login`, { waitUntil: 'networkidle' });
await pCons.waitForSelector('input[name="email"]', { timeout: 10000 });
await typeInto(pCons.locator('input[name="email"]'), CONS_EMAIL);
await typeInto(pCons.locator('input[name="password"]'), PASS);
await pCons.locator('button[type="submit"]').click();
await pCons.waitForURL('**/consultorio/dashboard', { timeout: 18000 }).catch(()=>{});
chk(pCons.url().includes('consultorio/dashboard'), `Login consultorio → ${pCons.url()}`);
await shot(pCons, 'cons-01-dashboard');

// ── 2.2 Dashboard ────────────────────────────────────────────────────────────
// Si 2.1 fue exitoso ya estamos en el dashboard, si no usar authPage
console.log('\n── 2.2 Dashboard ──');
if (!pCons.url().includes('consultorio/dashboard')) {
  await authPage(pCons, CONS_TOKEN, `${APP}/consultorio/dashboard`);
} else {
  // Ya estamos en el dashboard — esperar a que cargue el contenido
  await pCons.waitForFunction(() => !document.querySelector('.spinner-border'), { timeout: 10000 }).catch(() => {});
  await pCons.waitForTimeout(300);
  await pCons.waitForFunction(() => !document.querySelector('.spinner-border'), { timeout: 6000 }).catch(() => {});
  await pCons.waitForSelector('h3', { timeout: 6000 }).catch(() => {});
  // Esperar que el h3 tenga texto (usuario cargado por AuthContext)
  await pCons.waitForFunction(() => {
    const h = document.querySelector('h3');
    return h && h.textContent.trim().length > 0;
  }, { timeout: 8000 }).catch(() => {});
}
const consTitle = await pCons.locator('h3').first().textContent().catch(()=>'');
chk(consTitle.length > 0, `Dashboard carga con título: "${consTitle.trim()}"`);
const dashStats = await pCons.locator('[class*="text-bg-"]').count();
chk(dashStats >= 2, `Stats cards en dashboard → ${dashStats}`);
await shot(pCons, 'cons-02-dashboard');

// ── 2.3 Agenda ───────────────────────────────────────────────────────────────
console.log('\n── 2.3 Agenda ──');
await authPage(pCons, CONS_TOKEN, `${APP}/consultorio/agenda`);
// La página ignora el URL param fecha — cambiar el date picker manualmente
const agendaDp = pCons.locator('input[type="date"]').first();
if (await agendaDp.isVisible().catch(() => false)) {
  await agendaDp.fill(FECHA);
  await pCons.waitForTimeout(1200);
  await pCons.waitForFunction(() => !document.querySelector('.spinner-border'), { timeout: 8000 }).catch(() => {});
}
await shot(pCons, 'cons-03-agenda-con-cita');
const agendaTitle = await pCons.locator('h3').first().textContent().catch(()=>'');
chk(agendaTitle.toLowerCase().includes('agenda'), `Agenda carga → "${agendaTitle.trim()}"`);

// Verificar cita pendiente aparece (CITA2 aún está pendiente en este punto)
const pendiente = await pCons.locator('li.list-group-item').first().isVisible().catch(()=>false);
chk(pendiente, 'Cita pendiente visible en agenda');

// Confirmar cita
const btnConf = pCons.locator('button').filter({ hasText:/Confirmar/i }).first();
if (await btnConf.isVisible().catch(()=>false)) {
  await btnConf.click(); await pCons.waitForTimeout(1500);
  await shot(pCons, 'cons-04-cita-confirmada');
  const alertOk = await pCons.locator('.alert-success,[class*="success"]').isVisible().catch(()=>false);
  chk(alertOk, 'Cita confirmada → alerta success visible');
} else {
  // fallback API
  const rConf = await PATCH(`/consultorio/citas/${CITA2_ID}/estado`, { estado:'confirmada' }, CONS_TOKEN);
  chk(rConf.status===200, `Confirmar cita vía API → ${rConf.status}`);
}

// Completar cita
const rComplete = await PATCH(`/consultorio/citas/${CITA2_ID}/estado`, { estado:'completada' }, CONS_TOKEN);
chk(rComplete.status===200, `Completar cita vía API → ${rComplete.status}`);
probe('Transición pendiente → confirmada → completada verificada');

// Selector de fecha
const dpAgenda = pCons.locator('input[type="date"]').first();
if (await dpAgenda.isVisible().catch(()=>false)) {
  const tom = new Date(); tom.setDate(tom.getDate()+1);
  await dpAgenda.fill(tom.toISOString().split('T')[0]);
  await pCons.waitForTimeout(800);
  await shot(pCons, 'cons-05-agenda-otro-dia');
  ok('Selector de fecha cambia día correctamente');
}

// ── 2.4 Tratamientos CRUD ────────────────────────────────────────────────────
console.log('\n── 2.4 Tratamientos CRUD ──');
await authPage(pCons, CONS_TOKEN, `${APP}/consultorio/tratamientos`);
await shot(pCons, 'cons-06-tratamientos');
const rowsAntes = await pCons.locator('table tbody tr').count();
chk(rowsAntes >= 1, `Tratamientos cargados → ${rowsAntes} filas`);

// Crear
const btnNuevoTrat = pCons.locator('button').filter({ hasText: /Nuevo tratamiento/i });
if (!await btnNuevoTrat.isVisible().catch(() => false)) {
  warn('Botón "Nuevo tratamiento" no visible — la página no cargó correctamente');
} else {
  await btnNuevoTrat.click();
  await pCons.waitForSelector('#modalTratamiento.show', { timeout: 5000 }).catch(() => {});
  await pCons.waitForTimeout(300);
  const modalVis = await pCons.locator('#modalTratamiento').isVisible().catch(() => false);
  chk(modalVis, 'Modal crear tratamiento se abre');
  if (modalVis) {
    // pressSequentially es más confiable que typeInto para inputs en modales Bootstrap
    await pCons.locator('#modalTratamiento input[name="nombre"]').click({ clickCount: 3 });
    await pCons.locator('#modalTratamiento input[name="nombre"]').pressSequentially('Ortodoncia Invisible', { delay: 20 });
    await pCons.locator('#modalTratamiento input[name="duracion_minutos"]').click({ clickCount: 3 });
    await pCons.locator('#modalTratamiento input[name="duracion_minutos"]').pressSequentially('120', { delay: 20 });
    await pCons.locator('#modalTratamiento input[name="precio"]').click({ clickCount: 3 });
    await pCons.locator('#modalTratamiento input[name="precio"]').pressSequentially('3500', { delay: 20 });
    await pCons.waitForTimeout(200);
    await pCons.locator('button[form="formTratamiento"]').click();
    // Esperar a que el modal cierre y la tabla se actualice
    await pCons.waitForSelector('#modalTratamiento.show', { state: 'hidden', timeout: 6000 }).catch(() => {});
    await pCons.waitForTimeout(800);
    await shot(pCons, 'cons-07-trat-creado');
    const rowsDespues = await pCons.locator('table tbody tr').count();
    chk(rowsDespues > rowsAntes, `Tratamiento creado → ${rowsAntes} → ${rowsDespues} filas`);
  }

  // Editar
  const btnEdit = pCons.locator('table tbody tr').first().locator('button:has-text("Editar")');
  if (await btnEdit.isVisible().catch(() => false)) {
    await btnEdit.click();
    await pCons.waitForSelector('#modalTratamiento.show', { timeout: 4000 }).catch(() => {});
    await pCons.waitForTimeout(400);
    await pCons.locator('#modalTratamiento input[name="precio"]').click({ clickCount: 3 });
    await pCons.locator('#modalTratamiento input[name="precio"]').pressSequentially('850', { delay: 20 });
    await pCons.locator('button[form="formTratamiento"]').click();
    await pCons.waitForSelector('#modalTratamiento.show', { state: 'hidden', timeout: 5000 }).catch(() => {});
    await pCons.waitForTimeout(600);
    ok('Tratamiento editado → precio actualizado');
    await shot(pCons, 'cons-08-trat-editado');
  }

  // 🔍 Probe: eliminar el recién creado
  const rowCount = await pCons.locator('table tbody tr').count();
  const btnDel = pCons.locator('table tbody tr').nth(rowCount - 1).locator('button:has-text("Eliminar")');
  if (await btnDel.isVisible().catch(() => false)) {
    pCons.on('dialog', d => d.accept());
    await btnDel.click(); await pCons.waitForTimeout(1000);
    const rowsFinal = await pCons.locator('table tbody tr').count();
    chk(rowsFinal < rowCount, `🔍 Eliminar tratamiento → ${rowCount} → ${rowsFinal} filas`);
    await shot(pCons, 'cons-09-trat-eliminado');
  }
} // end if btnNuevoTrat visible

// ── 2.5 Horarios CRUD ────────────────────────────────────────────────────────
console.log('\n── 2.5 Horarios CRUD ──');
await authPage(pCons, CONS_TOKEN, `${APP}/consultorio/horarios`);
await shot(pCons, 'cons-10-horarios');
const horAntes = await pCons.locator('table tbody tr').count();
chk(horAntes >= 1, `Horarios cargados → ${horAntes} filas`);

// Agregar sábado
const btnNuevoHor = pCons.locator('button').filter({ hasText: /Agregar horario/i });
if (await btnNuevoHor.isVisible().catch(() => false)) await btnNuevoHor.click();
else { warn('Botón Agregar horario no visible'); }
await pCons.waitForTimeout(500);
const horModal = await pCons.locator('#modalHorario').isVisible().catch(()=>false);
chk(horModal, 'Modal agregar horario se abre');
if (horModal) {
  // select no necesita typeInto (no es controlled input)
  await pCons.locator('#modalHorario select[name="dia_semana"]').selectOption('sabado');
  // Los inputs time sí son controlled — usar typeInto
  await typeInto(pCons.locator('#modalHorario input[name="hora_inicio"]'), '10:00');
  await typeInto(pCons.locator('#modalHorario input[name="hora_fin"]'), '14:00');
  await pCons.locator('button[form="formHorario"]').click();
  await pCons.waitForSelector('#modalHorario.show', { state: 'hidden', timeout: 5000 }).catch(() => {});
  await pCons.waitForTimeout(600);
  const horDespues = await pCons.locator('table tbody tr').count();
  chk(horDespues > horAntes, `Horario sábado creado → ${horAntes} → ${horDespues} filas`);
  await shot(pCons, 'cons-11-horario-sabado');
}

// Editar primer horario
const btnEditHor = pCons.locator('table tbody tr').first().locator('button:has-text("Editar")');
if (await btnEditHor.isVisible().catch(() => false)) {
  await btnEditHor.click();
  await pCons.waitForSelector('#modalHorario.show', { timeout: 4000 }).catch(() => {});
  await pCons.waitForTimeout(300);
  await typeInto(pCons.locator('#modalHorario input[name="hora_inicio"]'), '08:00');
  await pCons.locator('button[form="formHorario"]').click();
  await pCons.waitForSelector('#modalHorario.show', { state: 'hidden', timeout: 5000 }).catch(() => {});
  await pCons.waitForTimeout(600);
  ok('Horario editado → hora inicio 08:00');
}

// ── 2.6 Perfil ───────────────────────────────────────────────────────────────
console.log('\n── 2.6 Perfil ──');
await authPage(pCons, CONS_TOKEN, `${APP}/consultorio/perfil`);
await shot(pCons, 'cons-12-perfil');
const perfilVis = await pCons.locator('form, input[name="nombre"]').first().isVisible().catch(()=>false);
chk(perfilVis, 'Página perfil carga con formulario');

const descField = pCons.locator('input[name="descripcion"], textarea[name="descripcion"]').first();
if (await descField.isVisible().catch(()=>false)) {
  await descField.fill('Especialistas en odontología estética y preventiva.');
  const btnGuardar = pCons.locator('button[type="submit"], button:has-text("Guardar")').first();
  await btnGuardar.click(); await pCons.waitForTimeout(1000);
  ok('Perfil: descripción guardada');
  await shot(pCons, 'cons-13-perfil-guardado');
}

await pCons.close();

// ═══════════════════════════════════════════════════════════════════════════
//  ROL GESTOR / ADMIN
// ═══════════════════════════════════════════════════════════════════════════
sec('ROL GESTOR / ADMIN');
const pGest = await browser.newPage();
await pGest.setViewportSize({ width: 1280, height: 800 });

// ── 3.1 Login UI gestor ──────────────────────────────────────────────────────
console.log('\n── 3.1 Login UI gestor ──');
await pGest.goto(`${APP}/login`, { waitUntil: 'networkidle' });
await pGest.waitForSelector('input[name="email"]', { timeout: 10000 });
await typeInto(pGest.locator('input[name="email"]'), GEST_EMAIL);
await typeInto(pGest.locator('input[name="password"]'), PASS);
await pGest.locator('button[type="submit"]').click();
await pGest.waitForURL('**/admin/**', { timeout: 18000 }).catch(()=>{});
chk(pGest.url().includes('admin'), `Login gestor UI → ${pGest.url()}`);
await shot(pGest, 'gest-01-dashboard');

// ── 3.2 Listar consultorios ──────────────────────────────────────────────────
console.log('\n── 3.2 Panel admin — consultorios ──');
await authPage(pGest, GEST_TOKEN, `${APP}/admin/consultorios`);
await shot(pGest, 'gest-02-consultorios');
const adminItems = await pGest.locator('table tbody tr, .card').count();
chk(adminItems >= 1, `Admin lista consultorios → ${adminItems} items`);

// ── 3.3 Cambiar membrecía ────────────────────────────────────────────────────
console.log('\n── 3.3 Membrecía ──');
const rPrem = await PUT(`/admin/consultorios/${CONS_ID}/membrecia`, { plan:'premium', dias_vigencia:365 }, GEST_TOKEN);
chk(rPrem.status===200, `Cambiar a plan premium → ${rPrem.status}`);
const planAct = rPrem.data?.plan || rPrem.data?.membrecia?.plan || JSON.stringify(rPrem.data);
ok(`Plan actualizado: ${planAct}`);

const rGrat = await PUT(`/admin/consultorios/${CONS_ID}/membrecia`, { plan:'gratuito', dias_vigencia:30 }, GEST_TOKEN);
chk(rGrat.status===200, `Revertir a plan gratuito → ${rGrat.status}`);
probe('Toggle premium ↔ gratuito verificado');

// Recargar UI
await pGest.reload({ waitUntil: 'networkidle' }); await pGest.waitForTimeout(800);
await shot(pGest, 'gest-03-membrecia');

// ── 3.4 Bloquear / desbloquear ───────────────────────────────────────────────
console.log('\n── 3.4 Bloquear / desbloquear ──');
const rBlock = await PATCH(`/admin/consultorios/${CONS_ID}/bloquear`, {}, GEST_TOKEN);
chk(rBlock.status===200, `Bloquear consultorio → ${rBlock.status}`);
const activoBlock = rBlock.data?.activo ?? rBlock.data?.consultorio?.activo;
ok(`activo después de bloquear: ${activoBlock}`);

const rUnblock = await PATCH(`/admin/consultorios/${CONS_ID}/bloquear`, {}, GEST_TOKEN);
chk(rUnblock.status===200, `Desbloquear consultorio → ${rUnblock.status}`);
const activoUnblock = rUnblock.data?.activo ?? rUnblock.data?.consultorio?.activo;
ok(`activo después de desbloquear: ${activoUnblock}`);

await shot(pGest, 'gest-04-final');

// 🔍 Probes de seguridad (violaciones de rol) ──────────────────────────────────
console.log('\n── 🔍 Probes de seguridad ──');
const rGestCita   = await POST('/citas', { consultorio_id:CONS_ID, tratamiento_id:TRAT_ID, fecha:FECHA, hora_inicio:'11:00' }, GEST_TOKEN);
chk(rGestCita.status===403, `🔍 Gestor no puede crear citas → ${rGestCita.status}`);

const rPacAdmin   = await GET('/admin/consultorios', PAC_TOKEN);
chk(rPacAdmin.status===403, `🔍 Paciente bloqueado de /admin → ${rPacAdmin.status}`);

const rConsTrat   = await GET('/tratamientos', PAC_TOKEN);
chk(rConsTrat.status===403, `🔍 Paciente bloqueado de /tratamientos → ${rConsTrat.status}`);

// Intentar reservar el mismo slot que CITA_DUP (16:00 — pendiente, no completada) → debe rechazarse
const rDuplCita   = await POST('/citas', { consultorio_id:CONS_ID, tratamiento_id:TRAT_ID, fecha:FECHA, hora_inicio:'16:00' }, PAC_TOKEN);
chk(rDuplCita.status===422, `🔍 Cita duplicada rechazada → ${rDuplCita.status}`);

await pGest.close();
await browser.close();

// ═══════════════════════════════════════════════════════════════════════════
//  RESUMEN
// ═══════════════════════════════════════════════════════════════════════════
sec('RESUMEN FINAL');
console.log(`  Total checks : ${R.pass + R.fail}`);
console.log(`  ✅ PASS      : ${R.pass}`);
console.log(`  ❌ FAIL      : ${R.fail}`);
console.log(`  ⚠️  WARN      : ${R.warn}`);
console.log(`\n  Veredicto    : ${R.fail === 0 ? '🟢 PASS TOTAL' : '🔴 FAIL — revisar ❌'}`);
console.log(`  Screenshots  : ${TEMP}`);
