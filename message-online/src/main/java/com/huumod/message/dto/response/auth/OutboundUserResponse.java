package com.huumod.message.dto.response.auth;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OutboundUserResponse {
    String id;
    String email;

    @JsonProperty("verified_email")
    boolean verifiedEmail;

    String name;

    @JsonProperty("given_name")
    String givenName;

    @JsonProperty("family_name")
    String familyName;

    String picture;
    String locale;
}
