package ca.backendboys.auctionservice.controller;

import ca.backendboys.auctionservice.dto.*;
import ca.backendboys.auctionservice.service.*;
import ca.backendboys.auctionservice.model.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/auctions")
public class AuctionController {
    private final AuctionCommandService command;
    private final AuctionQueryService query;

    public AuctionController(AuctionCommandService command, AuctionQueryService query) {
        this.command = command;
        this.query = query;
    }

    @GetMapping("/{itemId}")
    public ResponseEntity<AuctionView> get(@PathVariable Long itemId,
                                           @RequestParam(required = false) Long requesterId) {
        return ResponseEntity.ok(query.getAuctionByItem(itemId, requesterId));
    }

    @GetMapping("/{itemId}/history")
    public ResponseEntity<List<Bid>> history(@PathVariable Long itemId) {
        return ResponseEntity.ok(query.history(itemId));
    }

    @PostMapping("/{itemId}/bid")
    public ResponseEntity<BidResponse> bid(@PathVariable Long itemId, @RequestBody BidRequest req) {
        return ResponseEntity.ok(command.placeBid(itemId, req));
    }

    @PostMapping("/{itemId}/close")
    public ResponseEntity<CloseResponse> close(@PathVariable Long itemId) {
        return ResponseEntity.ok(command.closeAuction(itemId));
    }

}

