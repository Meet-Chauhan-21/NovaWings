package com.novawings.flights.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "destination_cards")
public class DestinationCard {

    @Id
    private String id;

    private String title;         // "Goa — Beach Paradise"
    private String destination;   // city name — links to flight search
    private String state;         // "Goa"
    private String tagline;       // "Sun, sand & sea"
    private String description;   // 1-2 lines about destination
    private String imageUrl;      // Unsplash URL
    private String category;      // "Beach"|"Hills"|"Heritage"|"Honeymoon"
                                  // |"Adventure"|"Spiritual"|"Wildlife"
                                  // |"City Break"|"Weekend Getaway"
    private String badge;         // "🔥 Trending"|"💕 Honeymoon"
                                  // |"🏔 Adventure"|"⭐ Popular"
    private boolean active;       // admin can disable
    private int displayOrder;     // admin controls position
    private boolean featured;     // show in top row (larger card)

    // Admin metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String updatedBy;
}
