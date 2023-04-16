import Jwt from "jsonwebtoken";
import HttpMethodStatus from "../utility/static.js";
import EventOrderAdd from "../models/event_order_add.js";
import ethers from "ethers";
import User from "../models/user.js";
import NFT from "../models/nft.js";
import { statusNFT } from "../utility/enum.js";
import schedule from "node-schedule";
import { utcToZonedTime } from "date-fns-tz";
import { vietnamTimezone } from "../utility/vietnam_timezone.js";
import { contractMarketPlace } from "../utility/contract.js"
import Auction from "../models/auction.js";

export const addAuctionOrder = async (req, res) => {
    try {
        const data = req.body;
        const endDate = utcToZonedTime(new Date(data.endAuction), vietnamTimezone);
        const startDate = utcToZonedTime(new Date(data.startAuction), vietnamTimezone);
        const now = utcToZonedTime(new Date(), vietnamTimezone);

        if (now.getTime() > endDate.getTime()) {
            return HttpMethodStatus.badRequest(
                res,
                `invalid end date ${endDate} \n now: ${now}`
            );
        }

        if (startDate.getTime() < now.getTime()) {
            return HttpMethodStatus.badRequest(
                res,
                `invalid start date ${startDate} \n now: ${now}`
            );
        }
        const eventMarketPlace = await contractMarketPlace.queryFilter(
            "OrderAdded"
        );
        const newIndex = eventMarketPlace.length - 1;

        const isContractExist = await EventOrderAdd.findOne({
            orderId: eventMarketPlace[newIndex].args[0],
        });

        if (isContractExist) {
            return HttpMethodStatus.badRequest(res, "orderId exist");
        }

        const nft = await NFT.findOneAndUpdate(
            { tokenId: eventMarketPlace[newIndex].args[2] },
            {
                status: statusNFT.AUCTION,
                orderId: eventMarketPlace[newIndex].args[0],
            }
        ).exec();

        if (!nft) {
            return HttpMethodStatus.badRequest(res, "nft not exist");
        }

        const auction = new Auction({
            nft: nft._id,
            minPrice: eventMarketPlace[newIndex].args[4],
            startAuction: data.startAuction,
            endAuction: data.endAuction,
            seller: eventMarketPlace[newIndex].args[1].toLowerCase(),
        });        
        
        auction.save((error, data) => {
            if (error) {
                return HttpMethodStatus.badRequest(res, error.message);
            }
            const newEventOrderAdd = new EventOrderAdd({
                transactionHash: eventMarketPlace[newIndex].transactionHash,
                orderId: eventMarketPlace[newIndex].args[0],
                seller: eventMarketPlace[newIndex].args[1].toLowerCase(),
                // buyer :eventMarketPlace[newIndex].args[2],
                tokenId: eventMarketPlace[newIndex].args[2],
                paymentToken: eventMarketPlace[newIndex].args[3],
                price: eventMarketPlace[newIndex].args[4],
                status: statusNFT.AUCTION,
                name: nft.name,
                uri: nft.uri,
                auction: data._id
            });
            ///Save event
            newEventOrderAdd.save((error, data) => {
                if (error) {
                    return HttpMethodStatus.badRequest(res, error.message);
                }
            });
        });

        schedule.scheduleJob(endDate, async () => {
            const auction = await Auction.findOne({
                tokenId: eventMarketPlace[newIndex].args[2],
            });
            const sortNFT = auction.listAuction.sort(
                (a, b) => Number(b.price) - Number(a.price)
            );
            // console.log(sortNFT)
            const orderExecute = await EventOrderAdd.findOneAndDelete({
                orderId: eventMarketPlace[newIndex].args[0],
            });
            await NFT.findOneAndUpdate({tokenId: nft.tokenId},{status: statusNFT.ONSTOCK})
            /// nếu không có ai đấu giá 
            if (sortNFT.length === 0) {
                // console.log('Auction end NFT no one auction')
                return HttpMethodStatus.ok(
                    res,
                    "Auction end NFT no one auction",
                    seller
                );
            } else {
                const buyer = sortNFT[0].walletAddress;
                const userBuy = await User.findOne({
                    walletAddress: buyer.toLowerCase(),
                });
                if (!userBuy) {
                    return HttpMethodStatus.badRequest(res, "user not exist");
                }
                await Auction.findOneAndUpdate(
                    { nft: nft._id },
                    { winner: userBuy._id , 
                      timeOutAuction: endDate.getTime() + 86400000
                    });

                const listNFT = await NFT.find({ owner: userBuy._id }).select(
                    "_id tokenId orderId uri name price"
                );
                userBuy.listNFT = listNFT;
                if (!userBuy) {
                    return HttpMethodStatus.badRequest(res, "userBuy not exist");
                }
                // console.log(`Auction end NFT belong to ${buyer.toLowerCase()}`)
                return HttpMethodStatus.ok(
                    res,
                    `Auction end NFT belong to ${buyer.toLowerCase()}`,
                    userBuy
                );
            }
        });
    } catch (error) {
        return HttpMethodStatus.internalServerError(res, error.message);
    }
};
