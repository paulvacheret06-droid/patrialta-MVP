/**
 * Bandeau de disclaimer permanent — non masquable.
 * Affiché en haut de chaque page dossier.
 */
export default function DossierDisclaimer() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
      <p className="text-xs text-amber-800 leading-relaxed">
        <span className="font-semibold">Important :</span> Ce dossier a été généré
        automatiquement par intelligence artificielle. Relisez et validez chaque section
        avant tout envoi à l&apos;organisme financeur. PatriAlta ne garantit pas
        l&apos;acceptation de votre demande de subvention.
      </p>
    </div>
  )
}
