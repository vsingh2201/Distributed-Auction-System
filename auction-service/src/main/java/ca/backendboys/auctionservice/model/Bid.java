package ca.backendboys.auctionservice.model;


import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "bids")
public class Bid {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "auction_id", nullable = false)
    private Long auctionId;


    @Column(name = "bidder_id", nullable = false)
    private Long bidderId;


    @Column(name = "amount", nullable = false)
    private Integer amount; // integer


    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();


// getters/setters
}

