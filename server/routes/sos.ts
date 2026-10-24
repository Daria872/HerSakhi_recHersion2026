import { Router, Request, Response } from "express";
import { db } from "../db.ts";
import { getAuthenticatedUser } from "./auth.ts";

export const sosRouter = Router();

// Nearby Police Stations & Women Safety Desks (Emergency 112 / 1091)
const nearbyPoliceStations = [
  {
    name: "Mayur Vihar Police Station • Women Safety Desk",
    phone: "011-22752100",
    distanceKm: 0.8,
    stationCode: "DL-PS-MV1",
    address: "Pocket 1, Near Metro Station, Mayur Vihar, New Delhi",
  },
  {
    name: "Patparganj Women Help Desk (24x7)",
    phone: "011-22241091",
    distanceKm: 1.6,
    stationCode: "DL-PS-PPG",
    address: "Mother Dairy Road, Patparganj, New Delhi",
  },
  {
    name: "National Emergency Response Support System (ERSS)",
    phone: "112",
    distanceKm: 0.1,
    stationCode: "NAT-112",
    address: "Dispatched to nearest mobile PCR patrol unit",
  },
];

// Check speech transcript for distress response
sosRouter.post("/check-voice", (req: Request, res: Response) => {
  const { speechTranscript = "" } = req.body;
  const transcript = speechTranscript.toLowerCase().trim();

  // Multilingual danger trigger keywords (Hindi, Tamil, Malayalam, Kannada, Telugu, English)
  const dangerKeywords = [
    "yes", "help", "danger", "bachao", "madad", "please", "save me",
    "haan", "kapathunga", "sahayam", "rakshikku", "sakhi help", "sahaya", "bhayama",
    "thodu", "emergency", "attack", "dar", "chup", "chhod do", "police"
  ];

  // Safe keywords
  const safeKeywords = ["safe", "no", "fine", "ok", "mistake", "accidental", "theek", "nahi", "paravala", "sukham"];

  const matchedDanger = dangerKeywords.some((word) => transcript.includes(word));
  const matchedSafe = safeKeywords.some((word) => transcript.includes(word));

  const isConfirmedDanger = matchedDanger && !matchedSafe;

  return res.json({
    transcript,
    detectedDanger: isConfirmedDanger,
    confidence: isConfirmedDanger ? 0.95 : matchedSafe ? 0.1 : 0.5,
    message: isConfirmedDanger
      ? "Distress response confirmed. Activating immediate police and emergency contact dispatch."
      : matchedSafe
      ? "Safe response registered. SOS standby cancelled."
      : "No clear response detected. If timer expires, safety dispatch will activate automatically.",
  });
});

// Trigger SOS Alert
sosRouter.post("/trigger", (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const {
    triggerType = "PHONE_DROP_MOTION",
    speechTranscript = "",
    detectedDanger = true,
    coordinates = { lat: 28.6083, lng: 77.2954 },
    address = "Mayur Vihar Phase 1, New Delhi, India",
  } = req.body;

  const assignedStation = nearbyPoliceStations[0];
  const emergencyContacts = ["Mom / Family Guardian (+91 98111 00011)", "ASHA Didis Emergency Ring (+91 98765 22200)"];

  const alert = db.triggerSOS({
    userId: user ? user.id : "guest_user",
    triggerType,
    speechTranscript,
    detectedDanger,
    coordinates,
    address,
    dispatchedToPoliceStation: assignedStation,
    emergencyContactsNotified: emergencyContacts,
    status: "ACTIVE_DISPATCH",
  });

  return res.status(201).json({
    alert,
    emergencyNumbers: [
      { name: "National Emergency Central", number: "112" },
      { name: "Women Helpline (All India)", number: "1091" },
      { name: "National Commission for Women (NCW)", number: "7827170170" },
      { name: "Women in Distress Toll-Free", number: "181" },
    ],
    message: "SOS alert active! PCR patrol vehicle and designated emergency contacts have been notified with your real-time GPS location.",
  });
});

// Get Nearby Police Stations
sosRouter.get("/nearby-police", (_req: Request, res: Response) => {
  return res.json({
    policeStations: nearbyPoliceStations,
    centralHelplines: [
      { name: "Police & All Emergency", number: "112" },
      { name: "Women's Safety Hotline", number: "1091" },
      { name: "Domestic & Sexual Harassment Support", number: "181" },
    ],
  });
});

// Resolve SOS
sosRouter.post("/resolve", (req: Request, res: Response) => {
  const { alertId } = req.body;
  if (alertId) {
    db.resolveSOS(alertId);
  }
  return res.json({
    success: true,
    message: "SOS standing alert resolved. You are in safe space.",
  });
});
