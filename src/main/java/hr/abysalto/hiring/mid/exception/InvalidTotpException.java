package hr.abysalto.hiring.mid.exception;

public class InvalidTotpException extends RuntimeException {
    public InvalidTotpException(String message) {
        super(message);
    }
}
