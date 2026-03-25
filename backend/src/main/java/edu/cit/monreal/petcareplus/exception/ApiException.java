// Custom runtime exception carrying API error code and HTTP status
package edu.cit.monreal.petcareplus.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ApiException extends RuntimeException {
    private final String code;
    private final String details;
    private final HttpStatus status;

    public ApiException(String code, String message, String details, HttpStatus status) {
        super(message);
        this.code = code;
        this.details = details;
        this.status = status;
    }
}

