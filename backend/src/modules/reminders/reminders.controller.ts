import { Request, Response } from "express";
import { remindersServiceApi } from "./reminders.service-api.js";

export const remindersController = {
  async list(req: Request, res: Response) {
    res.json(await remindersServiceApi.list(req.query as Record<string, string>, req.user));
  },
  async getById(req: Request, res: Response) {
    res.json(await remindersServiceApi.getById(String(req.params.id)));
  },
  async create(req: Request, res: Response) {
    res.status(201).json(await remindersServiceApi.create(req.body, req.user!.id));
  },
  async update(req: Request, res: Response) {
    res.json(await remindersServiceApi.update(String(req.params.id), req.body, req.user!.id));
  },
  async complete(req: Request, res: Response) {
    res.json(
      await remindersServiceApi.complete(String(req.params.id), req.body.completionNote, req.user!.id),
    );
  },
  async snooze(req: Request, res: Response) {
    res.json(
      await remindersServiceApi.snooze(String(req.params.id), new Date(req.body.snoozedUntil), req.user!.id),
    );
  },
  async reschedule(req: Request, res: Response) {
    res.json(
      await remindersServiceApi.reschedule(String(req.params.id), new Date(req.body.reminderDate), req.user!.id),
    );
  },
  async cancel(req: Request, res: Response) {
    res.json(await remindersServiceApi.cancel(String(req.params.id), req.user!.id));
  },
};
