package com.scms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;

@Data
@Entity
public class ComplaintHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long complaintId;
    private Long changedByUserId;
    private String action;
    private String remarks;
    private LocalDateTime createdAt;
}
