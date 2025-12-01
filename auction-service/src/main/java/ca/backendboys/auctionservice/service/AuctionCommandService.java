package ca.backendboys.auctionservice.service;


import ca.backendboys.auctionservice.dto.*;
import ca.backendboys.auctionservice.model.*;
import ca.backendboys.auctionservice.repository.*;
import jakarta.persistence.OptimisticLockException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ca.backendboys.auctionservice.exception.InvalidBidException;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import java.time.Instant;

@Service
public class AuctionCommandService {
    private final AuctionRepository auctions;
    private final BidRepository bids;

    public AuctionCommandService(AuctionRepository auctions, BidRepository bids) {
        this.auctions = auctions;
        this.bids = bids;
    }

    @Transactional
    public BidResponse placeBid(Long itemId, BidRequest req) {
        // 1) Find auction or fail with a clear 400
        Auction a = auctions.findByItemId(itemId)
                .orElseThrow(() -> new InvalidBidException("Auction not found for item " + itemId));

        // 2) Ensure auction is open
        if (!a.isOpen()) {
            throw new InvalidBidException("Auction is not open or already ended.");
        }

        // 3) Validate request amount
        if (req.getAmount() == null || req.getAmount() <= 0) {
            throw new InvalidBidException("Bid amount must be greater than 0.");
        }

        // 4) Determine current effective price (fallback to start price if needed)
        int currentPrice = (a.getCurrentPrice() != null)
                ? a.getCurrentPrice()
                : a.getStartPrice();

        if (req.getAmount() <= currentPrice) {
            throw new InvalidBidException(
                    "Bid must be strictly higher than the current price (" + currentPrice + ")."
            );
        }

        // 5) Validate bidder id
        if (req.getBidderId() == null) {
            throw new InvalidBidException("Bidder id is required.");
        }

        // 6) Persist bid first (history), then update aggregate
        Bid b = new Bid();
        b.setAuctionId(a.getId());
        b.setBidderId(req.getBidderId());
        b.setAmount(req.getAmount());
        bids.save(b);

        // 7) Update current leader (optimistic lock via @Version)
        a.setCurrentPrice(req.getAmount());
        a.setHighestBidderId(req.getBidderId());

        try {
            auctions.saveAndFlush(a);
        } catch (OptimisticLockException e) {
            // Someone else modified the auction between read & write
            throw new InvalidBidException(
                    "Another user just placed a bid. Please refresh and try again."
            );
        }

        return new BidResponse(a.getId(), a.getCurrentPrice(), a.getHighestBidderId());
    }

    @Transactional
    public CloseResponse closeAuction(Long itemId) {
        Auction a = auctions.findByItemId(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Auction not found"));

        if (a.getStatus() == AuctionStatus.ENDED) {
            return new CloseResponse(a.getId(), a.getStatus().name(), a.getHighestBidderId(), a.getCurrentPrice());
        }

        if (Instant.now().isBefore(a.getEndTime()))
            throw new IllegalStateException("Cannot close before end time");

        a.endNow();
        auctions.save(a);

        return new CloseResponse(a.getId(), a.getStatus().name(), a.getHighestBidderId(), a.getCurrentPrice());
    }

    // NEW:
    @Transactional
    public AuctionResponse createAuction(CreateAuctionRequest req) {
        if (auctions.existsByItemId(req.getItemId())) {
            throw new IllegalStateException(
                    "Auction already exists for item " + req.getItemId());
        }

        // Parse "2025-12-05T12:00:00" coming from JSON
        LocalDateTime ldt = LocalDateTime.parse(req.getEndsAt());
        Instant endsAt = ldt.atZone(ZoneOffset.UTC).toInstant();

        Auction a = new Auction();
        a.setItemId(req.getItemId());
        a.setStatus(AuctionStatus.OPEN);
        a.setStartPrice(req.getStartPrice());
        a.setCurrentPrice(req.getStartPrice());
        a.setEndTime(endsAt);

        Auction saved = auctions.save(a);
        return AuctionResponse.from(saved);
    }

}

