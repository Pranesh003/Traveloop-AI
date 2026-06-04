package com.traveloop.backend.controller;

import com.traveloop.backend.entity.Package;
import com.traveloop.backend.repository.PackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/packages")
public class PackageController {

    @Autowired
    private PackageRepository repository;

    @GetMapping
    public List<Package> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Package create(@RequestBody Package entity) {
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Package> update(@PathVariable Long id, @RequestBody Package details) {
        return repository.findById(id)
                .map(entity -> {
                    entity.setName(details.getName());
                    entity.setDuration(details.getDuration());
                    entity.setPrice(details.getPrice());
                    entity.setBookings(details.getBookings());
                    entity.setRating(details.getRating());
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
