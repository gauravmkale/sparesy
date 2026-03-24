package com.sparesy.core.service;

import com.sparesy.core.dto.request.RequestRequestDTO;
import com.sparesy.core.dto.response.RequestResponseDTO;
import com.sparesy.core.entity.Component;
import com.sparesy.core.entity.Company;
import com.sparesy.core.entity.Project;
import com.sparesy.core.entity.Request;
import com.sparesy.core.entity.SupplierComponent;
import com.sparesy.core.enums.RequestStatus;
import com.sparesy.core.repository.RequestRepository;
import com.sparesy.core.repository.SupplierComponentRepository;
import com.sparesy.core.websocket.NotificationService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sparesy.core.workflow.events.AllRequestsApprovedEvent;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RequestService {

    private final RequestRepository requestRepository;
    private final ProjectService projectService;
    private final CompanyService companyService;
    private final ComponentService componentService;
    private final ApplicationEventPublisher eventPublisher;
    private final NotificationService notificationService;
    private final SupplierComponentRepository supplierComponentRepository;

    public RequestService(RequestRepository requestRepository,
                      ProjectService projectService,
                      CompanyService companyService,
                      ComponentService componentService,
                      ApplicationEventPublisher eventPublisher,
                      NotificationService notificationService,
                      SupplierComponentRepository supplierComponentRepository) {
        this.requestRepository = requestRepository;
        this.projectService = projectService;
        this.companyService = companyService;
        this.componentService = componentService;
        this.eventPublisher = eventPublisher;
        this.notificationService = notificationService;
        this.supplierComponentRepository = supplierComponentRepository;
    }

    // Manufacturer sends a component request to a supplier for a specific project
    public Request sendRequest(RequestRequestDTO dto) {
        if(dto.getSupplierCompanyId() == null){
            throw new RuntimeException("Supplier company id is required for single requests");
        }
        Project project = projectService.getProjectById(dto.getProjectId());
        Company supplier = companyService.getCompanyById(dto.getSupplierCompanyId());
        Component component = componentService.getComponentById(dto.getComponentId());

        Request request = new Request();
        request.setProject(project);
        request.setSupplier(supplier);
        request.setComponent(component);
        request.setQuantityNeeded(dto.getQuantityNeeded());
        request.setStatus(RequestStatus.PENDING);
        request.setTargetPrice(dto.getTargetPrice());
        request.setTargetDelivery(dto.getTargetDelivery());

        Request saved = requestRepository.save(request);

        notificationService.notifyNewRequest(
            saved.getSupplier().getId(),
            saved.getId()
        );

        return saved;
    }

    // New: Send requests to all suppliers who carry this component
    @Transactional
    public void sendBulkRequest(RequestRequestDTO dto) {
        List<SupplierComponent> suppliersWithComp = 
            supplierComponentRepository.findByComponentIdAndIsActive(dto.getComponentId(), true);
        
        for (SupplierComponent sc : suppliersWithComp) {
            RequestRequestDTO singleDto = new RequestRequestDTO();
            singleDto.setProjectId(dto.getProjectId());
            singleDto.setComponentId(dto.getComponentId());
            singleDto.setQuantityNeeded(dto.getQuantityNeeded());
            singleDto.setTargetPrice(dto.getTargetPrice());
            singleDto.setTargetDelivery(dto.getTargetDelivery());
            singleDto.setSupplierCompanyId(sc.getSupplier().getId());
            
            sendRequest(singleDto);
        }
    }

    public Request getRequestById(Long id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found with id: " + id));
    }

    public List<Request> getRequestsByProject(Long projectId) {
        return requestRepository.findByProjectId(projectId);
    }

    public List<Request> getRequestsBySupplier(Long supplierId) {
        return requestRepository.findBySupplierId(supplierId);
    }

    public List<Request> getClientVisibleRequests(Long projectId){
        return requestRepository.findByProjectId(projectId);
    }

    public Request submitQuote(Long id, BigDecimal price, LocalDateTime delivery) {
        Request request = getRequestById(id);
        request.setQuotedPrice(price);
        request.setQuotedDelivery(delivery);
        request.setStatus(RequestStatus.QUOTED);
        request.setQuotedAt(LocalDateTime.now());
        return requestRepository.save(request);
    }

    public Request approveRequest(Long id) {
        Request request = getRequestById(id);
        request.setStatus(RequestStatus.APPROVED);
        Request saved = requestRepository.save(request);

        if (allRequestsApproved(request.getProject().getId())) {
            eventPublisher.publishEvent(
                    new AllRequestsApprovedEvent(this, request.getProject()));
        }

        return saved;
    }

    public Request rejectRequest(Long id) {
        Request request = getRequestById(id);
        request.setStatus(RequestStatus.REJECTED);
        return requestRepository.save(request);
    }

    public boolean allRequestsApproved(Long projectId) {
        return !requestRepository.existsByProjectIdAndStatusNot(projectId, RequestStatus.APPROVED);
    }

    // DTO Conversion Methods
    public RequestResponseDTO toRequestResponseDTO(Request request) {
        return RequestResponseDTO.builder()
                .id(request.getId())
                .projectId(request.getProject().getId())
                .projectName(request.getProject().getName())
                .supplierCompanyId(request.getSupplier().getId())
                .supplierName(request.getSupplier().getName())
                .componentId(request.getComponent().getId())
                .componentName(request.getComponent().getName())
                .partNumber(request.getComponent().getPartNumber())
                .quantityNeeded(request.getQuantityNeeded())
                .status(request.getStatus())
                .quotedPrice(request.getQuotedPrice())
                .quotedDelivery(request.getQuotedDelivery())
                .createdAt(request.getCreatedAt())
                .quotedAt(request.getQuotedAt())
                .build();
    }

    public List<RequestResponseDTO> toRequestResponseDTOs(List<Request> requests) {
        return requests.stream()
                .map(this::toRequestResponseDTO)
                .collect(Collectors.toList());
    }
}
