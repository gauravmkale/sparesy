package com.sparesy.core.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sparesy.core.enums.ProductionStage;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "production_orders")
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProductionOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProductionStage currentStage = ProductionStage.COMPONENT_PREP;

    @Column
    private LocalDateTime plannedStart;

    @Column
    private LocalDateTime plannedEnd;

    @Column
    private LocalDateTime actualStart;

    @Column
    private LocalDateTime actualEnd;

    @Column(columnDefinition = "TEXT")
    private String stageHistoryJson;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}