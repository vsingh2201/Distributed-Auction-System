package ca.backendboys.catalogueservice.service;


import ca.backendboys.catalogueservice.model.Item;
import ca.backendboys.catalogueservice.repository.ItemRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CatalogueService {
    private final ItemRepository repo;

    public CatalogueService(ItemRepository repo) {
        this.repo = repo;
    }

    public Item addItem(Item item) {
        return repo.save(item);
    }

    public List<Item> searchItems(String q) {
        return repo.findByNameContainingIgnoreCaseOrKeywordsContainingIgnoreCase(q, q);
    }

    public Optional<Item> getItem(Long id) {
        return repo.findById(id);
    }

    public Item updateStatus(Long id, String status) {
        Item item = repo.findById(id).orElseThrow();
        item.setStatus(status);
        return repo.save(item);
    }

    public List<Item> getActiveItems() {
        return repo.findByStatus("ACTIVE");
    }
}

