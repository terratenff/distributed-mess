package org.tt.field.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.tt.field.domain.Log;

public interface LogRepository extends JpaRepository<Log, Long> {
    
}
