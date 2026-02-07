package hr.abysalto.hiring.mid.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {

    private Long userId;

    private List<CartItemResponse> items;

    private int totalProducts;

    private int totalQuantity;

    private double totalPrice;

    private double totalDiscountedPrice;
}
