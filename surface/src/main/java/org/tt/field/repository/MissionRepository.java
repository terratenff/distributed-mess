package org.tt.field.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.tt.field.domain.Mission;

public interface MissionRepository extends JpaRepository<Mission, Long> {
    
}
