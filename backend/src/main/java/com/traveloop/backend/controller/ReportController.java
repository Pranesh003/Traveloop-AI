package com.traveloop.backend.controller;

import com.traveloop.backend.entity.Report;
import com.traveloop.backend.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportRepository repository;

    @GetMapping
    public List<Report> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Report create(@RequestBody Report entity) {
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Report> update(@PathVariable Long id, @RequestBody Report details) {
        return repository.findById(id)
                .map(entity -> {
                    entity.setType(details.getType());
                    entity.setUser(details.getUser());
                    entity.setReason(details.getReason());
                    entity.setDate(details.getDate());
                    entity.setStatus(details.getStatus());
                    return ResponseEntity.ok(repository.save(entity));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return repository.findById(id)
                .map(entity -> {
                    repository.delete(entity);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
