package ca.backendboys.auctionservice.dto;

import lombok.*;
import java.time.Instant;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuctionView {
    private Long auctionId;
    private Long itemId;
    private Integer currentPrice;
    private Long highestBidderId;
    private String status;
    private Instant endTime;
    private boolean payable;

}

