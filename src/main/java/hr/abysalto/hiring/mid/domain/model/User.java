package hr.abysalto.hiring.mid.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("USERS")
public class User {

    @Id
    private Long userId;

    private String username;

    private String email;

    private String password;

    private String firstName;

    private String lastName;

    private String totpSecret;

    private boolean twoFactorEnabled;

    private LocalDateTime createdAt;
}
