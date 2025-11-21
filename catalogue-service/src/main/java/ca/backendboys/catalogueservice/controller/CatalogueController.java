package ca.backendboys.catalogueservice.controller;


import ca.backendboys.catalogueservice.model.Item;
import ca.backendboys.catalogueservice.service.CatalogueService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;


@RestController
@RequestMapping("/catalogue")
public class CatalogueController {
    private final CatalogueService service;

    public CatalogueController(CatalogueService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Item> uploadItem(@RequestBody Item item) {
        return new ResponseEntity<>(service.addItem(item), HttpStatus.CREATED);
    }

    @GetMapping("/search")
    public List<Item> search(@RequestParam("q") String keyword) {
        return service.searchItems(keyword);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> getItem(@PathVariable Long id) {
        return service.getItem(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Item> updateStatus(@PathVariable Long id, @RequestBody Item item) {
        return ResponseEntity.ok(service.updateStatus(id, item.getStatus()));
    }

    @GetMapping("/items/active")
    public List<Item> getActiveItems() {
        return service.getActiveItems();
    }

    @GetMapping("/{id}/shipping")
    public ResponseEntity<Map<String, Object>> getShippingInfo(@PathVariable Long id) {
        return service.getItem(id)
                .map(item -> {
                    Map<String, Object> shipping = new HashMap<>();
                    shipping.put("standardCost", item.getStandardCost());
                    shipping.put("expeditedCost", item.getExpeditedCost());
                    shipping.put("shipInDays", item.getShipInDays());
                    return new ResponseEntity<>(shipping, HttpStatus.OK);
                })
                .orElse(ResponseEntity.notFound().build());
    }

}

