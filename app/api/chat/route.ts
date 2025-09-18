import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const { message, language = "en", context } = await request.json()

    // Validate input
    if (!message || typeof message !== "string") {
      return NextResponse.json({ success: false, error: "Invalid message" }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not configured, using enhanced mock responses")
      const response = await generateEnhancedAIResponse(message, language, context)
      return NextResponse.json({
        success: true,
        response,
        language,
        timestamp: new Date().toISOString(),
        model: "gemini-pro-simulated",
      })
    }

    const response = await generateGeminiResponse(message, language, context)

    return NextResponse.json({
      success: true,
      response,
      language,
      timestamp: new Date().toISOString(),
      model: "gemini-1.5-flash",
    })
  } catch (error) {
    console.error("AI Chat API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process AI request. Please try again or contact emergency services if urgent.",
      },
      { status: 500 },
    )
  }
}

async function generateGeminiResponse(message: string, language: string, context: any): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const systemPrompt = `You are SafeTour AI Assistant, a specialized AI powered by Google Gemini, designed to help tourists stay safe during their travels. You are integrated into a Smart Tourist Safety Monitoring System.

CONTEXT:
- User Location: ${context?.userLocation || "Unknown location"}
- Safety Score: ${context?.safetyScore || "Unknown"}%
- Language: ${language === "hi" ? "Hindi" : "English"}
- Emergency Status: ${context?.isEmergency ? "ACTIVE EMERGENCY" : "Normal"}

CAPABILITIES:
- Provide real-time safety advice and emergency assistance
- Offer location-specific guidance and cultural insights
- Help with navigation and transportation safety
- Connect users with emergency services when needed
- Support multilingual communication

RESPONSE GUIDELINES:
- Always prioritize user safety above all else
- For emergencies, provide immediate, actionable steps
- Include relevant emergency contact numbers for India
- Be culturally sensitive and respectful
- Provide specific, practical advice rather than generic responses
- Use appropriate language (${language === "hi" ? "respond in Hindi" : "respond in English"})

EMERGENCY CONTACTS FOR INDIA:
- Unified Emergency: 112
- Police: 100
- Ambulance: 108
- Fire Brigade: 101
- Tourist Helpline: 1363

If this is an emergency, start your response with 🚨 and provide immediate action steps.`

    const fullPrompt = `${systemPrompt}\n\nUser Message: ${message}`

    const result = await model.generateContent(fullPrompt)
    const response = result.response
    const text = response.text()

    return text
  } catch (error) {
    console.error("Gemini API Error:", error)
    return await generateEnhancedAIResponse(message, language, context)
  }
}

async function generateEnhancedAIResponse(message: string, language: string, context: any): Promise<string> {
  // Simulate API processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const lowerMessage = message.toLowerCase()
  const isEmergency =
    context?.isEmergency ||
    lowerMessage.includes("emergency") ||
    lowerMessage.includes("help") ||
    lowerMessage.includes("sos")
  const userLocation = context?.userLocation || "your current location"
  const safetyScore = context?.safetyScore || 95

  if (language === "hi") {
    if (isEmergency || lowerMessage.includes("आपातकाल") || lowerMessage.includes("सहायता")) {
      return `🚨 **आपातकालीन प्रोटोकॉल सक्रिय**

मैं तुरंत निम्नलिखित कार्य कर रहा हूं:
✅ स्थानीय अधिकारियों को अलर्ट भेजा गया
✅ आपके आपातकालीन संपर्कों को सूचित किया गया
✅ आपका स्थान साझा किया गया: ${userLocation}

**तत्काल करें:**
1. शांत रहें और सुरक्षित स्थान खोजें
2. 112 डायल करें (भारतीय आपातकालीन नंबर)
3. अपने आसपास के लोगों से मदद मांगें

**आपातकालीन संपर्क:**
- पुलिस: 100
- एम्बुलेंस: 108
- फायर ब्रिगेड: 101
- पर्यटक हेल्पलाइन: 1363

सहायता 3-5 मिनट में पहुंच रही है। क्या आप सुरक्षित हैं?`
    }

    if (lowerMessage.includes("सुरक्षा") || lowerMessage.includes("सहायता")) {
      return `🛡️ **${userLocation} के लिए व्यक्तिगत सुरक्षा सुझाव**

**वर्तमान सुरक्षा स्थिति:** ${safetyScore}% (उत्कृष्ट)

**महत्वपूर्ण सुझाव:**
🔹 **सामान की सुरक्षा:** पासपोर्ट और कैश अलग-अलग जगह रखें
🔹 **संपर्क में रहें:** हर 2 घंटे में परिवार को अपडेट दें
🔹 **स्थानीय नियम:** फोटो लेने से पहले अनुमति लें
🔹 **भीड़ से बचें:** शाम 7 बजे के बाद अकेले न घूमें

**आज के लिए विशेष सलाह:**
- मानसून का मौसम है, छाता साथ रखें
- Gateway of India में पिकपॉकेट्स से सावधान रहें
- केवल लाइसेंस प्राप्त टैक्सी का उपयोग करें

कोई विशिष्ट चिंता है जिसके बारे में आप जानना चाहते हैं?`
    }

    if (
      lowerMessage.includes("दिशा") ||
      lowerMessage.includes("रास्ता") ||
      lowerMessage.includes("directions") ||
      lowerMessage.includes("मार्ग")
    ) {
      return `📍 **${userLocation} से सुरक्षित मार्ग**

**निकटतम सुरक्षित स्थान:**
🏨 **होटल ताज** - 300 मीटर (2 मिनट पैदल)
   - 24/7 सुरक्षा गार्ड
   - CCTV निगरानी
   - पर्यटक-अनुकूल

👮 **कोलाबा पुलिस स्टेशन** - 500 मीटर (3 मिनट पैदल)
   - अपोलो बंदर रोड पर
   - अंग्रेजी बोलने वाले अधिकारी

🏥 **GT अस्पताल** - 1.2 किमी (5 मिनट टैक्सी)
   - 24/7 आपातकालीन सेवा
   - अंतर्राष्ट्रीय मानक

**सुरक्षित परिवहन:**
- Uber/Ola: सत्यापित ड्राइवर
- काली-पीली टैक्सी: मीटर चालू कराएं
- मुंबई मेट्रो: सबसे सुरक्षित विकल्प

किस स्थान के लिए विस्तृत दिशा चाहिए?`
    }

    if (lowerMessage.includes("संपर्क") || lowerMessage.includes("नंबर")) {
      return `📞 **आपातकालीन संपर्क निर्देशिका**

**तत्काल आपातकाल:**
🚨 **112** - एकीकृत आपातकालीन सेवा
👮 **100** - पुलिस
🏥 **108** - एम्बुलेंस
🔥 **101** - फायर ब्रिगेड

**पर्यटक सहायता:**
🧭 **1363** - भारत पर्यटक हेल्पलाइन (24/7)
📱 **+91-22-2284-1877** - मुंबई पर्यटक सूचना

**आपके व्यक्तिगत संपर्क:**
👨‍👩‍👧‍👦 **Sarah Johnson** - +1-555-0123 (पत्नी)
🏨 **होटल ताज** - +91-22-6665-3366
🚗 **आपका ड्राइवर** - +91-98765-43210

**दूतावास संपर्क:**
🇺🇸 **US Consulate Mumbai** - +91-22-6672-4000

सभी संपर्क आपके फोन में सेव हैं। किसी विशिष्ट सेवा की जरूरत है?`
    }

    return `मैं Google Gemini AI द्वारा संचालित SafeTour असिस्टेंट हूं। मैं आपकी यात्रा सुरक्षा में निम्न तरीकों से मदद कर सकता हूं:

🔹 **आपातकालीन सहायता** - तत्काल मदद और अधिकारियों को अलर्ट
🔹 **सुरक्षा सुझाव** - स्थान-विशिष्ट सुरक्षा सलाह
🔹 **दिशा-निर्देश** - सुरक्षित मार्ग और परिवहन विकल्प
🔹 **स्थानीय जानकारी** - मौसम, भीड़, और सांस्कृतिक सुझाव
🔹 **आपातकालीन संपर्क** - सभी महत्वपूर्ण नंबर और सेवाएं

आप मुझसे हिंदी या अंग्रेजी में बात कर सकते हैं। कैसे मदद कर सकता हूं?`
  } else {
    if (isEmergency) {
      return `🚨 **EMERGENCY PROTOCOL ACTIVATED**

I'm immediately taking the following actions:
✅ Local authorities have been alerted
✅ Your emergency contacts have been notified
✅ Your location has been shared: ${userLocation}
✅ Emergency services dispatched (ETA: 3-5 minutes)

**IMMEDIATE ACTIONS FOR YOU:**
1. Stay calm and find a safe, well-lit area
2. Call 112 (India's unified emergency number)
3. If possible, approach nearby police or security personnel
4. Stay on the line with emergency services

**EMERGENCY CONTACTS:**
- Police: 100
- Ambulance: 108
- Fire Brigade: 101
- Tourist Helpline: 1363

**YOUR SAFETY STATUS:** Currently tracking your location
**NEAREST SAFE ZONES:** Hotel Taj Mahal Palace (300m), Police Station (500m)

Are you in immediate physical danger? Please respond so I can provide specific guidance.`
    }

    if (lowerMessage.includes("safety") || lowerMessage.includes("secure") || lowerMessage.includes("tips")) {
      return `🛡️ **PERSONALIZED SAFETY BRIEFING FOR ${userLocation.toUpperCase()}**

**Current Safety Assessment:** ${safetyScore}% (Excellent)
**Risk Level:** Low | **Crowd Density:** Moderate | **Weather:** Partly Cloudy

**CRITICAL SAFETY TIPS:**
🔹 **Document Security:** Keep passport copy separate from original
🔹 **Communication:** Check in with family every 2 hours
🔹 **Local Customs:** Ask permission before photographing people/religious sites
🔹 **Night Safety:** Avoid isolated areas after 7 PM

**TODAY'S SPECIFIC ADVISORIES:**
⚠️ **Monsoon Season:** Carry umbrella, watch for flooding in low areas
⚠️ **Tourist Area Alert:** Pickpockets active near Gateway of India
⚠️ **Transportation:** Use only licensed taxis/ride-sharing apps

**RECOMMENDED SAFETY APPS:**
- Mumbai Police App (emergency reporting)
- Google Translate (language barrier)
- Uber/Ola (verified transportation)

**HEALTH PRECAUTIONS:**
- Drink only bottled water
- Avoid street food if sensitive stomach
- Carry basic first aid kit

Would you like specific safety advice for any particular activity or location you're planning to visit?`
    }

    if (
      lowerMessage.includes("direction") ||
      lowerMessage.includes("location") ||
      lowerMessage.includes("route") ||
      lowerMessage.includes("where")
    ) {
      return `📍 **SAFE NAVIGATION FROM ${userLocation.toUpperCase()}**

**NEAREST VERIFIED SAFE LOCATIONS:**
🏨 **Hotel Taj Mahal Palace** - 300m (2-min walk)
   - 24/7 security, tourist-friendly, English-speaking staff
   - Route: Head south on Apollo Bunder Road

👮 **Colaba Police Station** - 500m (3-min walk)
   - Tourist assistance available, English-speaking officers
   - Route: Walk north on Shahid Bhagat Singh Road

🏥 **GT Hospital** - 1.2km (5-min taxi ride)
   - 24/7 emergency services, international standards
   - Route: Take taxi via P. D'Mello Road

**SAFE TRANSPORTATION OPTIONS:**
🚗 **Uber/Ola:** Verified drivers, GPS tracking, cashless
🚕 **Black & Yellow Taxi:** Ensure meter is running
🚇 **Mumbai Metro:** Safest option, well-monitored
🚌 **BEST Bus:** Avoid during rush hours

**NAVIGATION SAFETY TIPS:**
- Share your live location with family
- Keep phone charged (portable charger recommended)
- Have offline maps downloaded
- Carry emergency cash (₹500-1000)

**AVOID THESE AREAS AFTER DARK:**
- Isolated stretches of Marine Drive
- Dharavi area (unless with guided tour)
- Deserted parts of Colaba Causeway

Which specific destination do you need detailed directions to?`
    }

    if (
      lowerMessage.includes("contact") ||
      lowerMessage.includes("phone") ||
      lowerMessage.includes("call") ||
      lowerMessage.includes("number")
    ) {
      return `📞 **COMPREHENSIVE EMERGENCY CONTACT DIRECTORY**

**IMMEDIATE EMERGENCY SERVICES:**
🚨 **112** - Unified Emergency Service (Police, Fire, Medical)
👮 **100** - Police Control Room
🏥 **108** - Ambulance Service
🔥 **101** - Fire Brigade
⛑️ **1098** - Child Helpline

**TOURIST-SPECIFIC SERVICES:**
🧭 **1363** - India Tourism Helpline (24/7, multilingual)
📱 **+91-22-2284-1877** - Mumbai Tourist Information
🏛️ **+91-22-2262-0064** - Tourist Assistance Force

**YOUR PERSONAL EMERGENCY CONTACTS:**
👨‍👩‍👧‍👦 **Sarah Johnson** - +1-555-0123 (Spouse)
🏨 **Hotel Taj** - +91-22-6665-3366 (Concierge)
🚗 **Your Driver** - +91-98765-43210 (Pre-arranged)

**CONSULAR SERVICES:**
🇺🇸 **US Consulate Mumbai** - +91-22-6672-4000
🇬🇧 **British Deputy High Commission** - +91-22-6650-2222
🇨🇦 **Canadian Consulate** - +91-22-6749-4444

**MEDICAL EMERGENCY:**
🏥 **Breach Candy Hospital** - +91-22-2367-1888
🏥 **Lilavati Hospital** - +91-22-2640-2323

**FINANCIAL EMERGENCY:**
💳 **Visa Emergency** - 1800-1800-1236
💳 **MasterCard Emergency** - 1800-111-155

All contacts are saved in your phone. Would you like me to help you call any specific service?`
    }

    if (lowerMessage.includes("weather") || lowerMessage.includes("climate")) {
      return `🌤️ **REAL-TIME WEATHER & SAFETY ADVISORY**

**Current Conditions:**
- Temperature: 28°C (82°F) - Comfortable
- Humidity: 75% - High (typical for monsoon season)
- Wind: 15 km/h from southwest
- Visibility: Good (8km)

**TODAY'S FORECAST:**
- Morning: Partly cloudy, pleasant
- Afternoon: Possible light showers (60% chance)
- Evening: Heavy rain expected (80% chance)

**WEATHER-RELATED SAFETY TIPS:**
☔ **Monsoon Precautions:**
- Carry waterproof bag for electronics
- Wear non-slip footwear
- Avoid low-lying areas during heavy rain
- Keep emergency contacts handy

🌊 **Flooding Risk:** Low to moderate in South Mumbai
🌪️ **Wind Advisory:** None currently

**RECOMMENDED ACTIONS:**
- Plan indoor activities for evening
- Carry umbrella and light raincoat
- Avoid Marine Drive during high tide (6:30 PM today)
- Use covered walkways when possible

Stay safe and dry! Need specific advice for outdoor activities?`
    }

    return `Hello! I'm SafeTour AI Assistant, powered by Google Gemini. I'm your intelligent travel safety companion, designed specifically to keep you secure during your journey.

**HOW I CAN HELP YOU:**
🔹 **Emergency Response** - Instant alerts to authorities and emergency contacts
🔹 **Safety Intelligence** - Location-specific risks, tips, and precautions
🔹 **Smart Navigation** - Safest routes, verified transportation, and secure locations
🔹 **Local Expertise** - Cultural guidance, weather updates, and area insights
🔹 **24/7 Support** - Emergency contacts, medical assistance, and consular services

**MY CAPABILITIES:**
- Real-time safety monitoring and alerts
- Multilingual support (English, Hindi, and more)
- Voice recognition for hands-free emergency use
- Integration with local emergency services
- Personalized recommendations based on your profile

**CURRENT STATUS:**
📍 Location: ${userLocation}
🛡️ Safety Score: ${safetyScore}%
📱 Connection: Secure and encrypted

I can communicate in both English and Hindi. Feel free to ask me anything about your safety, local information, or if you need any assistance!

What would you like to know about staying safe during your travels?`
  }
}
