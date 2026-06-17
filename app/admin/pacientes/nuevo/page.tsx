import NuevoPacienteForm from './NuevoPacienteForm'

export default function NuevoPacientePage() {
  return (
    <div className="max-w-lg mx-auto px-5 py-6">
      <div className="mb-6 animate-in">
        <h1 className="text-[22px] font-bold text-text">Nuevo paciente</h1>
        <p className="text-text-muted text-sm mt-1">Crea las credenciales de acceso para el paciente</p>
      </div>
      <NuevoPacienteForm />
    </div>
  )
}
