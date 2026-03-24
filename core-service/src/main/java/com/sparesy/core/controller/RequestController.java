package com.sparesy.core.controller;

import com.sparesy.core.dto.request.RequestRequestDTO;
import com.sparesy.core.dto.response.RequestResponseDTO;
import com.sparesy.core.security.CompanyContext;
import com.sparesy.core.service.RequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

// Handles the component sourcing workflow
// Manufacturer sends requests, suppliers respond with quotes
// Manufacturer approves or rejects each supplier quote
@RestController
@RequestMapping("/api/requests")
public class RequestController {

    private final RequestService requestService;

    public RequestController(RequestService requestService) {
        this.requestService = requestService;
    }

    // POST /api/requests
    // Manufacturer sends a component request to a supplier for a specific project
    @PostMapping
    public ResponseEntity<RequestResponseDTO> sendRequest(@Valid @RequestBody RequestRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(requestService.toRequestResponseDTO(requestService.sendRequest(dto)));
    }

    @PostMapping("/bulk")
    public ResponseEntity<Void> sendBulkRequest(@Valid @RequestBody RequestRequestDTO dto) {
        requestService.sendBulkRequest(dto);
        return ResponseEntity.ok().build();
    }

    // GET /api/requests/project/{projectId}
    // Manufacturer views all requests sent for a specific project
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<RequestResponseDTO>> getRequestsByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(requestService.toRequestResponseDTOs(requestService.getRequestsByProject(projectId)));
    }

    @GetMapping("/project/{projectId}/client")
    public ResponseEntity<List<RequestResponseDTO>> getClientRequestsByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(requestService.toRequestResponseDTOs(requestService.getClientVisibleRequests(projectId)));
    }

    // GET /api/requests/my
    // Supplier views all requests sent to them
    // supplierId extracted from JWT via CompanyContext
    @GetMapping("/my")
    public ResponseEntity<List<RequestResponseDTO>> getMyRequests() {
        Long supplierId = CompanyContext.getCurrentCompanyId();
        return ResponseEntity.ok(requestService.toRequestResponseDTOs(requestService.getRequestsBySupplier(supplierId)));
    }

    // PUT /api/requests/{id}/quote
    // Supplier submits their quoted price and delivery date
    // price and delivery passed as request params
    @PutMapping("/{id}/quote")
    public ResponseEntity<RequestResponseDTO> submitQuote(@PathVariable Long id,
                                               @RequestParam BigDecimal price,
                                               @RequestParam(required = false) LocalDateTime delivery) {
        return ResponseEntity.ok(requestService.toRequestResponseDTO(requestService.submitQuote(id, price, delivery)));
    }

    // PUT /api/requests/{id}/approve
    // Manufacturer approves a supplier's quoted price
    @PutMapping("/{id}/approve")
    public ResponseEntity<RequestResponseDTO> approveRequest(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.toRequestResponseDTO(requestService.approveRequest(id)));
    }

    // PUT /api/requests/{id}/reject
    // Manufacturer rejects a supplier's quoted price
    @PutMapping("/{id}/reject")
    public ResponseEntity<RequestResponseDTO> rejectRequest(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.toRequestResponseDTO(requestService.rejectRequest(id)));
    }
}