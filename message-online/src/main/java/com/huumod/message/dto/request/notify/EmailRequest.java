package com.huumod.message.dto.request.notify;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmailRequest {
    String htmlContent;
    Sender sender;
    String subject;
    List<Receptor> to;
}
