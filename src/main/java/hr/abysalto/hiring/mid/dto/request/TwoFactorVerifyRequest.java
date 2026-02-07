package hr.abysalto.hiring.mid.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorVerifyRequest {

    @NotBlank(message = "TOTP code is required")
    private String code;
}
