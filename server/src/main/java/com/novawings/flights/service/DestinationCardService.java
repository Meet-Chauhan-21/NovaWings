package com.novawings.flights.service;

import com.novawings.flights.model.DestinationCard;
import com.novawings.flights.repository.DestinationCardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DestinationCardService {

    @Autowired
    private DestinationCardRepository repo;

    // Public
    public List<DestinationCard> getAllActive() {
        return repo.findByActiveTrueOrderByDisplayOrderAsc();
    }

    public List<DestinationCard> getFeatured() {
        return repo.findByFeaturedTrueAndActiveTrueOrderByDisplayOrderAsc();
    }

    // Admin CRUD
    public List<DestinationCard> getAll() {
        return repo.findAll(Sort.by("displayOrder").ascending());
    }

    public DestinationCard create(DestinationCard card, String adminEmail) {
        card.setCreatedAt(LocalDateTime.now());
        card.setUpdatedAt(LocalDateTime.now());
        card.setUpdatedBy(adminEmail);
        card.setActive(true);
        return repo.save(card);
    }

    public DestinationCard update(String id, DestinationCard updated, String adminEmail) {
        DestinationCard existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        existing.setTitle(updated.getTitle());
        existing.setDestination(updated.getDestination());
        existing.setState(updated.getState());
        existing.setTagline(updated.getTagline());
        existing.setDescription(updated.getDescription());
        existing.setImageUrl(updated.getImageUrl());
        existing.setCategory(updated.getCategory());
        existing.setBadge(updated.getBadge());
        existing.setActive(updated.isActive());
        existing.setDisplayOrder(updated.getDisplayOrder());
        existing.setFeatured(updated.isFeatured());
        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedBy(adminEmail);
        return repo.save(existing);
    }

    public void delete(String id) {
        repo.deleteById(id);
    }

    public DestinationCard toggleActive(String id, String email) {
        DestinationCard card = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        card.setActive(!card.isActive());
        card.setUpdatedAt(LocalDateTime.now());
        card.setUpdatedBy(email);
        return repo.save(card);
    }

    public DestinationCard toggleFeatured(String id, String email) {
        DestinationCard card = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        card.setFeatured(!card.isFeatured());
        card.setUpdatedAt(LocalDateTime.now());
        card.setUpdatedBy(email);
        return repo.save(card);
    }

    public DestinationCard updateOrder(String id, int newOrder, String email) {
        DestinationCard card = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        card.setDisplayOrder(newOrder);
        card.setUpdatedAt(LocalDateTime.now());
        card.setUpdatedBy(email);
        return repo.save(card);
    }
}
