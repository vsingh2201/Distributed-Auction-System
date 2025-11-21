package ca.backendboys.catalogueservice.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "items")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemId;

    private String name;
    private String keywords;
    private Double startPrice;
    private LocalDateTime endsAt;
    private String status;

    // shipping info
    private Double standardCost;
    private Double expeditedCost;
    private Integer shipInDays;

    public Long getItemId() {
        return itemId;
    }
    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getKeywords() {
        return keywords;
    }
    public void setKeywords(String keywords) {
        this.keywords = keywords;
    }
    public Double getStartPrice() {
        return startPrice;
    }
    public void setStartPrice(Double startPrice) {
        this.startPrice = startPrice;
    }
    public LocalDateTime getEndsAt() {
        return endsAt;
    }
    public void setEndsAt(LocalDateTime endsAt) {
        this.endsAt = endsAt;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public Double getStandardCost() {
        return standardCost;
    }
    public void setStandardCost(Double standardCost) {
        this.standardCost = standardCost;
    }
    public Double getExpeditedCost() {
        return expeditedCost;
    }
    public void setExpeditedCost(Double expeditedCost) {
        this.expeditedCost = expeditedCost;
    }
    public Integer getShipInDays() {
        return shipInDays;
    }
    public void setShipInDays(Integer shipInDays) {
        this.shipInDays = shipInDays;
    }
}

