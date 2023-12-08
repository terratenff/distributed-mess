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

    /**
     * Queries specified number of ships.
     * @param limit At most this many ships are returned.
     * @return List of up to <limit> ships.
     */
    @Query(value = "SELECT * FROM ship ORDER BY id DESC LIMIT ?1", nativeQuery = true)
    Collection<Ship> findRecentShips(Integer limit);

    /**
     * Queries ships by name.
     * @param name What the name of the ships should contain.
     * @return List of ships that contain specified string in their names.
     */
    @Query(value = "SELECT * FROM ship WHERE name LIKE %?2% ORDER BY id DESC LIMIT ?1", nativeQuery = true)
    Collection<Ship> findRecentShipsByName(Integer limit, String name);
}
