package org.tt.field.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.tt.field.domain.Mission;

/**
 * Repository for mission entities.
 * 
 * @author terratenff
 */
public interface MissionRepository extends JpaRepository<Mission, Long> {
    
}
