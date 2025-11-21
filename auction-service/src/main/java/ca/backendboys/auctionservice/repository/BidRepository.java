package ca.backendboys.auctionservice.repository;

import ca.backendboys.auctionservice.model.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;


public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByAuctionIdOrderByCreatedAtDesc(Long auctionId);
}
