package ca.backendboys.auctionservice.dto;

import ca.backendboys.auctionservice.model.Auction;
import java.time.Instant;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuctionResponse {

    private Long auctionId;
    private Long itemId;
    private double startPrice;
    private double currentPrice;
    private Long highestBidderId;
    private String status;
    private Instant endsAt;

    public static AuctionResponse from(Auction a) {
        AuctionResponse r = new AuctionResponse();
        r.auctionId = a.getId();
        r.itemId = a.getItemId();
        r.startPrice = a.getStartPrice();
        r.currentPrice = a.getCurrentPrice();
        r.highestBidderId = a.getHighestBidderId();
        r.status = a.getStatus().name();
        r.endsAt = a.getEndTime();
        return r;
    }

    // getters + setters omitted for brevity
}
