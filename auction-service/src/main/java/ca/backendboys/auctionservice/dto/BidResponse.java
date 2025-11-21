package ca.backendboys.auctionservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class BidResponse {
    private Long auctionId;
    private Integer acceptedAmount;
    private Long highestBidderId;


}
