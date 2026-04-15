import { Request, Response } from "express";
import { dashboardService } from "./dashboard.service.js";

export const dashboardController = {
  async summary(_req: Request, res: Response) {
    res.json(await dashboardService.summary());
  },
  async upcomingReminders(_req: Request, res: Response) {
    res.json(await dashboardService.upcomingReminders());
  },
  async overdueReminders(_req: Request, res: Response) {
    res.json(await dashboardService.overdueReminders());
  },
  async recentCustomers(_req: Request, res: Response) {
    res.json(await dashboardService.recentCustomers());
  },
  async deliverySummary(_req: Request, res: Response) {
    res.json(await dashboardService.deliverySummary());
  },
  async statusBreakdown(_req: Request, res: Response) {
    res.json(await dashboardService.statusBreakdown());
  },
};
