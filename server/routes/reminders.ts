import { Router, Request, Response } from "express";
import { db } from "../db.ts";
import { getAuthenticatedUser } from "./auth.ts";

export const remindersRouter = Router();

// Get user reminders
remindersRouter.get("/", (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const reminders = db.getReminders(user.id);
  return res.json({ reminders });
});

// Create new reminder or follow-up
remindersRouter.post("/", (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { title, category, frequency, time, date, notes } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Reminder title is required." });
  }

  const reminder = db.addReminder(user.id, {
    title,
    category: category || "Medicine",
    frequency: frequency || "Daily",
    time: time || "09:00 AM",
    date: date || "Today",
    notes: notes || "",
    completed: false,
  });

  return res.status(201).json({ reminder });
});

// Toggle completion status
remindersRouter.put("/:id/toggle", (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const updated = db.toggleReminder(user.id, req.params.id);
  if (!updated) {
    return res.status(404).json({ error: "Reminder not found" });
  }

  return res.json({ reminder: updated });
});

// Delete reminder
remindersRouter.delete("/:id", (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  db.deleteReminder(user.id, req.params.id);
  return res.json({ success: true });
});
