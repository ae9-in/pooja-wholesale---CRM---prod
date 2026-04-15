import { Request, Response } from "express";
import { authService } from "./auth.service.js";

export const authController = {
  async login(req: Request, res: Response) {
    const result = await authService.login(req.body.email, req.body.password);
    res.json(result);
  },

  async logout(_req: Request, res: Response) {
    res.json({ success: true });
  },

  async me(req: Request, res: Response) {
    const result = await authService.me(req.user!.id);
    res.json(result);
  },

  async changePassword(req: Request, res: Response) {
    const result = await authService.changePassword(
      req.user!.id,
      req.body.currentPassword,
      req.body.newPassword,
    );
    res.json(result);
  },
};
