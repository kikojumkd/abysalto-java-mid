package hr.abysalto.hiring.mid.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {

    private Long cartItemId;

    private Long productId;

    private String title;

    private double price;

    private int quantity;

    private double total;

    private double discountPercentage;

    private double discountedTotal;

    private String thumbnail;
}
