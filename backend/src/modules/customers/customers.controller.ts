import { Request, Response } from "express";
import { customersService } from "./customers.service.js";

export const customersController = {
  async list(req: Request, res: Response) {
    res.json(await customersService.list(req.query as Record<string, string>, req.user));
  },
  async create(req: Request, res: Response) {
    res
      .status(201)
      .json(await customersService.create({ ...req.body, createdById: req.user!.id }, req.user!.id));
  },
  async getById(req: Request, res: Response) {
    res.json(await customersService.getById(String(req.params.id), req.user));
  },
  async update(req: Request, res: Response) {
    res.json(await customersService.update(String(req.params.id), req.body, req.user!.id));
  },
  async updateStatus(req: Request, res: Response) {
    res.json(await customersService.updateStatus(String(req.params.id), req.body.status, req.user!.id));
  },
  async remove(req: Request, res: Response) {
    res.json(await customersService.remove(String(req.params.id), req.user!.id));
  },
  async notes(req: Request, res: Response) {
    res.json(await customersService.listNotes(String(req.params.id)));
  },
  async addNote(req: Request, res: Response) {
    res.status(201).json(await customersService.addNote(String(req.params.id), req.body, req.user!.id));
  },
  async deliveries(req: Request, res: Response) {
    res.json(await customersService.listDeliveries(String(req.params.id)));
  },
};
