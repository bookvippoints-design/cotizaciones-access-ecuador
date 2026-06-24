const nodemailer = require('nodemailer')
const https = require('https')

// ============================================================
// CONFIGURACIÓN
// ============================================================
const OPERADORES = [
  'club50travel@aol.com',
  'dionad015@gmail.com',
  // 'tercero@correo.com', // <- agrega el tercero aquí cuando lo tengas
]

const GOOGLE_SHEET_WEBHOOK = process.env.GOOGLE_SHEET_WEBHOOK // opcional

// ============================================================
// TRANSPORTER GMX
// ============================================================
function crearTransporter() {
  return nodemailer.createTransport({
    host: 'mail.gmx.com',
    port: 465,
    secure: true,
    auth: {
      user: 'activaciones@gmx.com',
      pass: process.env.GMX_PASSWORD,
    },
  })
}

// ============================================================
// HTML DEL CORREO
// ============================================================
function construirCorreo(d) {
  function fila(label, valor) {
    if (!valor) return ''
    const v = Array.isArray(valor) ? valor.join(', ') : valor
    return `
      <tr>
        <td style="padding:9px 14px;font-weight:600;color:#374151;background:#F9FAFB;width:38%;font-size:12px;border-bottom:1px solid #E5E7EB;">${label}</td>
        <td style="padding:9px 14px;color:#111827;background:#ffffff;font-size:12px;border-bottom:1px solid #E5E7EB;">${v}</td>
      </tr>`
  }

  function seccion(titulo, emoji) {
    return `
      <tr>
        <td colspan="2" style="padding:10px 14px 8px;background:#1A3F7A;color:#ffffff;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">
          ${emoji} ${titulo}
        </td>
      </tr>`
  }

  const noches = d.fecha_llegada && d.fecha_salida
    ? Math.ceil((new Date(d.fecha_salida) - new Date(d.fecha_llegada)) / (1000 * 60 * 60 * 24))
    : null

  return `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:28px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:620px;">

  <!-- HEADER -->
  <tr><td style="background:#1A3F7A;border-radius:12px 12px 0 0;padding:24px 28px;">
    <p style="margin:0;font-size:18px;font-weight:800;color:#ffffff;">Access Ecuador</p>
    <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.65);">Nueva solicitud de cotización de hospedaje</p>
  </td></tr>

  <!-- ALERTA -->
  <tr><td style="background:#F97316;padding:10px 28px;">
    <p style="margin:0;font-size:12px;font-weight:700;color:#ffffff;">
      📋 Destino: ${d.destino || '—'} &nbsp;|&nbsp; 
      ${d.fecha_llegada} → ${d.fecha_salida}
      ${noches ? ` &nbsp;|&nbsp; ${noches} noche(s)` : ''}
      &nbsp;|&nbsp; Estado: <span style="background:rgba(255,255,255,0.25);padding:1px 8px;border-radius:4px;">PENDIENTE</span>
    </p>
  </td></tr>

  <!-- TABLA -->
  <tr><td style="background:#ffffff;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0">

    ${seccion('Datos Personales', '🧑')}
    ${fila('Nombre', d.nombre)}
    ${fila('Nacionalidad', d.nacionalidad)}
    ${fila('País de residencia', d.pais)}
    ${fila('Ciudad', d.ciudad)}
    ${fila('WhatsApp', d.whatsapp)}
    ${fila('Email', d.email)}

    ${seccion('Información del Viaje', '🌍')}
    ${fila('Destino', d.destino)}
    ${fila('Fecha de llegada', d.fecha_llegada)}
    ${fila('Fecha de salida', d.fecha_salida)}
    ${noches ? fila('Noches', noches) : ''}
    ${fila('¿Fechas flexibles?', d.fechas_flexibles)}

    ${seccion('Viajeros', '👥')}
    ${fila('Adultos', d.adultos)}
    ${fila('Niños', d.ninos)}
    ${fila('Edad de los niños', d.edad_ninos)}

    ${seccion('Hospedaje', '🏨')}
    ${fila('Tipo de hospedaje', d.tipo_hospedaje)}
    ${fila('Manejo de presupuesto', d.manejo_presupuesto)}
    ${fila('Presupuesto (USD)', d.presupuesto ? `$${d.presupuesto}` : '')}
    ${fila('Zona específica', d.zona)}
    ${fila('¿Recomendar zona?', d.recomendar_zona)}

    ${seccion('Prioridades', '⭐')}
    ${fila('Lo más importante', d.prioridad)}

    ${seccion('Servicios deseados', '🛎️')}
    ${fila('Servicios', d.servicios)}

    ${seccion('Motivo del viaje', '🎯')}
    ${fila('Motivo', d.motivo)}

    ${seccion('Información Adicional', '📋')}
    ${fila('¿Visa vigente?', d.visa)}
    ${fila('¿Vuelos comprados?', d.vuelos)}
    ${fila('¿Ver opciones sobre presupuesto?', d.ver_sobre_presupuesto)}
    ${fila('Comentarios', d.comentarios)}

  </table>
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#1A3F7A;border-radius:0 0 12px 12px;padding:16px 28px;text-align:center;">
    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.6);">
      Access Ecuador · admin@alfonsohidalgo.com · Este correo fue generado automáticamente.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`
}

// ============================================================
// HANDLER PRINCIPAL
// ============================================================
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const data = JSON.parse(event.body)
    const transporter = crearTransporter()
    const html = construirCorreo(data)

    const noches = data.fecha_llegada && data.fecha_salida
      ? Math.ceil((new Date(data.fecha_salida) - new Date(data.fecha_llegada)) / (1000 * 60 * 60 * 24))
      : ''

    const asunto = `Cotizacion de Hospedaje: ${data.destino || 'Sin destino'} | ${data.fecha_llegada} al ${data.fecha_salida} | ${data.adultos} adulto(s)`

    // Enviar a todos los operadores
    for (const correo of OPERADORES) {
      await transporter.sendMail({
        from: '"Access Ecuador Cotizaciones" <activaciones@gmx.com>',
        to: correo,
        subject: asunto,
        html,
      })
    }

    console.log('Cotización enviada a', OPERADORES.length, 'operadores')
    return { statusCode: 200, body: JSON.stringify({ ok: true }) }

  } catch (err) {
    console.error('Error en send-cotizacion:', err)
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
