import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions légales — PatriAlta',
}

export default function MentionsLegalesPage() {
  return (
    <article className="prose prose-sm prose-gray max-w-none">
      <h1>Mentions légales</h1>
      <p className="text-gray-500 text-sm">Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l&apos;économie numérique.</p>

      <h2>Éditeur du site</h2>
      <ul>
        <li><strong>Dénomination :</strong> PatriAlta</li>
        <li><strong>Responsable :</strong> Paul Vacheret</li>
        <li><strong>Adresse :</strong> Lyon, France</li>
        <li><strong>Email :</strong> contact@patrialta.fr</li>
        <li><strong>Directeur de la publication :</strong> Paul Vacheret</li>
      </ul>

      <h2>Hébergement</h2>
      <ul>
        <li><strong>Hébergeur :</strong> Vercel Inc.</li>
        <li><strong>Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, USA</li>
        <li><strong>Serveurs :</strong> Région EU (Frankfurt, Allemagne)</li>
        <li><strong>Site :</strong> vercel.com</li>
      </ul>

      <h2>Base de données</h2>
      <ul>
        <li><strong>Prestataire :</strong> Supabase Inc. (infrastructure AWS)</li>
        <li><strong>Région :</strong> eu-central-1 (Frankfurt, Allemagne)</li>
        <li><strong>Données hébergées :</strong> dans l&apos;Union Européenne</li>
      </ul>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble du contenu de ce site (textes, algorithmes, interfaces graphiques, bases de données)
        est protégé par le droit de la propriété intellectuelle et appartient à Paul Vacheret / PatriAlta.
        Toute reproduction, même partielle, sans autorisation préalable est interdite.
      </p>

      <h2>Données patrimoniales</h2>
      <p>
        Les données sur les monuments historiques sont issues de la <strong>Base Mérimée</strong>
        (Ministère de la Culture, données ouvertes). Les données sur les aides financières publiques
        proviennent notamment d&apos;<strong>Aides-territoires</strong> (beta.gouv.fr, données ouvertes).
        Les données sur les fondations privées sont vérifiées par l&apos;équipe PatriAlta.
      </p>

      <h2>Cookies</h2>
      <p>
        PatriAlta utilise uniquement les cookies techniques strictement nécessaires au fonctionnement
        du service (session d&apos;authentification). Aucun cookie analytique ou publicitaire n&apos;est déposé.
      </p>
    </article>
  )
}
