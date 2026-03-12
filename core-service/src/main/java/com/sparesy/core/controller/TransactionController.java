package com.sparesy.core.controller;

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
    // Any portal views their own transaction history
    // companyId extracted from JWT via CompanyContext
    @GetMapping("/my")
    public ResponseEntity<List<Transaction>> getMyTransactions() {
        Long companyId = CompanyContext.getCurrentCompanyId();
        return ResponseEntity.ok(transactionService.getByCompany(companyId));
    }

    // GET /api/transactions/revenue?type=MANUFACTURER_REVENUE
    // Returns total revenue for the logged-in company filtered by transaction type
    // Manufacturer uses MANUFACTURER_REVENUE, supplier uses SUPPLIER_REVENUE,
    // client uses CLIENT_COST
    @GetMapping("/revenue")
    public ResponseEntity<BigDecimal> getTotalRevenue(@RequestParam TransactionType type) {
        Long companyId = CompanyContext.getCurrentCompanyId();
        return ResponseEntity.ok(transactionService.getTotalRevenue(companyId, type));
    }
}