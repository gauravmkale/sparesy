package com.sparesy.core.service;

import com.sparesy.core.entity.Company;
import com.sparesy.core.entity.Project;
import com.sparesy.core.entity.Request;
import com.sparesy.core.entity.Transaction;
import com.sparesy.core.enums.TransactionType;
import com.sparesy.core.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    // Auto-called by WorkflowService when a supplier request is approved
    public Transaction recordSupplierRevenue(Request request) {
        Transaction t = new Transaction();
        t.setCompany(request.getSupplier());
        t.setProject(request.getProject());
        t.setComponent(request.getComponent());
        t.setType(TransactionType.SUPPLIER_REVENUE);
        t.setAmount(request.getQuotedPrice()
                .multiply(BigDecimal.valueOf(request.getQuantityNeeded())));
        t.setDescription("Component supply for project: " + request.getProject().getName());
        return transactionRepository.save(t);
    }

    // Auto-called by WorkflowService when client approves quote
    public Transaction recordClientCost(Project project, BigDecimal amount) {
        Transaction t = new Transaction();
        t.setCompany(project.getClient());
        t.setProject(project);
        t.setType(TransactionType.CLIENT_COST);
        t.setAmount(amount);
        t.setDescription("Quote approved for project: " + project.getName());
        return transactionRepository.save(t);
    }

    // Auto-called by WorkflowService — manufacturer earns on the quote
    public Transaction recordManufacturerRevenue(Project project, BigDecimal amount, Company manufacturer) {
        Transaction t = new Transaction();
        t.setCompany(manufacturer);
        t.setProject(project);
        t.setType(TransactionType.MANUFACTURER_REVENUE);
        t.setAmount(amount);
        t.setDescription("Revenue from project: " + project.getName());
        return transactionRepository.save(t);
    }

    // Any portal views their own transactions
    public List<Transaction> getByCompany(Long companyId) {
        return transactionRepository.findByCompanyId(companyId);
    }

    // Revenue summary for dashboards — total amount by company and type
    public BigDecimal getTotalRevenue(Long companyId, TransactionType type) {
        return transactionRepository.sumAmountByCompanyIdAndType(companyId, type);
    }
}