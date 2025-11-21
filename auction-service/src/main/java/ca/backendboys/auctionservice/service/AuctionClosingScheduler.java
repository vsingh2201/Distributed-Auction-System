package ca.backendboys.auctionservice.service;



import ca.backendboys.auctionservice.model.*;
import ca.backendboys.auctionservice.repository.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;

public class AuctionClosingScheduler {
    private final AuctionRepository auctions;

    public AuctionClosingScheduler(AuctionRepository auctions) {
        this.auctions = auctions;
    }

    // Every 30 seconds, end overdue auctions
    @Scheduled(fixedDelay = 30000)
    public void autoClose() {
        for (Auction a : auctions.findAllExpired(AuctionStatus.OPEN, Instant.now())) {
            a.endNow();
            auctions.save(a);
        }
    }

}

