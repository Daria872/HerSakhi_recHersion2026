/**
 * Intelligent Clinical Reasoning & Tailored Recommendation Engine
 * HerSakhi / SheShines Women's & Gender-Inclusive Healthcare
 *
 * Provides problem-specific, non-repetitive, culturally grounded medical guidance
 * aligned with ICMR, FOGSI, and WHO guidelines across multiple Indian languages.
 */

export interface ClinicalRecommendation {
  condition: string;
  summary: string;
  immediateRelief: string[];
  lifestyleAndNutrition: string[];
  diagnosticGuidance: string[];
  warningSigns: string[];
  followUpQuestions: string[];
  warmClosing: string;
}

export function generateTailoredRecommendation(
  query: string,
  language: string = "English",
  context?: { preferredName?: string; ageGroup?: string; genderIdentity?: string }
): string {
  const text = query.toLowerCase();
  const userName = context?.preferredName || "Sakhi";

  // Pick random seed variation to ensure answers never look identical
  const seed = Math.floor(Math.random() * 4);

  // 1. Identify primary health problem / topic
  let topic = "general";
  if (/cramp|period pain|dysmenorrhea|stomach ache.*period|menstrual pain|mahawari dard|dard.*period/i.test(text)) {
    topic = "cramps";
  } else if (/pcos|pcod|irregular period|ovary|facial hair|hirsutism|missed cycle|hormon/i.test(text)) {
    topic = "pcos";
  } else if (/heavy bleed|pad.*hour|soak.*pad|clot|menorrhagia|bahut jyada khoon|excessive bleed/i.test(text)) {
    topic = "heavy_bleeding";
  } else if (/pregnant|pregnancy|morning sick|nausea.*vomit|garbh|first trimester|baby/i.test(text)) {
    topic = "pregnancy";
  } else if (/uti|burn.*urin|pee.*pain|urine.*burn|peshab.*jalan|frequent pee|bladder/i.test(text)) {
    topic = "uti";
  } else if (/discharge|itch|yeast|candid|infection.*vagin|white discharge|safed pani|smell.*vagin/i.test(text)) {
    topic = "discharge_infection";
  } else if (/mental|anxiety|depress|stress|mood.*swing|pmdd|cry|panic|tension|udas/i.test(text)) {
    topic = "mental_health";
  } else if (/contracept|emergency pill|unwanted 72|ipill|i-pill|birth control|condom|garbh nirodhak/i.test(text)) {
    topic = "contraception";
  } else if (/anemia|hemoglobin|fatigue|tired|chakkar|dizzy|kamzori|weakness|khoon ki kami/i.test(text)) {
    topic = "anemia";
  } else if (/endometrio|deep pelvic pain|pain.*sex|pain.*intercourse|adenomyo/i.test(text)) {
    topic = "endometriosis";
  }

  // Multilingual response generators
  if (language === "हिन्दी") {
    return generateHindiRecommendation(topic, text, userName, seed);
  } else if (language === "தமிழ்") {
    return generateTamilRecommendation(topic, text, userName, seed);
  } else if (language === "മലയാളം") {
    return generateMalayalamRecommendation(topic, text, userName, seed);
  } else if (language === "ಕನ್ನಡ") {
    return generateKannadaRecommendation(topic, text, userName, seed);
  } else if (language === "తెలుగు") {
    return generateTeluguRecommendation(topic, text, userName, seed);
  } else {
    return generateEnglishRecommendation(topic, text, userName, seed);
  }
}

function generateEnglishRecommendation(topic: string, text: string, name: string, seed: number): string {
  const openers = [
    `Namaste ${name} 🌸 I hear you with gentle care and full attention.`,
    `Hello dear ${name} 🌷 You are in a safe, judgment-free space with HerSakhi.`,
    `Namaste ${name} 🌸 Thank you for sharing this openly with me. Let's look at this step-by-step.`,
    `Dear ${name} 🌸 I understand how uncomfortable this must feel right now, but please know you are not alone.`,
  ];
  const opener = openers[seed % openers.length];

  switch (topic) {
    case "cramps": {
      const tips = [
        "Applying a warm hot-water bottle or heating pad (around 40°C) to your lower abdomen dilates pelvic blood vessels and provides relief comparable to mild pain medication.",
        "Sipping warm ginger (adrak) or ajwain (carom seed) infused water helps suppress the inflammatory prostaglandins responsible for uterine spasms.",
        "Gentle pelvic relaxation poses like Balasana (Child's Pose) or Supta Baddha Konasana release tension in the pelvic floor and lower back.",
      ];
      return `${opener}

Your query about **menstrual cramps (dysmenorrhea)** is very important. Menstrual cramps occur when prostaglandins trigger uterine muscles to contract and shed the lining.

🌿 **Immediate Comfort Measures:**
• ${tips[seed % tips.length]}
• ${tips[(seed + 1) % tips.length]}
• Avoid chilled iced drinks and high-sodium foods, which exacerbate fluid retention and pelvic bloating.

🩺 **When to Consult a Doctor:**
• If the pain radiates severely to your thighs or back and prevents you from standing up.
• If cramps do not subside after 48–72 hours or appear outside your period window (which may indicate endometriosis or adenomyosis).

❓ **To help me assist you better:**
1. Did the pain begin a couple of days before bleeding, or immediately when bleeding started?
2. Are you experiencing any nausea, fever, or pain during urination?

*Note: You can book a confidential teleconsult with Dr. Fatima or our verified gynaecologists directly in the Consultations tab.*`;
    }

    case "pcos": {
      return `${opener}

Regarding your concerns about **PCOS / PCOD and hormonal balance**, let's de-mystify what happens inside the body:

PCOS is a metabolic and endocrine condition where the ovaries produce slightly higher androgens, which can delay ovulation and cause irregular cycles, acne, or weight changes.

🥗 **Nutritional & Daily Lifestyle Focus:**
• Prioritize low-glycemic foods: Incorporate complex grains like ragi, jowar, oats, and green leafy vegetables to prevent rapid insulin spikes.
• Spearmint tea: Drinking 1–2 cups of pure spearmint tea daily has been shown in clinical trials to help reduce free testosterone and facial hair growth.
• 20–30 minutes of brisk walking or gentle resistance exercises enhances cellular glucose uptake and regularizes cycles.
• Soak 1 teaspoon of methi (fenugreek) seeds overnight in water and drink in the morning to improve insulin sensitivity.

📋 **Recommended Tests to Discuss with Your Gynecologist:**
• Pelvic Ultrasound (to examine ovarian follicular pattern and endometrial thickness).
• Day 2/3 Hormone Panel (LH, FSH, Serum Prolactin, Free Testosterone, Thyroid TSH).

❓ **Helpful questions:**
1. Approximately how many days pass between your menstrual cycles?
2. Have you noticed sudden scalp hair thinning, acne around the jawline, or weight fluctuations?

*Take care, ${name}. Remember that PCOS can be managed effectively with compassionate, consistent lifestyle modifications.*`;
    }

    case "heavy_bleeding": {
      return `${opener}

Dealing with **heavy menstrual bleeding (menorrhagia)** can be physically draining and alarming. Let's take prompt, caring steps:

⚠️ **Clinical Warning Rule (Pad Saturation Test):**
If you are soaking through **two or more sanitary pads completely every hour for two consecutive hours**, or passing blood clots larger than a 10-rupee coin (approx. 2.5 cm), you should seek prompt medical evaluation at your nearest Primary Health Centre (PHC) or hospital.

🍵 **Immediate Supportive Care:**
• Replenish fluids: Sip coconut water, lemon ORS, or warm broth to maintain your intravascular blood pressure and avoid sudden syncope/dizziness.
• Iron & Vitamin C pairing: Eat steamed spinach, moringa leaves, or jaggery paired with a squeeze of fresh lemon juice (Vitamin C dramatically boosts non-heme iron absorption).
• Avoid strenuous lifting or hot baths, and keep your feet slightly elevated when resting.

📋 **What to Ask Your Doctor:**
• Request a Complete Blood Count (CBC) and Serum Ferritin to check for iron-deficiency anemia.
• Inquire about medical management options such as Tranexamic Acid or hormonal balancing therapies.

❓ **Please share:**
1. Are you feeling dizzy, fatigued, or short of breath when standing up?
2. Has this heavy flow happened in earlier cycles as well?`;
    }

    case "pregnancy": {
      return `${opener}

Nurturing your body during **pregnancy or early maternity** requires gentle, attentive care:

🌸 **Managing Morning Sickness & First Trimester Nausea:**
• Keep dry crackers, roasted chana, or whole-grain biscuits by your bedside. Eat a small bite before getting out of bed in the morning to stabilize gastric acid.
• Sip cool or lukewarm ginger-infused water, or inhale freshly sliced lemon peel to calm the vestibular and digestive nausea centers.
• Eat 5–6 small meals throughout the day instead of 2–3 large, heavy meals.

💊 **Essential Prenatal Nutrients:**
• Ensure you are taking daily Folic Acid (400–500 mcg) as prescribed by your ANM/ASHA or doctor to support healthy neural tube development.
• Stay well-hydrated with safe, boiled or filtered water.

🚨 **Immediate Warning Signs (Visit Doctor/PHC Promptly):**
• Inability to keep any liquids down for over 12–24 hours (Hyperemesis Gravidarum risk).
• Any vaginal bleeding, pink/brown spotting, or sharp, one-sided lower abdominal pain.

❓ **Clarifying question:**
How many weeks pregnant are you, or have you confirmed with a home urine pregnancy test?`;
    }

    case "uti": {
      return `${opener}

A **burning sensation during urination or suspected Urinary Tract Infection (UTI)** causes sharp distress, but timely action makes a big difference:

💧 **Immediate Relief & Flushing Steps:**
• Hydrate actively: Drink 2.5 to 3 liters of clean water throughout the day to flush bacteria (typically E. coli) from the urethral canal.
• Add a pinch of baking soda to a glass of water, or drink barley water (jo ka pani) to help alkalize acidic urine and relieve the raw burning sensation.
• Never hold your urine—empty your bladder fully each time you feel the urge.
• Always wipe from front to back after using the toilet to avoid introducing bowel flora to the urethra.

🚨 **Red Flags Indicating Upper Urinary Tract / Kidney Involvement:**
• If you develop lower back / flank pain (near the kidneys), chills, or a fever, please visit a clinic immediately for a Urine Routine & Culture test and targeted antibiotics.

❓ **A couple of quick questions:**
1. Do you notice any blood, cloudiness, or strong odor in the urine?
2. Are you experiencing any pelvic pressure or lower abdomen heaviness?`;
    }

    case "discharge_infection": {
      return `${opener}

Questions about **vaginal discharge and intimate health** are completely natural and very common. Let's look at what is normal versus what needs attention:

🔍 **Understanding Discharge Types:**
• Clear or egg-white, stretchy discharge is completely normal—it indicates ovulation or hormonal changes.
• Thick, white, curdy/cottage-cheese-like discharge with intense itching usually indicates a Candidiasis (yeast) overgrowth.
• Thin, greyish-white discharge with a distinct fishy odor often indicates Bacterial Vaginosis (BV).
• Frothy, yellowish-green discharge with redness suggests Trichomoniasis.

🛡️ **Intimate Hygiene & Self-Care Best Practices:**
• Wear 100% loose cotton underwear; avoid tight synthetic leggings or nylon materials.
• Never use internal vaginal douches, scented washes, or harsh chemical soaps. The vagina is self-cleaning; simply rinse the outer vulva with plain warm water.
• Include fresh homemade curd (dahi) in your diet to replenish beneficial Lactobacillus probiotics.

❓ **To help guide you:**
Is there any persistent itching, soreness, or foul odor accompanying the discharge?`;
    }

    case "mental_health": {
      return `${opener}

I hear you deeply. **Emotional overwhelm, mood swings, PMDD, and anxiety** are very real physiological and emotional states, not weaknesses:

🧠 **The Hormonal-Neurological Link:**
In the late luteal phase (the days before your period) or postpartum, drops in estrogen and progesterone alter serotonin and GABA activity in the brain, which can amplify sadness, irritability, or anxiety.

🧘‍♀️ **Grounding Relief Right Now:**
• Let's do a 4-7-8 Pranayama breath: Inhale gently through your nose for 4 counts, hold your breath gently for 7 counts, and exhale slowly through your mouth for 8 counts.
• Step away from screens for 15 minutes, wrap yourself in warmth, and sip chamomile or warm milk with a pinch of nutmeg.
• Speak to someone you trust, or journal your feelings without any self-judgment in the Mind & Wellness tab.

📞 **24/7 Free & Confidential Mental Health Helpline:**
You can call **Tele-MANAS (14416)** anytime, day or night, for compassionate psychological counseling in your regional language.

❓ **How long have you been feeling this heaviness, and does it seem to peak right before your menstrual cycle?**`;
    }

    case "contraception": {
      return `${opener}

Regarding your inquiry on **emergency contraception and family planning**, here is clear, medical, and judgment-free guidance:

💊 **Emergency Contraceptive Pills (e.g. Levonorgestrel 1.5mg):**
• Timing: Most effective when taken within **24 hours** of unprotected intercourse (up to 95% efficacy), and can be taken up to **72 hours**.
• How it works: It delays or prevents the release of an egg (ovulation). It does not terminate an already established pregnancy and is not an abortion pill.
• Expected Side Effects: Mild nausea, breast tenderness, fatigue, or your upcoming period arriving a few days earlier or later than usual.
• Important: Emergency pills should not be used as regular birth control as they provide a high surge of hormones.

🛡️ **Long-term Protection Options:**
• Discuss barrier methods (condoms—which also protect against STIs), oral contraceptive pills, or non-hormonal Copper-T IUDs with your doctor.

❓ **Has the pill been taken within the 72-hour window, and are you feeling any nausea?**`;
    }

    case "anemia": {
      return `${opener}

Feeling **constant fatigue, dizziness, or suspecting anemia** is very widespread among Indian women due to menstrual loss and nutritional gaps.

🩸 **Nutritional Action Plan to Boost Hemoglobin:**
• Iron Superfoods: Include moringa (drumstick leaves), methi, beetroot, dates, black raisins, and jaggery (gur).
• Crucial Vitamin C Pairing: Plant-based iron needs Vitamin C to be absorbed. Always squeeze lemon juice over your dal/greens or eat amla (Indian gooseberry) alongside meals.
• Tea/Chai Habit Adjustment: Avoid drinking tea, coffee, or milk within 1 hour before or after your meals. Tannins and calcium block iron absorption by up to 60%!

🩺 **Doctor & Clinic Steps:**
• Visit your local PHC or Anganwadi for a free finger-prick Hemoglobin test under the **Anemia Mukt Bharat** initiative.
• If your Hb is below 11 g/dL, your doctor may prescribe Iron-Folic Acid (IFA) tablets.

❓ **Have you noticed brittle nails, pale inner eyelids, or dizziness when standing up quickly?**`;
    }

    case "endometriosis": {
      return `${opener}

Your symptoms suggest deep **pelvic discomfort or potential endometriosis / adenomyosis**, which deserves thorough clinical validation:

Endometriosis occurs when tissue similar to the lining of the uterus grows outside the uterus (on ovaries, fallopian tubes, or pelvic ligaments), causing cyclic inflammation, pain during intercourse, and bowel/bladder discomfort.

🌿 **Comfort & Management:**
• Anti-inflammatory nutrition: Incorporate golden turmeric milk (curcumin), flaxseeds, walnuts, and ginger into your routine.
• Pelvic floor physical therapy: Specialized pelvic stretches help down-train hypertonic, tense pelvic floor muscles.
• Track your symptoms: Use the Symptom Care tab to record pain severity on each day of your cycle—this log will be invaluable for your doctor.

📋 **Clinical Diagnostic Step:**
• Schedule an appointment with a specialist gynecologist for a Transvaginal Ultrasound (TVS) or Pelvic MRI to evaluate endometriotic lesions.

❓ **Does the pain occur strictly during your period, or do you also feel pelvic ache throughout the month?**`;
    }

    default: {
      return `${opener}

Thank you for consulting HerSakhi about: "${text}".

Here is a structured overview to support you:

🌸 **Clinical Insight:**
Symptoms in this area are frequently linked to hormonal shifts, lifestyle stress, hydration levels, or pelvic muscle tension. Every body has unique rhythms, and taking a proactive look at your symptoms is a sign of strength.

🌱 **General Wellness & Comfort Steps:**
• Maintain steady hydration (at least 2.5 liters of clean water daily).
• Practice gentle diaphragmatic breathing or resting in a comfortable restorative posture.
• Keep a daily note of any changes in frequency, intensity, or triggers in our Symptom Vault.

🩺 **Next Steps with Healthcare Providers:**
If this discomfort persists beyond 48 hours, recurs across multiple weeks, or interferes with your daily activities, please visit your local Primary Health Centre (PHC) or book an online video consultation with Dr. Fatima Sheikh in the Consultations tab.

❓ **Could you share a little more detail about when you first noticed this, or if any other symptoms accompany it?**`;
    }
  }
}

function generateHindiRecommendation(topic: string, text: string, name: string, seed: number): string {
  const openers = [
    `नमस्ते ${name} जी 🌸 मैं आपकी बात अत्यंत ध्यान और आत्मीयता से सुन रही हूँ।`,
    `नमस्ते सखी ${name} 🌷 हरसखी पर आपका स्वागत है। यहाँ आप बिना किसी संकोच के अपनी बात साझा कर सकती हैं।`,
    `प्रिय ${name} 🌸 आपकी परेशानी को मैं समझ सकती हूँ। आइए इसे सरल और वैज्ञानिक तरीके से समझते हैं।`,
  ];
  const opener = openers[seed % openers.length];

  switch (topic) {
    case "cramps":
      return `${opener}

माहवारी के दर्द (Menstrual Cramps) को लेकर आपकी चिंता स्वाभाविक है। गर्भाशय की मांसपेशियों में प्रोस्टाग्लैंडीन (Prostaglandins) हार्मोन के कारण संकुचन होता है, जिससे यह दर्द उठता है।

🌿 **तुरंत राहत के घरेलू उपाय:**
• पेट के निचले हिस्से पर गर्म पानी की थैली (Hot Water Bag) से सिकाई करें। इससे रक्त संचार बेहतर होता है और मांसपेशियों की ऐंठन शांत होती है।
• अजवाइन और सोंठ (अदरक) का गुनगुना पानी पिएं। इसमें प्राकृतिक दर्दनिवारक गुण होते हैं।
• 'बालासन' (Child's Pose) या तितली आसन में विश्राम करें। इससे पेल्विक मांसपेशियों का तनाव कम होता है।

🩺 **डॉक्टर को कब दिखाएं:**
• यदि दर्द जांघों या पीठ तक फैले और आपसे खड़ा भी न हुआ जाए।
• यदि 2-3 दिन बाद भी दर्द कम न हो (यह एंडोमेट्रियोसिस का संकेत हो सकता है)।

❓ **मुझे और समझने में मदद करें:** क्या दर्द माहवारी शुरू होने से पहले ही बढ़ जाता है, या सिर्फ पहले-दूसरे दिन रहता है?`;

    case "pcos":
      return `${opener}

**PCOS / PCOD और अनियमित माहवारी** को लेकर परेशान न हों। यह एक हार्मोनल और मेटाबॉलिक स्थिति है, जिसे सही खानपान और दिनचर्या से बहुत अच्छी तरह नियंत्रित किया जा सकता है।

🥗 **खानपान और जीवनशैली के नियम:**
• मीठा, मैदा और तला-भुना कम करें। अपने भोजन में रागी, बाजरा, हरी सब्जियां और दालें शामिल करें ताकि इंसुलिन संतुलित रहे।
• पुदीने (Spearmint) की चाय दिन में एक बार पिएं। यह अनचाहे बालों (Hirsutism) और एंड्रोजन हार्मोन को कम करने में सहायक है।
• रोज़ाना 25-30 मिनट तेज़ टहलें या हल्का व्यायाम करें।
• मेथी के दानों को रातभर पानी में भिगोकर सुबह उसका पानी पिएं।

📋 **डॉक्टर से कौन-से टेस्ट करवाएं:**
• पेल्विक अल्ट्रासाउंड (Pelvic USG) और हार्मोन प्रोफाइल (LH/FSH, थायरॉइड TSH)।

❓ क्या आपके दो पीरियड के बीच 35 दिन से अधिक का अंतर रहता है?`;

    case "heavy_bleeding":
      return `${opener}

**अत्यधिक रक्तस्राव (Heavy Bleeding)** शरीर को कमज़ोर कर देता है। इस पर तुरंत ध्यान देना आवश्यक है:

⚠️ **ज़रूरी चेतावनी (पैड सैचुरेशन नियम):**
यदि आपको **लगातार 2 घंटे तक हर घंटे 2 या अधिक पैड बदलने पड़ रहे हों**, या बड़े रक्त के थक्के (Clots) निकल रहे हों, तो बिना देर किए नज़दीकी प्राथमिक स्वास्थ्य केंद्र (PHC) या अस्पताल जाएं।

🍵 **शरीर को संभालने के उपाय:**
• तुरंत ओआरएस (ORS), नींबू पानी या नारियल पानी पिएं ताकि शरीर में पानी और नमक की कमी से चक्कर न आएं।
• पालक, सहजन (मोरिंगा), गुड़ और भुने चने खाएं और साथ में नींबू निचोड़ें ताकि आयरन जल्दी सोख सके।

❓ क्या आपको उठते-बैठते चक्कर आ रहे हैं या अत्यधिक कमज़ोरी महसूस हो रही है?`;

    case "pregnancy":
      return `${opener}

**गर्भावस्था और शुरुआती दिनों में जी मिचलाना:**

🌸 **उल्टी और जी मिचलाने से बचाव:**
• सुबह बिस्तर से उठने से पहले भुने चने, सूखा बिस्कुट या खाखरा खाएं। इससे पेट का एसिड शांत रहता है।
• अदरक का हल्का गुनगुना पानी पिएं या नींबू सूंघें।
• दिन में एक बार बड़ा भोजन करने के बजाय 5-6 बार थोड़ा-थोड़ा खाएं।

💊 **ज़रूरी देखभाल:**
• अपनी आशा दीदी या डॉक्टर द्वारा दी गई **फोलिक एसिड** की गोली रोज़ाना ज़रूर लें।
• यदि 12 घंटे से अधिक समय तक कोई भी पानी या खाना पेट में न रुके, या पेट में तीव्र एकतरफा दर्द हो, तो तुरंत अस्पताल जाएं।`;

    case "uti":
      return `${opener}

**पेशाब में जलन या दर्द (UTI के लक्षण):**

💧 **तुरंत क्या करें:**
• दिनभर में 8 से 10 गिलास (3 लीटर) उबला या साफ पानी पिएं ताकि बैक्टीरिया पेशाब के रास्ते बाहर निकल सकें।
• जौ का पानी (Barley water) या एक गिलास पानी में चुटकीभर मीठा सोडा मिलाकर पिएं, इससे जलन तुरंत कम होती है।
• पेशाब को कभी न रोकें।
• शौच के बाद आगे से पीछे की तरफ धोएं ताकि संक्रमण न फैले।

🚨 **सावधानी:** यदि पीठ के निचले हिस्से में दर्द हो, उल्टी या बुखार आए, तो तुरंत PHC से यूरिन टेस्ट करवाएं और डॉक्टर की सलाह से दवा लें।`;

    case "mental_health":
      return `${opener}

मैं आपकी स्थिति समझ रही हूँ सखी। **मन में उदासी, घबराहट, अत्यधिक चिंता या चिड़चिड़ापन** कमज़ोरी नहीं है। माहवारी से पहले हार्मोन में बदलाव के कारण दिमाग में सेरोटोनिन कम हो जाता है, जिससे यह भारीपन महसूस होता है।

🧘‍♀️ **इस समय राहत के लिए:**
• 4-7-8 प्राणायाम करें: 4 सेकंड सांस अंदर लें, 7 सेकंड रोकें, और 8 सेकंड में धीरे-धीरे मुंह से छोड़ें।
• गर्म दूध में चुटकीभर जायफल डालकर पिएं।
• अपनी भावनाओं को बिना किसी झिझक के हरसखी माइंड वेलनेस जर्नल में लिखें।
• 📞 **टेली-मानस (Tele-MANAS) हेल्पलाइन 14416** पर कॉल करें — यह 24 घंटे मुफ्त और गोपनीय मानसिक स्वास्थ्य परामर्श सेवा है।`;

    default:
      return `${opener}

आपने जो लक्षण बताए हैं: "${text}"।

यह समस्या अक्सर हार्मोनल उतार-चढ़ाव, शरीर में पानी की कमी, अत्यधिक तनाव या पेल्विक मांसपेशियों में खिंचाव के कारण हो सकती है।

🌱 **देखभाल के सुझाव:**
• पर्याप्त आराम करें और गुनगुना पानी पिएं।
• हल्का सुपाच्य भोजन लें और कैफीन/चाय का सेवन सीमित करें।
• यदि यह समस्या 2-3 दिन से अधिक बनी रहे, तो अपने नज़दीकी प्राथमिक स्वास्थ्य केंद्र (PHC) जाएं या हमारे कंसल्टेशन टैब में डॉक्टर फातिमा शेख से ऑनलाइन परामर्श बुक करें।

❓ क्या यह परेशानी आपको पहले भी हुई है? कृपया थोड़ा और बताएं।`;
  }
}

function generateTamilRecommendation(topic: string, text: string, name: string, seed: number): string {
  return `வணக்கம் ${name} சகி 🌸 உங்கள் உடல்நலப் பிரச்சனையை அக்கறையுடன் கேட்கிறேன்.

${topic === "cramps" ? "மாதவிடாய் வலி (Menstrual Cramps) கருப்பை சுருங்குவதால் ஏற்படுகிறது. அடிவயிற்றில் வெந்நீர் ஒத்தடம் கொடுப்பது மற்றும் இஞ்சி கலந்த வெதுவெதுப்பான நீர் அருந்துவது உடனடி நிவாரணம் தரும்." : ""}
${topic === "pcos" ? "PCOS பிரச்சனைக்கு உணவு முறையும் உடற்பயிற்சியும் மிக முக்கியம். சிறுதானியங்கள், வெந்தய நீர் மற்றும் தினமும் 30 நிமிடம் நடைபயிற்சி ஹார்மோன்களை சமநிலைப்படுத்தும்." : ""}
${topic === "heavy_bleeding" ? "அதிக உதிரப்போக்கு இருந்தால் (ஒரு மணி நேரத்திற்கு 2 பேட்களுக்கு மேல் நனைந்தால்) உடனே அரசு ஆரம்ப சுகாதார நிலையத்தை (PHC) அணுகவும். எலுமிச்சை சாறு மற்றும் முருங்கைக்கீரை இரத்த அளவை உயர்த்தும்." : ""}
${topic === "uti" ? "சிறுநீர் எரிச்சலுக்கு நிறைய தண்ணீர் (3 லிட்டர்) குடிக்கவும். பார்லி நீர் அருந்துவது எரிச்சலை உடனே குறைக்கும்." : ""}

அறிகுறிகள் தொடர்ந்தால் நமது மருத்துவர் பாத்திமாவுடன் உடனே ஆன்லைன் ஆலோசனை பெறலாம். உங்களுக்கு வேறு ஏதேனும் தலைசுற்றல் அல்லது காய்ச்சல் உள்ளதா?`;
}

function generateMalayalamRecommendation(topic: string, text: string, name: string, seed: number): string {
  return `നമസ്കാരം ${name} സഖീ 🌸 നിങ്ങളുടെ ആരോഗ്യ പ്രശ്നം ഞാൻ ശ്രദ്ധയോടെ കേൾക്കുന്നു.

${topic === "cramps" ? "ആർത്തവവേദനയ്ക്ക് അടിവയറ്റിൽ ചൂടുപിടിക്കുന്നതും ഇഞ്ചിയിട്ട ചെറുചൂടുവെള്ളം കുടിക്കുന്നതും പേശികൾക്ക് വലിയ ആശ്വാസം നൽകും." : ""}
${topic === "pcos" ? "PCOS നിയന്ത്രിക്കാൻ മധുരവും അന്നജവും കുറച്ച് ചെറുധാന്യങ്ങളും ഉലുവ വെള്ളവും ശീലമാക്കുക. ദിവസവും 30 മിനിറ്റ് വ്യായാമം അത്യാവശ്യമാണ്." : ""}
${topic === "heavy_bleeding" ? "അമിത രക്തസ്രാവം ഉണ്ടെങ്കിൽ ഉടൻ തന്നെ അടുത്തുള്ള പി.എച്ച്.സി (PHC) സന്ദർശിക്കുക. ധാരാളം കരിക്കിൻ വെള്ളവും ഇലക്കറികളും കഴിക്കുക." : ""}
${topic === "uti" ? "മൂത്രമൊഴിക്കുമ്പോൾ പുകച്ചിൽ ഉണ്ടെങ്കിൽ ദിവസവും 3 ലിറ്റർ വെള്ളം കുടിക്കുക. ബാർലി വെള്ളം കുടിക്കുന്നത് എരിച്ചിൽ കുറയ്ക്കും." : ""}

കൂടുതൽ സംശയങ്ങൾക്ക് ഞങ്ങളുടെ ഡോക്ടറുമായി കൺസൾട്ടേഷൻ ബുക്ക് ചെയ്യാവുന്നതാണ്. ഇപ്പോൾ കഠിനമായ ക്ഷീണം തോന്നുന്നുണ്ടോ?`;
}

function generateKannadaRecommendation(topic: string, text: string, name: string, seed: number): string {
  return `ನಮಸ್ಕಾರ ${name} ಸಖಿ 🌸 ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಯನ್ನು ನಾನು ಸಂಪೂರ್ಣ ಕಾಳಜಿಯಿಂದ ಆಲಿಸುತ್ತಿದ್ದೇನೆ.

${topic === "cramps" ? "ಮುಟ್ಟಿನ ನೋವಿಗೆ (Cramps) ಹೊಟ್ಟೆಯ ಕೆಳಭಾಗದಲ್ಲಿ ಬಿಸಿ ನೀರಿನ ಶಾಖ ಕೊಡುವುದು ಮತ್ತು ಶುಂಠಿ ಕಷಾಯ ಕುಡಿಯುವುದು ಉತ್ತಮ ಉಪಶಮನ ನೀಡುತ್ತದೆ." : ""}
${topic === "pcos" ? "PCOS ನಿಯಂತ್ರಣಕ್ಕೆ ರಾಗಿ, ಸಿರಿಧಾನ್ಯಗಳು ಮತ್ತು ಮೆಂತ್ಯದ ನೀರನ್ನು ಬಳಸಿ. ದಿನವೂ 30 ನಿಮಿಷ ವಾಕಿಂಗ್ ಮಾಡುವುದು ಹಾರ್ಮೋನ್ ಸಮತೋಲನಕ್ಕೆ ಸಹಕಾರಿ." : ""}
${topic === "heavy_bleeding" ? "ಅತಿಯಾದ ರಕ್ತಸ್ರಾವವಿದ್ದರೆ ತಕ್ಷಣವೇ ಹತ್ತಿರದ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರಕ್ಕೆ (PHC) ಭೇಟಿ ನೀಡಿ. ನಿಂಬೆಹಣ್ಣಿನ ರಸ ಮತ್ತು ಪಾಲಕ್ ಸೊಪ್ಪು ರಕ್ತಹೀನತೆ ತಡೆಯುತ್ತದೆ." : ""}
${topic === "uti" ? "ಮೂತ್ರದಲ್ಲಿ ಉರಿ ಇದ್ದರೆ ದಿನಕ್ಕೆ 3 ಲೀಟರ್ ನೀರು ಮತ್ತು ಬಾರ್ಲಿ ನೀರನ್ನು ಕುಡಿಯಿರಿ." : ""}

ನಮ್ಮ ವೈದ್ಯರಾದ ಡಾ. ಫಾತಿಮಾ ಅವರೊಂದಿಗೆ ಆನ್‌ಲೈನ್ ಸಮಾಲೋಚನೆ ನಡೆಸಲು ಕನ್ಸಲ್ಟೇಶನ್ಸ್ ಟ್ಯಾಬ್ ಬಳಸಿ.`;
}

function generateTeluguRecommendation(topic: string, text: string, name: string, seed: number): string {
  return `నమస్తే ${name} సఖీ 🌸 మీ ఆరోగ్య సమస్యను నేను ఎంతో శ్రద్ధతో అర్థం చేసుకుంటున్నాను.

${topic === "cramps" ? "రుతుక్రమ నొప్పులకు పొత్తికడుపుపై వేడి నీళ్ల కాపడం పెట్టడం మరియు అల్లం, వాము నీరు తాగడం వల్ల వెంటనే ఉపశమనం లభిస్తుంది." : ""}
${topic === "pcos" ? "PCOS నియంత్రణకు కొర్రలు, రాగులు, మెంతుల నీరు మరియు ప్రతిరోజూ 30 నిమిషాల వ్యాయామం ఎంతగానో మేలు చేస్తాయి." : ""}
${topic === "heavy_bleeding" ? "రక్తస్రావం అధికంగా ఉంటే ఆలస్యం చేయకుండా సమీపంలోని PHC కి వెళ్లండి. కొబ్బరి నీళ్లు మరియు మునగాకు రక్తాన్ని నిలకడగా ఉంచుతాయి." : ""}
${topic === "uti" ? "మూత్రంలో మంట ఉంటే రోజుకు 3 లీటర్ల నీరు మరియు బార్లీ నీరు త్రాగండి." : ""}

మరింత సమాచారం లేదా వైద్య సహాయం కోసం మా వైద్యులను సంప్రదించవచ్చు. మీకు జ్వరం లేదా తలతిరగడం ఉందా?`;
}
