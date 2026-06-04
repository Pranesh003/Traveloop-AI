package com.traveloop.backend.controller;

import com.traveloop.backend.entity.Ticket;
import com.traveloop.backend.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketRepository repository;

    @GetMapping
    public List<Ticket> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Ticket create(@RequestBody Ticket entity) {
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> update(@PathVariable String id, @RequestBody Ticket details) {
        return repository.findById(id)
                .map(entity -> {
                    entity.setUser(details.getUser());
                    entity.setSubject(details.getSubject());
                    entity.setStatus(details.getStatus());
                    entity.setPriority(details.getPriority());
                    entity.setTime(details.getTime());
                    return ResponseEntity.ok(repository.save(entity));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        return repository.findById(id)
                .map(entity -> {
                    repository.delete(entity);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
