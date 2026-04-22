package com.scms.repository;

import com.scms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffRepository extends JpaRepository<User, Long> {
}