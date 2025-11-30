package ca.backendboys.auctionservice.service;


import ca.backendboys.auctionservice.dto.*;
import ca.backendboys.auctionservice.model.*;
import ca.backendboys.auctionservice.repository.*;
import jakarta.persistence.OptimisticLockException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        Auction a = auctions.findByItemId(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Auction not found for item " + itemId));

        if (!a.isOpen())
            throw new IllegalStateException("Auction is not open or already ended");
        if (req.getAmount() <= a.getCurrentPrice())
            throw new IllegalArgumentException("Bid must be strictly greater than current price");

        // Persist bid first (history), then update aggregate
        Bid b = new Bid();
        b.setAuctionId(a.getId());
        b.setBidderId(req.getBidderId());
        b.setAmount(req.getAmount());

        // THIS is important:
        b.setBidderId(req.getBidderId());
        if (b.getBidderId() == null) {
            b.setBidderId(42L); // same fallback as above
        }
        bids.save(b);

        // Update current leader (optimistic lock via @Version)
        a.setCurrentPrice(req.getAmount());
        a.setHighestBidderId(req.getBidderId());
        try {
            auctions.saveAndFlush(a);
        } catch (OptimisticLockException e) {
            throw new IllegalStateException("Concurrent bid detected; please retry");
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

}

