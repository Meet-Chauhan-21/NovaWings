package com.novawings.flights.repository;

import com.novawings.flights.model.DestinationCard;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DestinationCardRepository extends MongoRepository<DestinationCard, String> {

    List<DestinationCard> findByActiveTrueOrderByDisplayOrderAsc();

    List<DestinationCard> findByFeaturedTrueAndActiveTrueOrderByDisplayOrderAsc();

    List<DestinationCard> findByCategoryAndActiveTrue(String category);

    @NonNull
    List<DestinationCard> findAll(@NonNull Sort sort);
}
