package ca.backendboys.auctionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAuctionRequest {

    private Long itemId;
    private Long sellerId;
    private int startPrice;
    // same format you already use in Catalogue:
    // "2025-12-05T12:00:00"
    private String endsAt;

    public Long getItemId() {
        return itemId;
    }
    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public Long getSellerId() {
        return sellerId;
    }
    public void setSellerId(Long sellerId) {
        this.sellerId = sellerId;
    }

    public int getStartPrice() {
        return startPrice;
    }
    public void setStartPrice(int startPrice) {
        this.startPrice = startPrice;
    }

    public String getEndsAt() {
        return endsAt;
    }
    public void setEndsAt(String endsAt) {
        this.endsAt = endsAt;
    }
}
