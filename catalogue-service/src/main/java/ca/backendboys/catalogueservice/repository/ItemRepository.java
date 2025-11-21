package ca.backendboys.catalogueservice.repository;

import ca.backendboys.catalogueservice.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByNameContainingIgnoreCaseOrKeywordsContainingIgnoreCase(String name, String keywords);
    List<Item> findByStatus(String status);
}
