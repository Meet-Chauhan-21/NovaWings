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
@Document(collection = "locations")
public class Location {

    @Id
    private String id;

    private String city;          // "Mumbai"
    private String state;         // "Maharashtra"
    private String country;       // "India"
    private String airportCode;   // "BOM"
    private String airportName;   // "Chhatrapati Shivaji Maharaj Int'l"
    private String type;          // "metro" | "city" | "town"
    private boolean active;       // admin can disable a city
    private int displayOrder;     // admin controls sort order
    private boolean showOnExplore; // show on explore page city grid
    private boolean showOnHome;    // show on home popular cities

    // Auto-calculated — updated by system
    private long totalFlights;    // count of flights from this city
    private long activeFlights;   // count of SCHEDULED flights

    // Admin metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String updatedBy;
}
