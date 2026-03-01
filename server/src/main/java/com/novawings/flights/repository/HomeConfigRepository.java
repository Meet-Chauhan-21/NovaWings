package com.novawings.flights.repository;

import com.novawings.flights.model.HomeConfig;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HomeConfigRepository extends MongoRepository<HomeConfig, String> {

    Optional<HomeConfig> findFirstByOrderByUpdatedAtDesc();
}
