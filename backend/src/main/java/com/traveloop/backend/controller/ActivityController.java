package com.traveloop.backend.controller;

import com.traveloop.backend.entity.Activity;
import com.traveloop.backend.repository.ActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    @Autowired
    private ActivityRepository repository;

    @GetMapping
    public List<Activity> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Activity create(@RequestBody Activity entity) {
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Activity> update(@PathVariable Long id, @RequestBody Activity details) {
        return repository.findById(id)
                .map(entity -> {
                    entity.setName(details.getName());
                    entity.setType(details.getType());
                    entity.setPrice(details.getPrice());
                    entity.setDuration(details.getDuration());
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
