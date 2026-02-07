package hr.abysalto.hiring.mid.service;

import hr.abysalto.hiring.mid.client.DummyJsonClient;
import hr.abysalto.hiring.mid.domain.model.CartItem;
import hr.abysalto.hiring.mid.domain.model.User;
import hr.abysalto.hiring.mid.domain.repository.CartItemRepository;
import hr.abysalto.hiring.mid.domain.repository.UserRepository;
import hr.abysalto.hiring.mid.dto.request.CartItemRequest;
import hr.abysalto.hiring.mid.dto.response.CartItemResponse;
import hr.abysalto.hiring.mid.dto.response.CartResponse;
import hr.abysalto.hiring.mid.dto.response.ProductResponse;
import hr.abysalto.hiring.mid.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final DummyJsonClient dummyJsonClient;

    public CartService(CartItemRepository cartItemRepository,
                       UserRepository userRepository,
                       DummyJsonClient dummyJsonClient) {
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.dummyJsonClient = dummyJsonClient;
    }

    public CartResponse getCart(String username) {
        User user = getUser(username);
        List<CartItem> cartItems = cartItemRepository.findByUserId(user.getUserId());
        return buildCartResponse(user.getUserId(), cartItems);
    }

    @Transactional
    public CartResponse addToCart(CartItemRequest request, String username) {
        User user = getUser(username);

        // Verify product exists in DummyJSON
        dummyJsonClient.getProductById(request.getProductId());

        Optional<CartItem> existing = cartItemRepository.findByUserIdAndProductId(user.getUserId(), request.getProductId());

        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);
        } else {
            CartItem cartItem = CartItem.builder()
                    .userId(user.getUserId())
                    .productId(request.getProductId())
                    .quantity(request.getQuantity())
                    .addedAt(LocalDateTime.now())
                    .build();
            cartItemRepository.save(cartItem);
        }

        return getCart(username);
    }

    @Transactional
    public CartResponse removeFromCart(Long cartItemId, String username) {
        User user = getUser(username);

        cartItemRepository.findById(cartItemId)
                .filter(item -> item.getUserId().equals(user.getUserId()))
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        cartItemRepository.deleteByIdAndUserId(cartItemId, user.getUserId());
        return getCart(username);
    }

    @Transactional
    public CartResponse updateCartItemQuantity(Long cartItemId, int quantity, String username) {
        User user = getUser(username);

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .filter(item -> item.getUserId().equals(user.getUserId()))
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (quantity <= 0) {
            cartItemRepository.deleteByIdAndUserId(cartItemId, user.getUserId());
        } else {
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }

        return getCart(username);
    }

    @Transactional
    public void clearCart(String username) {
        User user = getUser(username);
        cartItemRepository.deleteAllByUserId(user.getUserId());
    }

    private CartResponse buildCartResponse(Long userId, List<CartItem> cartItems) {
        List<CartItemResponse> items = cartItems.stream()
                .map(this::toCartItemResponse)
                .toList();

        double totalPrice = items.stream().mapToDouble(CartItemResponse::getTotal).sum();
        double totalDiscountedPrice = items.stream().mapToDouble(CartItemResponse::getDiscountedTotal).sum();
        int totalQuantity = items.stream().mapToInt(CartItemResponse::getQuantity).sum();

        return CartResponse.builder()
                .userId(userId)
                .items(items)
                .totalProducts(items.size())
                .totalQuantity(totalQuantity)
                .totalPrice(Math.round(totalPrice * 100.0) / 100.0)
                .totalDiscountedPrice(Math.round(totalDiscountedPrice * 100.0) / 100.0)
                .build();
    }

    private CartItemResponse toCartItemResponse(CartItem cartItem) {
        ProductResponse product = dummyJsonClient.getProductById(cartItem.getProductId());

        double total = product.getPrice() * cartItem.getQuantity();
        double discountedTotal = total * (1 - product.getDiscountPercentage() / 100.0);

        return CartItemResponse.builder()
                .cartItemId(cartItem.getCartItemId())
                .productId(cartItem.getProductId())
                .title(product.getTitle())
                .price(product.getPrice())
                .quantity(cartItem.getQuantity())
                .total(Math.round(total * 100.0) / 100.0)
                .discountPercentage(product.getDiscountPercentage())
                .discountedTotal(Math.round(discountedTotal * 100.0) / 100.0)
                .thumbnail(product.getThumbnail())
                .build();
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
