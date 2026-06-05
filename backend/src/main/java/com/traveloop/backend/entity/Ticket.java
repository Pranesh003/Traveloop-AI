package com.traveloop.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tickets")
@Data
public class Ticket {

    @Id
    private String id;

    @Column(name = "ticket_user")
    private String user;
    private String subject;
    private String status;
    private String priority;
    private String time;
}
