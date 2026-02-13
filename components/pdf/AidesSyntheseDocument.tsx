import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Aide, CritereResult } from '@/lib/s1/types'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a1a' },
  header: { marginBottom: 24 },
  title: { fontSize: 16, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#555', marginBottom: 2 },
  meta: { fontSize: 9, color: '#888' },
  section: { marginBottom: 16 },
  aideCard: { border: '1pt solid #e5e7eb', borderRadius: 4, padding: 10, marginBottom: 8 },
  aideNom: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  aideOrg: { fontSize: 9, color: '#666', marginBottom: 6 },
  critereRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2 },
  critereIcon: { width: 14, fontSize: 9 },
  critereText: { flex: 1, fontSize: 9 },
  rempli: { color: '#166534' },
  manquant: { color: '#991b1b' },
  aVerifier: { color: '#92400e' },
  badge: { fontSize: 8, color: '#555', marginBottom: 6 },
  footer: { position: 'absolute', bottom: 24, left: 40, right: 40, borderTop: '1pt solid #e5e7eb', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#999' },
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 8, paddingBottom: 4, borderBottom: '1pt solid #e5e7eb' },
})

type AideResult = {
  aide: Aide
  criteres_remplis: CritereResult[]
  criteres_manquants: CritereResult[]
  criteres_a_verifier: CritereResult[]
}

type MonumentInfo = {
  nom: string
  commune: string
  departement: string
  region: string
  type_protection: string | null
}

export default function AidesSyntheseDocument({
  monument,
  results,
  generatedAt,
}: {
  monument: MonumentInfo
  results: AideResult[]
  generatedAt: Date
}) {
  const eligible = results.filter((r) => r.criteres_manquants.length === 0 && r.criteres_a_verifier.length === 0)
  const dateStr = generatedAt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const PROTECTION_LABELS: Record<string, string> = {
    classe: 'Classé MH', inscrit: 'Inscrit MH', spr: 'SPR', label_fdp: 'Label FdP', non_protege: 'Non protégé',
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.title}>{monument.nom}</Text>
          <Text style={styles.subtitle}>{monument.commune} · {monument.departement} · {monument.region}</Text>
          {monument.type_protection && (
            <Text style={styles.meta}>{PROTECTION_LABELS[monument.type_protection] ?? monument.type_protection}</Text>
          )}
          <Text style={[styles.meta, { marginTop: 8 }]}>
            Synthèse des aides éligibles — {eligible.length} aide{eligible.length > 1 ? 's' : ''} éligible{eligible.length > 1 ? 's' : ''} sur {results.length} analysées
          </Text>
        </View>

        {/* Aides éligibles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aides éligibles</Text>
          {eligible.length === 0 ? (
            <Text style={{ fontSize: 10, color: '#555' }}>Aucune aide éligible identifiée à ce jour.</Text>
          ) : (
            eligible.map((r) => (
              <View key={r.aide.id} style={styles.aideCard}>
                <Text style={styles.aideNom}>{r.aide.nom}</Text>
                <Text style={styles.aideOrg}>{r.aide.organisme}</Text>
                {(r.aide.montant_max || r.aide.taux_max) && (
                  <Text style={styles.badge}>
                    {r.aide.taux_max ? `Taux max : ${Math.round(r.aide.taux_max * 100)}%` : ''}
                    {r.aide.taux_max && r.aide.montant_max ? ' · ' : ''}
                    {r.aide.montant_max ? `Plafond : ${r.aide.montant_max.toLocaleString('fr-FR')} €` : ''}
                  </Text>
                )}
                {r.aide.date_depot_fin && (
                  <Text style={styles.badge}>Deadline : {new Date(r.aide.date_depot_fin).toLocaleDateString('fr-FR')}</Text>
                )}
                {r.criteres_remplis.map((c, i) => (
                  <View key={i} style={styles.critereRow}>
                    <Text style={[styles.critereIcon, styles.rempli]}>✓</Text>
                    <Text style={[styles.critereText, styles.rempli]}>{c.critere.label_humain}</Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Généré par PatriAlta le {dateStr} — Document non contractuel</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
