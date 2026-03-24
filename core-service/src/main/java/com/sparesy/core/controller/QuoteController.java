package com.sparesy.core.controller;

import com.sparesy.core.dto.request.QuoteRequestDTO;
import com.sparesy.core.dto.response.QuoteResponseDTO;
import com.sparesy.core.service.QuoteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Handles quote creation and client approval flow
// Manufacturer builds the quote, client approves or rejects
// Quote approval auto-triggers production order creation via WorkflowService
@RestController
@RequestMapping("/api/quotes")
public class QuoteController {

    private final QuoteService quoteService;

    public QuoteController(QuoteService quoteService) {
        this.quoteService = quoteService;
    }

    // POST /api/quotes
    // Manufacturer creates a quote draft for a project
    @PostMapping
    public ResponseEntity<QuoteResponseDTO> createQuote(@Valid @RequestBody QuoteRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(quoteService.toQuoteResponseDTO(quoteService.createQuote(dto)));
    }

    // GET /api/quotes/project/{projectId}
    // Fetch the quote for a specific project — one quote per project
    @GetMapping("/project/{projectId}")
    public ResponseEntity<QuoteResponseDTO> getQuoteByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(quoteService.toQuoteResponseDTO(quoteService.getQuoteByProject(projectId)));
    }

    // GET /api/quotes/my
    // Client views their own project's quote
    // Uses companyId from JWT to find their project's quote
    @GetMapping("/my")
    public ResponseEntity<List<QuoteResponseDTO>> getSentQuotes() {
        return ResponseEntity.ok(quoteService.toQuoteResponseDTOs(quoteService.getSentQuotes()));
    }

    // PUT /api/quotes/{id}/send
    // Manufacturer sends the quote to the client
    @PutMapping("/{id}/send")
    public ResponseEntity<QuoteResponseDTO> sendToClient(@PathVariable Long id) {
        return ResponseEntity.ok(quoteService.toQuoteResponseDTO(quoteService.sendToClient(id)));
    }

    // PUT /api/quotes/{id}/approve
    // Client approves the quote — triggers production order creation
    @PutMapping("/{id}/approve")
    public ResponseEntity<QuoteResponseDTO> approveQuote(@PathVariable Long id) {
        return ResponseEntity.ok(quoteService.toQuoteResponseDTO(quoteService.approveQuote(id)));
    }

    // PUT /api/quotes/{id}/reject
    // Client rejects the quote with an optional note
    @PutMapping("/{id}/reject")
    public ResponseEntity<QuoteResponseDTO> rejectQuote(@PathVariable Long id,
                                              @RequestParam(required = false) String note) {
        return ResponseEntity.ok(quoteService.toQuoteResponseDTO(quoteService.rejectQuote(id, note)));
    }
}