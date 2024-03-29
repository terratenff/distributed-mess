package org.tt.field.controllers.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Map;

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
import org.tt.field.core.EntityValidation;
import org.tt.field.domain.Event;
import org.tt.field.domain.Mission;
import org.tt.field.repository.EventRepository;
import org.tt.field.repository.MissionRepository;

/**
 * API controller class for the handling of mission entities.
 * 
 * @author terratenff
 */
@RestController
@RequestMapping("/missions")
public class MissionController {
    private final MissionRepository missionRepository;
    private final EventRepository eventRepository;

    private static Logger logger = LoggerFactory.getLogger(MissionController.class);

    public MissionController(MissionRepository missionRepository, EventRepository eventRepository) {
        this.missionRepository = missionRepository;
        this.eventRepository = eventRepository;
    }
    
    /**
     * @return Every mission entity.
     */
    @GetMapping
    public List<Mission> getMissions() {
        return missionRepository.findAll();
    }

    /**
     * @param id Mission ID.
     * @return Mission with specified ID.
     */
    @GetMapping("/{id}")
    public Mission getMission(@PathVariable Long id) {
        return missionRepository.findById(id).orElseThrow(RuntimeException::new);
    }

    /**
     * Adds a mission entity.
     * @param mission Mission entity to be added.
     * @return Return value for getting added mission.
     * @throws URISyntaxException
     */
    @PostMapping
    public ResponseEntity<Mission> createMission(@RequestBody Mission mission) throws URISyntaxException {

        if (!EntityValidation.validateMission(mission)) {
            logger.error("Mission creation was aborted.");
            return ResponseEntity.badRequest().build();
        }

        logger.info("A mission was added.");

        Mission savedMission = missionRepository.save(mission);
        return ResponseEntity.created(new URI("/missions/" + savedMission.getId())).body(savedMission);
    }

    /**
     * Edits existing mission entity.
     * @param id Mission ID.
     * @param mission Mission entity that replaces target mission entity.
     * @return ok.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Mission> updateMission(@PathVariable Long id, @RequestBody Mission mission) {

        if (!EntityValidation.validateMission(mission)) {
            logger.error("Mission editing was aborted.");
            return ResponseEntity.badRequest().build();
        }

        Mission currentMission = missionRepository.findById(id).orElse(null);
        if (currentMission == null) {
            logger.error("Mission with ID " + id + " not found.");
            return ResponseEntity.notFound().build();
        }

        logger.info("A mission was edited.");

        currentMission.setTitle(mission.getTitle());
        currentMission.setObjective(mission.getObjective());
        currentMission.setDescription(mission.getDescription());
        currentMission.setCenterX(mission.getCenterX());
        currentMission.setCenterY(mission.getCenterY());
        currentMission.setCenterZ(mission.getCenterZ());
        currentMission.setRadius(mission.getRadius());
        currentMission.setCurrentDestination(mission.getCurrentDestination());
        currentMission.setDepartureTime(mission.getDepartureTime());
        currentMission.setArrivalTime(mission.getArrivalTime());
        currentMission = missionRepository.save(mission);

        return ResponseEntity.ok(currentMission);
    }

    /**
     * Deletes existing mission entity.
     * @param id Mission ID.
     * @return ok.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Mission> deleteMission(@PathVariable Long id) {

        Mission currentMission = missionRepository.findById(id).orElse(null);
        if (currentMission == null) {
            logger.warn("Mission with ID " + id + " not found.");
            return ResponseEntity.notFound().build();
        }

        logger.info("A mission was deleted.");
        
        missionRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Creates an event entity for existing mission entity.
     * @param id Mission ID.
     * @param eventData Contents of the event.
     * @return ok. (notFound is returned if specified mission could not be found)
     */
    @PostMapping("/{id}/events")
    public ResponseEntity<String> createEventForMission(@PathVariable Long id, @RequestBody Map<String, String> eventData) {
        Mission mission = missionRepository.findById(id).orElse(null);
        if (mission == null) {
            logger.error("Mission with ID " + id + " not found.");
            return ResponseEntity.notFound().build();
        }

        Event event = new Event(Timestamp.from(Instant.now()), eventData.get("description"));
        
        if (!EntityValidation.validateEvent(event)) {
            logger.error("Event creation for a mission was aborted.");
            return ResponseEntity.badRequest().build();
        }

        logger.info("An event was created for a mission.");
        event = eventRepository.save(event);

        List<Event> events = mission.getEvents();
        events.add(event);
        mission.setEvents(events);
        missionRepository.save(mission);

        return ResponseEntity.ok().build();
    }
}
