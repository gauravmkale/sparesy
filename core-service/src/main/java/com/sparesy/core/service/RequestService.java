package com.sparesy.core.service;

import com.sparesy.core.dto.request.RequestRequestDTO;
import com.sparesy.core.entity.Component;
import com.sparesy.core.entity.Company;
import com.sparesy.core.entity.Project;
import com.sparesy.core.entity.Request;
import com.sparesy.core.enums.RequestStatus;
import com.sparesy.core.repository.RequestRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class RequestService {

    private final RequestRepository requestRepository;
    private final ProjectService projectService;
    private final CompanyService companyService;
    private final ComponentService componentService;

    public RequestService(RequestRepository requestRepository,
                          ProjectService projectService,
                          CompanyService companyService,
                          ComponentService componentService) {
        this.requestRepository = requestRepository;
        this.projectService = projectService;
        this.companyService = companyService;
        this.componentService = componentService;
    }

    // Manufacturer sends a component request to a supplier for a specific project
    public Request sendRequest(RequestRequestDTO dto) {
        Project project = projectService.getProjectById(dto.getProjectId());
        Company supplier = companyService.getCompanyById(dto.getSupplierCompanyId());
        Component component = componentService.getComponentById(dto.getComponentId());

        Request request = new Request();
        request.setProject(project);
        request.setSupplier(supplier);
        request.setComponent(component);
        request.setQuantityNeeded(dto.getQuantityNeeded());
        request.setStatus(RequestStatus.PENDING);

        return requestRepository.save(request);
    }

    // Fetch single request — used internally
    public Request getRequestById(Long id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found with id: " + id));
    }

    // Manufacturer views all requests for a project
    public List<Request> getRequestsByProject(Long projectId) {
        return requestRepository.findByProjectId(projectId);
    }

    // Supplier views all requests sent to them
    public List<Request> getRequestsBySupplier(Long supplierId) {
        return requestRepository.findBySupplierId(supplierId);
    }

    // Supplier submits their quoted price and delivery date
    public Request submitQuote(Long id, BigDecimal price, LocalDateTime delivery) {
        Request request = getRequestById(id);
        request.setQuotedPrice(price);
        request.setQuotedDelivery(delivery);
        request.setStatus(RequestStatus.QUOTED);
        request.setQuotedAt(LocalDateTime.now());
        return requestRepository.save(request);
    }

    // Manufacturer approves a supplier's quote
    public Request approveRequest(Long id) {
        Request request = getRequestById(id);
        request.setStatus(RequestStatus.APPROVED);
        return requestRepository.save(request);
    }

    // Manufacturer rejects a supplier's quote
    public Request rejectRequest(Long id) {
        Request request = getRequestById(id);
        request.setStatus(RequestStatus.REJECTED);
        return requestRepository.save(request);
    }

    // Used by WorkflowService — checks if all requests for a project are approved
    public boolean allRequestsApproved(Long projectId) {
        return !requestRepository.existsByProjectIdAndStatusNot(projectId, RequestStatus.APPROVED);
    }
}