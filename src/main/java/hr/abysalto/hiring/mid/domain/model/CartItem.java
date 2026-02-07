package hr.abysalto.hiring.mid.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("CART_ITEMS")
public class CartItem {

    @Id
    private Long cartItemId;

    private Long userId;

    private Long productId;

    private int quantity;

    private LocalDateTime addedAt;
}
