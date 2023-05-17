package org.tt.field.controllers.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.tt.field.core.Drydock;
import org.tt.field.core.LaunchSite;
import org.tt.field.core.TransitShip;
import org.tt.field.domain.Log;
import org.tt.field.domain.Mission;
import org.tt.field.domain.Ship;
import org.tt.field.repository.LogRepository;
import org.tt.field.repository.MissionRepository;
import org.tt.field.repository.ShipRepository;

@RestController
@RequestMapping("/ships")
public class ShipController {
    private final ShipRepository shipRepository;
    private final MissionRepository missionRepository;
    private final LogRepository logRepository;

    private Function<Ship, Ship> saveShipToRepository;
    private Function<Mission, Mission> saveMissionToRepository;
    private Function<Log, Log> saveLogToRepository;

    private static Logger logger = LoggerFactory.getLogger(ShipController.class);

    public ShipController(ShipRepository shipRepository, MissionRepository missionRepository, LogRepository logRepository) {
        this.shipRepository = shipRepository;
        this.missionRepository = missionRepository;
        this.logRepository = logRepository;

        saveShipToRepository = ship -> {
            return shipRepository.save(ship);
        };

        saveMissionToRepository = mission -> {
            return missionRepository.save(mission);
        };

        saveLogToRepository = log -> {
            return logRepository.save(log);
        };
    }

    @GetMapping
    public List<Ship> getShips() {
        return shipRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    @GetMapping("/assigned")
    public List<Ship> getAssignedShips() {
        return new ArrayList<Ship>(shipRepository.findAllAssignedShips());
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
        currentShip.setCondition(ship.getCondition());
        currentShip.setPeakCondition(ship.getPeakCondition());
        currentShip.setDescription(ship.getDescription());
        currentShip.setMission(ship.getMission());
        currentShip.setPastMissions(ship.getPastMissions());
        currentShip.setLogs(ship.getLogs());
        currentShip = shipRepository.save(ship);

        return ResponseEntity.ok(currentShip);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity deleteShip(@PathVariable Long id) {
        logger.info("A ship was deleted.");
        
        shipRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/logs")
    public ResponseEntity createLogForShip(@PathVariable Long id, @RequestBody Map<String, String> logData) {
        Ship ship = shipRepository.findById(id).orElse(null);
        if (ship == null) {
            logger.error("Ship with ID " + id + " not found.");
            return ResponseEntity.notFound().build();
        }

        logger.info("A log was created for a ship.");

        Log log = new Log(Timestamp.from(Instant.now()), logData.get("description"));
        log = logRepository.save(log);

        List<Log> logs = ship.getLogs();
        logs.add(log);
        ship.setLogs(logs);
        shipRepository.save(ship);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/repair")
    public ResponseEntity sendShipForRepairs(@PathVariable Long id) {
        if (!Drydock.getInstance().isInitialized()) {
            Drydock.getInstance().initialize(saveShipToRepository, saveLogToRepository);
        }
        Ship ship = shipRepository.findById(id).orElse(null);
        if (ship == null) {
            logger.error("Ship with ID " + id + " not found.");
            return ResponseEntity.notFound().build();
        } else if (ship.getStatus().equals("READY") || ship.getStatus().equals("BROKEN")) {
            int position = Drydock.getInstance().addToQueue(ship);
            logger.info("Ship with ID " + id + " has been sent to the drydock for repairs. Queue number: " + position + ".");
        } else {
            logger.warn("Ship with ID " + id + " does not need repairs.");
        }
        
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/decommission")
    public ResponseEntity decommissionShip(@PathVariable Long id) {
        Ship ship = shipRepository.findById(id).orElse(null);
        if (ship == null) {
            logger.error("Ship with ID " + id + " not found.");
            return ResponseEntity.notFound().build();
        } else {
            logger.info("Ship with ID " + id + " has been decommissioned.");
            ship.setStatus("DECOMMISSIONED");
            shipRepository.save(ship);
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/launch")
    public ResponseEntity launchShip(@PathVariable Long id) {
        if (!LaunchSite.getInstance().isInitialized()) {
            LaunchSite.getInstance().initialize(saveShipToRepository, saveMissionToRepository, saveLogToRepository);
        }

        Ship ship = shipRepository.findById(id).orElse(null);
        if (ship == null) {
            logger.error("Ship with ID " + id + " not found.");
            return ResponseEntity.notFound().build();
        } else if (ship.getStatus().equals("READY")) {
            int position = LaunchSite.getInstance().addToQueue(ship);
            logger.info("Ship with ID " + id + " has been sent to the launch site. Queue number: " + position + ".");
        } else {
            logger.warn("Ship with ID " + id + " cannot be launched.");
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping("/launch-all")
    public ResponseEntity launchAllShips() {
        if (!LaunchSite.getInstance().isInitialized()) {
            LaunchSite.getInstance().initialize(saveShipToRepository, saveMissionToRepository, saveLogToRepository);
        }

        Collection<Ship> assignedShips = shipRepository.findAllAssignedShips();
        if (assignedShips == null || assignedShips.size() == 0) {
            logger.warn("No assigned ships could be found.");
            return ResponseEntity.notFound().build();
        }
        for (Ship ship : assignedShips) {
            if (ship.getStatus().equals("READY")) {
                int position = LaunchSite.getInstance().addToQueue(ship);
                logger.info("Ship with ID " + ship.getId() + " has been sent to the launch site. Queue number: " + position + ".");
            }
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/abort")
    public ResponseEntity abortMission(@PathVariable Long id) {
        if (!LaunchSite.getInstance().isInitialized()) {
            LaunchSite.getInstance().initialize(saveShipToRepository, saveMissionToRepository, saveLogToRepository);
        }

        Ship ship = shipRepository.findById(id).orElse(null);
        if (ship == null) {
            logger.error("Ship with ID " + id + " not found.");
            return ResponseEntity.notFound().build();
        } else if (ship.getMission() != null) {
            TransitShip.abortMission(ship);
            LaunchSite.getInstance().abortMission(ship);
            logger.info("Ship with ID " + id + " has been instructed to abort its mission.");
        } else {
            logger.warn("Ship with ID " + id + " does not have a mission.");
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping("/abort-all")
    public ResponseEntity abortAllMissions() {
        if (!LaunchSite.getInstance().isInitialized()) {
            LaunchSite.getInstance().initialize(saveShipToRepository, saveMissionToRepository, saveLogToRepository);
        }

        Collection<Ship> assignedShips = shipRepository.findAllAssignedShips();
        if (assignedShips == null || assignedShips.size() == 0) {
            logger.warn("No assigned ships could be found.");
            return ResponseEntity.notFound().build();
        }
        for (Ship ship : assignedShips) {
            // TODO
        }
        return ResponseEntity.ok().build();
    }
}
