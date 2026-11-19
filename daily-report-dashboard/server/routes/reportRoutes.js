import { Router } from 'express';
import {
  listByMonth,
  listByRange,
  upsertReport,
  deleteReport,
} from '../controllers/reportController.js';

const router = Router();

router.get('/', listByMonth);
router.get('/range', listByRange);
router.put('/:date', upsertReport);
router.delete('/:date', deleteReport);

export default router;
