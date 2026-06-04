package com.traveloop.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "activities")
@Data
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String type;
    private String price;
    private String duration;
}
