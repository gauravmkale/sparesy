package com.sparesy.core.controller;

import com.sparesy.core.dto.response.ClientFinancialsResponseDTO;
import com.sparesy.core.dto.response.ProjectFinancialsResponseDTO;
import com.sparesy.core.entity.Transaction;
import com.sparesy.core.enums.TransactionType;
import com.sparesy.core.security.CompanyContext;
import com.sparesy.core.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

// Handles financial transaction records and revenue summaries
// No create endpoint — transactions are auto-recorded by WorkflowService
// All three portals use this to view their own financial history
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // GET /api/transactions/my
    @GetMapping("/my")
    public ResponseEntity<List<Transaction>> getMyTransactions() {
        Long companyId = CompanyContext.getCurrentCompanyId();
        return ResponseEntity.ok(transactionService.getByCompany(companyId));
    }

    // GET /api/transactions/revenue
    @GetMapping("/revenue")
    public ResponseEntity<BigDecimal> getTotalRevenue(@RequestParam TransactionType type) {
        Long companyId = CompanyContext.getCurrentCompanyId();
        return ResponseEntity.ok(transactionService.getTotalRevenue(companyId, type));
    }

    @GetMapping("/project/{id}/summary")
    public ResponseEntity<ProjectFinancialsResponseDTO> getProjectSummary(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.getProjectFinancials(id));
    }

    @GetMapping("/client/{id}/summary")
    public ResponseEntity<ClientFinancialsResponseDTO> getClientSummary(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.getClientFinancials(id));
    }

    @GetMapping("/clients/summaries")
    public ResponseEntity<List<ClientFinancialsResponseDTO>> getClientSummaries() {
        return ResponseEntity.ok(transactionService.getAllClientSummaries());
    }
}