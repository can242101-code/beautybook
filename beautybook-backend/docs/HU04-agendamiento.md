# Documentación HU04 - Agendamiento de Cita

## Descripción
Endpoint REST POST /api/citas y formulario frontend para agendar cita.

## Criterios de Aceptación
- El paciente selecciona fecha, hora y tratamiento
- El sistema valida disponibilidad en tiempo real (Redis/Memurai)
- Retorna 201 Created en éxito, 409 si hay conflicto de horario
