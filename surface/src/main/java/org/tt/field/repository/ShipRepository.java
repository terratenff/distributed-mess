package org.tt.field.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.tt.field.domain.Ship;

public interface ShipRepository extends JpaRepository<Ship, Long> {
}
