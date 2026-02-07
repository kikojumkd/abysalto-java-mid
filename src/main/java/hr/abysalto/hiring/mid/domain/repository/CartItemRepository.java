package hr.abysalto.hiring.mid.domain.repository;

import hr.abysalto.hiring.mid.domain.model.CartItem;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartItemRepository extends CrudRepository<CartItem, Long> {

}
