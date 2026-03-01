package com.novawings.flights.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteConfig {
    private String source;
    private String destination;
    private String label;
    private boolean active;
}
