import express from "express";
const router = express.Router();

import {
    addOrder,
    getOrders,
    getEventAddOrders,
    executeOrder,
    getEventOrderMatch,
    getNFTUser,
    cancleOrder,
    addTokenId,
} from '../controllers/contract_controller.js'
import { authToken } from "../middleware/authorization.js";

router.get('/addOrder',authToken, addOrder)
router.get('/getOrders',getOrders)
router.get('/getEventAddOrders', getEventAddOrders)
router.get('/getEventOrderMatch',getEventOrderMatch)
router.post('/executeOrder', executeOrder)
router.post('/getNFTUser',getNFTUser)
router.post('/cancleOrder',cancleOrder)
router.post('/addTokenId', addTokenId)
export default router