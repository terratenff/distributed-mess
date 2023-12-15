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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.tt.field.core.Drydock;
import org.tt.field.core.EntityValidation;
import org.tt.field.core.LaunchSite;
import org.tt.field.core.TransitShip;
import org.tt.field.domain.Event;
import org.tt.field.domain.Log;
import org.tt.field.domain.Mission;
import org.tt.field.domain.Ship;
import org.tt.field.repository.LogRepository;
import org.tt.field.repository.MissionRepository;
import org.tt.field.repository.ShipRepository;

/**
 * API controller class for the handling of ship entities.
 * 
 * @author terratenff
 */
@RestController
@RequestMapping("/ships")
public class ShipController {
    private final ShipRepository shipRepository;
    private final MissionRepository missionRepository;
    private final LogRepository logRepository;

    /**
     * A function that is expected to save a ship entity to its repository.
     */
    private Function<Ship, Ship> saveShipToRepository;

    /**
     * A function that is expected to save a ship entity's mission to its repository.
     */
    private Function<Mission, Mission> saveMissionToRepository;

    /**
     * A function that is expected to save a ship entity's log entry to its repository.
     */
    private Function<Log, Log> saveLogToRepository;

    private static Logger logger = LoggerFactory.getLogger(ShipController.class);

    public ShipController(ShipRepository shipRepository, MissionRepository missionRepository, LogRepository logRepository) {
        this.shipRepository = shipRepository;
        this.missionRepository = missionRepository;
        this.logRepository = logRepository;

        saveShipToRepository = ship -> {
            return this.shipRepository.save(ship);
        };

        saveMissionToRepository = mission -> {
            return this.missionRepository.save(mission);
        };

        saveLogToRepository = log -> {
            return this.logRepository.save(log);
        };
    }

    /**
     * @return Every ship entity.
     */
    @GetMapping
    public List<Ship> getShips() {
        return shipRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    /**
     * @return Number of ship entities in the database.
     */
    @GetMapping("/count")
    public Long getShipCount() {
        return shipRepository.count();
    }

    /**
     * Get most recently added ships by name.
     * @param limitStr How many ships are returned at most.
     * @param query What must ship name contain in order to be fetched.
     * @return Up to <limit> ships that contain <query> in their names.
     */
    @GetMapping("/recent")
    public List<Ship> getRecentShips(
        @RequestParam(name = "limit", defaultValue = "25") String limitStr,
        @RequestParam(name = "query", defaultValue = "") String query) {
            try {
                final int limit = Integer.parseInt(limitStr);
                if (query.isEmpty()) {
                    return new ArrayList<Ship>(shipRepository.findRecentShips(limit));
                } else {
                    return new ArrayList<Ship>(shipRepository.findRecentShipsByName(limit, query));
                }
            } catch (NumberFormatException e) {
                return List.of();
            }
    }

    /**
     * @return Every ship entity that has an assigned mission.
     */
    @GetMapping("/assigned")
    public List<Ship> getAssignedShips() {
        return new ArrayList<Ship>(shipRepository.findAllAssignedShips());
    }

    /**
     * @param id Ship ID.
     * @return Ship with specified ID.
     */
    @GetMapping("/{id}")
    public Ship getShip(@PathVariable Long id) {
        return shipRepository.findById(id).orElseThrow(RuntimeException::new);
    }

    /**
     * Adds a ship entity.
     * @param ship Ship entity to be added.
     * @return Return value for getting added ship.
     * @throws URISyntaxException
     */
    @PostMapping
    public ResponseEntity<Ship> createShip(@RequestBody Ship ship) throws URISyntaxException {

        if (!EntityValidation.validateShip(ship)) {
            logger.error("Ship creation was aborted.");
            return ResponseEntity.badRequest().build();
        }

        logger.info("A ship was added.");

        Ship savedShip = shipRepository.save(ship);
        return ResponseEntity.created(new URI("/ships/" + savedShip.getId())).body(savedShip);
    }

    /**
     * Edits existing ship entity.
     * @param id Ship ID.
     * @param ship Ship entity that replaces target ship entity.
     * @return ok.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Ship> updateShip(@PathVariable Long id, @RequestBody Ship ship) {

        if (!EntityValidation.validateShip(ship)) {
            logger.error("Ship editing was aborted.");
            return ResponseEntity.badRequest().build();
        }

        Ship currentShip = shipRepository.findById(id).orElse(null);
        if (currentShip == null) {
            logger.error("Ship with ID " + id + " not found.");
            return ResponseEntity.notFound().build();
        }

        logger.info("A ship was edited.");

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

    /**
     * Deletes existing ship entity.
     * @param id Ship ID.
     * @return ok.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteShip(@PathVariable Long id) {

        Ship ship = shipRepository.findById(id).orElse(null);
        if (ship == null) {
            logger.warn("Ship with ID " + id + " not found.");
            return ResponseEntity.notFound().build();
        }

        logger.info("A ship was deleted.");
        shipRepository.deleteById(id);

        return ResponseEntity.ok().build();
    }

    /**
     * Creates a log entity for existing ship entity.
     * @param id Ship ID.
     * @param logData Contents of the log.
     * @return ok. (notFound is returned if specified ship could not be found)
     */
    @PostMapping("/{id}/logs")
    public ResponseEntity<String> createLogForShip(@PathVariable Long id, @RequestBody Map<String, String> logData) {
        
        Ship ship = shipRepository.findById(id).orElse(null);
        if (ship == null) {
            logger.error("Ship with ID " + id + " not found.");
            return ResponseEntity.notFound().build();
        }

        Log log = new Log(Timestamp.from(Instant.now()), logData.get("description"));
        
        if (!EntityValidation.validateLog(log)) {
            logger.error("Log creation for a ship was aborted.");
            return ResponseEntity.badRequest().build();
        }
        
        logger.info("A log was created for a ship.");
        log = logRepository.save(log);

        List<Log> logs = ship.getLogs();
        logs.add(log);
        ship.setLogs(logs);
        shipRepository.save(ship);

        return ResponseEntity.ok().build();
    }

    /**
     * Sends specified ship entity to dry dock for repairs. If the ship does not
     * need repairs, nothing is done. A ship can only be repaired if it is "READY".
     * @param ship Ship.
     * @return ok. (notFound is returned if specified ship could not be found)
     */
    @PostMapping("/repair")
    public ResponseEntity<String> sendShipForRepairs(@RequestBody Ship ship) {

        if (!Drydock.getInstance().isInitialized()) {
            Drydock.getInstance().initialize(saveShipToRepository, saveLogToRepository);
        }

        if (!EntityValidation.validateShip(ship)) {
            logger.error("Ship repairs were aborted.");
            return ResponseEntity.badRequest().build();
        }

        Long id = ship.getId();
        Ship targetShip = shipRepository.findById(id).orElse(null);
        if (targetShip == null) {
            logger.error("Ship with ID " + id + " not found.");
            return ResponseEntity.notFound().build();
        } else if (targetShip.getStatus().equals("READY") || targetShip.getStatus().equals("BROKEN")) {
            int position = Drydock.getInstance().addToQueue(targetShip);
            logger.info("Ship with ID " + id + " has been sent to the drydock for repairs. Queue number: " + position + ".");
        } else {
            logger.warn("Ship with ID " + id + " does not need repairs.");
        }
        
        return ResponseEntity.ok().build();
    }

    /**
     * Aborts the repairs of selected ship, as long as the repairs have not been started yet.
     * A ship can only abort its repairs if it is "AWAITING_REPAIRS".
     * @param ship Ship.
     * @return ok. (notFound is returned if specified ship could not be found)
     */
    @PostMapping("/abort-repair")
    public ResponseEntity<String> abortShipRepairs(@RequestBody Ship ship) {

        if (!Drydock.getInstance().isInitialized()) {
            Drydock.getInstance().initialize(saveShipToRepository, saveLogToRepository);
        }

        if (!EntityValidation.validateShip(ship)) {
            logger.error("Could not abort ship repairs.");
            return ResponseEntity.badRequest().build();
        }

        Long id = ship.getId();
        Ship targetShip = shipRepository.findById(id).orElse(null);
        if (targetShip == null) {
            logger.error("Ship with ID " + id + " not found.");
            return ResponseEntity.notFound().build();
        } else if (targetShip.getStatus().startsWith("AWAITING_REPAIRS")) {
             Drydock.getInstance().removeFromQueue(targetShip);
            logger.info("Ship with ID " + id + " has been removed from the dry dock repair queue.");
        } else {
            logger.warn("Ship with ID " + id + " is not awaiting repairs.");
        }
        
        return ResponseEntity.ok().build();
    }

    /**
     * Decommissions specified ship, making it unusable.
     * @param ship Ship.
     * @return ok. (notFound is returned if specified ship could not be found)
     */
    @PostMapping("/decommission")
    public ResponseEntity<String> decommissionShip(@RequestBody Ship ship) {

        if (!EntityValidation.validateShip(ship)) {
            logger.error("Ship decommission aborted.");
            return ResponseEntity.badRequest().build();
        }

        Long id = ship.getId();
        Ship targetShip = shipRepository.findById(id).orElse(null);
        if (targetShip == null) {
            logger.error("Ship with ID " + id + " not found.");
            return ResponseEntity.notFound().build();
        } else if (!targetShip.getStatus().equals("READY") &&
                   !targetShip.getStatus().equals("BROKEN")) {
            logger.error("Ship with ID " + id + " must be available before it can be decommissioned.");
            return ResponseEntity.badRequest().build();
        } else {
            logger.info("Ship with ID " + id + " has been decommissioned.");
            targetShip.setStatus("DECOMMISSIONED");
            shipRepository.save(targetShip);
        }

        return ResponseEntity.ok().build();
    }

    /**
     * Sends specified ship to the launch site, where it will wait for launch.
     * A ship can only be sent to the launch site if it is "READY" and assigned to a mission.
     * @param ship Ship.
     * @return ok. (notFound is returned if specified ship could not be found)
     */
    @PostMapping("/launch")
    public ResponseEntity<String> launchShip(@RequestBody Ship ship) {

        if (!LaunchSite.getInstance().isInitialized()) {
            LaunchSite.getInstance().initialize(saveShipToRepository, saveMissionToRepository, saveLogToRepository);
        }

        if (!EntityValidation.validateShip(ship)) {
            logger.error("Ship launch aborted.");
            return ResponseEntity.badRequest().build();
        }

        Long id = ship.getId();
        Ship targetShip = shipRepository.findById(id).orElse(null);
        if (targetShip == null) {
            logger.error("Ship with ID " + id + " not found.");
            return ResponseEntity.notFound().build();
        } else if (targetShip.getStatus().equals("READY") &&
                   targetShip.getMission() != null) {
            int position = LaunchSite.getInstance().addToQueue(targetShip);
            logger.info("Ship with ID " + id + " has been sent to the launch site. Queue number: " + position + ".");
        } else {
            logger.error("Ship with ID " + id + " cannot be launched, since it either is not ready or is not assigned to a mission.");
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok().build();
    }

    /**
     * Sends every assigned and "READY" ship to the launch site, where they will wait for launch.
     * @return ok. (notFound is returned if there are no ships with assigned missions available)
     */
    @PostMapping("/launch-all")
    public ResponseEntity<String> launchAllShips() {

        if (!LaunchSite.getInstance().isInitialized()) {
            LaunchSite.getInstance().initialize(saveShipToRepository, saveMissionToRepository, saveLogToRepository);
        }

        Collection<Ship> assignedShips = shipRepository.findAllAssignedShips();
        if (assignedShips == null || assignedShips.size() == 0) {
            logger.warn("No assigned ships could be found.");
            return ResponseEntity.noContent().build();
        }
        for (Ship ship : assignedShips) {
            if (ship.getStatus().equals("READY")) {
                int position = LaunchSite.getInstance().addToQueue(ship);
                logger.info("Ship with ID " + ship.getId() + " has been sent to the launch site. Queue number: " + position + ".");
            }
        }
        return ResponseEntity.ok().build();
    }

    /**
     * Receives an inbound ship entity. It is instructed to land.
     * @param ship Inbound ship. It must exist and be active on surface module.
     * @return ok (notFound if ship is not found, and badRequest if ship is not active)
     */
    @PostMapping("/receive-ship")
    public ResponseEntity<String> receiveShip(@RequestBody Ship ship) {

        Long id = ship.getId();
        Ship targetShip = shipRepository.findById(id).orElse(null);
        if (targetShip == null) {
            logger.error("Ship with ID " + id + " not found.");
            return ResponseEntity.notFound().build();
        } else if (!targetShip.getStatus().equals("ACTIVE")) {
            logger.error("Ship with ID " + id + " is not active: invalid ship received.");
            return ResponseEntity.badRequest().build();
        }

        // Transfer changes that occurred to the ship.
        List<Log> shipLogs = ship.getLogs();
        List<Event> missionEvents = ship.getMission().getEvents();
        List<Log> targetShipLogs = targetShip.getLogs();
        List<Event> targetMissionEvents = targetShip.getMission().getEvents();

        for (Log log : shipLogs) {
            if (log.getId() <= -1) {
                Log newLog = new Log();
                newLog.setTimestamp(log.getTimestamp());
                newLog.setDescription(log.getDescription());
                targetShipLogs.add(newLog);
            }
        }

        for (Event event : missionEvents) {
            if (event.getId() <= -1) {
                Event newEvent = new Event();
                newEvent.setTimestamp(event.getTimestamp());
                newEvent.setDescription(event.getDescription());
                targetMissionEvents.add(newEvent);
            }
        }

        Mission updatedMission = targetShip.getMission();
        updatedMission.setEvents(targetMissionEvents);
        missionRepository.save(updatedMission);

        targetShip.setLogs(targetShipLogs);
        targetShip.setCondition(ship.getCondition());
        targetShip.setStatus("INBOUND");
        targetShip = shipRepository.save(targetShip);

        logger.info("Ship with ID " + ship.getId() + " has arrived to surface. It is inbound.");

        TransitShip transitShip = new TransitShip(targetShip, saveShipToRepository, saveMissionToRepository);
        transitShip.toSurface();
        transitShip.start();
        return ResponseEntity.ok().build();
    }

    /**
     * Instructs specified ship to abort its mission. Nothing is done if the ship does not have an
     * assigned mission.
     * @param ship Ship.
     * @return ok. (notFound is returned if specified ship could not be found)
     */
    @PostMapping("/abort")
    public ResponseEntity<String> abortMission(@RequestBody Ship ship) {

        if (!LaunchSite.getInstance().isInitialized()) {
            LaunchSite.getInstance().initialize(saveShipToRepository, saveMissionToRepository, saveLogToRepository);
        }

        if (!EntityValidation.validateShip(ship)) {
            logger.error("Mission abort operation cancelled.");
            return ResponseEntity.badRequest().build();
        }

        Long id = ship.getId();
        Ship targetShip = shipRepository.findById(id).orElse(null);
        if (targetShip == null) {
            logger.error("Ship with ID " + id + " not found.");
            return ResponseEntity.notFound().build();
        } else if (targetShip.getMission() != null) {
            TransitShip.abortMission(targetShip);
            LaunchSite.getInstance().abortMission(targetShip);
            logger.info("Ship with ID " + id + " has been instructed to abort its mission.");
        } else {
            logger.warn("Ship with ID " + id + " does not have a mission to abort.");
        }

        return ResponseEntity.ok().build();
    }

    /**
     * Instructs every assigned ship to abort their missions.
     * @return ok. (notFound is returned if there are no ships with assigned missions available)
     */
    @PostMapping("/abort-all")
    public ResponseEntity<String> abortAllMissions() {

        if (!LaunchSite.getInstance().isInitialized()) {
            LaunchSite.getInstance().initialize(saveShipToRepository, saveMissionToRepository, saveLogToRepository);
        }

        Collection<Ship> assignedShips = shipRepository.findAllAssignedShips();
        if (assignedShips == null || assignedShips.size() == 0) {
            logger.warn("No assigned ships could be found.");
            return ResponseEntity.noContent().build();
        }
        for (Ship ship : assignedShips) {
            TransitShip.abortMission(ship);
            LaunchSite.getInstance().abortMission(ship);
            logger.info("Ship with ID " + ship.getId() + " has been instructed to abort its mission.");
        }

        return ResponseEntity.ok().build();
    }
}
