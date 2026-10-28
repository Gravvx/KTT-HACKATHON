const express = require('express');
const router = express.Router();
const localDb = require('../utils/localDb');

// Helper to query Google Gemini API via native fetch with full conversation history & memory
const callGeminiAPI = async (prompt, language, userApiKey = null, audioPayload = null, history = []) => {
  const apiKey = userApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  const targetLangName = language === 'hi' ? 'Hindi (हिंदी)' : language === 'mr' ? 'Marathi (मराठी)' : 'English';

  const systemInstructionText = `You are CivicConnect AI, an expert Civic Grievance Resolution & Government Welfare Assistant for Indian citizens.
Your job is to help citizens resolve real-world civic issues (road potholes, overflowing garbage dumps, contaminated water, power cuts, broken streetlights, illegal encroachment, pension delays, hospital cards, ration problems, or municipal delays).
Always answer in ${targetLangName} in a complete, comprehensive, and empathetic manner. NEVER cut off mid-sentence.
Always maintain context from earlier messages in this conversation.
When discussing civic issues, provide:
1. 🔍 Direct Problem Analysis & Context
2. 🏛️ Exact Responsible Authority (e.g. Municipal Corporation PWD, Jal Board, DISCOM, Gram Panchayat)
3. 📱 Official Escalation Portals & Apps (e.g. CPGRAMS pgportal.gov.in, Swachhata-MoHUA App, 311, State CM Helpline)
4. 📞 Direct Official Helplines (e.g. 1969 for Sanitation, 1912 for Electricity, 1916 for Water, 1950 for Pensions, 104 for Health)
5. 📝 Ready-to-use Complaint Template / Action Plan if requested.`;

  // Build multi-turn conversational contents
  const contents = [];

  // Add conversation history
  if (Array.isArray(history) && history.length > 0) {
    for (const turn of history.slice(-8)) {
      if (turn.sender === 'user' && turn.text) {
        contents.push({ role: 'user', parts: [{ text: turn.text }] });
      } else if (turn.sender === 'bot' && turn.text && !turn.isError) {
        contents.push({ role: 'model', parts: [{ text: turn.text }] });
      }
    }
  }

  // Add current turn
  const currentParts = [];
  if (audioPayload && audioPayload.data) {
    currentParts.push({
      inline_data: {
        mime_type: audioPayload.mimeType || 'audio/webm',
        data: audioPayload.data,
      },
    });
    currentParts.push({
      text: prompt
        ? `${prompt}\n(The user also provided the attached voice audio in ${targetLangName}. Accurately transcribe their spoken words and give a complete, end-to-end civic resolution answer without truncation.)`
        : `The user spoke this voice audio in ${targetLangName}. Listen carefully, transcribe what they said, and provide a complete, comprehensive civic resolution answer without truncation.`,
    });
  } else {
    currentParts.push({
      text: prompt || 'Please help me resolve this civic issue.',
    });
  }

  contents.push({ role: 'user', parts: currentParts });

  const requestBody = {
    system_instruction: {
      parts: [{ text: systemInstructionText }],
    },
    contents,
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 2500,
    },
  };

  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-flash-latest'];
  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          return text.trim();
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        console.warn(`Gemini (${model}) returned status ${response.status}:`, errData?.error?.message);
      }
    } catch (err) {
      console.warn(`Gemini API call failed on ${model}:`, err.message);
    }
  }

  return null;
};

// Intelligent Local Civic AI Resolver (Fallback engine)
const generateLocalCivicResponse = (message, language = 'en', history = []) => {
  const m = (message || '').toLowerCase();
  const isHi = language === 'hi';

  // Check recent context from history if follow-up
  const lastUserMessages = history.filter((h) => h.sender === 'user').map((h) => h.text.toLowerCase()).join(' ');
  const combined = `${lastUserMessages} ${m}`;

  // 1. Roads, Potholes & Footpaths
  if (
    combined.includes('pothole') || combined.includes('road') || combined.includes('सड़क') || combined.includes('खड्डे') ||
    combined.includes('रोड') || combined.includes('traffic') || combined.includes('footpath') || combined.includes('गाढ़ा')
  ) {
    if (m.includes('लेटर') || m.includes('शिकायत पत्र') || m.includes('letter') || m.includes('draft') || m.includes('फॉर्मेट')) {
      if (isHi) {
        return `📝 नगर निगम / PWD को सड़क मरम्मत हेतु आवेदन पत्र का प्रारूप:

सेवा में,
कार्यपालक अभियंता (Executive Engineer),
लोक निर्माण विभाग (PWD) / नगर निगम,
विषय: क्षेत्र में खतरनाक गड्ढों की तत्काल मरम्मत एवं सड़क सुधार हेतु।

महोदय,
सविनय निवेदन है कि हमारे क्षेत्र (स्थान: [सड़क / वार्ड का नाम लिखें]) की मुख्य सड़क पर गहरे गड्ढे बने हुए हैं। इसके कारण आए दिन दोपहिया वाहन चालक फिसल कर दुर्घटनाग्रस्त हो रहे हैं और शाम के समय गंभीर जाम की स्थिति बन जाती है।

अतः आपसे विनम्र अनुरोध है कि जनसुरक्षा को ध्यान में रखते हुए इस सड़क के गड्ढों की पैचिंग एवं डामरीकरण का कार्य शीघ्रातिशीघ्र पूर्ण कराने की कृपा करें।

सधन्यवाद,
प्रार्थी: [आपका नाम]
मोबाइल नंबर: [आपका मोबाइल]
दिनांक: [आज की तारीख]`;
      }
      return `📝 Formal Complaint Letter for Road Repair:

To,
The Executive Engineer,
Public Works Department (PWD) / Municipal Corporation,
Subject: Urgent request for repair and resurfacing of hazardous potholes.

Respected Sir/Madam,
I am writing to draw your urgent attention to the severely damaged road surface on [Road Name / Ward Number]. Deep craters have formed over a stretch of 50 meters, causing frequent skidding of two-wheelers and severe traffic congestion.

Under the Municipal Citizen Charter, road patching is mandated within 48 hours for arterial routes. I earnestly request the department to inspect the site and carry out bituminous repair work immediately.

Yours sincerely,
[Your Name]
Contact: [Your Mobile Number]
Date: [Current Date]`;
    }

    if (isHi) {
      return `🚧 सड़क और गड्ढों (Potholes) की शिकायत निवारण समाधान:

1. जिम्मेदार विभाग: 
• लोक निर्माण विभाग (PWD) और नगर निगम का रोड मेंटेनेंस सेल।

2. तुरंत शिकायत दर्ज करने के माध्यम:
• MCD 311 मोबाइल ऐप या आपके शहर का म्युनिसिपल 311 ऐप (फोटो और GPS लोकेशन के साथ)।
• राष्ट्रीय जन शिकायत पोर्टल (CPGRAMS): pgportal.gov.in पर लॉगिन करके PWD विभाग चुनें।

3. आधिकारिक हेल्पलाइन:
• सिटी टोल-फ्री हेल्पलाइन: 1800-11-0093 या 311
• सीएम हेल्पलाइन नंबर: 1076 (विभिन्न राज्यों में उपलब्ध)

4. त्वरित कार्रवाई के चरण:
• गड्ढे की 2 स्पष्ट तस्वीरें लें जिसमें सड़क का लैंडमार्क दिखे।
• शिकायत में वार्ड नंबर और नजदीकी खंभा/दुकान का पता लिखें।
• नगर निगम के सिटिजन चार्टर के अनुसार 48 से 72 घंटों में गड्ढों की पैचिंग का नियम है। यदि समाधान न हो तो ज़ोनल एक्जीक्यूटिव इंजीनियर (EE) को CPGRAMS पर एस्केलेट करें।`;
    }
    return `🚧 Road Potholes & Infrastructure Resolution Guide:

1. Responsible Authorities:
• City Municipal Corporation (Engineering Wing) & State Public Works Department (PWD).

2. How to File an Official Grievance:
• Municipal 311 Mobile App (Upload photo with auto-detected GPS coordinates).
• Central Public Grievance Redress and Monitoring System (CPGRAMS) at pgportal.gov.in.

3. Official Helplines:
• Citizen Civic Helpline: 311
• Chief Minister Public Grievance Cell: 1076 / 1800-11-0093

4. Step-by-Step Escalation Plan:
• Take 2 high-resolution photos showing the pothole depth and landmark.
• File complaint under "Roads & Infrastructure Repair".
• Note down the Grievance Docket Number. Municipal citizen charters mandate road patching within 48 to 72 hours.
• If unresolved, file an appeal to the Zonal Executive Engineer citing safety hazards under Section 133 CrPC.`;
  }

  // 2. Sanitation, Garbage & Waste Dumps
  if (
    combined.includes('garbage') || combined.includes('waste') || combined.includes('dustbin') || combined.includes('कचरा') ||
    combined.includes('कूड़ा') || combined.includes('बदबू') || combined.includes('सफाई') || combined.includes('dump') || combined.includes('trash')
  ) {
    if (isHi) {
      return `🗑️ कचरा और गंदगी की समस्या का त्वरित समाधान:

1. जिम्मेदार विभाग:
• नगर निगम का ठोस अपशिष्ट प्रबंधन विभाग (Solid Waste Management Cell)।

2. शिकायत निवारण पोर्टल:
• भारत सरकार का "स्वच्छता-MoHUA" ऐप (Google Play / App Store)। इस पर फोटो अपलोड करते ही 12 घंटे में कचरा उठाने की समय-सीमा तय है।
• स्थानीय नगर निगम का सेनेटरी कंट्रोल रूम।

3. आधिकारिक हेल्पलाइन:
• स्वच्छ भारत राष्ट्रीय टोल-फ्री हेल्पलाइन: 1969
• नगर निगम स्वच्छता कॉल सेंटर: 14420

4. समाधान के चरण:
• कचरे के ढेर की तस्वीर Swachhata App पर अपलोड करें।
• यह सीधे आपके वार्ड के सेनेटरी इंस्पेक्टर (Sanitary Inspector) को ऑटो-असाइन होती है।
• कचरा उठने के बाद आपको 'Before' और 'After' फोटो के साथ वेरिफिकेशन SMS मिलता है।`;
    }
    return `🗑️ Sanitation & Overflowing Garbage Resolution Guide:

1. Responsible Department:
• Solid Waste Management (SWM) Wing, City Municipal Corporation.

2. Official Portals & Apps:
• "Swachhata-MoHUA" App (Official Government of India sanitation app). Reports filed here are monitored with a strict 12-hour resolution SLA.
• Municipal Corporation Waste Management Portal.

3. Official Helplines:
• Swachh Bharat National Helpline: 1969
• Sanitation Call Center: 14420 / 311

4. Action Plan:
• Capture photo of the garbage dump and post on Swachhata App.
• The system automatically routes the ticket to the designated Ward Sanitary Inspector.
• If not cleared within 24 hours, escalate ticket to Chief Medical Officer of Health (CMOH).`;
  }

  // 3. Water Supply, Pipeline Leakage & Contaminated Water
  if (
    combined.includes('water') || combined.includes('leak') || combined.includes('पानी') || combined.includes('नल') ||
    combined.includes('जल') || combined.includes('sewage') || combined.includes('नाली') || combined.includes('drain') || combined.includes('ganda pani')
  ) {
    if (isHi) {
      return `🚰 दूषित पानी, लीकेज और जल आपूर्ति समस्या का समाधान:

1. जिम्मेदार विभाग:
• राज्य जल बोर्ड / जन स्वास्थ्य यांत्रिकी विभाग (PHED) / नगर निगम जल आपूर्ति विंग।

2. शिकायत पोर्टल:
• राज्य जल बोर्ड ऑनलाइन पोर्टल और CPGRAMS (pgportal.gov.in)।

3. आधिकारिक हेल्पलाइन:
• केंद्रीय जल आपूर्ति और सीवरेज हेल्पलाइन: 1916 (टोल-फ्री)
• आपातकालीन वाटर टैंकर सहायता: 1916

4. कार्रवाई के चरण:
• गंदे पानी का वीडियो या पाइपलाइन लीकेज की फोटो लें।
• 1916 पर कॉल करके 'जल आपूर्ति में संदूषण (Water Contamination)' श्रेणी में आपातकालीन शिकायत दर्ज करें।
• पीने के पानी का नमूना जांच के लिए लैब टीम 24 घंटे में पहुंचती है।`;
    }
    return `🚰 Water Contamination, Pipeline Leak & Drainage Resolution:

1. Responsible Authorities:
• State Jal Board (Water Supply & Sewerage Disposal Board) / Public Health Engineering Dept (PHED).

2. Complaint Portals:
• State Water Board Portal & CPGRAMS (pgportal.gov.in).

3. Official Helplines:
• Central Water & Sewerage Emergency Helpline: 1916 (24x7 Toll-Free)
• Municipal Drainage Cell: 311

4. Escalation Procedure:
• File complaint under "Potable Water Quality & Pipeline Burst".
• 1916 issues an immediate priority docket.
• If piped supply is disrupted, request an emergency government water tanker at the subsidized rate directly via the 1916 helpline.`;
  }

  // Default Comprehensive Civic Response
  if (isHi) {
    return `🇮🇳 सिविककनेक्ट नागरिक सहायता केंद्र:

मैं सड़क गड्ढे, गंदगी/कचरा, जलभराव, बिजली कटौती, दूषित पेयजल, स्ट्रीट लाइट, पेंशन और सरकारी योजनाओं से संबंधित किसी भी नागरिक समस्या के समाधान में आपकी सहायता कर सकता हूँ।

कृपया अपनी समस्या का विवरण बताएं (जैसे: 'सड़क पर गड्ढा है', 'कचरा नहीं उठ रहा', या 'पेंशन का पैसा नहीं आया')। मैं आपको संबंधित सरकारी विभाग, आधिकारिक पोर्टल, शिकायत का तरीका और हेल्पलाइन नंबर तुरंत प्रदान करूँगा।`;
  }

  return `🇮🇳 CivicConnect Citizen Grievance Assistant:

I can guide you on resolving civic issues (road potholes, uncollected garbage, water pipeline leaks, power outages, non-functional streetlights, sewage blockage) and applying for government welfare schemes.

Please describe your civic issue (e.g., "pothole on my road", "sewage overflowing", "how to get pension"). I will identify the exact municipal department, provide the official 24x7 helpline, and give you step-by-step escalation procedures.`;
};

// GET /api/chat/history
router.get('/history', (req, res) => {
  try {
    const history = localDb.getChatHistory(50);
    res.json({ success: true, history });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// POST /api/chat/message
router.post('/message', async (req, res) => {
  try {
    const {
      message,
      language = 'en',
      apiKey = null,
      audioData = null,
      mimeType = null,
      history = [],
    } = req.body;

    if (!message && !audioData) {
      return res.status(400).json({ error: 'Message or audio data is required' });
    }

    const trimmed = (message || '').trim();
    let replyText = null;
    let provider = 'local_ai';

    // In test mode, immediately utilize the deterministic intelligent civic engine
    if (process.env.NODE_ENV === 'test') {
      replyText = generateLocalCivicResponse(trimmed, language, history);
      provider = 'local_civic_engine';
    } else {
      // 1. Try Gemini API first (with full multi-turn conversation memory)
      try {
        const audioPayload = audioData ? { data: audioData, mimeType } : null;
        const geminiResult = await callGeminiAPI(trimmed, language, apiKey, audioPayload, history);
        if (geminiResult) {
          replyText = geminiResult;
          provider = 'gemini_2.5_flash';
        }
      } catch (err) {
        console.warn('Gemini invocation bypassed:', err.message);
      }

      // 2. Intelligent local civic resolution engine fallback
      if (!replyText) {
        replyText = generateLocalCivicResponse(trimmed, language, history);
        provider = 'local_civic_engine';
      }
    }

    // Save record to local storage
    localDb.saveChatMessage({
      userMessage: trimmed || '[Voice Audio Query]',
      botResponse: replyText,
      language,
      provider,
    });

    res.json({
      userMessage: trimmed || '[Voice Audio Query]',
      botResponse: replyText,
      reply: replyText,
      response: replyText,
      language,
      provider,
      engine: provider,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat processing error:', error);
    res.status(500).json({ error: 'Chat processing failed' });
  }
});

module.exports = router;
