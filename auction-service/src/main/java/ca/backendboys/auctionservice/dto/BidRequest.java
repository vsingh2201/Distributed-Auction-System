package ca.backendboys.auctionservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BidRequest {


    private Long bidderId;
    private Integer amount;

}
