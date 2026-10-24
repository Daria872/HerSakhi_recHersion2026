import { Router, Request, Response } from "express";
import { db } from "../db.ts";
import { getAuthenticatedUser } from "./auth.ts";

export const consultationsRouter = Router();

// Get list of verified specialist doctors
consultationsRouter.get("/doctors", (req: Request, res: Response) => {
  const { specialty } = req.query;
  const doctors = db.getDoctors(typeof specialty === "string" ? specialty : undefined);
  return res.json({ doctors });
});

// Get user's consultation bookings
consultationsRouter.get("/my-bookings", (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const bookings = db.getBookings(user.id);
  return res.json({ bookings });
});

// Get upcoming active appointment with waiting room status
consultationsRouter.get("/active", (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const bookings = db.getBookings(user.id);
  const active = bookings.find((b) => b.status === "CONFIRMED" || b.status === "WAITING_ROOM") || bookings[0];

  return res.json({
    activeBooking: active || null,
    telemedicineNotice:
      "DISHA & Indian Telemedicine Practice Guidelines Compliant. No video recordings stored. Prescriptions sent directly via SMS & encrypted PDF.",
  });
});

// Book appointment
consultationsRouter.post("/book", (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { doctorId, appointmentTime, shareSymptomSummary } = req.body;
  const doctor = db.getDoctorById(doctorId);
  if (!doctor) {
    return res.status(404).json({ error: "Doctor not found" });
  }

  const booking = db.addBooking(user.id, {
    doctorId: doctor.id,
    doctorName: doctor.name,
    specialty: doctor.specialty,
    appointmentTime: appointmentTime || doctor.nextAvailableSlot,
    feeInr: doctor.feeInr,
    isSubsidized: doctor.isRuralGrantSubsidized,
    status: "CONFIRMED",
    preConsultChecklist: {
      shareSymptomSummary: Boolean(shareSymptomSummary),
      audioVideoTested: false,
      lowBandwidthMode: true,
    },
    doctorAvatarUrl: doctor.avatarUrl,
  });

  return res.status(201).json({
    booking,
    message: `Consultation booked with ${doctor.name} for ${booking.appointmentTime}.`,
  });
});

// Update pre-consult checklist
consultationsRouter.put("/:id/checklist", (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const { shareSymptomSummary, audioVideoTested, lowBandwidthMode } = req.body;

  const currentBooking = db.getBookings(user.id).find((b) => b.id === id);
  if (!currentBooking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  const updatedChecklist = {
    ...currentBooking.preConsultChecklist,
    ...(shareSymptomSummary !== undefined && { shareSymptomSummary }),
    ...(audioVideoTested !== undefined && { audioVideoTested }),
    ...(lowBandwidthMode !== undefined && { lowBandwidthMode }),
  };

  const updated = db.updateBooking(user.id, id, {
    preConsultChecklist: updatedChecklist,
  });

  return res.json({ booking: updated });
});
