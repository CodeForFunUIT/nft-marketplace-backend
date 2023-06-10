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

const tagsNFT = {
    WEAPON: 'weapon',
    ANIMAL: 'animal',
    POTION: 'potion',
    JEWELRY: 'jewelry',
}

const subTagsNFT = {
    SWORD: 'sword',
    ARMOR: 'armor',
    BOW: 'bow',
    CROWN: 'crown',
    DRAGON: 'dragon',
    HEAL_POTION: 'heal_potion',
    MANA_POTION: 'mana_potion',
    HORSE: 'horse',
    KNIFE: 'knife',
    RING: 'ring',
    SHIELD: 'shield',
}

const catalystType = {
    COMMON: 'common',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary'
}

export  {statusNFT, event,sortByNFT, activityType ,tagsNFT, subTagsNFT, catalystType};
