package com.sparesy.core.service;

import com.sparesy.core.entity.Company;
import com.sparesy.core.entity.Project;
import com.sparesy.core.entity.Request;
import com.sparesy.core.entity.Transaction;
import com.sparesy.core.enums.TransactionType;
import com.sparesy.core.repository.TransactionRepository;
import com.sparesy.core.dto.response.ClientFinancialsResponseDTO;
import com.sparesy.core.dto.response.ProjectFinancialsResponseDTO;
import com.sparesy.core.repository.ProjectRepository;
import com.sparesy.core.repository.CompanyRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final ProjectRepository projectRepository;
    private final CompanyRepository companyRepository;

    public TransactionService(TransactionRepository transactionRepository, ProjectRepository projectRepository, CompanyRepository companyRepository) {
        this.transactionRepository = transactionRepository;
        this.projectRepository = projectRepository;
        this.companyRepository = companyRepository;
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

    public ProjectFinancialsResponseDTO getProjectFinancials(Long projectId) {
        Project project = projectRepository.findById(projectId).orElseThrow();

        // sumAmountByProjectIdAndType returns null when no rows match — default to ZERO
        BigDecimal revenue = transactionRepository.sumAmountByProjectIdAndType(projectId, TransactionType.MANUFACTURER_REVENUE);
        BigDecimal cost    = transactionRepository.sumAmountByProjectIdAndType(projectId, TransactionType.SUPPLIER_REVENUE);
        if (revenue == null) revenue = BigDecimal.ZERO;
        if (cost == null)    cost    = BigDecimal.ZERO;

        return ProjectFinancialsResponseDTO.builder()
                .projectId(projectId)
                .projectName(project.getName())
                .revenue(revenue)
                .cost(cost)
                .profit(revenue.subtract(cost))
                .status(project.getStatus().toString())
                .build();
    }

    public ClientFinancialsResponseDTO getClientFinancials(Long clientId) {
        Company client = companyRepository.findById(clientId).orElseThrow();
        List<Project> projects = projectRepository.findByClientId(clientId);
        
        List<ProjectFinancialsResponseDTO> projectStats = projects.stream()
                .map(p -> getProjectFinancials(p.getId()))
                .collect(Collectors.toList());
        
        BigDecimal totalRevenue = projectStats.stream()
                .map(ProjectFinancialsResponseDTO::getRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalProfit = projectStats.stream()
                .map(ProjectFinancialsResponseDTO::getProfit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        return ClientFinancialsResponseDTO.builder()
                .clientId(clientId)
                .clientName(client.getName())
                .totalRevenue(totalRevenue)
                .totalProfit(totalProfit)
                .projects(projectStats)
                .build();
    }

    public List<ClientFinancialsResponseDTO> getAllClientSummaries() {
        return companyRepository.findByTypeAndOnboardingStatusAndIsActive(
                com.sparesy.core.enums.CompanyType.CLIENT, 
                com.sparesy.core.enums.OnboardingStatus.APPROVED, true).stream()
                .map(c -> getClientFinancials(c.getId()))
                .collect(Collectors.toList());
    }
}