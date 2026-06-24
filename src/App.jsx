import { useState } from 'react'

const INITIAL = {
  nombre: '', nacionalidad: '', whatsapp: '', email: '',
  destino: '', fecha_llegada: '', fecha_salida: '', fechas_flexibles: '',
  adultos: '', ninos: '', edad_ninos: '',
  tipo_hospedaje: '', manejo_presupuesto: '', presupuesto: '', zona: '', recomendar_zona: '',
  prioridades: [],
  servicios: [],
  motivo: '',
  visa: '', vuelos: '', ver_sobre_presupuesto: '', comentarios: '',
}

const SERVICIOS = [
  'Desayuno incluido', 'Todo incluido', 'Piscina', 'Frente al mar',
  'Cocina', 'Gimnasio', 'Spa', 'Estacionamiento', 'Transporte aeropuerto',
  'WiFi', 'Cerca de atracciones', 'Cerca de transporte público', 'Pet Friendly',
]

const PRIORIDADES = ['Precio', 'Ubicación', 'Calidad del hotel', 'Comodidad de la habitación', 'Servicios del hotel']

const totalSteps = 7

const secciones = [
  'Datos Personales', 'Información del Viaje', 'Hospedaje',
  'Prioridades', 'Servicios', 'Motivo', 'Información Adicional',
]

export default function App() {
  const [form, setForm] = useState(INITIAL)
  const [step, setStep] = useState(1)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleServicio(s) {
    setForm(f => ({
      ...f,
      servicios: f.servicios.includes(s)
        ? f.servicios.filter(x => x !== s)
        : [...f.servicios, s],
    }))
  }

  function handlePrioridad(p) {
    setForm(f => {
      if (f.prioridades.includes(p)) return { ...f, prioridades: f.prioridades.filter(x => x !== p) }
      if (f.prioridades.length >= 2) return f // máximo 2
      return { ...f, prioridades: [...f.prioridades, p] }
    })
  }

  function validarStep() {
    const required = {
      1: ['nombre', 'nacionalidad', 'whatsapp', 'email'],
      2: ['destino', 'fecha_llegada', 'fecha_salida', 'adultos'],
      3: ['tipo_hospedaje', 'manejo_presupuesto', 'presupuesto'],
      4: [],
      5: [],
      6: ['motivo'],
      7: ['visa', 'vuelos', 'ver_sobre_presupuesto'],
    }
    return required[step].every(f => form[f] !== '')
  }

  function next() {
    if (!validarStep()) { setError('Por favor complete los campos obligatorios.'); return }
    setError('')
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function prev() {
    setError('')
    setStep(s => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validarStep()) { setError('Por favor complete los campos obligatorios.'); return }
    setSending(true)
    setError('')
    try {
      const res = await fetch('/.netlify/functions/send-cotizacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) setSent(true)
      else setError('Hubo un error al enviar. Intente nuevamente.')
    } catch {
      setError('Hubo un error al enviar. Intente nuevamente.')
    }
    setSending(false)
  }

  if (sent) return (
    <div className="min-h-screen bg-warm-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl text-center">
        <div className="text-6xl mb-4">✈️</div>
        <h2 className="font-heading font-extrabold text-brand-navy text-2xl mb-3">¡Solicitud enviada!</h2>
        <p className="font-body text-gray-500 text-sm leading-relaxed mb-6">
          Hemos recibido su solicitud. Nuestro equipo la revisará y le contactará a la brevedad por WhatsApp o correo electrónico.
        </p>
        <div className="bg-warm-bg rounded-2xl p-4 text-left mb-6">
          <p className="font-body text-gray-600 text-sm"><strong>Destino:</strong> {form.destino}</p>
          <p className="font-body text-gray-600 text-sm"><strong>Llegada:</strong> {form.fecha_llegada}</p>
          <p className="font-body text-gray-600 text-sm"><strong>Salida:</strong> {form.fecha_salida}</p>
          <p className="font-body text-gray-600 text-sm"><strong>Viajeros:</strong> {form.adultos} adulto(s){form.ninos ? `, ${form.ninos} niño(s)` : ''}</p>
        </div>
        <button onClick={() => { setForm(INITIAL); setStep(1); setSent(false) }}
          className="w-full bg-brand-orange text-white font-heading font-bold text-sm px-6 py-3.5 rounded-xl hover:bg-orange-500 transition-colors">
          Nueva solicitud
        </button>
      </div>
    </div>
  )

  const progreso = Math.round((step / totalSteps) * 100)

  return (
    <div className="min-h-screen bg-warm-bg">
      {/* Header */}
      <div className="bg-brand-navy py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-heading font-extrabold text-white text-xl md:text-2xl">
            Solicitud de Cotización de Hospedaje
          </h1>
          <p className="font-body text-white/60 text-sm mt-1">
            Complete el formulario y le enviaremos las mejores opciones para su viaje.
          </p>
        </div>
      </div>

      {/* Progreso */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="font-body text-xs text-gray-500">
              Paso {step} de {totalSteps} — <span className="font-semibold text-brand-navy">{secciones[step - 1]}</span>
            </p>
            <p className="font-heading font-bold text-brand-orange text-xs">{progreso}%</p>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-orange rounded-full transition-all duration-500" style={{ width: `${progreso}%` }} />
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">

            {/* SECCIÓN 1 — Datos Personales */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-heading font-bold text-brand-navy text-lg border-b border-gray-100 pb-3">🧑 Datos Personales</h2>
                {[
                  { name: 'nombre', label: 'Nombre completo', required: true },
                  { name: 'nacionalidad', label: 'Nacionalidad', required: true },
                  { name: 'whatsapp', label: 'WhatsApp (con código de país)', required: true, placeholder: '+593999123456' },
                  { name: 'email', label: 'Correo electrónico', required: true, type: 'email' },
                ].map(f => (
                  <div key={f.name}>
                    <label className="font-body text-sm font-medium text-gray-700 block mb-1.5">
                      {f.label} {f.required && <span className="text-red-400">*</span>}
                    </label>
                    <input type={f.type || 'text'} name={f.name} value={form[f.name]} onChange={handleChange}
                      placeholder={f.placeholder || ''}
                      className="w-full px-4 py-3 font-body text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-brand-orange" />
                  </div>
                ))}
              </div>
            )}

            {/* SECCIÓN 2 — Viaje + Viajeros */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-heading font-bold text-brand-navy text-lg border-b border-gray-100 pb-3">🌍 Información del Viaje</h2>
                <div>
                  <label className="font-body text-sm font-medium text-gray-700 block mb-1.5">Destino <span className="text-red-400">*</span></label>
                  <input type="text" name="destino" value={form.destino} onChange={handleChange} placeholder="Ej: Cancún, México"
                    className="w-full px-4 py-3 font-body text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-brand-orange" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-sm font-medium text-gray-700 block mb-1.5">Fecha de llegada <span className="text-red-400">*</span></label>
                    <input type="date" name="fecha_llegada" value={form.fecha_llegada} onChange={handleChange}
                      className="w-full px-4 py-3 font-body text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-brand-orange" />
                  </div>
                  <div>
                    <label className="font-body text-sm font-medium text-gray-700 block mb-1.5">Fecha de salida <span className="text-red-400">*</span></label>
                    <input type="date" name="fecha_salida" value={form.fecha_salida} onChange={handleChange}
                      className="w-full px-4 py-3 font-body text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-brand-orange" />
                  </div>
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-gray-700 block mb-3">¿Las fechas son flexibles?</label>
                  <div className="flex gap-3">
                    {['Sí', 'No'].map(op => (
                      <button key={op} type="button" onClick={() => setForm(f => ({ ...f, fechas_flexibles: op }))}
                        className={`flex-1 py-3 rounded-xl font-heading font-semibold text-sm border-2 transition-colors ${form.fechas_flexibles === op ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-navy'}`}>
                        {op}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-sm font-medium text-gray-700 block mb-1.5">Número de adultos <span className="text-red-400">*</span></label>
                    <input type="number" min="1" name="adultos" value={form.adultos} onChange={handleChange}
                      className="w-full px-4 py-3 font-body text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-brand-orange" />
                  </div>
                  <div>
                    <label className="font-body text-sm font-medium text-gray-700 block mb-1.5">Número de niños</label>
                    <input type="number" min="0" name="ninos" value={form.ninos} onChange={handleChange}
                      className="w-full px-4 py-3 font-body text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-brand-orange" />
                  </div>
                </div>
                {form.ninos > 0 && (
                  <div>
                    <label className="font-body text-sm font-medium text-gray-700 block mb-1.5">Edad de los niños</label>
                    <input type="text" name="edad_ninos" value={form.edad_ninos} onChange={handleChange} placeholder="Ej: 3, 7, 10"
                      className="w-full px-4 py-3 font-body text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-brand-orange" />
                  </div>
                )}
              </div>
            )}

            {/* SECCIÓN 3 — Hospedaje */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-heading font-bold text-brand-navy text-lg border-b border-gray-100 pb-3">🏨 Hospedaje</h2>
                <div>
                  <label className="font-body text-sm font-medium text-gray-700 block mb-3">Tipo de hospedaje <span className="text-red-400">*</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Hotel', 'Resort Todo Incluido', 'Departamento', 'Aparthotel', 'Villa', 'Casa vacacional', 'Indiferente'].map(op => (
                      <button key={op} type="button" onClick={() => setForm(f => ({ ...f, tipo_hospedaje: op }))}
                        className={`py-2.5 px-3 rounded-xl font-body text-sm border-2 transition-colors text-left ${form.tipo_hospedaje === op ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-navy'}`}>
                        {op}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-gray-700 block mb-3">¿Cómo desea manejar su presupuesto? <span className="text-red-400">*</span></label>
                  <div className="flex gap-3">
                    {['Presupuesto por noche', 'Presupuesto por estadía completa'].map(op => (
                      <button key={op} type="button" onClick={() => setForm(f => ({ ...f, manejo_presupuesto: op }))}
                        className={`flex-1 py-3 px-2 rounded-xl font-body text-xs border-2 transition-colors text-center ${form.manejo_presupuesto === op ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-navy'}`}>
                        {op}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-gray-700 block mb-1.5">Presupuesto aproximado (USD) <span className="text-red-400">*</span></label>
                  <input type="number" name="presupuesto" value={form.presupuesto} onChange={handleChange} placeholder="Ej: 150"
                    className="w-full px-4 py-3 font-body text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-brand-orange" />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-gray-700 block mb-1.5">¿Tiene una zona específica donde hospedarse?</label>
                  <textarea name="zona" value={form.zona} onChange={handleChange} rows={2} placeholder="Ej: Zona hotelera, centro histórico..."
                    className="w-full px-4 py-3 font-body text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-brand-orange resize-none" />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-gray-700 block mb-3">Si no conoce el destino, ¿desea que le recomendemos la mejor zona?</label>
                  <div className="flex gap-3">
                    {['Sí', 'No'].map(op => (
                      <button key={op} type="button" onClick={() => setForm(f => ({ ...f, recomendar_zona: op }))}
                        className={`flex-1 py-3 rounded-xl font-heading font-semibold text-sm border-2 transition-colors ${form.recomendar_zona === op ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-navy'}`}>
                        {op}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SECCIÓN 4 — Prioridades (máx 2) */}
            {step === 4 && (
              <div className="space-y-5">
                <h2 className="font-heading font-bold text-brand-navy text-lg border-b border-gray-100 pb-3">⭐ Prioridades</h2>
                <div>
                  <label className="font-body text-sm font-medium text-gray-700 block mb-1">¿Qué es más importante para usted?</label>
                  <p className="font-body text-gray-400 text-xs mb-3">Seleccione hasta 2 opciones.</p>
                  <div className="space-y-2">
                    {PRIORIDADES.map(op => {
                      const seleccionada = form.prioridades.includes(op)
                      const deshabilitada = !seleccionada && form.prioridades.length >= 2
                      return (
                        <button key={op} type="button" onClick={() => handlePrioridad(op)} disabled={deshabilitada}
                          className={`w-full py-3 px-4 rounded-xl font-body text-sm border-2 transition-colors text-left flex items-center gap-3
                            ${seleccionada ? 'bg-brand-navy text-white border-brand-navy' : deshabilitada ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-navy'}`}>
                          <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${seleccionada ? 'border-white bg-brand-orange' : 'border-gray-300'}`} />
                          {op}
                          {seleccionada && <span className="ml-auto text-brand-orange text-xs font-bold">✓</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SECCIÓN 5 — Servicios */}
            {step === 5 && (
              <div className="space-y-5">
                <h2 className="font-heading font-bold text-brand-navy text-lg border-b border-gray-100 pb-3">🛎️ Servicios Importantes</h2>
                <p className="font-body text-gray-500 text-sm">Seleccione todos los que apliquen.</p>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICIOS.map(s => (
                    <button key={s} type="button" onClick={() => handleServicio(s)}
                      className={`py-2.5 px-3 rounded-xl font-body text-xs border-2 transition-colors text-left flex items-center gap-2 ${form.servicios.includes(s) ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-emerald'}`}>
                      <span>{form.servicios.includes(s) ? '✅' : '☐'}</span>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SECCIÓN 6 — Motivo */}
            {step === 6 && (
              <div className="space-y-5">
                <h2 className="font-heading font-bold text-brand-navy text-lg border-b border-gray-100 pb-3">🎯 Motivo del Viaje</h2>
                <div className="grid grid-cols-2 gap-2">
                  {['Vacaciones', 'Luna de miel', 'Aniversario', 'Cumpleaños', 'Familiar', 'Negocios', 'Compras', 'Turismo', 'Otro'].map(op => (
                    <button key={op} type="button" onClick={() => setForm(f => ({ ...f, motivo: op }))}
                      className={`py-3 px-3 rounded-xl font-body text-sm border-2 transition-colors text-center ${form.motivo === op ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-navy'}`}>
                      {op}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SECCIÓN 7 — Información Adicional */}
            {step === 7 && (
              <div className="space-y-5">
                <h2 className="font-heading font-bold text-brand-navy text-lg border-b border-gray-100 pb-3">📋 Información Adicional</h2>
                {[
                  { name: 'visa', label: '¿Posee visa vigente para el destino?', opciones: ['Sí', 'No', 'No aplica'] },
                  { name: 'vuelos', label: '¿Ya tiene vuelos comprados?', opciones: ['Sí', 'No'] },
                  { name: 'ver_sobre_presupuesto', label: 'Si encontramos una opción mejor que supera su presupuesto, ¿le gustaría verla?', opciones: ['Sí', 'No'] },
                ].map(campo => (
                  <div key={campo.name}>
                    <label className="font-body text-sm font-medium text-gray-700 block mb-3">{campo.label} <span className="text-red-400">*</span></label>
                    <div className="flex gap-2">
                      {campo.opciones.map(op => (
                        <button key={op} type="button" onClick={() => setForm(f => ({ ...f, [campo.name]: op }))}
                          className={`flex-1 py-3 rounded-xl font-heading font-semibold text-sm border-2 transition-colors ${form[campo.name] === op ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-navy'}`}>
                          {op}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <div>
                  <label className="font-body text-sm font-medium text-gray-700 block mb-1.5">Comentarios adicionales</label>
                  <textarea name="comentarios" value={form.comentarios} onChange={handleChange} rows={4}
                    placeholder="Cualquier información adicional que nos ayude a encontrar la mejor opción..."
                    className="w-full px-4 py-3 font-body text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-brand-orange resize-none" />
                </div>
              </div>
            )}

            {error && <p className="font-body text-red-500 text-sm mt-4 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

            {/* Navegación */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button type="button" onClick={prev}
                  className="flex-1 py-3.5 rounded-xl font-heading font-semibold text-sm border-2 border-gray-200 text-gray-600 hover:border-brand-navy transition-colors">
                  ← Anterior
                </button>
              )}
              {step < totalSteps ? (
                <button type="button" onClick={next}
                  className="flex-1 bg-brand-orange text-white font-heading font-bold text-sm py-3.5 rounded-xl hover:bg-orange-500 transition-colors">
                  Siguiente →
                </button>
              ) : (
                <button type="submit" disabled={sending}
                  className="flex-1 bg-brand-orange text-white font-heading font-bold text-sm py-3.5 rounded-xl hover:bg-orange-500 transition-colors disabled:opacity-60">
                  {sending ? 'Enviando...' : '✅ Enviar solicitud'}
                </button>
              )}
            </div>
          </div>
        </form>

        <p className="text-center font-body text-gray-400 text-xs mt-6">
          Access Ecuador · admin@alfonsohidalgo.com · +593 958 900 029
        </p>
      </div>
    </div>
  )
}
