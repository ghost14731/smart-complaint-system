package com.scms.controller;

import com.scms.model.ComplaintHistory;
import com.scms.repository.ComplaintHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/complaints/{complaintId}/history")
public class ComplaintHistoryController {

    @Autowired
    private ComplaintHistoryRepository historyRepository;

    @GetMapping
    public ResponseEntity<List<ComplaintHistory>> getComplaintHistory(@PathVariable Long complaintId) {
        return ResponseEntity.ok(historyRepository.findByComplaintIdOrderByCreatedAtAsc(complaintId));
    }
}
