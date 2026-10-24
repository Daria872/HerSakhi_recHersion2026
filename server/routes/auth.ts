import { Router, Request, Response } from "express";
import { db } from "../db.ts";

export const authRouter = Router();

// Middleware to authenticate Bearer token or fallback to demo user
export function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const user = db.getUserByToken(token);
    if (user) return user;
  }
  // Default to Demo user (Ananya) for seamless testing if no token is passed
  return db.getUserById("usr_demo_ananya");
}

// Register
authRouter.post("/register", (req: Request, res: Response) => {
  const {
    preferredName,
    email,
    password,
    genderIdentity,
    ageGroup,
    language,
    livingSetting,
    accessibilityPrefs,
    consents,
  } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required for registration" });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const { user, token } = db.createUser({
    preferredName: preferredName || "Sakhi",
    email,
    passwordHash: password ? "hash_" + password.length : undefined,
    genderIdentity: genderIdentity || "Woman",
    ageGroup: ageGroup || "25–34",
    language: language || "English",
    livingSetting: livingSetting || "Semi-urban",
    accessibilityPrefs: accessibilityPrefs || {
      largeText: false,
      screenReader: false,
      voiceAssistance: true,
      highContrast: false,
    },
    consents: consents || {
      encryptedHealthVault: true,
      shareClinicalSummaryWithDoctor: true,
      lowBandwidthSync: true,
      anonymizedResearchOptOut: true,
    },
  });

  return res.status(201).json({ user, token });
});

// Login
authRouter.post("/login", (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const token = db.createSession(user.id);
  return res.json({ user, token });
});

// Me
authRouter.get("/me", (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return res.json({ user });
});

// Update Profile
authRouter.put("/profile", (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const updated = db.updateUserProfile(user.id, req.body);
  return res.json({ user: updated });
});

// Data Export (Module 9: Privacy & Security GDPR / DISHA compliance)
authRouter.get("/export-data", (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const symptoms = db.getSymptoms(user.id);
  const moods = db.getMoods(user.id);
  const journals = db.getJournals(user.id);
  const bookings = db.getBookings(user.id);

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    standard: "Ayushman Bharat Digital Mission (ABDM) / Personal Health Records (PHR) Data Standard",
    encryptionStatus: "Encrypted at rest with user client key",
    userProfile: {
      id: user.id,
      preferredName: user.preferredName,
      language: user.language,
      genderIdentity: user.genderIdentity,
      livingSetting: user.livingSetting,
      accessibilityPrefs: user.accessibilityPrefs,
      consents: user.consents,
    },
    healthRecords: {
      symptomObservations: symptoms,
      moodAndWellnessRhythm: moods,
      encryptedJournalCount: journals.length,
      consultations: bookings,
    },
  };

  return res.json(exportPayload);
});

// Delete Account & Purge Health Vault
authRouter.delete("/delete-account", (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  db.deleteUserAccount(user.id);
  return res.json({
    success: true,
    message: "Your account and all associated health vault records have been permanently erased from HerSakhi servers.",
  });
});
