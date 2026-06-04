package com.traveloop.backend.controller;

import com.traveloop.backend.entity.Destination;
import com.traveloop.backend.repository.DestinationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/destinations")
public class DestinationController {

    @Autowired
    private DestinationRepository repository;

    @GetMapping
    public List<Destination> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Destination create(@RequestBody Destination entity) {
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Destination> update(@PathVariable Long id, @RequestBody Destination details) {
        return repository.findById(id)
                .map(entity -> {
                    entity.setCountry(details.getCountry());
                    entity.setCity(details.getCity());
                    entity.setStatus(details.getStatus());
                    entity.setSafety(details.getSafety());
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
