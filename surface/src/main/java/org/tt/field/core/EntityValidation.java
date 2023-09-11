package org.tt.field.core;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.tt.field.domain.Event;
import org.tt.field.domain.Log;
import org.tt.field.domain.Mission;
import org.tt.field.domain.Ship;

/**
 * Utility class that is used to validate database entities.
 * 
 * @author terratenff
 */
public class EntityValidation {

    private static Logger logger = LoggerFactory.getLogger(EntityValidation.class);

    private static final int SHIP_CONDITION_LIMIT = 500;
    private static final int SHIP_NAME_LIMIT = 50;
    private static final int SHIP_DESCRIPTION_LIMIT = 255;

    private static final String[] MISSION_VALID_OBJECTIVES = {"Exploration", "Transportation", "Search"};
    private static final int MISSION_TITLE_LIMIT = 50;
    private static final int MISSION_DESCRIPTION_LIMIT = 255;
    private static final int MISSION_COORDINATE_MIN = -1000;
    private static final int MISSION_COORDINATE_MAX = 1000;
    private static final int MISSION_RADIUS_LIMIT = 1000;

    private static final int LOG_DESCRIPTION_LIMIT = 255;
    private static final int EVENT_DESCRIPTION_LIMIT = 255;
    
    private EntityValidation() {}

    /**
     * Validate provided ship entity. If it is invalid, the factor that makes it invalid is logged.
     * @param ship Ship entity subject to validation.
     * @return true, if the ship entity is valid. false otherwise.
     */
    public static boolean validateShip(Ship ship) {

        boolean valid = true;

        if (ship == null) {
            logger.error("Ship is null.");
            return false;
        }

        boolean validCondition = ship.getCondition() <= SHIP_CONDITION_LIMIT &&
                                     ship.getPeakCondition() <= SHIP_CONDITION_LIMIT;
        
        boolean validConditionState = ship.getCondition() <= ship.getPeakCondition();

        boolean validConditionNegative = ship.getCondition() >= 0 &&
                                     ship.getPeakCondition() >= 0;

        boolean validName = ship.getName().length() <= SHIP_NAME_LIMIT;

        boolean validDescription = ship.getDescription() == null || ship.getDescription().length() <= SHIP_DESCRIPTION_LIMIT;

        boolean validMission = true;
        if (ship.getMission() != null) {
            validMission = validateMission(ship.getMission());
        }

        if (!validCondition) {
            logger.error("Peak condition is exceeded: " + SHIP_CONDITION_LIMIT + " vs. "
            + ship.getCondition() + " / " + ship.getPeakCondition());
            valid = false;
        }
        
        if (!validConditionState) {
            logger.error("Condition cannot be greater than peak condition: "
            + ship.getCondition() + " / " + ship.getPeakCondition());
            valid = false;
        }

        if (!validConditionNegative) {
            logger.error("Conditions cannot be negative: " + ship.getCondition() + " / " + ship.getPeakCondition());
            valid = false;
        }
        
        if (!validName) {
            logger.error("Ship name is too long: "
            + SHIP_NAME_LIMIT + " vs. " + ship.getName().length());
            valid = false;
        }
        
        if (!validDescription) {
            logger.error("Ship description is too long: "
            + SHIP_DESCRIPTION_LIMIT + " vs. " + ship.getDescription().length());
            valid = false;
        }

        if (!validMission) {
            logger.error("Ship mission is invalid.");
            valid = false;
        }

        return valid;
    }

    /**
     * Validate provided mission entity. If it is invalid, the factor that makes it invalid is logged.
     * @param mission Mission entity subject to validation.
     * @return true, if the mission entity is valid. false otherwise.
     */
    public static boolean validateMission(Mission mission) {

        boolean valid = true;

        if (mission == null) {
            logger.error("Mission is null.");
            return false;
        }

        boolean validMissionObjective = false;
        for (String missionObjective : MISSION_VALID_OBJECTIVES) {
            if (mission.getObjective().equals(missionObjective)) {
                validMissionObjective = true;
                break;
            }
        }

        boolean validTitle = mission.getTitle().length() <= MISSION_TITLE_LIMIT;

        boolean validCoordinateX = mission.getCenterX() >= MISSION_COORDINATE_MIN &&
                                    mission.getCenterX() <= MISSION_COORDINATE_MAX;
        boolean validCoordinateY = mission.getCenterX() >= MISSION_COORDINATE_MIN &&
                                    mission.getCenterX() <= MISSION_COORDINATE_MAX;
        boolean validCoordinateZ = mission.getCenterX() >= MISSION_COORDINATE_MIN &&
                                    mission.getCenterX() <= MISSION_COORDINATE_MAX;
        
        boolean validRadius = mission.getRadius() <= MISSION_RADIUS_LIMIT;
        boolean validRadiusNegative = mission.getRadius() >= 0;

        boolean validDescription = mission.getDescription() == null || mission.getDescription().length() <= MISSION_DESCRIPTION_LIMIT;

        if (!validMissionObjective) {
            logger.error("Invalid mission objective: " + mission.getObjective());
            valid = false;
        }

        if (!validTitle) {
            logger.error("Mission title is too long: "
            + MISSION_TITLE_LIMIT + " vs. " + mission.getTitle().length());
            valid = false;
        }

        if (!validCoordinateX) {
            logger.error("X-coordinate must be within range ["
            + MISSION_COORDINATE_MIN + ", " + MISSION_COORDINATE_MAX
            + "], but is " + mission.getCenterX());
            valid = false;
        }

        if (!validCoordinateY) {
            logger.error("Y-coordinate must be within range ["
            + MISSION_COORDINATE_MIN + ", " + MISSION_COORDINATE_MAX
            + "], but is " + mission.getCenterY());
            valid = false;
        }

        if (!validCoordinateZ) {
            logger.error("Z-coordinate must be within range ["
            + MISSION_COORDINATE_MIN + ", " + MISSION_COORDINATE_MAX
            + "], but is " + mission.getCenterZ());
            valid = false;
        }

        if (!validRadius) {
            logger.error("Mission radius is too high: "
            + MISSION_RADIUS_LIMIT + " vs. " + mission.getRadius());
            valid = false;
        }

        if (!validRadiusNegative) {
            logger.error("Mission radius cannot be negative: " + mission.getRadius());
            valid = false;
        }

        if (!validDescription) {
            logger.error("Mission description is too long: "
            + MISSION_DESCRIPTION_LIMIT + " vs. " + mission.getDescription());
            valid = false;
        }

        return valid;
    }

    /**
     * Validate provided log entity. If it is invalid, the factor that makes it invalid is logged.
     * @param log Log entity subject to validation.
     * @return true, if the log entity is valid. false otherwise.
     */
    public static boolean validateLog(Log log) {

        boolean valid = true;

        if (log == null) {
            logger.error("Log is null.");
            return false;
        }

        boolean validDescription = log.getDescription().length() <= MISSION_DESCRIPTION_LIMIT;

        if (!validDescription) {
            logger.error("Log description is too long: "
            + LOG_DESCRIPTION_LIMIT + " vs. " + log.getDescription());
            valid = false;
        }

        return valid;
    }

    /**
     * Validate provided event entity. If it is invalid, the factor that makes it invalid is logged.
     * @param event Event entity subject to validation.
     * @return true, if the event entity is valid. false otherwise.
     */
    public static boolean validateEvent(Event event) {

        boolean valid = true;

        if (event == null) {
            logger.error("Event is null.");
            return false;
        }

        boolean validDescription = event.getDescription().length() <= MISSION_DESCRIPTION_LIMIT;

        if (!validDescription) {
            logger.error("Log description is too long: "
            + EVENT_DESCRIPTION_LIMIT + " vs. " + event.getDescription());
            valid = false;
        }

        return valid;
    }
}
