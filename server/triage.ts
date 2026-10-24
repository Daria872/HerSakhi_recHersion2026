/**
 * Deterministic Clinical Triage & Warning-Sign Engine for SheShines / HerSakhi
 * Grounded in ICMR, FOGSI, MoHFW (India) & WHO triage protocols.
 * 
 * CRITICAL RULE: Emergency assessment does NOT rely on LLM inference.
 * Deterministic rules execute first and override any probabilistic output.
 */

export interface TriageInput {
  symptoms: string[];
  severity: number; // 1 to 5
  duration: string;
  notes?: string;
  isPregnant?: boolean;
  cycleDay?: number;
}

export interface TriageResult {
  isEmergency: boolean;
  level: "EMERGENCY_RED_FLAG" | "URGENT_DOCTOR" | "ROUTINE_CARE" | "SELF_CARE_OBSERVE";
  matchedRule?: string;
  urgentNotice?: string;
  immediateAction: string;
  emergencyHelplines: Array<{
    name: string;
    number: string;
    purpose: string;
  }>;
  clinicalDisclaimer: string;
}

export function evaluateClinicalTriage(input: TriageInput): TriageResult {
  const textCorpus = [
    ...(input.symptoms || []),
    input.notes || "",
    input.duration || ""
  ].join(" ").toLowerCase();

  const helplines = [
    { name: "Emergency Medical Response / Ambulance", number: "108", purpose: "Immediate emergency hospital transport across India" },
    { name: "Maternal & Child Health Helpline", number: "102", purpose: "Free maternal, pregnant & infant medical transit" },
    { name: "Tele-MANAS National Mental Health", number: "14416", purpose: "24/7 Toll-free confidential mental health support" },
    { name: "Asha Sahayak Rural Health Desk", number: "1800-111-222", purpose: "Toll-free rural guidance & PHC coordination" }
  ];

  const disclaimer = "HerSakhi provides triage navigation and educational guidance only. It is not a clinical diagnosis or medical prescription. Always consult certified medical practitioners for definitive treatment.";

  // Rule 1: Massive Hemorrhage / Pad Soaking
  const padHemorrhage = /soak(ing)?.*(pad|towel)|pad.*hour|heavy.*bleed|hemorrhage|blood.*clot.*golf|clot.*large/i.test(textCorpus) && input.severity >= 4;
  if (padHemorrhage || (input.symptoms.includes("Heavy bleeding") && input.severity === 5)) {
    return {
      isEmergency: true,
      level: "EMERGENCY_RED_FLAG",
      matchedRule: "Excessive Menstrual / Vaginal Bleeding",
      urgentNotice: "Soaking >2 menstrual pads per hour for 2+ consecutive hours, or passing large blood clots with weakness, indicates severe blood loss requiring prompt medical evaluation.",
      immediateAction: "Visit the nearest Primary Health Centre (PHC), Community Health Centre (CHC), or Hospital Emergency Room immediately. Dial 108 or 102.",
      emergencyHelplines: helplines,
      clinicalDisclaimer: disclaimer
    };
  }

  // Rule 2: Syncope, Fainting or Severe Dizziness with Pelvic Symptoms (Ectopic pregnancy / internal bleeding risk)
  if (/faint|loss of conscious|syncope|blacking out|collapsed|severe dizzy|vertigo with pain/i.test(textCorpus)) {
    return {
      isEmergency: true,
      level: "EMERGENCY_RED_FLAG",
      matchedRule: "Syncope / Hemodynamic Compromise",
      urgentNotice: "Unexplained fainting or severe dizziness combined with abdominal or pelvic symptoms is an emergency warning sign.",
      immediateAction: "Lie down with feet elevated if safe. Have someone accompany you or call 108 immediately for urgent clinical assessment.",
      emergencyHelplines: helplines,
      clinicalDisclaimer: disclaimer
    };
  }

  // Rule 3: Acute Severe One-Sided Pelvic Pain (Ovarian torsion, ruptured ectopic pregnancy, ruptured cyst)
  if ((/sharp.*one.*side|unilateral.*pelvic|excruciating.*pelvic|stabbing.*lower.*belly|rigid.*abdomen/i.test(textCorpus) || input.symptoms.includes("Sharp lower abdomen ache")) && input.severity >= 4) {
    return {
      isEmergency: true,
      level: "EMERGENCY_RED_FLAG",
      matchedRule: "Acute Unilateral Pelvic Abdomen Agony",
      urgentNotice: "Sudden, sharp, agonizing one-sided pelvic pain requires immediate ruling out of ectopic pregnancy, ovarian torsion, or appendicitis.",
      immediateAction: "Do not take strong painkillers that mask symptoms without medical guidance. Seek in-person emergency hospital assessment right away.",
      emergencyHelplines: helplines,
      clinicalDisclaimer: disclaimer
    };
  }

  // Rule 4: High Fever with Pelvic Rigidity or Purulent Discharge (Severe PID / Sepsis)
  if (/fever.*pelvic|chills.*discharge|foul.*smell.*fever|high fever/i.test(textCorpus) && input.severity >= 3) {
    return {
      isEmergency: true,
      level: "EMERGENCY_RED_FLAG",
      matchedRule: "Infectious Pelvic Emergency / Possible Sepsis",
      urgentNotice: "High fever accompanied by pelvic tenderness, abdominal stiffness, or malodorous discharge needs urgent antibiotic assessment.",
      immediateAction: "Seek medical evaluation at the nearest clinic or hospital within 2-4 hours to prevent upper genital tract complications.",
      emergencyHelplines: helplines,
      clinicalDisclaimer: disclaimer
    };
  }

  // Rule 5: Pregnancy specific red flags
  if (input.isPregnant && (/bleed|leak|water broke|cramp|headache.*vision|swelling.*face/i.test(textCorpus))) {
    return {
      isEmergency: true,
      level: "EMERGENCY_RED_FLAG",
      matchedRule: "Obstetric Red Flag in Pregnancy",
      urgentNotice: "Bleeding, fluid leakage, or severe headache with visual disturbances during pregnancy require immediate hospital obstetric check.",
      immediateAction: "Call 102/108 or proceed straight to maternal hospital / CHC casualty unit.",
      emergencyHelplines: helplines,
      clinicalDisclaimer: disclaimer
    };
  }

  // Urgent care level: High severity but not immediate life-threat
  if (input.severity >= 4) {
    return {
      isEmergency: false,
      level: "URGENT_DOCTOR",
      matchedRule: "High Symptom Disruption (Severity 4/5)",
      urgentNotice: "Your reported discomfort significantly restricts your daily routine. Early clinical review prevents worsening.",
      immediateAction: "Schedule a teleconsultation or visit a nearby clinic / PHC within 24 to 48 hours.",
      emergencyHelplines: helplines,
      clinicalDisclaimer: disclaimer
    };
  }

  // Routine care level: Noticeable symptoms
  if (input.severity === 3) {
    return {
      isEmergency: false,
      level: "ROUTINE_CARE",
      matchedRule: "Moderate Observation",
      urgentNotice: "Moderate symptoms noted. Documenting daily variations helps your doctor formulate a clear picture.",
      immediateAction: "Log your daily progress, keep warm compress handy if indicated, and prepare a clinician brief for your next routine checkup.",
      emergencyHelplines: helplines,
      clinicalDisclaimer: disclaimer
    };
  }

  // Self care
  return {
    isEmergency: false,
    level: "SELF_CARE_OBSERVE",
    matchedRule: "Mild Physiological Variation",
    urgentNotice: "Mild symptoms typical of cyclic hormonal transitions.",
    immediateAction: "Rest, hydrate well, practice gentle somatic stretches (like Balasana), and observe over the next 24-48 hours.",
    emergencyHelplines: helplines,
    clinicalDisclaimer: disclaimer
  };
}
