package com.scms.repository;

import com.scms.model.ComplaintHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComplaintHistoryRepository extends JpaRepository<ComplaintHistory, Long> {
    List<ComplaintHistory> findByComplaintIdOrderByCreatedAtAsc(Long complaintId);
}
