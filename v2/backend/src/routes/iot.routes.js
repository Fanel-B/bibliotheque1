import { Router } from 'express';
import * as iotController from '../controllers/iot.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { setDeviceStateSchema, scenarioSchema } from '../schemas/iot.schema.js';

export const iotRouter = Router();

// Employé et admin peuvent consulter le dashboard IoT.
iotRouter.get(
  '/zones',
  requireAuth,
  requireRole('employee', 'admin'),
  asyncHandler(iotController.zones)
);
iotRouter.get(
  '/sensors/:id/history',
  requireAuth,
  requireRole('employee', 'admin'),
  asyncHandler(iotController.sensorHistory)
);
iotRouter.get(
  '/alerts',
  requireAuth,
  requireRole('employee', 'admin'),
  asyncHandler(iotController.alerts)
);
iotRouter.patch(
  '/alerts/:id/acknowledge',
  requireAuth,
  requireRole('employee', 'admin'),
  asyncHandler(iotController.acknowledgeAlert)
);

// Seul l'admin pilote réellement les équipements et déclenche des scénarios.
iotRouter.patch(
  '/devices/:id',
  requireAuth,
  requireRole('admin'),
  validate(setDeviceStateSchema),
  asyncHandler(iotController.setDeviceState)
);
iotRouter.post(
  '/simulator/scenario',
  requireAuth,
  requireRole('admin'),
  validate(scenarioSchema),
  asyncHandler(iotController.runScenario)
);
