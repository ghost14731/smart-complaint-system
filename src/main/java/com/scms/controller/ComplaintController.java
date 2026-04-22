package com.scms.controller;

import com.scms.dto.ComplaintRequest;
import com.scms.model.Complaint;
import com.scms.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/complaints")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    @PostMapping
    public ResponseEntity<Complaint> createComplaint(@RequestBody ComplaintRequest request) {
        Complaint complaint = new Complaint();
        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setCategory(request.getCategory());
        complaint.setUserId(request.getUserId());
        return ResponseEntity.ok(complaintService.createComplaint(complaint));
    }

    @GetMapping
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Complaint> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(complaintService.updateStatus(id, status));
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<Complaint> verifyComplaint(@PathVariable Long id, @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(complaintService.verifyComplaint(id, remarks));
    }

    @PutMapping("/{id}/reopen")
    public ResponseEntity<Complaint> reopenComplaint(@PathVariable Long id, @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(complaintService.reopenComplaint(id, remarks));
    }
}