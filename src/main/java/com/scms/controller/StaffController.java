package com.scms.controller;

import com.scms.model.Complaint;
import com.scms.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDateTime;
import com.scms.model.Notification;
import com.scms.model.ComplaintHistory;
import com.scms.repository.NotificationRepository;
import com.scms.repository.ComplaintHistoryRepository;

@RestController
@RequestMapping("/staff")
public class StaffController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ComplaintHistoryRepository historyRepository;

    @GetMapping("/complaints")
    public ResponseEntity<List<Complaint>> getAssignedComplaints(@RequestParam Long staffId) {
        return ResponseEntity.ok(complaintRepository.findByAssignedStaffId(staffId));
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<Complaint> updateStatus(@PathVariable Long id, @RequestParam String status, @RequestParam(required = false) String remarks) {
        Complaint complaint = complaintRepository.findById(id).orElseThrow();
        complaint.setStatus(status);
        Complaint saved = complaintRepository.save(complaint);
        
        Notification notif = new Notification();
        notif.setUserId(complaint.getUserId());
        notif.setMessage("The status of your complaint #" + complaint.getId() + " has been updated to: " + status);
        notif.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notif);

        ComplaintHistory history = new ComplaintHistory();
        history.setComplaintId(saved.getId());
        history.setChangedByUserId(complaint.getAssignedStaffId());
        history.setAction("Status updated to " + status);
        history.setRemarks(remarks);
        history.setCreatedAt(LocalDateTime.now());
        historyRepository.save(history);
        
        return ResponseEntity.ok(saved);
    }
}