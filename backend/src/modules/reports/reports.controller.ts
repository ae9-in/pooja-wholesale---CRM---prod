import { Request, Response } from "express";
import { reportsService } from "./reports.service.js";

export const reportsController = {
  async customers(_req: Request, res: Response) {
    res.json(await reportsService.customers());
  },
  async deliveries(_req: Request, res: Response) {
    res.json(await reportsService.deliveries());
  },
  async reminders(_req: Request, res: Response) {
    res.json(await reportsService.reminders());
  },
  async revisitPerformance(_req: Request, res: Response) {
    res.json(await reportsService.revisitPerformance());
  },
};
