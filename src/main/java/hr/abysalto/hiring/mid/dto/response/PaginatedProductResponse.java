package hr.abysalto.hiring.mid.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginatedProductResponse {

    private List<ProductResponse> products;

    private int total;

    private int skip;

    private int limit;
}
