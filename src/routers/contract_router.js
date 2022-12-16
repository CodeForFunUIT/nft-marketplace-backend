import express from "express";
const router = express.Router();

import {
    addOrder,
    getEventAddOrders,
    executeOrder,
    getEventOrderMatch,
    cancleOrder,
    addTokenId,
    getOrdersFromBlochain,
    getOrdersFromMongo,
} from '../controllers/contract_controller.js'
import { authToken } from "../middleware/authorization.js";

router.get('/addOrder', addOrder)
router.get('/getOrdersFromBlochain',getOrdersFromBlochain),
router.get('/getOrdersFromMongo',getOrdersFromMongo),
router.get('/getEventAddOrders', getEventAddOrders)
router.get('/getEventOrderMatch',getEventOrderMatch)
router.post('/executeOrder', executeOrder)
router.post('/cancleOrder',cancleOrder)
router.post('/addTokenId', addTokenId)
export default router