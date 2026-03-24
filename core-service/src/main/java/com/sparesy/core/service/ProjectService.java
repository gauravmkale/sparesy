package com.sparesy.core.service;

import com.sparesy.core.dto.request.ProjectRequestDTO;
import com.sparesy.core.dto.response.ProjectResponseDTO;
import com.sparesy.core.entity.Company;
import com.sparesy.core.entity.Project;
import com.sparesy.core.enums.ProjectStatus;
import com.sparesy.core.repository.ProjectRepository;
import com.sparesy.core.security.CompanyContext;
import org.springframework.stereotype.Service;

import com.sparesy.core.workflow.events.ProjectSubmittedEvent;
import org.springframework.context.ApplicationEventPublisher;


import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final CompanyService companyService;
    private ApplicationEventPublisher eventPublisher;

    // Both dependencies injected via constructor
    public ProjectService(ProjectRepository projectRepository,
                        CompanyService companyService,
                        ApplicationEventPublisher eventPublisher) {
        this.projectRepository = projectRepository;
        this.companyService = companyService;
        this.eventPublisher = eventPublisher;
    }

    // Client submits a new project — companyId comes from JWT via CompanyContext
    public Project submitProject(ProjectRequestDTO dto) {
        Long companyId = CompanyContext.getCurrentCompanyId();
        Company client = companyService.getCompanyById(companyId);

        Project project = new Project();
        project.setClient(client);
        project.setName(dto.getName());
        project.setQuantity(dto.getQuantity());
        project.setLayerCount(dto.getLayerCount());
        project.setBoardThickness(dto.getBoardThickness());
        project.setSurfaceFinish(dto.getSurfaceFinish());
        project.setStatus(ProjectStatus.SUBMITTED);

        Project saved = projectRepository.save(project);

        // Fire event — WorkflowService picks this up automatically
        eventPublisher.publishEvent(new ProjectSubmittedEvent(this, saved));

        return saved;
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

        // Saves a project entity directly — used by FileController after setting file paths
    public Project saveProject(Project project) {
        return projectRepository.save(project);
    }

    // DTO Conversion Methods
    public ProjectResponseDTO toProjectResponseDTO(Project project) {
        return ProjectResponseDTO.builder()
                .id(project.getId())
                .name(project.getName())
                .quantity(project.getQuantity())
                .layerCount(project.getLayerCount())
                .boardThickness(project.getBoardThickness())
                .surfaceFinish(project.getSurfaceFinish())
                .status(project.getStatus())
                .clientCompanyId(project.getClient().getId())
                .clientName(project.getClient().getName())
                .gerberFilePath(project.getGerberFilePath())
                .bomFilePath(project.getBomFilePath())
                .expectedDelivery(project.getExpectedDelivery())
                .submittedAt(project.getSubmittedAt())
                .build();
    }

    public List<ProjectResponseDTO> toProjectResponseDTOs(List<Project> projects) {
        return projects.stream()
                .map(this::toProjectResponseDTO)
                .collect(Collectors.toList());
    }
}