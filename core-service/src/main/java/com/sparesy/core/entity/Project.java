package com.sparesy.core.entity;

import com.sparesy.core.enums.ProjectStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
@Getter
@Setter
public class Project {
    //Even if we dont write @Column hibernate would still maptables according to the columns automatically, 
    // but we do that so that we can add constraints to our columns
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //Many to one mapping because a single client can have multiple clients .
    //FetchType.LAZY - fetch means how hibernate loads the data if its lazy that means
    //it will only fetch company table if accessed. this helps us avoid unnecessay joins.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_company_id", nullable = false)
    private Company client;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false)
    private Integer quantity;

    @Column(length = 50)
    private String layerCount;

    @Column(length = 50)
    private String boardThickness;

    @Column(length = 50)
    private String surfaceFinish;

    @Column(length = 500)
    private String gerberFilePath;

    @Column(length = 500)
    private String bomFilePath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProjectStatus status = ProjectStatus.SUBMITTED;

    @Column
    private LocalDateTime expectedDelivery;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime submittedAt;
}