package com.sparesy.core.controller;

import com.sparesy.core.dto.request.ProjectRequestDTO;
import com.sparesy.core.dto.response.ProjectResponseDTO;
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
    public ResponseEntity<ProjectResponseDTO> submitProject(@Valid @RequestBody ProjectRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.toProjectResponseDTO(projectService.submitProject(dto)));
    }

    // GET /api/projects
    // Manufacturer views all projects, newest first
    @GetMapping
    public ResponseEntity<List<ProjectResponseDTO>> getAllProjects() {
        return ResponseEntity.ok(projectService.toProjectResponseDTOs(projectService.getAllProjects()));
    }

    // GET /api/projects/my
    // Client views only their own projects
    // companyId comes from JWT via CompanyContext
    @GetMapping("/my")
    public ResponseEntity<List<ProjectResponseDTO>> getMyProjects() {
        Long companyId = CompanyContext.getCurrentCompanyId();
        return ResponseEntity.ok(projectService.toProjectResponseDTOs(projectService.getProjectsByClient(companyId)));
    }

    // GET /api/projects/{id}
    // Anyone with access fetches a single project by id
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponseDTO> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.toProjectResponseDTO(projectService.getProjectById(id)));
    }

    // PUT /api/projects/{id}/status
    // Manufacturer or workflow updates a project's status
    // Status is passed as a request param e.g. ?status=SOURCING
    @PutMapping("/{id}/status")
    public ResponseEntity<ProjectResponseDTO> updateStatus(@PathVariable Long id,
                                                @RequestParam ProjectStatus status) {
        return ResponseEntity.ok(projectService.toProjectResponseDTO(projectService.updateStatus(id, status)));
    }
}