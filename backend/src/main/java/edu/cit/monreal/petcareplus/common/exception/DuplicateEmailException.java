// This exception is thrown when trying to register with an email that already exists
package edu.cit.monreal.petcareplus.common.exception;

public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException(String message) {
        super(message);
    }
}
