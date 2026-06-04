package com.traveloop.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "broadcasts")
@Data
public class Broadcast {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String body;
    private String target;
    
    @ElementCollection
    private List<String> channels;
    
    private String date;
}
