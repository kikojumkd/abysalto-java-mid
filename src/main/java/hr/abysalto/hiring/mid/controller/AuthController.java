package hr.abysalto.hiring.mid.controller;

import hr.abysalto.hiring.mid.dto.request.LoginRequest;
import hr.abysalto.hiring.mid.dto.request.RegisterRequest;
import hr.abysalto.hiring.mid.dto.request.TwoFactorVerifyRequest;
import hr.abysalto.hiring.mid.dto.response.AuthResponse;
import hr.abysalto.hiring.mid.dto.response.TwoFactorSetupResponse;
import hr.abysalto.hiring.mid.dto.response.UserResponse;
import hr.abysalto.hiring.mid.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Authentication", description = "User registration, login, and 2FA management")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "Register a new user")
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @Operation(summary = "Login with username and password (optionally with TOTP code if 2FA is enabled)")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(summary = "Verify 2FA code during login (when 2FA is enabled)")
    @PostMapping("/2fa/verify")
    public ResponseEntity<AuthResponse> verifyTwoFactor(
            @RequestHeader("X-2FA-Token") String twoFactorToken,
            @Valid @RequestBody TwoFactorVerifyRequest request) {
        return ResponseEntity.ok(authService.verifyTwoFactor(twoFactorToken, request.getCode()));
    }

    @Operation(summary = "Get the currently logged-in user's info")
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(authService.getCurrentUser(userDetails.getUsername()));
    }

    @Operation(summary = "Initiate 2FA setup – returns secret and QR code URI")
    @PostMapping("/2fa/setup")
    public ResponseEntity<TwoFactorSetupResponse> setupTwoFactor(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(authService.setupTwoFactor(userDetails.getUsername()));
    }

    @Operation(summary = "Confirm 2FA setup by verifying a TOTP code")
    @PostMapping("/2fa/confirm")
    public ResponseEntity<AuthResponse> confirmTwoFactorSetup(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TwoFactorVerifyRequest request) {
        return ResponseEntity.ok(authService.confirmTwoFactorSetup(userDetails.getUsername(), request.getCode()));
    }

    @Operation(summary = "Disable 2FA for the current user")
    @DeleteMapping("/2fa")
    public ResponseEntity<Void> disableTwoFactor(@AuthenticationPrincipal UserDetails userDetails) {
        authService.disableTwoFactor(userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
