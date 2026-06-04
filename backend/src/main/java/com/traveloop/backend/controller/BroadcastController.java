package com.traveloop.backend.controller;

import com.traveloop.backend.entity.Broadcast;
import com.traveloop.backend.repository.BroadcastRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/broadcasts")
public class BroadcastController {

    @Autowired
    private BroadcastRepository repository;

    @GetMapping
    public List<Broadcast> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Broadcast create(@RequestBody Broadcast entity) {
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Broadcast> update(@PathVariable Long id, @RequestBody Broadcast details) {
        return repository.findById(id)
                .map(entity -> {
                    entity.setTitle(details.getTitle());
                    entity.setBody(details.getBody());
                    entity.setTarget(details.getTarget());
                    entity.setChannels(details.getChannels());
                    entity.setDate(details.getDate());
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
