package org.tt.field.core;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.function.Function;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.tt.field.domain.Mission;
import org.tt.field.domain.Ship;
import org.tt.field.utils.HttpUtils;
import org.tt.field.utils.PropertyUtils;

/**
 * Simulator class for ship entities. Ships are simulated to move around the airspace,
 * either going to or returning from space.
 * 
 * @author terratenff
 */
public class TransitShip extends Thread {

    private static final Logger logger = LoggerFactory.getLogger(TransitShip.class);

    /**
     * How long the ships remain in airspace.
     */
    private static final int TRANSIT_TIME = PropertyUtils.getInteger("org.tt.field.core.TransitShip.TRANSIT_TIME", 60000);

    /**
     * How long the ships wait before trying to connect to space module again.
     */
    private static final int RETRY_TIME = PropertyUtils.getInteger("org.tt.field.core.TransitShip.RETRY_DELAY", 10000);

    /**
     * How many times the ships attempt to connect to space before giving up and returning to surface.
     */
    private static final int RETRY_CONNECTION_COUNT = 5;

    /**
     * The probability of ship condition degrading by one.
     */
    private static final double CONDITION_DEGRADATION_RATE = 0.10;

    /**
     * How much time must pass before condition degradation is checked. (milliseconds)
     */
    private static final int CONDITION_DEGRADATION_FREQUENCY = 1000;

    /**
     * List of active simulated ships.
     */
    private static List<TransitShip> shipsOnTransit = new ArrayList<TransitShip>();

    /**
     * Instructs specified ship entity to abort its current mission.
     * @param ship Ship entity that is to abort its mission.
     * @return true, if the ship's mission has been aborted (or already was aborted).
     * false, if the ship in question could not be found.
     */
    public static boolean abortMission(Ship ship) {

        // Remove inactive transit ships to avoid errors.
        cleanup();

        TransitShip targetShip = null;
        for (TransitShip transitShip : shipsOnTransit) {
            if (transitShip.ship.equals(ship)) {
                targetShip = transitShip;
                break;
            }
        }

        if (targetShip != null && !targetShip.direction) {
            targetShip.abortMission = true;
            return true;
        } else {
            return false;
        }
    }

    /**
     * Removes all transit ships that are no longer being used (concluded = true).
     */
    public static void cleanup() {
        int i = 0;
        while (i < shipsOnTransit.size()) {
            TransitShip transitShip = shipsOnTransit.get(i);
            if (transitShip.concluded) {
                shipsOnTransit.remove(i);
            } else {
                i++;
            }
        }
    }

    /**
     * The ship entity that the transit ship represents.
     */
    private Ship ship;

    /**
     * A function that is expected to save the ship entity to its repository.
     */
    private Function<Ship, Ship> saveShipToRepository;

    /**
     * A function that is expected to save the ship entity's mission to its repository.
     */
    private Function<Mission, Mission> saveMissionToRepository;

    private Random random = new Random();
    
    /**
     * Determines whether the ship entity has aborted its mission.
     */
    private boolean abortMission = false;

    /**
     * Determines whether the transit ship has concluded its service to the ship entity.
     * If this is true, the transit ship is removed during a cleanup.
     */
    private boolean concluded = false;

    /**
     * Determines whether the ship entity has completed its mission.
     */
    private boolean missionCompleted = true;

    /**
     * Ship direction. true: to space. false: to surface.
     */
    private boolean direction = true;

    /**
     * Transit ship constructor.
     * @param ship Ship entity that is to be represented.
     * @param saveShipToRepository Function that must save ship entity to its repository.
     * @param saveMissionToRepository Function that must save ship entity's mission to its repository.
     */
    public TransitShip(Ship ship, Function<Ship, Ship> saveShipToRepository, Function<Mission, Mission> saveMissionToRepository) {
        this.ship = ship;
        this.saveShipToRepository = saveShipToRepository;
        this.saveMissionToRepository = saveMissionToRepository;

        shipsOnTransit.add(this);
    }

    /**
     * Set ship direction to space.
     */
    public void toSpace() {
        direction = true;
    }

    /**
     * Set ship direction to surface.
     */
    public void toSurface() {
        direction = false;
    }

    public void run() {
        if (direction) {
            moveToSpace();
        } else {
            moveToSurface();
        }
    }

    private void moveToSpace() {
        try {
            while (true) {
                wait(TRANSIT_TIME);

                if (ship.getStatus().equals("OUTBOUND")) {

                    // Transit ship is approaching space.

                    boolean continueMission = wait(TRANSIT_TIME);

                    if (!continueMission) {

                        // Mission was aborted.

                        missionCompleted = false;
                        logger.warn("Ship with ID " + ship.getId() + " has aborted its mission. It is returning now.");
                        ship.setStatus("INBOUND");
                        ship = saveShipToRepository.apply(ship);

                        continue;
                    }

                    // Attempt to connect to space module.

                    boolean enteredSpace = sendShipToSpace();

                    if (enteredSpace) {

                        // Transit ship successfully connected to space module.

                        logger.info("Ship with ID " + ship.getId() + " has entered space.");
                        ship.setStatus("ACTIVE");
                        ship = saveShipToRepository.apply(ship);

                        // Transit ship is no longer needed.

                        concluded = true;

                        return;

                    } else {

                        // Transit ship failed to connect to space module after multiple attempts.

                        logger.warn("Ship with ID " + ship.getId() + " is unable to enter space. It is making a return trip.");
                        ship.setStatus("INBOUND");
                        ship = saveShipToRepository.apply(ship);
                    }
                    
                } else if (ship.getStatus().equals("INBOUND")) {

                    // Transit ship is approaching land.

                    wait(TRANSIT_TIME);
                    logger.info("Ship with ID " + ship.getId() + " is attempting to land.");
                    ship.setStatus("LANDING");
                    ship = saveShipToRepository.apply(ship);

                    // Transit ship is landing.

                    wait(TRANSIT_TIME);
                    String shipStatus;
                    if (ship.getCondition() == 0) {
                        logger.info("Ship with ID " + ship.getId() + " has crashed.");
                        shipStatus = "CRASHED";
                    } else if (ship.getCondition() < (ship.getPeakCondition() / 10)) {
                        logger.info("Ship with ID " + ship.getId() + " has landed in a broken state.");
                        shipStatus = "BROKEN";
                    } else {
                        logger.info("Ship with ID " + ship.getId() + " has landed.");
                        shipStatus = "READY";
                    }

                    // Transit ship has landed. Ship entity's mission marked as
                    // completed if it was not aborted.

                    // The mission is moved to past missions regardless of its outcome.

                    Mission mission = ship.getMission();
                    mission.setCompleted(missionCompleted);
                    mission.setArrivalTime(Timestamp.from(Instant.now()));
                    saveMissionToRepository.apply(mission);
                    
                    ship.getPastMissions().add(mission);
                    ship.setStatus(shipStatus);
                    ship.setMission(null);
                    ship = saveShipToRepository.apply(ship);

                    // Transit ship is no longer needed.

                    concluded = true;
                    
                    return;
                }
            }
            
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    private void moveToSurface() {
        try {
            while (true) {
                wait(TRANSIT_TIME);

                if (ship.getStatus().equals("INBOUND")) {

                    // Transit ship is approaching land.

                    wait(TRANSIT_TIME);
                    logger.info("Ship with ID " + ship.getId() + " is attempting to land.");
                    ship.setStatus("LANDING");
                    ship = saveShipToRepository.apply(ship);

                    // Transit ship is landing.

                    wait(TRANSIT_TIME);
                    String shipStatus;
                    if (ship.getCondition() == 0) {
                        logger.info("Ship with ID " + ship.getId() + " has crashed.");
                        shipStatus = "CRASHED";
                    } else if (ship.getCondition() < (ship.getPeakCondition() / 10)) {
                        logger.info("Ship with ID " + ship.getId() + " has landed in a broken state.");
                        shipStatus = "BROKEN";
                    } else {
                        logger.info("Ship with ID " + ship.getId() + " has landed.");
                        shipStatus = "READY";
                    }

                    // Transit ship has landed. Ship entity's mission marked as
                    // completed.

                    Mission mission = ship.getMission();
                    mission.setCompleted(missionCompleted);
                    mission.setArrivalTime(Timestamp.from(Instant.now()));
                    saveMissionToRepository.apply(mission);
                    
                    ship.getPastMissions().add(mission);
                    ship.setStatus(shipStatus);
                    ship.setMission(null);
                    ship = saveShipToRepository.apply(ship);

                    // Transit ship is no longer needed.

                    concluded = true;
                    
                    return;
                }
            }
            
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    /**
     * Attempts to send Http requests that contains details of the ship,
     * to the space module a set number of times.
     * @return true, if the ship was sent successfully. false otherwise.
     * @throws InterruptedException
     */
    private boolean sendShipToSpace() throws InterruptedException {
        boolean enteredSpace = false;
        for (int i = 0; i < RETRY_CONNECTION_COUNT; i++) {
            wait(RETRY_TIME);
            if (HttpUtils.sendShip(ship)) {
                enteredSpace = true;
                break;
            } else if (i != RETRY_CONNECTION_COUNT - 1) {
                logger.warn("Ship with ID " + ship.getId() + " failed to connect to space. "
                    + "Remaining attempts: " + (RETRY_CONNECTION_COUNT - i - 1));
            }

        }

        return enteredSpace;
    }

    /**
     * Utility function for waiting. Includes condition degradation checks.
     * @param time How long must be waited (milliseconds).
     * @return true, if the mission was not aborted. false otherwise.
     * @throws InterruptedException
     */
    private boolean wait(int time) throws InterruptedException {
        for (int i = 0; i < time / CONDITION_DEGRADATION_FREQUENCY; i++) {
            Thread.sleep(CONDITION_DEGRADATION_FREQUENCY);
            double degradationRoll = random.nextDouble();
            if (degradationRoll < CONDITION_DEGRADATION_RATE && ship.getCondition() > 0) {
                ship.setCondition(ship.getCondition() - 1);
                ship = saveShipToRepository.apply(ship);
            }

            if (abortMission && ship.getStatus().equals("OUTBOUND")) {
                return false;
            }
        }
        return true;
    }
}
