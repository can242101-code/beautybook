export default function PrivacyPolicyModal() {
  return (
    <div className="modal fade" id="modalPrivacidad" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-scrollable modal-lg">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-shield-check text-primary me-2" />
              Política de Privacidad — BeautyBook
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar" />
          </div>

          <div className="modal-body small text-muted" style={{ lineHeight: 1.7 }}>
            <p><strong className="text-body">Última actualización:</strong> junio 2026</p>

            <h6 className="fw-semibold text-body mt-4">1. Responsable del tratamiento</h6>
            <p>
              BeautyBook, plataforma de agendamiento de citas dentales, es responsable del tratamiento de
              los datos personales que usted proporciona al registrarse o utilizar nuestros servicios.
            </p>

            <h6 className="fw-semibold text-body mt-4">2. Datos que recopilamos</h6>
            <ul>
              <li><strong>Pacientes:</strong> nombre completo, correo electrónico, teléfono (opcional) y notas clínicas que usted ingrese voluntariamente al agendar una cita.</li>
              <li><strong>Consultorios:</strong> nombre del titular, correo electrónico, número de cédula profesional, nombre del consultorio, dirección, ciudad y teléfono.</li>
            </ul>

            <h6 className="fw-semibold text-body mt-4">3. Finalidad del tratamiento</h6>
            <p>Los datos se utilizan exclusivamente para:</p>
            <ul>
              <li>Crear y gestionar su cuenta en la plataforma.</li>
              <li>Agendar, confirmar y recordar citas dentales.</li>
              <li>Verificar la identidad y licencia profesional de los consultorios registrados.</li>
              <li>Enviar notificaciones relacionadas con sus citas (confirmaciones y cancelaciones).</li>
            </ul>

            <h6 className="fw-semibold text-body mt-4">4. Cédula Profesional</h6>
            <p>
              El número de cédula profesional solicitado a los consultorios es utilizado únicamente para
              verificar que el titular es un profesional de la salud dental habilitado. No se comparte
              con terceros ni se usa para ningún otro fin.
            </p>

            <h6 className="fw-semibold text-body mt-4">5. Compartición de datos</h6>
            <p>
              No vendemos ni cedemos sus datos personales a terceros. Los datos del paciente
              (nombre y notas de cita) son accesibles por el consultorio seleccionado
              para la prestación del servicio.
            </p>

            <h6 className="fw-semibold text-body mt-4">6. Seguridad</h6>
            <p>
              Las contraseñas se almacenan cifradas (bcrypt). La comunicación se realiza
              mediante tokens de autenticación de un solo uso. No almacenamos datos de pago.
            </p>

            <h6 className="fw-semibold text-body mt-4">7. Derechos del usuario</h6>
            <p>
              Usted puede solicitar la corrección, eliminación o portabilidad de sus datos
              en cualquier momento contactando al administrador de la plataforma.
            </p>

            <h6 className="fw-semibold text-body mt-4">8. Contacto</h6>
            <p>
              Para cualquier duda sobre el tratamiento de sus datos, escriba a{' '}
              <strong className="text-body">privacidad@beautybook.com</strong>.
            </p>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-primary" data-bs-dismiss="modal">
              Entendido
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
