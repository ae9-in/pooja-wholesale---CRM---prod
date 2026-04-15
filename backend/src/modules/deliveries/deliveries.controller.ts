import { Request, Response } from "express";
import { AppError } from "../../utils/app-error.js";
import { deliveriesService } from "./deliveries.service.js";

export const deliveriesController = {
  async list(req: Request, res: Response) {
    res.json(await deliveriesService.list(req.query as Record<string, string>, req.user));
  },
  async create(req: Request, res: Response) {
    res.status(201).json(await deliveriesService.create(req.body, req.user!.id));
  },
  async createBulk(req: Request, res: Response) {
    res.status(201).json(await deliveriesService.createMany(req.body.orders, req.user!.id));
  },
  async getById(req: Request, res: Response) {
    res.json(await deliveriesService.getById(String(req.params.id)));
  },
  async update(req: Request, res: Response) {
    res.json(await deliveriesService.update(String(req.params.id), req.body, req.user!.id));
  },
  async remove(req: Request, res: Response) {
    res.json(await deliveriesService.remove(String(req.params.id), req.user!.id));
  },
  async addItem(req: Request, res: Response) {
    res.status(201).json(await deliveriesService.addItem(String(req.params.id), req.body, req.user!.id));
  },
  async updateItem(req: Request, res: Response) {
    res.json(
      await deliveriesService.updateItem(
        String(req.params.id),
        String(req.params.itemId),
        req.body,
        req.user!.id,
      ),
    );
  },
  async deleteItem(req: Request, res: Response) {
    res.json(
      await deliveriesService.deleteItem(String(req.params.id), String(req.params.itemId), req.user!.id),
    );
  },
  async uploadBill(req: Request, res: Response) {
    if (!req.file) {
      throw new AppError("Bill file is required", 400);
    }
    res.json(await deliveriesService.attachBill(String(req.params.id), req.file, req.user!.id));
  },
  async deleteBill(req: Request, res: Response) {
    res.json(await deliveriesService.removeBill(String(req.params.id), req.user!.id));
  },
};
