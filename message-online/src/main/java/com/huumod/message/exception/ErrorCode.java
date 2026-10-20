package com.huumod.message.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    INVALID_KEY(1001, "Uncategorized error", HttpStatus.BAD_REQUEST),
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized_exception", HttpStatus.INTERNAL_SERVER_ERROR),
    USER_EXITED(1001, "User exited", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1030, "user name must be at least 3 characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004, "user name must be at least 3 characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXITED(1005, "user not exited", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "unauthenticated", HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED(403, "Access denied", HttpStatus.FORBIDDEN),
    PRODUCT_NOT_FOUND(1001, "Sản phẩm không tồn tại", HttpStatus.NOT_FOUND),
    PRODUCT_SLUG_EXISTED(1002, "Slug sản phẩm đã tồn tại", HttpStatus.BAD_REQUEST),
    PRODUCT_DETAIL_NOT_FOUND(1003, "Biến thể sản phẩm không tồn tại", HttpStatus.NOT_FOUND),
    PRODUCT_DETAIL_SKU_EXISTED(1004, "SKU đã tồn tại", HttpStatus.BAD_REQUEST),
    CATEGORY_NOT_FOUND(1010, "Danh mục không tồn tại", HttpStatus.NOT_FOUND),
    UNAUTHORIZED(403, "Không có quyền truy cập", HttpStatus.FORBIDDEN),
    USER_NOT_FOUND(1006, "user not found", HttpStatus.NOT_FOUND),
    CONVERSATION_NOR_FOUND(1007, "conversation not found", HttpStatus.NOT_FOUND),
    CONVERSATION_CREATE_FAILED(1008, "conversation create failed", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST(1009, "Invalid request", HttpStatus.BAD_REQUEST),
    EMAIL_NOT_SEND(2000, "email not sent", HttpStatus.BAD_REQUEST),
    CONVERSATION_NOT_FOUND(2001, "conversation not found", HttpStatus.NOT_FOUND),
    ;

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}