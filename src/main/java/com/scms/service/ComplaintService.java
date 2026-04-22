package com.scms.service;

import com.scms.model.Complaint;
import com.scms.model.ComplaintHistory;
import com.scms.repository.ComplaintRepository;
import com.scms.repository.ComplaintHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ComplaintService {

    @Autowired
    private ComplaintRepository repository;

    @Autowired
    private ComplaintHistoryRepository historyRepository;

    public Complaint createComplaint(Complaint complaint) {
        complaint.setStatus("PENDING");
        complaint.setCreatedAt(LocalDateTime.now());
        Complaint saved = repository.save(complaint);
        
        ComplaintHistory history = new ComplaintHistory();
        history.setComplaintId(saved.getId());
        history.setChangedByUserId(saved.getUserId());
        history.setAction("Complaint Submitted");
        history.setRemarks("Initial submission");
        history.setCreatedAt(LocalDateTime.now());
        historyRepository.save(history);
        
        return saved;
    }

    public List<Complaint> getAllComplaints() {
        return repository.findAll();
    }

    public Complaint updateStatus(Long id, String status) {
        Complaint c = repository.findById(id).orElseThrow();
        c.setStatus(status);
        return repository.save(c);
    }

    public Complaint verifyComplaint(Long id, String remarks) {
        Complaint c = repository.findById(id).orElseThrow();
        c.setStatus("CLOSED");
        Complaint saved = repository.save(c);

        ComplaintHistory history = new ComplaintHistory();
        history.setComplaintId(id);
        history.setChangedByUserId(c.getUserId());
        history.setAction("Resolution Verified & Closed");
        history.setRemarks(remarks);
        history.setCreatedAt(LocalDateTime.now());
        historyRepository.save(history);

        return saved;
    }

    public Complaint reopenComplaint(Long id, String remarks) {
        Complaint c = repository.findById(id).orElseThrow();
        c.setStatus("REOPENED");
        Complaint saved = repository.save(c);

        ComplaintHistory history = new ComplaintHistory();
        history.setComplaintId(id);
        history.setChangedByUserId(c.getUserId());
        history.setAction("Complaint Re-opened by User");
        history.setRemarks(remarks);
        history.setCreatedAt(LocalDateTime.now());
        historyRepository.save(history);

        return saved;
    }
}