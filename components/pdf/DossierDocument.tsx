/**
 * Composant React-PDF pour l'export du dossier de subvention.
 * Runtime Node.js uniquement — incompatible Edge Runtime.
 */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { Template } from '@/lib/s2/types'

// ────────────────────────────────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    color: '#1a1a1a',
  },
  // Page de garde
  coverPage: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 80,
    paddingBottom: 56,
    paddingHorizontal: 56,
    color: '#1a1a1a',
  },
  coverOrganisme: {
    fontSize: 11,
    color: '#555555',
    marginBottom: 48,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  coverTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    lineHeight: 1.3,
  },
  coverSubtitle: {
    fontSize: 13,
    color: '#444444',
    marginBottom: 32,
  },
  coverDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 24,
  },
  coverMeta: {
    fontSize: 10,
    color: '#555555',
    marginBottom: 6,
  },
  coverDate: {
    marginTop: 48,
    fontSize: 9,
    color: '#888888',
  },
  // Sections
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    marginTop: 24,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  sectionBody: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#222222',
  },
  // Annexe
  annexeTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
    marginTop: 20,
  },
  pieceItem: {
    fontSize: 10,
    color: '#444444',
    marginBottom: 4,
    paddingLeft: 8,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#aaaaaa',
  },
  disclaimer: {
    fontSize: 8,
    color: '#888888',
    fontStyle: 'italic',
    marginBottom: 6,
  },
})

// ────────────────────────────────────────────────────────────────────────────
// Props
// ────────────────────────────────────────────────────────────────────────────

interface DossierDocumentProps {
  monument: {
    nom: string
    commune: string
    departement: string
    type_protection: string | null
  }
  aide: {
    nom: string
    organisme_nom: string
    date_depot_fin: string | null
  }
  template: Template
  sectionsContenu: Record<string, { contenu: string; is_edite: boolean }>
  documents: { type_piece: string; nom_fichier: string }[]
  generatedAt: string
}

// ────────────────────────────────────────────────────────────────────────────
// Composant
// ────────────────────────────────────────────────────────────────────────────

export default function DossierDocument({
  monument,
  aide,
  template,
  sectionsContenu,
  documents,
  generatedAt,
}: DossierDocumentProps) {
  const dateGeneration = new Date(generatedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const deadline = aide.date_depot_fin
    ? new Date(aide.date_depot_fin).toLocaleDateString('fr-FR')
    : null

  return (
    <Document
      title={`Dossier — ${aide.nom} — ${monument.nom}`}
      author="PatriAlta"
    >
      {/* ── Page de garde ── */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.coverOrganisme}>{aide.organisme_nom}</Text>
        <Text style={styles.coverTitle}>Demande de subvention</Text>
        <Text style={styles.coverSubtitle}>{aide.nom}</Text>
        <View style={styles.coverDivider} />
        <Text style={styles.coverMeta}>Monument : {monument.nom}</Text>
        <Text style={styles.coverMeta}>
          Localisation : {monument.commune} ({monument.departement})
        </Text>
        {monument.type_protection && (
          <Text style={styles.coverMeta}>Protection : {monument.type_protection}</Text>
        )}
        {deadline && (
          <Text style={styles.coverMeta}>Date limite de dépôt : {deadline}</Text>
        )}
        <Text style={styles.coverDate}>Document généré le {dateGeneration}</Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>PatriAlta — patri-alta.fr</Text>
          <Text style={styles.footerText}>1</Text>
        </View>
      </Page>

      {/* ── Pages de contenu ── */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.disclaimer}>
          Ce dossier a été généré automatiquement par PatriAlta. Relisez et validez
          chaque section avant tout envoi à l&apos;organisme financeur. Ce document ne
          constitue pas un engagement de financement.
        </Text>

        {template.sections.map((section) => {
          const sectionData = sectionsContenu[section.id]
          if (!sectionData?.contenu) return null

          return (
            <View key={section.id} wrap={false}>
              <Text style={styles.sectionTitle}>{section.titre}</Text>
              <Text style={styles.sectionBody}>{sectionData.contenu}</Text>
            </View>
          )
        })}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {monument.nom} — {aide.nom}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber }) => `${pageNumber}`}
          />
        </View>
      </Page>

      {/* ── Annexe pièces justificatives ── */}
      {documents.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.annexeTitle}>Annexe — Pièces justificatives</Text>
          {documents.map((doc, i) => (
            <Text key={i} style={styles.pieceItem}>
              • {doc.type_piece}{doc.nom_fichier ? ` (${doc.nom_fichier})` : ''}
            </Text>
          ))}

          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>
              {monument.nom} — {aide.nom}
            </Text>
            <Text
              style={styles.footerText}
              render={({ pageNumber }) => `${pageNumber}`}
            />
          </View>
        </Page>
      )}
    </Document>
  )
}
