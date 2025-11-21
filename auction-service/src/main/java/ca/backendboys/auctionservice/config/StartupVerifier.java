package ca.backendboys.auctionservice.config;


import ca.backendboys.auctionservice.repository.*;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StartupVerifier {
    @Bean
    ApplicationRunner verify(AuctionRepository auctions) {
        return args -> {
            System.out.println("=== Auctions count = " + auctions.count());
            auctions.findAll().forEach(a -> System.out.println(" - itemId=" + a.getItemId() + ", id=" + a.getId()
                    + ", status=" + a.getStatus() + ", price=" + a.getCurrentPrice()));
        };
    }
}

