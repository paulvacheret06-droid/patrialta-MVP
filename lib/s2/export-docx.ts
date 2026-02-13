/**
 * S2 — Export DOCX du dossier de subvention.
 * Utilise la bibliothèque `docx` (v9+).
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from 'docx'
import type { Template } from '@/lib/s2/types'

interface MonumentData {
  nom: string
  commune: string
  departement: string
  type_protection: string | null
}

interface AideData {
  nom: string
  organisme_nom: string
  date_depot_fin: string | null
}

interface DocumentData {
  type_piece: string
  nom_fichier: string
}

/**
 * Génère un Buffer DOCX à partir des données du dossier.
 */
export async function generateDossierDocx(
  monument: MonumentData,
  aide: AideData,
  template: Template,
  sectionsContenu: Record<string, { contenu: string; is_edite: boolean }>,
  documents: DocumentData[],
  generatedAt: string
): Promise<Buffer> {
  const dateGeneration = new Date(generatedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const deadline = aide.date_depot_fin
    ? new Date(aide.date_depot_fin).toLocaleDateString('fr-FR')
    : null

  const children: Paragraph[] = []

  // ── Page de garde ──────────────────────────────────────────────────────────

  children.push(
    new Paragraph({
      children: [new TextRun({ text: aide.organisme_nom, size: 20, color: '555555' })],
      spacing: { after: 400 },
    }),
    new Paragraph({
      text: 'Demande de subvention',
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: aide.nom, size: 28, bold: true })],
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Monument : ${monument.nom}`, size: 20 })],
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Localisation : ${monument.commune} (${monument.departement})`,
          size: 20,
        }),
      ],
      spacing: { after: 80 },
    })
  )

  if (monument.type_protection) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Protection : ${monument.type_protection}`, size: 20 }),
        ],
        spacing: { after: 80 },
      })
    )
  }

  if (deadline) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Date limite de dépôt : ${deadline}`, size: 20 }),
        ],
        spacing: { after: 200 },
      })
    )
  }

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `Document généré le ${dateGeneration}`, size: 16, color: '888888' }),
      ],
      spacing: { after: 800 },
    })
  )

  // ── Disclaimer ──────────────────────────────────────────────────────────────

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'IMPORTANT : Ce dossier a été généré automatiquement par PatriAlta. Relisez et validez chaque section avant tout envoi à l\'organisme financeur. Ce document ne constitue pas un engagement de financement.',
          italics: true,
          size: 16,
          color: '666666',
        }),
      ],
      border: {
        top: { style: BorderStyle.SINGLE, size: 4, color: 'DDAA44' },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: 'DDAA44' },
      },
      spacing: { before: 200, after: 600 },
    })
  )

  // ── Sections ────────────────────────────────────────────────────────────────

  for (const section of template.sections) {
    const sectionData = sectionsContenu[section.id]
    if (!sectionData?.contenu) continue

    children.push(
      new Paragraph({
        text: section.titre,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 160 },
      })
    )

    // Diviser le contenu en paragraphes (double saut de ligne)
    const paragraphs = sectionData.contenu.split(/\n\n+/)
    for (const para of paragraphs) {
      if (para.trim()) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: para.trim(), size: 20 })],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120, line: 340 },
          })
        )
      }
    }
  }

  // ── Annexe pièces ───────────────────────────────────────────────────────────

  if (documents.length > 0) {
    children.push(
      new Paragraph({
        text: 'Annexe — Pièces justificatives',
        heading: HeadingLevel.HEADING_2,
        pageBreakBefore: true,
        spacing: { before: 200, after: 160 },
      })
    )

    for (const doc of documents) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `• ${doc.type_piece}${doc.nom_fichier ? ` (${doc.nom_fichier})` : ''}`,
              size: 20,
            }),
          ],
          spacing: { after: 80 },
        })
      )
    }
  }

  // ── Assemblage du document ──────────────────────────────────────────────────

  const doc = new Document({
    creator: 'PatriAlta',
    title: `Dossier — ${aide.nom} — ${monument.nom}`,
    description: `Demande de subvention générée par PatriAlta`,
    styles: {
      default: {
        document: {
          run: { size: 20, font: 'Calibri' },
          paragraph: { alignment: AlignmentType.LEFT },
        },
      },
    },
    sections: [
      {
        children,
      },
    ],
  })

  return await Packer.toBuffer(doc)
}
