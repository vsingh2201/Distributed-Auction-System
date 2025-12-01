-- data.sql
DELETE FROM bids;
DELETE FROM auctions;

----------------------------------------------------------------
-- Auction 1: OPEN, no bids yet
----------------------------------------------------------------
INSERT INTO auctions (
  item_id, seller_id, start_price, current_price, highest_bidder_id,
  status, start_time, end_time, version
) VALUES (
  1, 7, 500, 500, NULL,
  'OPEN', DATETIME('now','-5 minutes'), DATETIME('now','+15 minutes'), 0
);

----------------------------------------------------------------
-- Auction2: OPEN, with bid history
----------------------------------------------------------------
INSERT INTO auctions (
  item_id, seller_id, start_price, current_price, highest_bidder_id,
  status, start_time, end_time, version
) VALUES (
  2, 8, 600, 750, 42,
  'OPEN', DATETIME('now','-30 minutes'), DATETIME('now','+5 minutes'), 0
);

-- Bids for A2
INSERT INTO bids (auction_id, bidder_id, amount, created_at)
SELECT a.id, 11, 620, DATETIME('now','-20 minutes')
FROM auctions a WHERE a.item_id = 101;

INSERT INTO bids (auction_id, bidder_id, amount, created_at)
SELECT a.id, 12, 700, DATETIME('now','-15 minutes')
FROM auctions a WHERE a.item_id = 101;

INSERT INTO bids (auction_id, bidder_id, amount, created_at)
SELECT a.id, 42, 750, DATETIME('now','-10 minutes')
FROM auctions a WHERE a.item_id = 101;

----------------------------------------------------------------
-- Auction 3: ENDED, winner decided
----------------------------------------------------------------
INSERT INTO auctions (
  item_id, seller_id, start_price, current_price, highest_bidder_id,
  status, start_time, end_time, version
) VALUES (
  3, 9, 1000, 1300, 55,
  'ENDED', DATETIME('now','-90 minutes'), DATETIME('now','-10 minutes'), 0
);

-- Bids for A3 (ended)
INSERT INTO bids (auction_id, bidder_id, amount, created_at)
SELECT a.id, 51, 1100, DATETIME('now','-70 minutes')
FROM auctions a WHERE a.item_id = 102;

INSERT INTO bids (auction_id, bidder_id, amount, created_at)
SELECT a.id, 54, 1250, DATETIME('now','-50 minutes')
FROM auctions a WHERE a.item_id = 102;

INSERT INTO bids (auction_id, bidder_id, amount, created_at)
SELECT a.id, 55, 1300, DATETIME('now','-40 minutes')
FROM auctions a WHERE a.item_id = 102;

----------------------------------------------------------------
-- Auction 4: OPEN
----------------------------------------------------------------
INSERT INTO auctions (
  item_id, seller_id, start_price, current_price, highest_bidder_id,
  status, start_time, end_time, version
) VALUES (
  4, 10, 50, 50, NULL,
  'OPEN', DATETIME('now','-2 minutes'), DATETIME('now','+2 minutes'), 0
);

----------------------------------------------------------------
-- Auction 5: PENDING (not open yet; attempts to bid should fail)
----------------------------------------------------------------
INSERT INTO auctions (
  item_id, seller_id, start_price, current_price, highest_bidder_id,
  status, start_time, end_time, version
) VALUES (
  5, 11, 200, 200, NULL,
  'PENDING', DATETIME('now'), DATETIME('now','+30 minutes'), 0
);

----------------------------------------------------------------
-- Auction 6: CANCELLED (cannot bid)
----------------------------------------------------------------
INSERT INTO auctions (
  item_id, seller_id, start_price, current_price, highest_bidder_id,
  status, start_time, end_time, version
) VALUES (
  6, 12, 300, 300, NULL,
  'CANCELLED', DATETIME('now','-10 minutes'), DATETIME('now','+20 minutes'), 0
);