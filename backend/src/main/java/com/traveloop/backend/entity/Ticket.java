package com.traveloop.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tickets")
@Data
public class Ticket {

    @Id
    private String id;

    private String user;
    private String subject;
    private String status;
    private String priority;
    private String time;
}
