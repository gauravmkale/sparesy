package com.sparesy.core.controller;

import com.sparesy.core.dto.request.ProjectRequestDTO;
import com.sparesy.core.entity.Project;
import com.sparesy.core.enums.ProjectStatus;
import com.sparesy.core.security.CompanyContext;
import com.sparesy.core.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Handles all PCB project operations
// Client submits projects, manufacturer views and manages them
// File uploads (Gerber + BOM) are handled separately by FileController
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    // POST /api/projects
    // Client submits a new PCB project
    // companyId is extracted from JWT inside ProjectService via CompanyContext
    @PostMapping
    public ResponseEntity<Project> submitProject(@Valid @RequestBody ProjectRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.submitProject(dto));
    }

    // GET /api/projects
    // Manufacturer views all projects, newest first
    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    // GET /api/projects/my
    // Client views only their own projects
    // companyId comes from JWT via CompanyContext
    @GetMapping("/my")
    public ResponseEntity<List<Project>> getMyProjects() {
        Long companyId = CompanyContext.getCurrentCompanyId();
        return ResponseEntity.ok(projectService.getProjectsByClient(companyId));
    }

    // GET /api/projects/{id}
    // Anyone with access fetches a single project by id
    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    // PUT /api/projects/{id}/status
    // Manufacturer or workflow updates a project's status
    // Status is passed as a request param e.g. ?status=SOURCING
    @PutMapping("/{id}/status")
    public ResponseEntity<Project> updateStatus(@PathVariable Long id,
                                                @RequestParam ProjectStatus status) {
        return ResponseEntity.ok(projectService.updateStatus(id, status));
    }
}