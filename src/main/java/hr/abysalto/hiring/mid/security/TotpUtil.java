package hr.abysalto.hiring.mid.security;

import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

/**
 * Time-based One-Time Password (TOTP) utility implementing RFC 6238.
 * Uses HMAC-SHA1 with a 30-second time step and 6-digit codes.
 */
@Component
public class TotpUtil {

    private static final int TIME_STEP_SECONDS = 30;
    private static final int CODE_DIGITS = 6;
    private static final int SECRET_LENGTH = 20;
    private static final String ALGORITHM = "HmacSHA1";
    private static final String ISSUER = "AbysaltoMidApp";

    public String generateSecret() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[SECRET_LENGTH];
        random.nextBytes(bytes);
        return Base32.encode(bytes);
    }

    public String generateOtpAuthUri(String secret, String username) {
        String encodedIssuer = URLEncoder.encode(ISSUER, StandardCharsets.UTF_8);
        String encodedUsername = URLEncoder.encode(username, StandardCharsets.UTF_8);
        return String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=%d&period=%d",
                encodedIssuer, encodedUsername, secret, encodedIssuer, CODE_DIGITS, TIME_STEP_SECONDS);
    }

    public boolean verifyCode(String secret, String code) {
        if (code == null || code.length() != CODE_DIGITS) {
            return false;
        }

        long currentTimeStep = System.currentTimeMillis() / 1000 / TIME_STEP_SECONDS;

        // Allow 1 step before and after for clock skew tolerance
        for (int i = -1; i <= 1; i++) {
            String generatedCode = generateCode(secret, currentTimeStep + i);
            if (generatedCode.equals(code)) {
                return true;
            }
        }
        return false;
    }

    private String generateCode(String secret, long timeStep) {
        try {
            byte[] keyBytes = Base32.decode(secret);
            byte[] timeBytes = ByteBuffer.allocate(8).putLong(timeStep).array();

            Mac mac = Mac.getInstance(ALGORITHM);
            mac.init(new SecretKeySpec(keyBytes, ALGORITHM));
            byte[] hash = mac.doFinal(timeBytes);

            int offset = hash[hash.length - 1] & 0x0F;
            int binary = ((hash[offset] & 0x7F) << 24)
                    | ((hash[offset + 1] & 0xFF) << 16)
                    | ((hash[offset + 2] & 0xFF) << 8)
                    | (hash[offset + 3] & 0xFF);

            int otp = binary % (int) Math.pow(10, CODE_DIGITS);
            return String.format("%0" + CODE_DIGITS + "d", otp);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error generating TOTP code", e);
        }
    }

    /**
     * Minimal Base32 encoder/decoder (RFC 4648) to avoid external dependencies.
     */
    private static class Base32 {
        private static final String ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

        static String encode(byte[] data) {
            StringBuilder result = new StringBuilder();
            int buffer = 0;
            int bitsLeft = 0;

            for (byte b : data) {
                buffer = (buffer << 8) | (b & 0xFF);
                bitsLeft += 8;
                while (bitsLeft >= 5) {
                    result.append(ALPHABET.charAt((buffer >> (bitsLeft - 5)) & 0x1F));
                    bitsLeft -= 5;
                }
            }

            if (bitsLeft > 0) {
                result.append(ALPHABET.charAt((buffer << (5 - bitsLeft)) & 0x1F));
            }

            return result.toString();
        }

        static byte[] decode(String encoded) {
            encoded = encoded.toUpperCase().replaceAll("[=\\s]", "");
            int outputLength = encoded.length() * 5 / 8;
            byte[] result = new byte[outputLength];

            int buffer = 0;
            int bitsLeft = 0;
            int index = 0;

            for (char c : encoded.toCharArray()) {
                int val = ALPHABET.indexOf(c);
                if (val < 0) {
                    throw new IllegalArgumentException("Invalid Base32 character: " + c);
                }
                buffer = (buffer << 5) | val;
                bitsLeft += 5;
                if (bitsLeft >= 8) {
                    result[index++] = (byte) (buffer >> (bitsLeft - 8));
                    bitsLeft -= 8;
                }
            }

            return result;
        }
    }
}
