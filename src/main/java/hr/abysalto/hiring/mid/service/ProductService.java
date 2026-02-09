package hr.abysalto.hiring.mid.service;

import hr.abysalto.hiring.mid.client.DummyJsonClient;
import hr.abysalto.hiring.mid.domain.model.FavoriteProduct;
import hr.abysalto.hiring.mid.domain.model.User;
import hr.abysalto.hiring.mid.domain.repository.FavoriteProductRepository;
import hr.abysalto.hiring.mid.domain.repository.UserRepository;
import hr.abysalto.hiring.mid.dto.response.PaginatedProductResponse;
import hr.abysalto.hiring.mid.dto.response.ProductResponse;
import hr.abysalto.hiring.mid.exception.DuplicateResourceException;
import hr.abysalto.hiring.mid.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final DummyJsonClient dummyJsonClient;
    private final FavoriteProductRepository favoriteProductRepository;
    private final UserRepository userRepository;

    public PaginatedProductResponse getProducts(int limit, int skip, String sortBy, String order, String username) {
        PaginatedProductResponse response = dummyJsonClient.getProducts(limit, skip, sortBy, order);
        enrichWithFavoriteStatus(response.getProducts(), username);
        return response;
    }

    public ProductResponse getProductById(Long id, String username) {
        ProductResponse product = dummyJsonClient.getProductById(id);
        enrichSingleProductWithFavoriteStatus(product, username);
        return product;
    }

    public PaginatedProductResponse searchProducts(String query, int limit, int skip, String username) {
        PaginatedProductResponse response = dummyJsonClient.searchProducts(query, limit, skip);
        enrichWithFavoriteStatus(response.getProducts(), username);
        return response;
    }

    @Transactional
    public ProductResponse addToFavorites(Long productId, String username) {
        User user = getUser(username);

        // Verify product exists in DummyJSON
        ProductResponse product = dummyJsonClient.getProductById(productId);

        if (favoriteProductRepository.findByUserIdAndProductId(user.getUserId(), productId).isPresent()) {
            throw new DuplicateResourceException("Product already in favorites");
        }

        FavoriteProduct favorite = FavoriteProduct.builder()
                .userId(user.getUserId())
                .productId(productId)
                .addedAt(LocalDateTime.now())
                .build();

        favoriteProductRepository.save(favorite);

        product.setFavorited(true);
        return product;
    }

    @Transactional
    public void removeFromFavorites(Long productId, String username) {
        User user = getUser(username);

        favoriteProductRepository.findByUserIdAndProductId(user.getUserId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found in favorites"));

        favoriteProductRepository.deleteByUserIdAndProductId(user.getUserId(), productId);
    }

    public List<ProductResponse> getFavorites(String username) {
        User user = getUser(username);
        List<Long> productIds = favoriteProductRepository.findProductIdsByUserId(user.getUserId());

        return productIds.stream()
                .map(id -> {
                    ProductResponse product = dummyJsonClient.getProductById(id);
                    product.setFavorited(true);
                    return product;
                })
                .toList();
    }

    private void enrichWithFavoriteStatus(List<ProductResponse> products, String username) {
        if (username == null) return;

        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return;

        Set<Long> favoriteIds = favoriteProductRepository.findProductIdsByUserId(user.getUserId())
                .stream()
                .collect(Collectors.toSet());

        products.forEach(product -> product.setFavorited(favoriteIds.contains(product.getId())));
    }

    private void enrichSingleProductWithFavoriteStatus(ProductResponse product, String username) {
        if (username == null) return;

        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return;

        boolean isFavorited = favoriteProductRepository
                .findByUserIdAndProductId(user.getUserId(), product.getId())
                .isPresent();

        product.setFavorited(isFavorited);
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
