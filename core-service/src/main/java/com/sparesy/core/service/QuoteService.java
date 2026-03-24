package com.sparesy.core.service;

import com.sparesy.core.dto.request.QuoteRequestDTO;
import com.sparesy.core.dto.response.QuoteResponseDTO;
import com.sparesy.core.entity.Project;
import com.sparesy.core.entity.Quote;
import com.sparesy.core.enums.QuoteStatus;
import com.sparesy.core.repository.QuoteRepository;
import com.sparesy.core.websocket.NotificationService;

import org.springframework.stereotype.Service;

import com.sparesy.core.workflow.events.QuoteApprovedEvent;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuoteService {

    private final QuoteRepository quoteRepository;
    private final ProjectService projectService;
    private final ApplicationEventPublisher eventPublisher;
    private final NotificationService notificationService;



    public QuoteService(QuoteRepository quoteRepository,
                    ProjectService projectService,
                    ApplicationEventPublisher eventPublisher,
                    NotificationService notificationService) {
    this.quoteRepository = quoteRepository;
    this.projectService = projectService;
    this.eventPublisher = eventPublisher;
    this.notificationService=notificationService;
}


    // Manufacturer creates a quote draft for a project
    public Quote createQuote(QuoteRequestDTO dto) {
        Project project = projectService.getProjectById(dto.getProjectId());

        Quote quote = new Quote();
        quote.setProject(project);
        quote.setTotalPrice(dto.getTotalPrice());
        quote.setLeadTimeDays(dto.getLeadTimeDays());
        quote.setLineItemsJson(dto.getLineItemsJson());
        quote.setNotes(dto.getNotes());
        quote.setStatus(QuoteStatus.DRAFT);

        return quoteRepository.save(quote);
    }

    // Fetch single quote — used internally
    public Quote getQuoteById(Long id) {
        return quoteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quote not found with id: " + id));
    }

    // Fetch quote for a project — one quote per project
    public Quote getQuoteByProject(Long projectId) {
        return quoteRepository.findByProjectId(projectId)
                .orElseThrow(() -> new RuntimeException("Quote not found for project id: " + projectId));
    }

    // Manufacturer sends the quote to the client
    public Quote sendToClient(Long id) {
        Quote quote = getQuoteById(id);
        quote.setStatus(QuoteStatus.SENT);
        quote.setSentAt(LocalDateTime.now());
        Quote saved = quoteRepository.save(quote);
        notificationService.notifyQuoteReady(
            saved.getProject().getClient().getId(),
            saved.getProject().getId()
        );

        return saved;
    }

    // Client approves the quote
    public Quote approveQuote(Long id) {
    Quote quote = getQuoteById(id);
    quote.setStatus(QuoteStatus.APPROVED);
    quote.setClientResponseAt(LocalDateTime.now());
    Quote saved = quoteRepository.save(quote);

    // Fire event — WorkflowService creates production order and records transactions
    eventPublisher.publishEvent(new QuoteApprovedEvent(this, saved.getProject(), saved));

    return saved;
}

    // Client rejects the quote with an optional note
    public Quote rejectQuote(Long id, String note) {
        Quote quote = getQuoteById(id);
        quote.setStatus(QuoteStatus.REJECTED);
        quote.setNotes(note);
        quote.setClientResponseAt(LocalDateTime.now());
        return quoteRepository.save(quote);
    }

    // Manufacturer views all sent quotes
    public List<Quote> getSentQuotes() {
        return quoteRepository.findByStatus(QuoteStatus.SENT);
    }

    // DTO Conversion Methods
    public QuoteResponseDTO toQuoteResponseDTO(Quote quote) {
        return QuoteResponseDTO.builder()
                .id(quote.getId())
                .projectId(quote.getProject().getId())
                .projectName(quote.getProject().getName())
                .totalPrice(quote.getTotalPrice())
                .leadTimeDays(quote.getLeadTimeDays())
                .lineItemsJson(quote.getLineItemsJson())
                .status(quote.getStatus())
                .notes(quote.getNotes())
                .createdAt(quote.getCreatedAt())
                .sentAt(quote.getSentAt())
                .clientResponseAt(quote.getClientResponseAt())
                .build();
    }

    public List<QuoteResponseDTO> toQuoteResponseDTOs(List<Quote> quotes) {
        return quotes.stream()
                .map(this::toQuoteResponseDTO)
                .collect(Collectors.toList());
    }
}