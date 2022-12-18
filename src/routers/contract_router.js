import express from "express";
const router = express.Router();

import {
    addOrder,
    getEventAddOrders,
    executeOrder,
    getEventOrderMatch,
    cancelOrder,
    getOrdersFromBlochain,
    getOrdersFromMongo,
    hackOrder,
} from '../controllers/contract_controller.js'
import { authToken } from "../middleware/authorization.js";

router.get('/addOrder', addOrder)
router.post('/hackOrder',hackOrder),
router.get('/getOrdersFromBlochain',getOrdersFromBlochain),
router.get('/getOrdersFromMongo',getOrdersFromMongo),
router.get('/getEventAddOrders', getEventAddOrders)
router.get('/getEventOrderMatch',getEventOrderMatch)
router.post('/executeOrder', executeOrder)
router.post('/cancelOrder',cancelOrder)

export default router