package com.sparesy.core.repository;

import com.sparesy.core.entity.Project;
import com.sparesy.core.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    // Client sees only their own projects
    List<Project> findByClientId(Long clientId);
    // Filter by status — used by workflow
    List<Project> findByClientIdAndStatus(Long clientId, ProjectStatus status);
    // Manufacturer sees all projects, newest first
    List<Project> findAllByOrderBySubmittedAtDesc();
}