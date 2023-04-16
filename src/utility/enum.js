const statusNFT = {
    SELLING: 'selling',
    ONSTOCK: 'onStock',
    AUCTION: 'auction',
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

export  {statusNFT, event,sortByNFT};
