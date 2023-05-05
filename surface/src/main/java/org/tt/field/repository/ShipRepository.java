package org.tt.field.repository;

import java.util.Collection;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.tt.field.domain.Ship;

public interface ShipRepository extends JpaRepository<Ship, Long> {

    @Query("SELECT s FROM Ship s WHERE s.mission != null")
    Collection<Ship> findAllAssignedShips();
}
