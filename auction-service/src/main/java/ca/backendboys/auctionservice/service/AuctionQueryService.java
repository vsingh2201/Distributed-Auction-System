package ca.backendboys.auctionservice.service;



import ca.backendboys.auctionservice.dto.*;
import ca.backendboys.auctionservice.model.*;
import ca.backendboys.auctionservice.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AuctionQueryService {
    private final AuctionRepository auctions;
    private final BidRepository bids;

    public AuctionQueryService(AuctionRepository auctions, BidRepository bids) {
        this.auctions = auctions;
        this.bids = bids;
    }

    public AuctionView getAuctionByItem(Long itemId, Long requesterId) {
        Auction a = auctions.findByItemId(itemId).orElse(null);
        if (a == null) return null;
        boolean payable = a.getStatus() == AuctionStatus.ENDED && requesterId != null
                && requesterId.equals(a.getHighestBidderId());
        return new AuctionView(a.getId(), a.getItemId(), a.getCurrentPrice(), a.getHighestBidderId(),
                a.getStatus().name(), a.getEndTime(), payable);
    }

    public List<Bid> history(Long itemId) {
        Auction a = auctions.findByItemId(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Auction not found"));
        return bids.findByAuctionIdOrderByCreatedAtDesc(a.getId());
    }
}

