import { Router, Request, Response } from "express";
import { db } from "../db.ts";
import { getAuthenticatedUser } from "./auth.ts";

export const ruralRouter = Router();

// In-memory reports store
const reportedBarriers: any[] = [];

// Get Rural Care Kits
ruralRouter.get("/care-kits", (req: Request, res: Response) => {
  const { category } = req.query;
  const kits = db.getCareKits(typeof category === "string" ? category : undefined);
  return res.json({ careKits: kits });
});

// Get Verified Women Drivers (Saheli Vahan Collective)
ruralRouter.get("/women-drivers", (_req: Request, res: Response) => {
  const drivers = db.getWomenDrivers();
  return res.json({ drivers });
});

// Book a Woman Driver to reach the health center
ruralRouter.post("/book-driver", (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { driverId, pickupLocation, destinationPHC } = req.body;
  const booking = db.bookWomanDriver(
    user.id,
    driverId,
    pickupLocation || user.placeName || "Mayur Vihar Ph-1, Delhi",
    destinationPHC || "Kalyani Community Health Centre (PHC)"
  );

  return res.status(201).json({
    booking,
    message: `Driver ${booking.driverName} has accepted your ride and is en route. ETA: ${booking.etaMinutes} mins.`,
  });
});

// Get Driver Bookings for User
ruralRouter.get("/driver-bookings", (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const bookings = db.getDriverBookings(user.id);
  return res.json({ bookings });
});

// Rural navigation resources & offline guide packages
ruralRouter.get("/resources", (_req: Request, res: Response) => {
  return res.json({
    helpline: {
      name: "Asha Sahayak • 24x7 Rural Helpline",
      number: "1800-111-222",
      emergencyNumber: "108",
      maternalTransportNumber: "102",
      type: "Toll-Free Voice Support",
      features: [
        "Local dialect routing (Hindi, Bhojpuri, Tamil, Telugu, Kannada, Bengali)",
        "Zero-balance phone call connectivity",
        "Direct ASHA community worker dispatch",
      ],
    },
    offlineGuides: [
      {
        id: "guide_1",
        title: "Emergency Menstrual Pain Remedies",
        category: "Pain Relief",
        summary: "Safe, home-accessible non-pharmacological relief methods.",
        content:
          "Apply warm water bottle or hot compress over lower abdomen for 15-20 min. Drink warm ginger or ajwain tea. Practice gentle pelvic opening stretch (Balasana). Avoid extreme cold drinks during peak cramping.",
      },
      {
        id: "guide_2",
        title: "Iron & Folic Acid Guidelines for Anemia",
        category: "Nutrition",
        summary: "ICMR guidelines on preventing maternal and adolescent anemia.",
        content:
          "Free blue IFA tablets are available at every PHC/Anganwadi. Take with water or lemon water (Vitamin C enhances absorption). Do NOT take immediately with hot chai or milk (tannins block iron absorption).",
      },
      {
        id: "guide_3",
        title: "Safe Menstrual Hygiene Without Running Water",
        category: "Hygiene",
        summary: "Dignified, infection-free care in resource-limited rural environments.",
        content:
          "Wash hands with clean soap before and after pad changing. If using cloth pads, boil in hot water with salt, and dry in direct sunlight (UV light acts as natural disinfectant). Never hide wet cloths in damp corners.",
      },
      {
        id: "guide_4",
        title: "Pregnancy Warning Signs (Khatre ke Nishan)",
        category: "Obstetrics",
        summary: "Crucial red flags requiring immediate CHC/district hospital transfer.",
        content:
          "Severe swelling of hands/face, continuous blurred vision, sudden gush of water, severe epigastric pain, or absence of baby movement for >12 hours requires immediate transport via 102/108 ambulance.",
      },
    ],
    careKits: db.getCareKits(),
    transportPartners: db.getWomenDrivers(),
  });
});

// Report barrier (e.g., medicine stock-out at local PHC)
ruralRouter.post("/report-barrier", (req: Request, res: Response) => {
  const { barrierType, phcName, district, notes } = req.body;

  const report = {
    id: "BAR-" + Math.floor(1000 + Math.random() * 9000),
    barrierType: barrierType || "Medicine Stockout",
    phcName: phcName || "Local PHC",
    district: district || "East Delhi",
    notes: notes || "",
    timestamp: new Date().toISOString(),
  };

  reportedBarriers.push(report);

  return res.status(201).json({
    success: true,
    message: "Thank you for reporting this healthcare barrier. It has been registered for ASHA District Grievance follow-up.",
    report,
  });
});
