package com.scms.dto;

import lombok.Data;

@Data
public class ComplaintRequest {
    private String title;
    private String description;
    private String category;
    private Long userId;
}