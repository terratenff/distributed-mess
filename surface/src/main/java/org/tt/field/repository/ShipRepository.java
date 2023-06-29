package org.tt.field.repository;

import java.util.Collection;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.tt.field.domain.Ship;

/**
 * Repository for ship entities.
 * 
 * @author terratenff
 */
public interface ShipRepository extends JpaRepository<Ship, Long> {

    /**
     * Queries for those ship entities that have been assigned a mission.
     * @return List of assigned ships.
     */
    @Query("SELECT s FROM Ship s WHERE s.mission != null")
    Collection<Ship> findAllAssignedShips();
}
