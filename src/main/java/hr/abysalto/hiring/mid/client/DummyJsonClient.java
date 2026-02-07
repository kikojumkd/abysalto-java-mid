package hr.abysalto.hiring.mid.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import hr.abysalto.hiring.mid.dto.response.PaginatedProductResponse;
import hr.abysalto.hiring.mid.dto.response.ProductResponse;
import hr.abysalto.hiring.mid.exception.ExternalApiException;
import hr.abysalto.hiring.mid.exception.ResourceNotFoundException;
import io.netty.channel.ChannelOption;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;

import java.time.Duration;
import java.util.List;

@Component
public class DummyJsonClient {

    private static final Logger log = LoggerFactory.getLogger(DummyJsonClient.class);
    private final WebClient webClient;

    public DummyJsonClient(@Value("${dummyjson.base-url}") String baseUrl) {
        ConnectionProvider provider = ConnectionProvider.builder("dummyjson")
                .maxIdleTime(Duration.ofSeconds(30))
                .maxLifeTime(Duration.ofMinutes(5))
                .evictInBackground(Duration.ofSeconds(30))
                .build();

        HttpClient httpClient = HttpClient.create(provider)
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5000)
                .responseTimeout(Duration.ofSeconds(10));

        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }

    @Cacheable(value = "products", key = "'all_' + #limit + '_' + #skip + '_' + #sortBy + '_' + #order")
    public PaginatedProductResponse getProducts(int limit, int skip, String sortBy, String order) {
        log.debug("Fetching products from DummyJSON API: limit={}, skip={}, sortBy={}, order={}", limit, skip, sortBy, order);

        try {
            DummyJsonProductListResponse response = webClient.get()
                    .uri(uriBuilder -> {
                        uriBuilder.path("/products");
                        uriBuilder.queryParam("limit", limit);
                        uriBuilder.queryParam("skip", skip);
                        if (sortBy != null && !sortBy.isBlank()) {
                            uriBuilder.queryParam("sortBy", sortBy);
                        }
                        if (order != null && !order.isBlank()) {
                            uriBuilder.queryParam("order", order);
                        }
                        return uriBuilder.build();
                    })
                    .retrieve()
                    .bodyToMono(DummyJsonProductListResponse.class)
                    .block();

            if (response == null) {
                throw new ExternalApiException("Received null response from DummyJSON");
            }

            List<ProductResponse> products = response.getProducts().stream()
                    .map(this::mapToProductResponse)
                    .toList();

            return PaginatedProductResponse.builder()
                    .products(products)
                    .total(response.getTotal())
                    .skip(response.getSkip())
                    .limit(response.getLimit())
                    .build();
        } catch (WebClientResponseException e) {
            throw new ExternalApiException("DummyJSON API error: " + e.getStatusCode(), e);
        }
    }

    @Cacheable(value = "product", key = "#id")
    public ProductResponse getProductById(Long id) {
        log.debug("Fetching product {} from DummyJSON API", id);

        try {
            DummyJsonProduct product = webClient.get()
                    .uri("/products/{id}", id)
                    .retrieve()
                    .bodyToMono(DummyJsonProduct.class)
                    .block();

            if (product == null) {
                throw new ResourceNotFoundException("Product not found with id: " + id);
            }

            return mapToProductResponse(product);
        } catch (WebClientResponseException.NotFound e) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        } catch (WebClientResponseException e) {
            throw new ExternalApiException("DummyJSON API error: " + e.getStatusCode(), e);
        }
    }

    @Cacheable(value = "products", key = "'search_' + #query + '_' + #limit + '_' + #skip")
    public PaginatedProductResponse searchProducts(String query, int limit, int skip) {
        log.debug("Searching products from DummyJSON API: query={}", query);

        try {
            DummyJsonProductListResponse response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/products/search")
                            .queryParam("q", query)
                            .queryParam("limit", limit)
                            .queryParam("skip", skip)
                            .build())
                    .retrieve()
                    .bodyToMono(DummyJsonProductListResponse.class)
                    .block();

            if (response == null) {
                throw new ExternalApiException("Received null response from DummyJSON");
            }

            List<ProductResponse> products = response.getProducts().stream()
                    .map(this::mapToProductResponse)
                    .toList();

            return PaginatedProductResponse.builder()
                    .products(products)
                    .total(response.getTotal())
                    .skip(response.getSkip())
                    .limit(response.getLimit())
                    .build();
        } catch (WebClientResponseException e) {
            throw new ExternalApiException("DummyJSON API error: " + e.getStatusCode(), e);
        }
    }

    private ProductResponse mapToProductResponse(DummyJsonProduct product) {
        return ProductResponse.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .category(product.getCategory())
                .price(product.getPrice())
                .discountPercentage(product.getDiscountPercentage())
                .rating(product.getRating())
                .stock(product.getStock())
                .brand(product.getBrand())
                .thumbnail(product.getThumbnail())
                .images(product.getImages())
                .build();
    }

    // Internal DummyJSON API response models

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    static class DummyJsonProductListResponse {
        private List<DummyJsonProduct> products;
        private int total;
        private int skip;
        private int limit;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    static class DummyJsonProduct {
        private Long id;
        private String title;
        private String description;
        private String category;
        private double price;
        private double discountPercentage;
        private double rating;
        private int stock;
        private String brand;
        private String thumbnail;
        private List<String> images;
    }
}