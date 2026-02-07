package hr.abysalto.hiring.mid.domain.repository;

import hr.abysalto.hiring.mid.domain.model.FavoriteProduct;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FavoriteProductRepository extends CrudRepository<FavoriteProduct, Long> {

}
