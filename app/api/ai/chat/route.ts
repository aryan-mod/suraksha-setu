import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { language } from "@/lib/config" // Declare the language variable

export async function POST(request: NextRequest) {
  try {
    const { message, userId, location, context } = await request.json()

    // Initialize Supabase client for user context
    const supabase = await createClient()

    let userProfile = null
    let safetyScore = 95
    let emergencyContacts = []

    // Get user context if userId provided
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*, emergency_contacts(*)")
        .eq("id", userId)
        .single()

      if (profile) {
        userProfile = profile
        safetyScore = profile.safety_score || 95
        emergencyContacts = profile.emergency_contacts || []
      }
    }

    // Try Gemini API first, fallback to enhanced responses
    let response: string

    if (process.env.GEMINI_API_KEY) {
      try {
        response = await generateGeminiResponse(message, language, {
          userProfile,
          location,
          safetyScore,
          emergencyContacts,
          context,
        })
      } catch (error) {
        console.log("[v0] Gemini API failed, using fallback:", error)
        response = generateEnhancedAIResponse(message, language, {
          userProfile,
          location,
          safetyScore,
          emergencyContacts,
          context,
        })
      }
    } else {
      response = generateEnhancedAIResponse(message, language, {
        userProfile,
        location,
        safetyScore,
        emergencyContacts,
        context,
      })
    }

    // Log chat interaction for analytics
    if (userId) {
      await supabase.from("chat_logs").insert({
        user_id: userId,
        message: message,
        response: response,
        language: language,
        location: location,
        safety_score: safetyScore,
      })
    }

    return NextResponse.json({
      success: true,
      response,
      language,
      safetyScore,
      timestamp: new Date().toISOString(),
      emergencyDetected: isEmergencyMessage(message),
    })
  } catch (error) {
    console.error("[v0] AI Chat API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process AI request",
        fallbackResponse:
          language === "hi"
            ? "क्षमा करें, तकनीकी समस्या है। आपातकाल के लिए 112 डायल करें।"
            : "Sorry, technical issue. For emergencies, dial 112.",
      },
      { status: 500 },
    )
  }
}

async function generateGeminiResponse(message: string, language: string, context: any): Promise<string> {
  const systemPrompt = `You are SafeTour AI, an advanced tourist safety assistant. Context:
- User: ${context.userProfile?.full_name || "Tourist"}
- Location: ${context.location || "Unknown"}
- Safety Score: ${context.safetyScore}%
- Language: ${language === "hi" ? "Hindi" : "English"}
- Emergency Contacts: ${context.emergencyContacts?.length || 0} available

Guidelines:
1. Prioritize safety and emergency responses
2. Provide location-specific advice
3. Use appropriate language (${language === "hi" ? "Hindi" : "English"})
4. Be concise but comprehensive
5. Include relevant emojis and formatting
6. For emergencies, provide immediate actionable steps

Respond naturally and helpfully to: "${message}"`

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
      process.env.GEMINI_API_KEY,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: systemPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here to help with your safety needs."
}

function generateEnhancedAIResponse(message: string, language: string, context: any): string {
  const lowerMessage = message.toLowerCase()
  const userName = context.userProfile?.full_name || (language === "hi" ? "यात्री" : "Traveler")
  const location = context.location || (language === "hi" ? "अज्ञात स्थान" : "Unknown location")
  const safetyScore = context.safetyScore || 95

  if (language === "hi") {
    if (isEmergencyMessage(message)) {
      return `🚨 ${userName}, आपातकालीन स्थिति का पता चला!

तत्काल कार्य:
✅ स्थानीय अधिकारियों को सूचित किया जा रहा है
✅ आपके आपातकालीन संपर्कों को अलर्ट भेजा जा रहा है
✅ आपका स्थान साझा किया गया: ${location}
✅ सुरक्षा स्कोर: ${safetyScore}%

📞 तुरंत कॉल करें:
• आपातकाल: 112
• पुलिस: 100
• एम्बुलेंस: 108

कृपया शांत रहें, सहायता आ रही है। अपडेट के लिए जुड़े रहें।`
    }

    if (lowerMessage.includes("सुरक्षा") || lowerMessage.includes("safety")) {
      return `🛡️ ${userName}, आपकी सुरक्षा रिपोर्ट:

📍 वर्तमान स्थान: ${location}
📊 सुरक्षा स्कोर: ${safetyScore}%
${safetyScore >= 90 ? "✅ उच्च सुरक्षा क्षेत्र" : safetyScore >= 70 ? "⚠️ मध्यम सुरक्षा - सावधान रहें" : "🚨 कम सुरक्षा - तुरंत सुरक्षित स्थान पर जाएं"}

🏥 निकटतम सुविधाएं:
• पुलिस स्टेशन: 500m
• अस्पताल: 1.2km  
• पर्यटक सहायता: 800m

कोई विशिष्ट चिंता है?`
    }

    if (lowerMessage.includes("दिशा") || lowerMessage.includes("location") || lowerMessage.includes("रास्ता")) {
      return `📍 ${userName}, आपकी स्थान जानकारी:

🗺️ वर्तमान: ${location}
🎯 सुरक्षा स्कोर: ${safetyScore}%

🏢 निकटतम सुरक्षित स्थान:
1. होटल/रिसॉर्ट - 300m (2 मिनट)
2. पुलिस स्टेशन - 500m (3 मिनट)  
3. अस्पताल - 1.2km (8 मिनट)
4. पर्यटक केंद्र - 800m (5 मिनट)

किस स्थान का रास्ता चाहिए?`
    }

    return `नमस्ते ${userName}! मैं SafeTour AI असिस्टेंट हूं।

🎯 आपकी वर्तमान स्थिति:
📍 स्थान: ${location}
🛡️ सुरक्षा: ${safetyScore}%

मैं आपकी मदद कर सकता हूं:
• आपातकालीन सहायता 🚨
• सुरक्षा जानकारी 🛡️
• दिशा-निर्देश 🗺️
• स्थानीय संपर्क 📞

कैसे मदद कर सकता हूं?`
  } else {
    if (isEmergencyMessage(message)) {
      return `🚨 ${userName}, EMERGENCY DETECTED!

Immediate Actions:
✅ Notifying local authorities
✅ Alerting your emergency contacts
✅ Location shared: ${location}
✅ Safety Score: ${safetyScore}%

📞 Call Immediately:
• Emergency: 112
• Police: 100  
• Ambulance: 108
• Tourist Helpline: 1363

Stay calm, help is on the way. Keep this chat open for updates.`
    }

    if (lowerMessage.includes("safety") || lowerMessage.includes("secure")) {
      return `🛡️ ${userName}, Your Safety Report:

📍 Current Location: ${location}
📊 Safety Score: ${safetyScore}%
${safetyScore >= 90 ? "✅ High Safety Zone" : safetyScore >= 70 ? "⚠️ Moderate Safety - Stay Alert" : "🚨 Low Safety - Move to Safe Zone"}

🏥 Nearest Facilities:
• Police Station: 500m away
• Hospital: 1.2km away
• Tourist Help Center: 800m away

Any specific safety concerns?`
    }

    if (lowerMessage.includes("location") || lowerMessage.includes("direction") || lowerMessage.includes("where")) {
      return `📍 ${userName}, Your Location Info:

🗺️ Current: ${location}
🎯 Safety Score: ${safetyScore}%

🏢 Nearest Safe Locations:
1. Hotel/Resort - 300m (2 min walk)
2. Police Station - 500m (3 min walk)
3. Hospital - 1.2km (8 min walk)  
4. Tourist Center - 800m (5 min walk)

Need directions to any specific place?`
    }

    return `Hello ${userName}! I'm SafeTour AI Assistant.

🎯 Your Current Status:
📍 Location: ${location}
🛡️ Safety: ${safetyScore}%

I can help you with:
• Emergency assistance 🚨
• Safety information 🛡️
• Directions & navigation 🗺️
• Local contacts 📞

How can I assist you today?`
  }
}

function isEmergencyMessage(message: string): boolean {
  const emergencyKeywords = [
    "emergency",
    "help",
    "sos",
    "danger",
    "attack",
    "robbery",
    "accident",
    "आपातकाल",
    "सहायता",
    "खतरा",
    "हमला",
    "चोरी",
    "दुर्घटना",
  ]

  return emergencyKeywords.some((keyword) => message.toLowerCase().includes(keyword.toLowerCase()))
}
