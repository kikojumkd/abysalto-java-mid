package hr.abysalto.hiring.mid.domain.repository;

import hr.abysalto.hiring.mid.domain.model.FavoriteProduct;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteProductRepository extends CrudRepository<FavoriteProduct, Long> {

    @Query("SELECT * FROM favorite_products WHERE user_id = :userId ORDER BY added_at DESC")
    List<FavoriteProduct> findByUserId(@Param("userId") Long userId);

    @Query("SELECT * FROM favorite_products WHERE user_id = :userId AND product_id = :productId")
    Optional<FavoriteProduct> findByUserIdAndProductId(@Param("userId") Long userId,
                                                       @Param("productId") Long productId);

    @Modifying
    @Query("DELETE FROM favorite_products WHERE user_id = :userId AND product_id = :productId")
    void deleteByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);

    @Query("SELECT product_id FROM favorite_products WHERE user_id = :userId")
    List<Long> findProductIdsByUserId(@Param("userId") Long userId);
}
