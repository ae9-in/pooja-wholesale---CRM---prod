import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { billUpload } from "../uploads/upload.service.js";
import { deliveriesController } from "./deliveries.controller.js";
import {
  deliveryBulkCreateSchema,
  deliveryCreateSchema,
  deliveryItemCreateSchema,
  deliveryUpdateSchema,
} from "./deliveries.validation.js";

export const deliveryRouter = Router();

deliveryRouter.use(authenticate);

deliveryRouter.get("/", asyncHandler(deliveriesController.list));
deliveryRouter.post(
  "/",
  authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.STAFF),
  validate(deliveryCreateSchema),
  asyncHandler(deliveriesController.create),
);
deliveryRouter.post(
  "/bulk",
  authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.STAFF),
  validate(deliveryBulkCreateSchema),
  asyncHandler(deliveriesController.createBulk),
);
deliveryRouter.get("/:id", asyncHandler(deliveriesController.getById));
deliveryRouter.patch(
  "/:id",
  authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.STAFF),
  validate(deliveryUpdateSchema),
  asyncHandler(deliveriesController.update),
);
deliveryRouter.delete("/:id", authorize(Role.SUPER_ADMIN, Role.ADMIN), asyncHandler(deliveriesController.remove));
deliveryRouter.post("/:id/items", validate(deliveryItemCreateSchema), asyncHandler(deliveriesController.addItem));
deliveryRouter.patch(
  "/:id/items/:itemId",
  validate(deliveryItemCreateSchema),
  asyncHandler(deliveriesController.updateItem),
);
deliveryRouter.delete("/:id/items/:itemId", asyncHandler(deliveriesController.deleteItem));
deliveryRouter.post("/:id/upload-bill", billUpload.single("bill"), asyncHandler(deliveriesController.uploadBill));
deliveryRouter.delete("/:id/bill", asyncHandler(deliveriesController.deleteBill));
