import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import notesRouter from "./notes.js";
const router: IRouter = Router();

router.use(healthRouter);
router.use(notesRouter);

export default router;
