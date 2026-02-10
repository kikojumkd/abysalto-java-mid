package hr.abysalto.hiring.mid.controller;

import hr.abysalto.hiring.mid.dto.response.PaginatedProductResponse;
import hr.abysalto.hiring.mid.dto.response.ProductResponse;
import hr.abysalto.hiring.mid.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Products", description = "Product browsing, search, and favorites management")
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @Operation(summary = "Get all products with pagination and sorting")
    @GetMapping
    public ResponseEntity<PaginatedProductResponse> getProducts(
            @Parameter(description = "Number of products to return") @RequestParam(defaultValue = "20") int limit,
            @Parameter(description = "Number of products to skip") @RequestParam(defaultValue = "0") int skip,
            @Parameter(description = "Field to sort by (e.g., title, price, rating)") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort order: asc or desc") @RequestParam(required = false) String order,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(productService.getProducts(limit, skip, sortBy, order, userDetails.getUsername()));
    }

    @Operation(summary = "Get a single product by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(productService.getProductById(id, userDetails.getUsername()));
    }

    @Operation(summary = "Search products by query")
    @GetMapping("/search")
    public ResponseEntity<PaginatedProductResponse> searchProducts(
            @Parameter(description = "Search query") @RequestParam String q,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int skip,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(productService.searchProducts(q, limit, skip, userDetails.getUsername()));
    }

    @Operation(summary = "Get all favorite products for the current user")
    @GetMapping("/favorites")
    public ResponseEntity<List<ProductResponse>> getFavorites(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(productService.getFavorites(userDetails.getUsername()));
    }

    @Operation(summary = "Add a product to favorites")
    @PostMapping("/{productId}/favorite")
    public ResponseEntity<ProductResponse> addToFavorites(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.addToFavorites(productId, userDetails.getUsername()));
    }

    @Operation(summary = "Remove a product from favorites")
    @DeleteMapping("/{productId}/favorite")
    public ResponseEntity<Void> removeFromFavorites(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails) {
        productService.removeFromFavorites(productId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
