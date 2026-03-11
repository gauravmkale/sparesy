package com.sparesy.core.repository;

import com.sparesy.core.entity.Request;
import com.sparesy.core.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RequestRepository extends JpaRepository<Request, Long> {
    List<Request> findByProjectId(Long projectId);
    List<Request> findBySupplierId(Long supplierId);
    List<Request> findByProjectIdAndStatus(Long projectId, RequestStatus status);
    // Used by workflow to check if all requests for a project are approved
    boolean existsByProjectIdAndStatusNot(Long projectId, RequestStatus status);
}