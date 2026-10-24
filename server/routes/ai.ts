import { Router, Request, Response } from "express";
import { ai, hasGeminiApiKey } from "../gemini.ts";
import { evaluateClinicalTriage } from "../triage.ts";
import { generateTailoredRecommendation } from "../clinicalRecommendations.ts";

export const aiRouter = Router();

// Multilingual translations and culturally grounded prompts
const languagePrompts: Record<string, string> = {
  English: "Respond in warm, clear, compassionate English with simple medical explanations.",
  "हिन्दी": "कृपया अत्यंत संवेदनशील, सरल और आत्मीय हिन्दी में उत्तर दें। कठिन डॉक्टरी शब्दों को आम बोलचाल में समझाएं।",
  "தமிழ்": "தயவுசெய்து எளிய, கனிவான மற்றும் எளிதில் புரிந்துகொள்ளக்கூடிய தமிழில் பதிலளிக்கவும்.",
  "മലയാളം": "ദയവായി ലളിതവും ഊഷ്മളവുമായ മലയാളത്തിൽ മറുപടി നൽകുക.",
  "ಕನ್ನಡ": "ದಯವಿಟ್ಟು ಸರಳ, ಆತ್ಮೀಯ ಮತ್ತು ಸುಲಭವಾಗಿ ಅರ್ಥವಾಗುವ ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ.",
  "తెలుగు": "దయచేసి సరళమైన, ఆప్యాయతతో కూడిన తెలుగులో సమాధానం ఇవ్వండి.",
};

// Conversational Health Assistant: Ask HerSakhi
aiRouter.post("/ask-sakhi", async (req: Request, res: Response) => {
  const { prompt, language = "English", context } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  // 1. First run deterministic clinical triage check on the input text
  const triage = evaluateClinicalTriage({
    symptoms: [prompt],
    severity: 3,
    duration: "Acute query",
    notes: prompt,
  });

  const languageDirective = languagePrompts[language] || languagePrompts.English;

  const systemInstruction = `
You are "HerSakhi" (हरसखी), a trusted, culturally empathetic, and judgment-free clinical healthcare companion for women, trans women, and non-binary individuals across India (rural, semi-urban, urban).

CORE CLINICAL PRINCIPLES:
1. Warmth & Dignity: Use deeply respectful, sisterly language (e.g. "Namaste Sakhi", "I hear you with gentle care").
2. Educational & Triage Only: NEVER provide a definitive diagnosis or prescribe drugs. Explain possibilities and anatomy in clear, comforting language.
3. Plain-Language Explanations: De-mystify medical terminology (e.g. explain luteal phase as "the days between ovulation and your next period when the body prepares its nest").
4. Follow-up Questions: Ask 1-2 thoughtful clarifying questions to help them understand their symptoms (e.g., "Are you experiencing any fever or one-sided cramping?").
5. Explain Uncertainty: Acknowledge that symptoms can have multiple benign or clinical causes, and advise consulting a certified doctor or visiting a nearby PHC.
6. Language: ${languageDirective}
7. Disclaimer: Always conclude with a gentle reminder that this is educational triage support.
`;

  // If Gemini API is available, invoke gemini-3.8-flash
  if (hasGeminiApiKey && ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `User query: "${prompt}". User context: ${JSON.stringify(context || {})}`,
              },
            ],
          },
        ],
        config: {
          systemInstruction,
          temperature: 0.6,
        },
      });

      const reply = response.text || "I am listening to you, Sakhi. Could you share a little more about what you are feeling?";

      return res.json({
        reply,
        language,
        triage,
        source: "Gemini 3.8 Flash Clinical Reasoning",
      });
    } catch (err: any) {
      console.error("Gemini API error, falling back to clinical rule response:", err?.message);
    }
  }

  // Dynamic, problem-specific clinical recommendation engine
  const fallbackReply = generateTailoredRecommendation(prompt, language, context);

  return res.json({
    reply: fallbackReply,
    language,
    triage,
    source: "HerSakhi Clinical Guideline Engine",
  });
});

// Text-to-Speech (TTS) for Multilingual Accessibility using gemini-3.8-flash-lite-tts
aiRouter.post("/tts", async (req: Request, res: Response) => {
  const { text, voice = "Kore" } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Text is required for TTS" });
  }

  if (hasGeminiApiKey && ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash-lite-tts",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: text.slice(0, 300), // Clean concise TTS snippet
                speechMetadata: {
                  style: "Warm, compassionate healthcare companion with gentle tone",
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice as any },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({
          audioUrl: `data:audio/wav;base64,${base64Audio}`,
          format: "audio/wav",
          source: "gemini-3.8-flash-lite-tts",
        });
      }
    } catch (err: any) {
      console.error("Gemini TTS error, falling back to Web Speech synthesis:", err?.message);
    }
  }

  // If server-side TTS unavailable, notify client to use client-side SpeechSynthesis
  return res.json({
    useClientWebSpeech: true,
    text,
    message: "Using browser Web Speech API for voice output",
  });
});

// Specialized Reproductive Health Problem Solver & Hospital Recommendation
aiRouter.post("/reproductive-guidance", async (req: Request, res: Response) => {
  const {
    problemDescription = "",
    language = "English",
    severity = 3,
    duration = "Recent",
    locationName = "Mayur Vihar Ph-1, Delhi",
  } = req.body;

  if (!problemDescription) {
    return res.status(400).json({ error: "Please enter your symptoms or health concern." });
  }

  // 1. Evaluate deterministic clinical triage first
  const triage = evaluateClinicalTriage({
    symptoms: [problemDescription],
    severity: Number(severity) || 3,
    duration,
    notes: problemDescription,
  });

  // 2. Fetch nearby hospitals & PHCs
  const allFacilities = (await import("../db.ts")).db.getFacilities();
  const recommendedFacilities = allFacilities.slice(0, 3).map((f) => ({
    id: f.id,
    name: f.name,
    type: f.type,
    address: f.address,
    distanceKm: f.distanceKm,
    feeDisplay: f.feeDisplay,
    services: f.services.slice(0, 3),
    femaleDoctorAvailable: f.femaleDoctorAvailable,
    contactNumber: f.contactNumber,
  }));

  const languageDirective = languagePrompts[language] || languagePrompts.English;

  let solutionText = "";

  if (hasGeminiApiKey && ai) {
    try {
      const prompt = `
A woman in India reported the following reproductive health concern:
"${problemDescription}"
Reported Severity: ${severity}/5. Duration: ${duration}.
Current Location Area: ${locationName}.

Nearby Available Health Facilities:
${JSON.stringify(recommendedFacilities, null, 2)}

Please provide a compassionate, culturally respectful response in ${language}:
1. Understanding the Symptoms in Simple Words: Demystify any medical terminology (like dysmenorrhea, anovulation, PCOS, luteal phase) in gentle everyday language to address lack of understanding.
2. What Might Be Happening: Explain possible causes (hormonal fluctuations, stress, pelvic tension, ovulatory shift) without offering an absolute diagnosis or prescription.
3. Safe Home Comfort Steps: Non-drug comfort measures (warm compress, hydration, gentle pelvic stretches).
4. Recommended Nearby Centres: Highlight the closest verified PHC or women's clinic from the list above based on their location.
5. Emphasize that HerSakhi is an educational companion and invite them to visit the recommended doctor or PHC.

${languageDirective}
`;
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          temperature: 0.5,
        },
      });

      solutionText = response.text || "";
    } catch (err: any) {
      console.error("Gemini reproductive guidance failed, using clinical fallback:", err?.message);
    }
  }

  if (!solutionText) {
    // Grounded fallback
    if (language === "हिन्दी") {
      solutionText = `सखी, आपकी समस्या को समझना और शरीर के संकेतों को जानना पहला कदम है।\n\n1. सरल भाषा में समझें: पेट के निचले हिस्से में दर्द या ऐंठन अक्सर गर्भाशय की मांसपेशियों में खिंचाव और प्रोस्टाग्लैंडीन (हार्मोन) के स्तर में उतार-चढ़ाव के कारण होती है।\n2. संभावित कारण: मासिक चक्र के विभिन्न चरणों (जैसे ओव्यूलेशन या ल्यूटियल फेज) में ऐसे लक्षण स्वाभाविक हो सकते हैं। कभी-कभी पीसीओडी (हार्मोन असंतुलन) से भी माहवारी अनियमित हो जाती है।\n3. घरेलू राहत उपाय: पेट के निचले हिस्से पर गर्म पानी की थैली से सिकाई करें, गुनगुना पानी पिएं और बालआसन (आरामदायक योग मुद्रा) अपनाएं।\n4. नज़दीकी स्वास्थ्य केंद्र: आपके क्षेत्र (${locationName}) में कल्याणी सामुदायिक स्वास्थ्य केंद्र (PHC, 1.8 किमी दूर, मुफ़्त परामर्श) और डॉ. सुनीता राव वीमेन क्लीनिक उपलब्ध हैं।`;
    } else {
      solutionText = `Namaste Sakhi 🌸 Here is a gentle breakdown to help you understand what your body is experiencing:\n\n1. Demystifying Your Symptoms: Cramping and pelvic tenderness are often caused by natural prostaglandins contracting the uterine wall during hormonal shifts. If cycles vary beyond 35 days, subtle hormonal variations (like estrogen-progesterone rhythm) or temporary stress may be factors.\n\n2. What Might Be Happening: Rather than an alarming illness, these symptoms commonly indicate cyclic hormonal transitions, ovulation changes, or manageable conditions like PCOS that benefit from early lifestyle and medical guidance.\n\n3. Gentle Self-Care: Apply warm compresses to the lower abdomen for 15-20 minutes, stay well hydrated, and avoid heavy strain.\n\n4. Recommended Nearby Care: Based on your area (${locationName}), Kalyani Community Health Centre (PHC, 1.8 km, Free OPD) and Dr. Sunita Rao Women's Care Clinic (3.2 km, ₹300) are verified and accessible.`;
    }
  }

  return res.json({
    problemDescription,
    solution: solutionText,
    language,
    triage,
    recommendedFacilities,
  });
});
