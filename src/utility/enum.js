const statusNFT = {
    SELLING: 'selling',
    ONSTOCK: 'onStock',
    AUCTION: 'auction',
}

const activityType = {
    LIKE_NFT: 'likeNFT',
    AUCTION_NFT: 'auctionNFT',
}

const event = {
    ADD_ORDER: 'OrderAdded',
    CANCEL_ORDER: 'OrderCancelled',
    MATCH_ORDER: 'OrderMatched',
}

const sortByNFT = {
    LOWEST_PRICE: 'Lowest Price',
    HIGHEST_PRICE: 'Highest Price',
    RECENTLY_SOLD:'Recently Sold',
    MOST_LIKED:"Most Liked",
    MOST_RECENT:"Most Recent",
    OLDEST:"Oldest"
}

const methodTransaction = {
    ADD_ORDER: '0xc46142c5',
    APPROVE: '0x095ea7b3',
    CANCEL_ORDER: '0x514fcac7',
    TRANSFER: '0xa9059cbb',
    MINT_PUBLIC: '0x161ac21f'
}

export  {statusNFT, event,sortByNFT, activityType};
