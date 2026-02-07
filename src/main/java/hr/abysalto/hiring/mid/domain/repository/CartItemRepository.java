package hr.abysalto.hiring.mid.domain.repository;

import hr.abysalto.hiring.mid.domain.model.CartItem;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends CrudRepository<CartItem, Long> {

    @Query("SELECT * FROM cart_items WHERE user_id = :userId ORDER BY added_at DESC")
    List<CartItem> findByUserId(@Param("userId") Long userId);

    @Query("SELECT * FROM cart_items WHERE user_id = :userId AND product_id = :productId")
    Optional<CartItem> findByUserIdAndProductId(@Param("userId") Long userId,
                                                @Param("productId") Long productId);

    @Modifying
    @Query("DELETE FROM cart_items WHERE cart_item_id = :id AND user_id = :userId")
    void deleteByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM cart_items WHERE user_id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);
}
