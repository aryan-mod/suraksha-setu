"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const languages = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    rtl: false
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳',
    rtl: false
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    rtl: false
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇧🇩',
    rtl: false
  }
]

interface EnhancedLanguageSelectorProps {
  className?: string
  variant?: 'dropdown' | 'inline'
  showFlags?: boolean
  showNativeNames?: boolean
}

export default function EnhancedLanguageSelector({ 
  className, 
  variant = 'dropdown',
  showFlags = true,
  showNativeNames = true 
}: EnhancedLanguageSelectorProps) {
  const { i18n, t } = useTranslation('common')
  const [currentLanguage, setCurrentLanguage] = useState('en')

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('i18nextLng') || 'en'
    setCurrentLanguage(savedLanguage)
    if (i18n && typeof i18n.changeLanguage === 'function') {
      i18n.changeLanguage(savedLanguage)
    }
  }, [i18n])

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode)
    if (i18n && typeof i18n.changeLanguage === 'function') {
      i18n.changeLanguage(languageCode)
    }
    localStorage.setItem('i18nextLng', languageCode)
  }

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0]
  }

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {languages.map((language) => (
          <Button
            key={language.code}
            variant={currentLanguage === language.code ? "default" : "outline"}
            size="sm"
            onClick={() => handleLanguageChange(language.code)}
            className="h-8 px-3"
          >
            {showFlags && (
              <span className="mr-1 text-sm">{language.flag}</span>
            )}
            <span className="text-xs">
              {showNativeNames ? language.nativeName : language.name}
            </span>
            {currentLanguage === language.code && (
              <Check className="h-3 w-3 ml-1" />
            )}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`h-9 px-3 ${className}`}>
          {showFlags && (
            <span className="mr-2">{getCurrentLanguage().flag}</span>
          )}
          <Globe className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">
            {showNativeNames ? getCurrentLanguage().nativeName : getCurrentLanguage().name}
          </span>
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center">
              {showFlags && (
                <span className="mr-3 text-sm">{language.flag}</span>
              )}
              <div className="flex flex-col">
                <span className="font-medium">{language.name}</span>
                {showNativeNames && language.nativeName !== language.name && (
                  <span className="text-xs text-muted-foreground">
                    {language.nativeName}
                  </span>
                )}
              </div>
            </div>
            {currentLanguage === language.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        
        <div className="px-2 py-2 border-t mt-1">
          <Badge variant="secondary" className="text-xs">
            <Globe className="h-3 w-3 mr-1" />
            {languages.length} languages
          </Badge>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}