import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation — PatriAlta',
}

export default function CGUPage() {
  return (
    <article className="max-w-none text-gray-700 leading-relaxed">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Conditions Générales d&apos;Utilisation</h1>
      <p className="text-gray-500 text-sm">Dernière mise à jour : février 2026</p>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">1. Objet du service</h2>
      <p>
        PatriAlta est une plateforme SaaS d&apos;aide à l&apos;identification des financements publics et privés
        pour les monuments historiques et le patrimoine bâti. Elle s&apos;adresse aux collectivités locales,
        aux propriétaires privés et aux associations gestionnaires de patrimoine.
      </p>
      <p>
        PatriAlta fournit un <strong>diagnostic indicatif et non contractuel</strong>. Les informations
        produites par la plateforme ne constituent pas un conseil juridique ou financier.
        L&apos;éligibilité définitive à une aide est déterminée par l&apos;organisme financeur, non par PatriAlta.
      </p>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">2. Création de compte</h2>
      <p>
        L&apos;utilisation du service nécessite la création d&apos;un compte. L&apos;utilisateur s&apos;engage à fournir
        des informations exactes et à maintenir la confidentialité de ses identifiants.
        Un seul compte par personne physique ou morale est autorisé.
      </p>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3. Utilisation du service</h2>
      <p>L&apos;utilisateur s&apos;engage à :</p>
      <ul>
        <li>Ne pas utiliser PatriAlta à des fins frauduleuses ou contraires à la réglementation</li>
        <li>Ne pas tenter d&apos;accéder aux données d&apos;autres utilisateurs</li>
        <li>Valider humainement tout dossier généré avant de le soumettre à un organisme financeur</li>
        <li>Ne jamais soumettre automatiquement un dossier généré par PatriAlta sans relecture préalable</li>
      </ul>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4. Responsabilités de PatriAlta</h2>
      <p>
        PatriAlta met en œuvre tous les moyens raisonnables pour assurer l&apos;exactitude des données
        du catalogue d&apos;aides. Toutefois, les aides financières évoluent fréquemment. PatriAlta ne peut
        garantir l&apos;exactitude, la complétude ou l&apos;actualité des informations à tout moment.
      </p>
      <p>
        PatriAlta ne peut être tenu responsable d&apos;une aide ratée, d&apos;un dossier refusé ou de toute
        décision prise sur la base des informations produites par la plateforme.
      </p>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5. Limitation de responsabilité</h2>
      <p>
        Dans les limites permises par la loi applicable, la responsabilité de PatriAlta est limitée
        aux seuls dommages directs prouvés résultant d&apos;une faute de sa part. PatriAlta exclut toute
        responsabilité pour les dommages indirects, pertes d&apos;opportunité, ou pertes de subvention.
      </p>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">6. Propriété intellectuelle</h2>
      <p>
        Le contenu du service (algorithmes, interfaces, textes, templates) est la propriété
        exclusive de PatriAlta. Les données saisies par l&apos;utilisateur lui appartiennent.
        Les dossiers générés par PatriAlta peuvent être utilisés librement par l&apos;utilisateur
        pour les soumissions aux organismes financeurs.
      </p>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">7. Résiliation et suppression de compte</h2>
      <p>
        L&apos;utilisateur peut demander la suppression de son compte à tout moment en contactant
        <strong> contact@patrialta.fr</strong>. Les données personnelles sont supprimées dans un délai
        de 30 jours suivant la demande, conformément à la politique de confidentialité.
      </p>
      <p>
        PatriAlta se réserve le droit de suspendre ou supprimer un compte en cas de violation
        des présentes CGU.
      </p>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">8. Modifications des CGU</h2>
      <p>
        PatriAlta peut modifier les présentes CGU à tout moment. L&apos;utilisateur sera informé
        par email des modifications substantielles. La poursuite de l&apos;utilisation du service
        après notification vaut acceptation des nouvelles conditions.
      </p>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">9. Droit applicable</h2>
      <p>
        Les présentes CGU sont soumises au droit français. Tout litige sera soumis
        à la compétence exclusive des tribunaux compétents de Lyon (France).
      </p>

      <hr />
      <p className="text-sm text-gray-400">
        Pour toute question : <strong>contact@patrialta.fr</strong>
      </p>
    </article>
  )
}
