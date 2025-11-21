package ca.backendboys.auctionservice.model;



import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "auctions")
public class Auction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "item_id", nullable = false)
    private Long itemId;


    @Column(name = "seller_id", nullable = false)
    private Long sellerId;


    @Column(name = "start_price", nullable = false)
    private Integer startPrice; // integer bids only


    @Column(name = "current_price", nullable = false)
    private Integer currentPrice;


    @Column(name = "highest_bidder_id")
    private Long highestBidderId;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuctionStatus status;


    @Column(name = "start_time", nullable = false)
    private Instant startTime;


    @Column(name = "end_time", nullable = false)
    private Instant endTime;


    @Version
    private Long version;


    public boolean isOpen() { return status == AuctionStatus.OPEN && Instant.now().isBefore(endTime); }
    public void endNow() { this.status = AuctionStatus.ENDED; }



}

