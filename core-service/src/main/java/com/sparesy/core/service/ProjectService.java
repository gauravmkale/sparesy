package com.sparesy.core.service;

import com.sparesy.core.dto.request.ProjectRequestDTO;
import com.sparesy.core.entity.Company;
import com.sparesy.core.entity.Project;
import com.sparesy.core.enums.ProjectStatus;
import com.sparesy.core.repository.ProjectRepository;
import com.sparesy.core.security.CompanyContext;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final CompanyService companyService;

    // Both dependencies injected via constructor
    public ProjectService(ProjectRepository projectRepository,
                          CompanyService companyService) {
        this.projectRepository = projectRepository;
        this.companyService = companyService;
    }

    // Client submits a new project — companyId comes from JWT via CompanyContext
    public Project submitProject(ProjectRequestDTO dto) {
        Long companyId = CompanyContext.getCurrentCompanyId();

        // Fetch the Company entity so we can set the FK relationship
        Company client = companyService.getCompanyById(companyId);

        // Build the Project entity from the DTO
        Project project = new Project();
        project.setClient(client);
        project.setName(dto.getName());
        project.setQuantity(dto.getQuantity());
        project.setLayerCount(dto.getLayerCount());
        project.setBoardThickness(dto.getBoardThickness());
        project.setSurfaceFinish(dto.getSurfaceFinish());

        // Status defaults to SUBMITTED — set in entity but being explicit here
        project.setStatus(ProjectStatus.SUBMITTED);

        return projectRepository.save(project);
    }

    // Fetch a single project by its own ID
    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
    }

    // Client fetches only their own projects
    public List<Project> getProjectsByClient(Long clientId) {
        return projectRepository.findByClientId(clientId);
    }

    // Manufacturer fetches all projects, newest first
    public List<Project> getAllProjects() {
        return projectRepository.findAllByOrderBySubmittedAtDesc();
    }

    // Manufacturer or workflow updates a project's status
    public Project updateStatus(Long id, ProjectStatus status) {
        Project project = getProjectById(id);
        project.setStatus(status);
        return projectRepository.save(project);
    }
}