import express from "express";
const router = express.Router();

import {
    addOrder,
    getOrders,
} from '../controllers/contract_controller.js'
import { authToken } from "../middleware/authorization.js";

router.get('/addOrder',authToken, addOrder)
router.get('/getOrders',getOrders)

export default router