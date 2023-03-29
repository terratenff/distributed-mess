package org.tt.field.controllers.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static Logger logger = LoggerFactory.getLogger(ShipController.class);

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
        logger.info("A ship was added.");

        Ship savedShip = shipRepository.save(ship);
        return ResponseEntity.created(new URI("/ships/" + savedShip.getId())).body(savedShip);
    }

    @PutMapping("/{id}")
    public ResponseEntity updateShip(@PathVariable Long id, @RequestBody Ship ship) {
        logger.info("A ship was edited.");

        Ship currentShip = shipRepository.findById(id).orElseThrow(RuntimeException::new);
        currentShip.setName(ship.getName());
        currentShip.setStatus(ship.getStatus());
        currentShip = shipRepository.save(ship);

        return ResponseEntity.ok(currentShip);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity deleteShip(@PathVariable Long id) {
        logger.info("A ship was deleted.");
        
        shipRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
