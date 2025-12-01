package ca.backendboys.paymentservice.dto;


import ca.backendboys.paymentservice.model.ShippingChoice;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class PaymentRequest {
    private Long itemId;
    private Integer userId;
    private ShippingChoice shippingChoice;

    // mock card details for this assignment (never store real PANs in prod)
    private String cardNumber;
    private String cardName;
    private String cardExp; // e.g., "12/29"
    private String cvv;     // e.g., "123"
}

