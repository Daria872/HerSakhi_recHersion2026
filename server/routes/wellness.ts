import { Router, Request, Response } from "express";
import { db } from "../db.ts";
import { getAuthenticatedUser } from "./auth.ts";

export const wellnessRouter = Router();

// Log Mood & Energy
wellnessRouter.post("/mood", (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { mood, phrase, cycleDay, cyclePhase } = req.body;
  if (!mood) {
    return res.status(400).json({ error: "Mood is required" });
  }

  const entry = db.addMood(user.id, {
    mood,
    phrase: phrase || mood,
    cycleDay: cycleDay ? Number(cycleDay) : 14,
    cyclePhase: cyclePhase || "Luteal transition",
  });

  return res.status(201).json({ entry });
});

// Get Mood History
wellnessRouter.get("/mood-history", (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const moods = db.getMoods(user.id);
  return res.json({ moods });
});

// Save Private Encrypted Journal Entry
wellnessRouter.post("/journal", (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { prompt, content, isEncrypted } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  const entry = db.addJournal(user.id, {
    prompt: prompt || "What weighs on your mind today?",
    encryptedContent: content,
    isEncrypted: isEncrypted !== false,
  });

  return res.status(201).json({ entry });
});

// Get User's Journal Entries
wellnessRouter.get("/journals", (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const journals = db.getJournals(user.id);
  return res.json({ journals });
});

// Grounding & Somatic Exercises Reference
wellnessRouter.get("/somatic-exercises", (_req: Request, res: Response) => {
  return res.json({
    pranayama: {
      name: "4-7-8 Pranayama Breath",
      phaseCount: 3,
      phases: [
        { name: "Inhale slowly through nose...", duration: 4 },
        { name: "Hold gently...", duration: 7 },
        { name: "Exhale softly through mouth...", duration: 8 },
      ],
      soundscapes: ["Kerala Rain", "Temple Bells", "Forest Dawn", "Silent Sanctuary"],
    },
    sensoryAnchor: {
      name: "5-4-3-2-1 Sensory Grounding",
      steps: [
        { count: 5, label: "Things you can see", desc: "Notice sunlight, colors, textures around you." },
        { count: 4, label: "Things you can touch", desc: "Feel fabric, ring on finger, floor under feet." },
        { count: 3, label: "Sounds you can hear", desc: "Traffic hum, fan blades, your soft breath." },
        { count: 2, label: "Scents you can smell", desc: "Warm tea, soap, rain on dust." },
        { count: 1, label: "Taste or affirmation", desc: "A sip of water, or 'I am grounded and present.'" },
      ],
    },
    pelvicRelease: {
      pose: "Balasana (Supported Child's Pose)",
      guidance: [
        "Spread knees wide on a soft mat or bed, sinking hips back to your heels.",
        "Rest your forehead on a pillow. Allow pelvic floor muscles to fully drop and soften without tension.",
        "Inhale into your lower back ribs for 5 slow deep breaths.",
      ],
    },
    crisisResources: {
      teleManas: {
        number: "14416",
        title: "Tele-MANAS Support",
        desc: "24/7 Govt. Toll-Free Crisis Line • Multilingual • Free • Confidential",
      },
    },
  });
});
