const statusNFT = {
  SELLING: "selling",
  ONSTOCK: "onStock",
  AUCTION: "auction",
};

const activityType = {
  LIKE_NFT: "likeNFT",
  AUCTION_NFT: "auctionNFT",
};

const event = {
  ADD_ORDER: "OrderAdded",
  CANCEL_ORDER: "OrderCancelled",
  MATCH_ORDER: "OrderMatched",
};

const sortByNFT = {
  LOWEST_PRICE: "Lowest Price",
  HIGHEST_PRICE: "Highest Price",
  RECENTLY_SOLD: "Recently Sold",
  MOST_LIKED: "Most Liked",
  MOST_RECENT: "Most Recent",
  OLDEST: "Oldest",
};

const tagsNFT = {
  WEAPON: "weapon",
  ANIMAL: "animal",
  POTION: "potion",
  JEWELRY: "jewelry",
};

const subTagsNFT = {
  SWORD: "sword",
  ARMOR: "armor",
  BOW: "bow",
  CROWN: "crown",
  DRAGON: "dragon",
  HEAL_POTION: "heal_potion",
  MANA_POTION: "mana_potion",
  HORSE: "horse",
  KNIFE: "knife",
  RING: "ring",
  SHIELD: "shield",
};

const catalystType = {
  COMMON: "common",
  RARE: "rare",
  EPIC: "epic",
  LEGENDARY: "legendary",
};

const address = {
  ADDRESS_MERKETPLACE: "0x898256E72bF11AeA2D2c8D1275F644a2Db78AA91",
  ADDRESS_NNG_TOKEN: "0x006B385edB7B58037Dba2796b122871B3208C03f",
  ADDRESS_NFT: "0x2e09D13B2bF47D280d9dfde93aBC8c07D0fd4fDa",
};

const maximumWalletList = 3

export {
  statusNFT,
  event,
  sortByNFT,
  activityType,
  tagsNFT,
  subTagsNFT,
  catalystType,
  address,
  maximumWalletList,
};
