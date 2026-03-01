package com.novawings.flights.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "home_config")
public class HomeConfig {

    @Id
    private String id;

    private List<RouteConfig> popularRoutes;

    private List<RouteConfig> dealRoutes;

    private String heroTitle;

    private String heroSubtitle;

    private LocalDateTime updatedAt;

    private String updatedBy;
}
