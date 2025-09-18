"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { useLanguage } from "./language-provider"
import { GoogleTranslate } from "./google-translate"
import { Globe, Search, X, Languages, Sparkles } from "lucide-react"

interface EnhancedLanguageSelectorProps {
  variant?: "dropdown" | "modal" | "inline"
  showGoogleTranslate?: boolean
  showFlags?: boolean
  showNativeNames?: boolean
  className?: string
}

export function EnhancedLanguageSelector({
  variant = "dropdown",
  showGoogleTranslate = true,
  showFlags = true,
  showNativeNames = true,
  className = "",
}: EnhancedLanguageSelectorProps) {
  const { currentLanguage, setLanguage, availableLanguages, translate } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"native" | "google">("native")

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
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant={activeTab === "native" ? "default" : "outline"}
            onClick={() => setActiveTab("native")}
            className="glassmorphism flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            Native Languages
          </Button>
          {showGoogleTranslate && (
            <Button
              variant={activeTab === "google" ? "default" : "outline"}
              onClick={() => setActiveTab("google")}
              className="glassmorphism flex items-center gap-2"
            >
              <Languages className="h-4 w-4" />
              Google Translate
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-2 w-2 mr-1" />
                AI
              </Badge>
            </Button>
          )}
        </div>

        {activeTab === "native" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
                {currentLanguage === lang.code && <Sparkles className="h-4 w-4 ml-auto text-primary" />}
              </Button>
            ))}
          </div>
        )}

        {activeTab === "google" && showGoogleTranslate && (
          <div className="space-y-4">
            <Card className="glassmorphism bg-card/50 border-border/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Languages className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Google Translate Integration</h3>
                  <p className="text-sm text-muted-foreground">Translate the entire page to 100+ languages using AI</p>
                </div>
              </div>
              <GoogleTranslate variant="custom" />
            </Card>
          </div>
        )}
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
        </Button>

        {isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl glassmorphism bg-card/95 border-border/50 max-h-[80vh] overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Language Settings
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Button
                    variant={activeTab === "native" ? "default" : "outline"}
                    onClick={() => setActiveTab("native")}
                    size="sm"
                    className="glassmorphism"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Native
                  </Button>
                  {showGoogleTranslate && (
                    <Button
                      variant={activeTab === "google" ? "default" : "outline"}
                      onClick={() => setActiveTab("google")}
                      size="sm"
                      className="glassmorphism"
                    >
                      <Languages className="h-4 w-4 mr-2" />
                      Google Translate
                    </Button>
                  )}
                </div>

                {activeTab === "native" && (
                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={translate("common.search")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 glassmorphism"
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0">
                {activeTab === "native" && (
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
                            {currentLanguage === lang.code && <Sparkles className="h-4 w-4 text-primary" />}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                )}

                {activeTab === "google" && showGoogleTranslate && (
                  <div className="p-4">
                    <Card className="glassmorphism bg-card/30 border-border/30 p-6">
                      <div className="text-center mb-4">
                        <div className="p-3 rounded-xl bg-primary/20 w-fit mx-auto mb-3">
                          <Languages className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-2">Google Translate</h3>
                        <p className="text-sm text-muted-foreground">
                          Translate the entire page to 100+ languages using Google's AI translation service
                        </p>
                      </div>
                      <GoogleTranslate variant="custom" />
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Button variant="ghost" onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 glassmorphism">
        <Globe className="h-4 w-4" />
        {showFlags && currentLang && <span>{currentLang.flag}</span>}
        <span className="hidden sm:inline">
          {showNativeNames && currentLang ? currentLang.name : currentLanguage.toUpperCase()}
        </span>
      </Button>

      {isOpen && (
        <Card className="absolute top-12 right-0 w-80 glassmorphism bg-card/95 border-border/50 shadow-2xl z-50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 mb-3">
              <Button
                variant={activeTab === "native" ? "default" : "outline"}
                onClick={() => setActiveTab("native")}
                size="sm"
                className="glassmorphism flex-1"
              >
                <Globe className="h-4 w-4 mr-2" />
                Native
              </Button>
              {showGoogleTranslate && (
                <Button
                  variant={activeTab === "google" ? "default" : "outline"}
                  onClick={() => setActiveTab("google")}
                  size="sm"
                  className="glassmorphism flex-1"
                >
                  <Languages className="h-4 w-4 mr-2" />
                  Translate
                </Button>
              )}
            </div>

            {activeTab === "native" && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={translate("common.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-8 glassmorphism"
                />
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {activeTab === "native" && (
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
                        {currentLanguage === lang.code && <Sparkles className="h-4 w-4 text-primary" />}
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            )}

            {activeTab === "google" && showGoogleTranslate && (
              <div className="p-3">
                <GoogleTranslate variant="custom" />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
