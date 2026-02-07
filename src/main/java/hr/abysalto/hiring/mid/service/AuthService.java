package hr.abysalto.hiring.mid.service;

import hr.abysalto.hiring.mid.domain.model.User;
import hr.abysalto.hiring.mid.domain.repository.UserRepository;
import hr.abysalto.hiring.mid.dto.request.LoginRequest;
import hr.abysalto.hiring.mid.dto.request.RegisterRequest;
import hr.abysalto.hiring.mid.dto.response.AuthResponse;
import hr.abysalto.hiring.mid.dto.response.TwoFactorSetupResponse;
import hr.abysalto.hiring.mid.dto.response.UserResponse;
import hr.abysalto.hiring.mid.exception.DuplicateResourceException;
import hr.abysalto.hiring.mid.exception.InvalidTotpException;
import hr.abysalto.hiring.mid.exception.ResourceNotFoundException;
import hr.abysalto.hiring.mid.security.JwtUtil;
import hr.abysalto.hiring.mid.security.TotpUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final TotpUtil totpUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       TotpUtil totpUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.totpUtil = totpUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username already exists: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists: " + request.getEmail());
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .twoFactorEnabled(false)
                .createdAt(LocalDateTime.now())
                .build();

        user = userRepository.save(user);

        String token = jwtUtil.generateAccessToken(user.getUsername(), Map.of("userId", user.getUserId()));

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .message("Registration successful")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        // If 2FA is enabled, require TOTP code
        if (user.isTwoFactorEnabled()) {
            if (request.getTotpCode() == null || request.getTotpCode().isBlank()) {
                // Return a temporary 2FA token so the client can submit the code
                String twoFactorToken = jwtUtil.generateTwoFactorToken(user.getUsername());
                return AuthResponse.builder()
                        .twoFactorRequired(true)
                        .twoFactorToken(twoFactorToken)
                        .message("Two-factor authentication code required")
                        .build();
            }

            if (!totpUtil.verifyCode(user.getTotpSecret(), request.getTotpCode())) {
                throw new InvalidTotpException("Invalid two-factor authentication code");
            }
        }

        String token = jwtUtil.generateAccessToken(user.getUsername(), Map.of("userId", user.getUserId()));

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .message("Login successful")
                .build();
    }

    public AuthResponse verifyTwoFactor(String twoFactorToken, String code) {
        if (!jwtUtil.isTokenValid(twoFactorToken) || !jwtUtil.isTwoFactorToken(twoFactorToken)) {
            throw new InvalidTotpException("Invalid or expired two-factor token");
        }

        String username = jwtUtil.extractUsername(twoFactorToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!totpUtil.verifyCode(user.getTotpSecret(), code)) {
            throw new InvalidTotpException("Invalid two-factor authentication code");
        }

        String token = jwtUtil.generateAccessToken(user.getUsername(), Map.of("userId", user.getUserId()));

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .message("Two-factor authentication successful")
                .build();
    }

    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        return toUserResponse(user);
    }

    @Transactional
    public TwoFactorSetupResponse setupTwoFactor(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String secret = totpUtil.generateSecret();
        user.setTotpSecret(secret);
        userRepository.save(user);

        String otpAuthUri = totpUtil.generateOtpAuthUri(secret, username);

        return TwoFactorSetupResponse.builder()
                .secret(secret)
                .qrCodeUri(otpAuthUri)
                .message("Scan the QR code or enter the secret manually in your authenticator app. "
                        + "Then verify with a code to enable 2FA.")
                .build();
    }

    @Transactional
    public AuthResponse confirmTwoFactorSetup(String username, String code) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getTotpSecret() == null) {
            throw new IllegalArgumentException("Two-factor setup not initiated. Call setup endpoint first.");
        }

        if (!totpUtil.verifyCode(user.getTotpSecret(), code)) {
            throw new InvalidTotpException("Invalid code. Please try again.");
        }

        user.setTwoFactorEnabled(true);
        userRepository.save(user);

        String token = jwtUtil.generateAccessToken(user.getUsername(), Map.of("userId", user.getUserId()));

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .message("Two-factor authentication enabled successfully")
                .build();
    }

    @Transactional
    public void disableTwoFactor(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setTwoFactorEnabled(false);
        user.setTotpSecret(null);
        userRepository.save(user);
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .twoFactorEnabled(user.isTwoFactorEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
