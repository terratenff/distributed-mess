package org.tt.field.controllers.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.tt.field.domain.Ship;
import org.tt.field.repository.ShipRepository;

@RestController
@RequestMapping("/ships")
public class ShipController {
    private final ShipRepository shipRepository;

    public ShipController(ShipRepository shipRepository) {
        this.shipRepository = shipRepository;
    }

    @GetMapping
    public List<Ship> getShips() {
        return shipRepository.findAll();
    }

    @GetMapping("/{id}")
    public Ship getShip(@PathVariable Long id) {
        return shipRepository.findById(id).orElseThrow(RuntimeException::new);
    }

    @PostMapping
    public ResponseEntity createShip(@RequestBody Ship ship) throws URISyntaxException {
        Ship savedShip = shipRepository.save(ship);
        return ResponseEntity.created(new URI("/ships/" + savedShip.getId())).body(savedShip);
    }

    @PutMapping("/{id}")
    public ResponseEntity updateShip(@PathVariable Long id, @RequestBody Ship ship) {
        Ship currentShip = shipRepository.findById(id).orElseThrow(RuntimeException::new);
        currentShip.setName(ship.getName());
        currentShip.setStatus(ship.getStatus());
        currentShip = shipRepository.save(ship);

        return ResponseEntity.ok(currentShip);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity deleteShip(@PathVariable Long id) {
        shipRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}