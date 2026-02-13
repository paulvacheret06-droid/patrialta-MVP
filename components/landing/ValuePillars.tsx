const PILLARS = [
  {
    icon: '🗺️',
    title: 'Exhaustivité transversale',
    description:
      'Toutes les aides en un seul endroit : État / DRAC, régions, départements, fondations privées et Europe. Aucun outil ne croise aujourd\'hui ces sources pour votre monument.',
  },
  {
    icon: '🔔',
    title: 'Proactivité',
    description:
      'PatriAlta vous alerte quand une aide s\'ouvre pour votre monument. Une opportunité n\'est plus manquée faute d\'information.',
  },
  {
    icon: '🧭',
    title: 'Accessibilité sans expertise',
    description:
      'Le mille-feuille des aides patrimoine traduit en critères factuels clairs. Un secrétaire de mairie y trouve immédiatement ce qui s\'applique à son cas.',
  },
  {
    icon: '📋',
    title: 'Continuité diagnostic → montage',
    description:
      'Les données saisies pour le diagnostic S1 pré-remplissent directement le dossier S2. Pas de ressaisie, pas de ressaut entre les étapes.',
  },
]

export default function ValuePillars() {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      <h2 className="text-center text-sm font-medium text-gray-400 uppercase tracking-widest mb-10">
        Pourquoi PatriAlta
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {PILLARS.map((pillar) => (
          <div
            key={pillar.title}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <div className="text-2xl mb-3">{pillar.icon}</div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">{pillar.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{pillar.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
