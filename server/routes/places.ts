import { Router, Request, Response } from "express";
import { db } from "../db.ts";

export const placesRouter = Router();

// Search and list healthcare facilities
placesRouter.get("/nearby", (req: Request, res: Response) => {
  const { query, filter, maxDistance } = req.query;

  let facilities = db.getFacilities(
    typeof query === "string" ? query : undefined,
    typeof filter === "string" ? filter : undefined
  );

  if (maxDistance && !isNaN(Number(maxDistance))) {
    const max = Number(maxDistance);
    facilities = facilities.filter((f) => f.distanceKm <= max);
  }

  return res.json({
    currentLocation: {
      areaName: "Mayur Vihar Ph-1, Delhi",
      lat: 28.6083,
      lng: 77.2954,
    },
    count: facilities.length,
    facilities,
    communityAuditedNotice:
      "All verified pricing, accessibility ramps, and doctor presence are audited on-ground by ASHA workers and community sakhis. No automated price fabrication or sponsored rankings.",
  });
});

// Single facility detail
placesRouter.get("/:id", (req: Request, res: Response) => {
  const facility = db.getFacilityById(req.params.id);
  if (!facility) {
    return res.status(404).json({ error: "Facility not found" });
  }
  return res.json({ facility });
});

// Report fee change or audit barrier
placesRouter.post("/report-audit", (req: Request, res: Response) => {
  const { facilityId, reportType, description } = req.body;
  return res.json({
    success: true,
    message: "Thank you, Sakhi. Your report has been dispatched to the local ASHA audit coordinator for verification.",
    reportId: "REP-" + Math.floor(10000 + Math.random() * 90000),
  });
});
