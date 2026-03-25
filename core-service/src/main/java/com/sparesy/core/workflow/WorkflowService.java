package com.sparesy.core.workflow;

import com.sparesy.core.entity.Project;
import com.sparesy.core.entity.Quote;
import com.sparesy.core.entity.Request;
import com.sparesy.core.enums.ProjectStatus;
import com.sparesy.core.enums.RequestStatus;
import com.sparesy.core.repository.CompanyRepository;
import com.sparesy.core.repository.RequestRepository;
import com.sparesy.core.service.ProductionService;
import com.sparesy.core.service.ProjectService;
import com.sparesy.core.service.TransactionService;
import com.sparesy.core.workflow.events.AllRequestsApprovedEvent;
import com.sparesy.core.workflow.events.QuoteApprovedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.List;

// The automation engine for Sparesy
// Listens for key business events and automatically orchestrates the next steps
// No manual triggering needed — Spring fires these when publishEvent() is called
@Service
public class WorkflowService {

    private final ProjectService projectService;
    private final ProductionService productionService;
    private final TransactionService transactionService;
    private final RequestRepository requestRepository;
    private final CompanyRepository companyRepository;

    public WorkflowService(ProjectService projectService,
                           ProductionService productionService,
                           TransactionService transactionService,
                           RequestRepository requestRepository,
                           CompanyRepository companyRepository) {
        this.projectService = projectService;
        this.productionService = productionService;
        this.transactionService = transactionService;
        this.requestRepository = requestRepository;
        this.companyRepository = companyRepository;
    }


    // Advances project status to QUOTED so manufacturer can build the client quote
    @EventListener
    public void onAllRequestsApproved(AllRequestsApprovedEvent event) {
        Project project = event.getProject();

        // All supplier requests are approved — project is ready for quoting
        projectService.updateStatus(project.getId(), ProjectStatus.QUOTED);
    }

    // Triggered when client approves a quote
    // This is the most important workflow step — it kicks off production
    @EventListener
    public void onQuoteApproved(QuoteApprovedEvent event) {
        Project project = event.getProject();
        Quote quote = event.getQuote();

        // Step 1 — advance project status to IN_PRODUCTION
        projectService.updateStatus(project.getId(), ProjectStatus.IN_PRODUCTION);

        // Step 2 — auto-create the production order
        productionService.createProductionOrder(project.getId());

        // Step 3 — record client cost transaction
        transactionService.recordClientCost(project, quote.getTotalPrice());

        // Step 4 — record manufacturer revenue transaction
        // Find the manufacturer company — there is only one MANUFACTURER in the system
        companyRepository.findByTypeAndIsActive(com.sparesy.core.enums.CompanyType.MANUFACTURER, true)
                .stream()
                .findFirst()
                .ifPresent(manufacturer ->
                        transactionService.recordManufacturerRevenue(
                                project, quote.getTotalPrice(), manufacturer));

        // Step 5 — record supplier revenue for each approved request
        List<Request> approvedRequests = requestRepository
                .findByProjectIdAndStatus(project.getId(), RequestStatus.APPROVED);

        for (Request request : approvedRequests) {
            transactionService.recordSupplierRevenue(request);
        }
    }
}