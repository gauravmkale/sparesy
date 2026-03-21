package com.sparesy.core.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sparesy.core.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

//when the manufacturer asks a supplier to quote a component for a specific project.
@Entity
@Table(name = "requests")
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Request {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which project this component is needed for
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    // Which supplier is being asked
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_company_id", nullable = false)
    private Company supplier;

    // Which component is being requested
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "component_id", nullable = false)
    private Component component;

    // How many units the manufacturer needs
    @Column(nullable = false)
    private Integer quantityNeeded;

    // Starts as PENDING, supplier moves it to QUOTED,
    // manufacturer then moves it to APPROVED or REJECTED
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RequestStatus status = RequestStatus.PENDING;

    // Optional: Target price from manufacturer (suggested price)
    @Column(precision = 10, scale = 2)
    private BigDecimal targetPrice;

    // Optional: Target delivery date from manufacturer
    @Column
    private LocalDateTime targetDelivery;

    // Filled in by the supplier when they respond
    @Column(precision = 10, scale = 2)
    private BigDecimal quotedPrice;

    // Filled in by the supplier — when they can deliver
    @Column
    private LocalDateTime quotedDelivery;

    // When the manufacturer sent this request
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // When the supplier submitted their quote
    @Column
    private LocalDateTime quotedAt;
}