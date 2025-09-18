"use client"

import { useLanguage } from "@/components/language-provider"

interface TranslationOptions {
  count?: number
  values?: Record<string, string | number>
  fallback?: string
}

export function useTranslation() {
  const { translate, currentLanguage, formatNumber, formatDate, formatCurrency } = useLanguage()

  // Enhanced translation with interpolation and pluralization
  const t = (key: string, options?: TranslationOptions): string => {
    let translation = translate(key)

    // Use fallback if translation not found
    if (translation === key && options?.fallback) {
      translation = options.fallback
    }

    // Handle pluralization (basic implementation)
    if (options?.count !== undefined) {
      const pluralKey = options.count === 1 ? `${key}.singular` : `${key}.plural`
      const pluralTranslation = translate(pluralKey)
      if (pluralTranslation !== pluralKey) {
        translation = pluralTranslation
      }
    }

    // Handle variable interpolation
    if (options?.values) {
      Object.entries(options.values).forEach(([placeholder, value]) => {
        const regex = new RegExp(`{{${placeholder}}}`, "g")
        translation = translation.replace(regex, String(value))
      })
    }

    return translation
  }

  // Get emergency numbers based on current language/region
  const getEmergencyNumbers = () => {
    const emergencyNumbers: Record<string, Record<string, string>> = {
      en: { police: "911", ambulance: "911", fire: "911" },
      hi: { police: "100", ambulance: "108", fire: "101" },
      es: { police: "091", ambulance: "061", fire: "080" },
      fr: { police: "17", ambulance: "15", fire: "18" },
      de: { police: "110", ambulance: "112", fire: "112" },
      pt: { police: "112", ambulance: "112", fire: "112" },
      it: { police: "112", ambulance: "118", fire: "115" },
      ja: { police: "110", ambulance: "119", fire: "119" },
      ko: { police: "112", ambulance: "119", fire: "119" },
      zh: { police: "110", ambulance: "120", fire: "119" },
      ar: { police: "999", ambulance: "997", fire: "998" },
      ru: { police: "102", ambulance: "103", fire: "101" },
    }

    return emergencyNumbers[currentLanguage] || emergencyNumbers["en"]
  }

  // Get localized safety messages
  const getSafetyMessage = (safetyScore: number): string => {
    if (safetyScore >= 90) return t("safety.highSafety")
    if (safetyScore >= 70) return t("safety.moderateSafety")
    if (safetyScore >= 50) return t("safety.lowSafety")
    return t("safety.criticalSafety")
  }

  // Format relative time (e.g., "2 hours ago")
  const formatRelativeTime = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) {
      return t("time.daysAgo", { values: { count: days }, fallback: `${days} days ago` })
    }
    if (hours > 0) {
      return t("time.hoursAgo", { values: { count: hours }, fallback: `${hours} hours ago` })
    }
    if (minutes > 0) {
      return t("time.minutesAgo", { values: { count: minutes }, fallback: `${minutes} minutes ago` })
    }
    return t("time.justNow")
  }

  return {
    t,
    translate,
    currentLanguage,
    formatNumber,
    formatDate,
    formatCurrency,
    formatRelativeTime,
    getEmergencyNumbers,
    getSafetyMessage,
  }
}
