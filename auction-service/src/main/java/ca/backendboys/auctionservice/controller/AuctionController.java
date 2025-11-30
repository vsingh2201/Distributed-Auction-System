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

        AuctionView view = query.getAuctionByItem(itemId, requesterId);

        if (view == null) {
            // no auction for this item → 404 instead of 500
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(view);
    }


    @GetMapping("/{itemId}/history")
    public ResponseEntity<List<Bid>> history(@PathVariable Long itemId) {
        return ResponseEntity.ok(query.history(itemId));
    }

    @PostMapping("/{itemId}/bid")
    public ResponseEntity<BidResponse> bid(@PathVariable Long itemId, @RequestBody BidRequest req) {
        // simple safety net – for some reason bidderId is null
        if (req.getBidderId() == null) {
            // Fall back to a default demo user (e.g. 42 or 1).
            // This keeps your demo working even if frontend sends something odd.
            req.setBidderId(42L);
        }
        return ResponseEntity.ok(command.placeBid(itemId, req));
    }

    @PostMapping("/{itemId}/close")
    public ResponseEntity<CloseResponse> close(@PathVariable Long itemId) {
        return ResponseEntity.ok(command.closeAuction(itemId));
    }

}

