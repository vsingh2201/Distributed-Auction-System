package ca.backendboys.auctionservice.repository;




import ca.backendboys.auctionservice.model.Auction;
import ca.backendboys.auctionservice.model.AuctionStatus;
import org.springframework.data.jpa.repository.*;
import java.time.Instant;
import java.util.*;



public interface AuctionRepository extends JpaRepository<Auction, Long> {
    Optional<Auction> findByItemId(Long itemId);

    boolean existsByItemId(Long itemId);

    @Query("select a from Auction a where a.status = :status and a.endTime <= :now")
    List<Auction> findAllExpired(AuctionStatus status, Instant now);


}

