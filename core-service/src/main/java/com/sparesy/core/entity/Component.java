package com.sparesy.core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "components")
@Getter
@Setter
public class Component {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String partNumber;

    @Column(length = 100)
    private String category;

    @Column(length = 500)
    private String description;
}