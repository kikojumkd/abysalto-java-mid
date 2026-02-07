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
@Table("FAVORITE_PRODUCTS")
public class FavoriteProduct {

    @Id
    private Long favoriteId;

    private Long userId;

    private Long productId;

    private LocalDateTime addedAt;
}
