package com.traveloop.backend.controller;

import com.traveloop.backend.entity.Plan;
import com.traveloop.backend.repository.PlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
public class PlanController {

    @Autowired
    private PlanRepository repository;

    @GetMapping
    public List<Plan> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Plan create(@RequestBody Plan entity) {
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Plan> update(@PathVariable Long id, @RequestBody Plan details) {
        return repository.findById(id)
                .map(entity -> {
                    entity.setName(details.getName());
                    entity.setPrice(details.getPrice());
                    entity.setUsers(details.getUsers());
                    entity.setFeatures(details.getFeatures());
                    entity.setPopular(details.getPopular());
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
