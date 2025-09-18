"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from "./language-provider"
import { Globe, Check, ChevronDown, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"

interface LanguageSelectorProps {
  variant?: "dropdown" | "modal" | "inline"
  showFlags?: boolean
  showNativeNames?: boolean
  className?: string
}

export function LanguageSelector({
  variant = "dropdown",
  showFlags = true,
  showNativeNames = true,
  className = "",
}: LanguageSelectorProps) {
  const { currentLanguage, setLanguage, availableLanguages, translate } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const currentLang = availableLanguages.find((lang) => lang.code === currentLanguage)

  const filteredLanguages = availableLanguages.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleLanguageSelect = (langCode: string) => {
    setLanguage(langCode)
    setIsOpen(false)
    setSearchQuery("")
  }

  if (variant === "inline") {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ${className}`}>
        {availableLanguages.map((lang) => (
          <Button
            key={lang.code}
            variant={currentLanguage === lang.code ? "default" : "outline"}
            onClick={() => handleLanguageSelect(lang.code)}
            className="flex items-center gap-2 justify-start h-auto p-3 glassmorphism"
          >
            {showFlags && <span className="text-lg">{lang.flag}</span>}
            <div className="flex flex-col items-start">
              <span className="font-medium">{lang.name}</span>
              <span className="text-xs opacity-70 uppercase">{lang.code}</span>
            </div>
            {currentLanguage === lang.code && <Check className="h-4 w-4 ml-auto text-primary" />}
          </Button>
        ))}
      </div>
    )
  }

  if (variant === "modal") {
    return (
      <>
        <Button
          variant="ghost"
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 glassmorphism ${className}`}
        >
          <Globe className="h-4 w-4" />
          {showFlags && currentLang && <span>{currentLang.flag}</span>}
          <span className="hidden sm:inline">
            {showNativeNames && currentLang ? currentLang.name : currentLanguage.toUpperCase()}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>

        {isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md glassmorphism bg-card/95 border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    {translate("nav.settings")} - {translate("common.language")}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={translate("common.search")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 glassmorphism"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-80">
                  <div className="p-4 space-y-2">
                    {filteredLanguages.map((lang) => (
                      <Button
                        key={lang.code}
                        variant="ghost"
                        onClick={() => handleLanguageSelect(lang.code)}
                        className={`w-full justify-start h-auto p-3 glassmorphism ${
                          currentLanguage === lang.code ? "bg-primary/10 border-primary/20" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 w-full">
                          {showFlags && <span className="text-xl">{lang.flag}</span>}
                          <div className="flex flex-col items-start flex-1">
                            <span className="font-medium">{lang.name}</span>
                            <span className="text-xs text-muted-foreground uppercase">{lang.code}</span>
                          </div>
                          {lang.rtl && (
                            <Badge variant="outline" className="text-xs">
                              RTL
                            </Badge>
                          )}
                          {currentLanguage === lang.code && <Check className="h-4 w-4 text-primary" />}
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </>
    )
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <Button variant="ghost" onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 glassmorphism">
        <Globe className="h-4 w-4" />
        {showFlags && currentLang && <span>{currentLang.flag}</span>}
        <span className="hidden sm:inline">
          {showNativeNames && currentLang ? currentLang.name : currentLanguage.toUpperCase()}
        </span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isOpen && (
        <Card className="absolute top-12 right-0 w-64 glassmorphism bg-card/95 border-border/50 shadow-2xl z-50">
          <CardHeader className="pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={translate("common.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-8 glassmorphism"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-64">
              <div className="p-2 space-y-1">
                {filteredLanguages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant="ghost"
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`w-full justify-start h-auto p-2 glassmorphism ${
                      currentLanguage === lang.code ? "bg-primary/10 border-primary/20" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {showFlags && <span className="text-lg">{lang.flag}</span>}
                      <div className="flex flex-col items-start flex-1">
                        <span className="font-medium text-sm">{lang.name}</span>
                        <span className="text-xs text-muted-foreground uppercase">{lang.code}</span>
                      </div>
                      {lang.rtl && (
                        <Badge variant="outline" className="text-xs">
                          RTL
                        </Badge>
                      )}
                      {currentLanguage === lang.code && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
