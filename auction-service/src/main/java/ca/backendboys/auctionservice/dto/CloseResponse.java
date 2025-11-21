package ca.backendboys.auctionservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CloseResponse {
    private Long auctionId;
    private String status;
    private Long winnerId;
    private Integer winningAmount;

}
