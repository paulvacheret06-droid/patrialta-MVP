import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de confidentialité — PatriAlta',
}

export default function ConfidentialitePage() {
  return (
    <article className="max-w-none text-gray-700 leading-relaxed">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Politique de confidentialité</h1>
      <p className="text-gray-500 text-sm">Dernière mise à jour : février 2026</p>

      <p>
        PatriAlta s&apos;engage à protéger vos données personnelles conformément au Règlement Général
        sur la Protection des Données (RGPD — Règlement UE 2016/679) et à la loi Informatique et Libertés.
      </p>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">1. Responsable du traitement</h2>
      <p>
        Paul Vacheret, opérant sous la marque PatriAlta — Lyon, France.<br />
        Contact : <strong>contact@patrialta.fr</strong>
      </p>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">2. Données collectées et finalités</h2>
      <table>
        <thead>
          <tr>
            <th>Données</th>
            <th>Finalité</th>
            <th>Base légale</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Adresse email</td>
            <td>Authentification, notifications</td>
            <td>Exécution du contrat</td>
          </tr>
          <tr>
            <td>Statut juridique, commune</td>
            <td>Personnalisation du diagnostic d&apos;éligibilité</td>
            <td>Exécution du contrat</td>
          </tr>
          <tr>
            <td>Données monument (nom, localisation, protection)</td>
            <td>Calcul d&apos;éligibilité aux aides</td>
            <td>Exécution du contrat</td>
          </tr>
          <tr>
            <td>Contenu des dossiers générés</td>
            <td>Montage de dossiers de subvention</td>
            <td>Exécution du contrat</td>
          </tr>
          <tr>
            <td>Pièces justificatives uploadées</td>
            <td>Constitution des dossiers</td>
            <td>Exécution du contrat</td>
          </tr>
          <tr>
            <td>Date de consentement RGPD</td>
            <td>Preuve du consentement</td>
            <td>Obligation légale</td>
          </tr>
          <tr>
            <td>Logs de connexion</td>
            <td>Sécurité et débogage</td>
            <td>Intérêt légitime</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3. Durée de conservation</h2>
      <ul>
        <li><strong>Données de compte :</strong> durée de la relation contractuelle + 3 ans après résiliation</li>
        <li><strong>Données monument et dossiers :</strong> durée de la relation contractuelle</li>
        <li><strong>Pièces justificatives :</strong> durée de la relation contractuelle</li>
        <li><strong>Logs de connexion :</strong> 12 mois maximum</li>
        <li><strong>Après suppression de compte :</strong> toutes les données personnelles sont effacées dans un délai de 30 jours</li>
      </ul>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4. Sous-traitants</h2>
      <ul>
        <li><strong>Supabase Inc.</strong> — hébergement base de données et fichiers (AWS eu-central-1, Frankfurt)</li>
        <li><strong>Vercel Inc.</strong> — hébergement application (région EU, Frankfurt)</li>
        <li><strong>Anthropic, PBC</strong> — génération IA des dossiers (traitement sans stockage des données selon les conditions Anthropic API)</li>
        <li><strong>Brevo SAS</strong> — envoi d&apos;emails transactionnels (siège Paris, France)</li>
      </ul>
      <p>Tous les sous-traitants traitent les données dans l&apos;Union Européenne ou selon des garanties adéquates.</p>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5. Vos droits</h2>
      <p>Conformément au RGPD, vous disposez des droits suivants :</p>
      <ul>
        <li><strong>Droit d&apos;accès :</strong> obtenir une copie de vos données</li>
        <li><strong>Droit de rectification :</strong> corriger des données inexactes</li>
        <li><strong>Droit à l&apos;effacement :</strong> demander la suppression de votre compte et de vos données</li>
        <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
        <li><strong>Droit d&apos;opposition :</strong> vous opposer à certains traitements basés sur l&apos;intérêt légitime</li>
        <li><strong>Droit à la limitation :</strong> limiter le traitement dans certains cas</li>
      </ul>
      <p>
        Pour exercer ces droits : <strong>contact@patrialta.fr</strong>.<br />
        Vous pouvez également introduire une réclamation auprès de la <strong>CNIL</strong> (cnil.fr).
      </p>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">6. Sécurité</h2>
      <p>
        PatriAlta met en œuvre des mesures techniques et organisationnelles adaptées : chiffrement
        des communications (TLS), hébergement dans l&apos;UE, accès aux données restreint par authentification
        (RLS Supabase), mots de passe hachés, clés API non exposées côté client.
      </p>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">7. Contact</h2>
      <p>
        Pour toute question relative à vos données personnelles :<br />
        Email : <strong>contact@patrialta.fr</strong><br />
        Adresse : PatriAlta — Lyon, France
      </p>
    </article>
  )
}
