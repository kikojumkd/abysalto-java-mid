package hr.abysalto.hiring.mid.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductResponse {

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

    private boolean favorited;
}
