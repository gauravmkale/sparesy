package com.sparesy.core.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sparesy.core.enums.QuoteStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "quotes")
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Quote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // One quote per project
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    // Final price shown to the client — components + assembly + shipping
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    // Total lead time in days
    @Column(nullable = false)
    private Integer leadTimeDays;

    // Line items stored as JSON — avoids needing a separate QuoteLineItem table
    // Example: [{"description":"Resistor 10k","qty":100,"unitPrice":0.05,"total":5.00}]
    @Column(columnDefinition = "TEXT")
    private String lineItemsJson;

    // DRAFT → manufacturer is still building it
    // SENT → client can see it
    // APPROVED / REJECTED → client has responded
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private QuoteStatus status = QuoteStatus.DRAFT;

    // Optional note from client when they approve or reject
    @Column(length = 500)
    private String notes;

    // When the manufacturer created the draft
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // When it was sent to the client
    @Column
    private LocalDateTime sentAt;

    // When the client approved or rejected
    @Column
    private LocalDateTime clientResponseAt;
}