'use client'

import { useState } from 'react'
import { dismissAlert } from '@/actions/alerts'

interface Alert {
  id: string
  type: 'nouvelle_aide' | 'deadline_approche'
  metadata: {
    aide_nom?: string
    date_depot_fin?: string
  } | null
  monument: { nom: string; commune: string } | null
  aide: { nom: string } | null
}

interface AlertsBannerProps {
  alerts: Alert[]
}

export default function AlertsBanner({ alerts: initialAlerts }: AlertsBannerProps) {
  const [alerts, setAlerts] = useState(initialAlerts)

  if (alerts.length === 0) return null

  const handleDismiss = async (alertId: string) => {
    const result = await dismissAlert(alertId)
    if ('success' in result) {
      setAlerts((prev) => prev.filter((a) => a.id !== alertId))
    }
  }

  return (
    <div className="space-y-2 mb-6">
      {alerts.map((alert) => {
        const aideNom = alert.metadata?.aide_nom ?? alert.aide?.nom ?? 'Aide disponible'
        const monumentLabel = alert.monument
          ? `${alert.monument.nom} (${alert.monument.commune})`
          : ''

        const isDeadline = alert.type === 'deadline_approche'
        const deadline = alert.metadata?.date_depot_fin
          ? new Date(alert.metadata.date_depot_fin).toLocaleDateString('fr-FR')
          : null

        return (
          <div
            key={alert.id}
            className={`flex items-start justify-between gap-4 rounded-lg border px-4 py-3 ${
              isDeadline
                ? 'border-orange-200 bg-orange-50'
                : 'border-blue-200 bg-blue-50'
            }`}
          >
            <div className="min-w-0">
              <p className={`text-xs font-medium ${isDeadline ? 'text-orange-800' : 'text-blue-800'}`}>
                {isDeadline ? (
                  <>Date limite approche{deadline ? ` (${deadline})` : ''} — </>
                ) : (
                  <>Nouvelle aide disponible — </>
                )}
                {aideNom}
              </p>
              {monumentLabel && (
                <p className="text-xs text-gray-500 mt-0.5">{monumentLabel}</p>
              )}
            </div>
            <button
              onClick={() => handleDismiss(alert.id)}
              className="flex-shrink-0 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Masquer l'alerte"
            >
              Masquer
            </button>
          </div>
        )
      })}
    </div>
  )
}
