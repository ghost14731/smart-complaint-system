package com.scms.controller;

import com.scms.model.Complaint;
import com.scms.model.User;
import com.scms.repository.ComplaintRepository;
import com.scms.repository.UserRepository;
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
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ComplaintHistoryRepository historyRepository;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/complaints")
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(complaintRepository.findAll());
    }

    @PutMapping("/complaints/{id}/assign")
    public ResponseEntity<Complaint> assignComplaint(@PathVariable Long id, @RequestParam Long staffId, @RequestParam(required = false) String remarks) {
        Complaint complaint = complaintRepository.findById(id).orElseThrow();
        User staff = userRepository.findById(staffId).orElseThrow();
        if (staff.getRole() != null && staff.getRole().name().equals("STAFF")) {
            complaint.setAssignedStaffId(staffId);
            complaint.setStatus("ASSIGNED");
            Complaint saved = complaintRepository.save(complaint);
            
            Notification notif = new Notification();
            notif.setUserId(complaint.getUserId());
            notif.setMessage("Your complaint #" + complaint.getId() + " has been assigned to a staff member.");
            notif.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(notif);

            ComplaintHistory history = new ComplaintHistory();
            history.setComplaintId(saved.getId());
            history.setChangedByUserId(0L); // System/Admin
            history.setAction("Assigned to Staff #" + staffId);
            history.setRemarks(remarks);
            history.setCreatedAt(LocalDateTime.now());
            historyRepository.save(history);
            
            return ResponseEntity.ok(saved);
        }
        return ResponseEntity.badRequest().build();
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<Complaint> updateComplaintStatus(@PathVariable Long id, @RequestParam String status, @RequestParam(required = false) String remarks) {
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
        history.setChangedByUserId(0L); // System/Admin
        history.setAction("Status updated to " + status);
        history.setRemarks(remarks);
        history.setCreatedAt(LocalDateTime.now());
        historyRepository.save(history);
        
        return ResponseEntity.ok(saved);
    }
}