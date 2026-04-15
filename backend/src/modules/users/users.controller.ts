import { Request, Response } from "express";
import { usersService } from "./users.service.js";

export const usersController = {
  async list(req: Request, res: Response) {
    res.json(await usersService.list(req.query as Record<string, string>));
  },
  async create(req: Request, res: Response) {
    res.status(201).json(await usersService.create({ ...req.body, actorId: req.user!.id }));
  },
  async getById(req: Request, res: Response) {
    res.json(await usersService.getById(String(req.params.id)));
  },
  async update(req: Request, res: Response) {
    res.json(await usersService.update(String(req.params.id), req.body, req.user!.id));
  },
  async activate(req: Request, res: Response) {
    res.json(await usersService.setActive(String(req.params.id), true, req.user!.id));
  },
  async deactivate(req: Request, res: Response) {
    res.json(await usersService.setActive(String(req.params.id), false, req.user!.id));
  },
};
