package org.tt.field.core;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
import java.util.Random;
import java.util.function.Function;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.tt.field.domain.Log;
import org.tt.field.domain.Mission;
import org.tt.field.domain.Ship;
import org.tt.field.utils.PropertyUtils;

/**
 * Simulator class that acts as the launch site for ship entities. Only one ship can
 * be launched at a time.
 * 
 * @author terratenff
 */
public class LaunchSite {

    private static final Logger logger = LoggerFactory.getLogger(LaunchSite.class);
    private static LaunchSite instance;
    
    /**
     * How long the launch site stands by, waiting for a ship (milliseconds).
     */
    private static final int IDLE_TIME = PropertyUtils.getInteger("org.tt.field.core.LaunchSite.IDLE_TIME", 10000);

    /**
     * How long it takes to launch a ship (milliseconds).
     */
    private static final int LAUNCH_TIME = PropertyUtils.getInteger("org.tt.field.core.LaunchSite.LAUNCH_TIME", 15000);

    /**
     * The probability of a log entry being generated for a ship.
     * This is checked once a second.
     */
    private static final double LOG_RATE = 0.001;
    
    /**
     * Getter for singleton instance.
     * @return LaunchSite. Note that it must be initialized separately.
     */
    public static LaunchSite getInstance() {
        if (instance == null) {
            instance = new LaunchSite();
        }
        return instance;
    }

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

    /**
     * This thread object manages the launch site.
     */
    private Thread launchSiteThread;

    private Random random = new Random();

    /**
     * Ship entity queue. Ships are added here to wait for their turn to be launched.
     */
    private Queue<Ship> launchQueue = new LinkedList<Ship>();

    /**
     * Ship entity that is currently being launched.
     */
    private Ship targetShip;

    /**
     * Determines whether the launch site has been intialized.
     */
    private boolean initialized = false;

    /**
     * Determines whether the launch of current ship must be aborted.
     */
    private boolean interruptionRequested = false;

    /**
     * Instructs specified ship to abort its mission. If it is being launched, it is
     * requested to interrupt its launch. Otherwise the ship is removed from the queue
     * @param ship
     */
    public void abortMission(Ship ship) {
        if (targetShip != null && targetShip.getId() == ship.getId()) {
            interruptionRequested = true;
        } else {
            for (Ship queueShip : launchQueue) {
                if (queueShip.equals(ship)) {
                    launchQueue.remove(queueShip);
                    updateQueueShipStatus();

                    ship.setStatus("READY");
                    ship.setMission(null);
                    saveShipToRepository.apply(ship);

                    break;
                }
            }
        }
    }

    /**
     * Adds a ship entity to the queue and returns its number in line.
     * @param ship Ship that is to be added.
     * @return Integer that represents ship's queue number. Indexing starts at 1.
     * @throws IllegalStateException The launch site must be initialized first.
     */
    public int addToQueue(Ship ship) throws IllegalStateException {
        if (!initialized) {
            throw new IllegalStateException("Launch site has not been initialized.");
        }
        ship.setStatus("AWAITING_TAKEOFF (" + (launchQueue.size() + 1) + ")");
        launchQueue.add(saveShipToRepository.apply(ship));
        logger.info("A ship was added to queue. Queue size: " + launchQueue.size());
        return launchQueue.size();
    }

    /**
     * Gets specified ship entity's queue number.
     * @param shipId ID of the ship entity.
     * @return Queue number of the ship. Indexing starts at 1.
     */
    public int getShipNumber(int shipId) {
        int i = 0;

        for (Ship ship : launchQueue) {
            if (ship.getId() == shipId) return i + 1;
            i++;
        }

        return -1;
    }

    /**
     * Initializes the launch site.
     * @param callbackShip Function must save a ship entity to its repository.
     * @param callbackMission Function that must save a ship entity's mission to its repository.
     * @param callbackLog Function that must save a ship entity's log entry to its repository.
     */
    public void initialize(Function<Ship, Ship> callbackShip, Function<Mission, Mission> callbackMission, Function<Log, Log> callbackLog) {
        saveShipToRepository = callbackShip;
        saveMissionToRepository = callbackMission;
        saveLogToRepository = callbackLog;

        logger.info("Setting up launch site...");
        launchSiteThread = new Thread(() -> {
            try {
                launchCore();
            } catch (InterruptedException e) {
                logger.error("Something went wrong with launch site thread: " + e.getMessage());
            }
        });
        launchSiteThread.start();
        initialized = true;
    }

    /**
     * Checks if the launch site has been initialized.
     * @return true / false
     */
    public boolean isInitialized() {
        return initialized;
    }

    /**
     * Interrupts the current ship launch.
     */
    public void requestInterruption() {
        interruptionRequested = true;
    }

    /**
     * Core function of the launch site.
     * @throws InterruptedException
     */
    private void launchCore() throws InterruptedException {
        logger.info("Launch site is now open.");
        while (true) {
            Thread.sleep(IDLE_TIME);
            if (targetShip == null) {

                // No ship is being launched.

                targetShip = launchQueue.poll();
                if (targetShip != null) {

                    // First-in-line ship is selected to be launched.

                    targetShip.setStatus("AWAITING_TAKEOFF (Next)");
                    targetShip = saveShipToRepository.apply(targetShip);
                    updateQueueShipStatus();
                }

            } else if (targetShip.getStatus().startsWith("AWAITING_TAKEOFF") && interruptionRequested) {
                
                // Target ship is waiting to be launched, but the launch is aborted.
                
                interruptionRequested = false;
                logger.warn("Ship with ID " + targetShip.getId() + " has aborted its mission. It has returned to the shipyard.");

                Mission mission = targetShip.getMission();
                mission.setArrivalTime(Timestamp.from(Instant.now()));
                saveMissionToRepository.apply(mission);

                targetShip.setStatus("READY");
                targetShip.setMission(null);
                saveShipToRepository.apply(targetShip);

                // Target ship is no longer at the launch site.

                targetShip = null;

            } else if (targetShip.getStatus().startsWith("AWAITING_TAKEOFF")) {

                // Target ship is waiting to be launched. The launch begins.

                targetShip.setStatus("TAKING_OFF");
                targetShip = saveShipToRepository.apply(targetShip);
                logger.info("Ship with ID " + targetShip.getId() + " is taking off.");

                for (int i = 0; i < LAUNCH_TIME / 1000; i++) {
                    Thread.sleep(1000);

                    if (interruptionRequested) {
                        break;
                    } else if (random.nextDouble() < LOG_RATE) {
                        addLogToShip("launch_site_flavor");
                    }
                }

                if (interruptionRequested) {

                    // Target ship is in the middle of taking off, but it is aborted.

                    interruptionRequested = false;
                    logger.warn("Ship with ID " + targetShip.getId() + " has aborted its mission. It is returning now.");
                    targetShip.setStatus("LANDING");
                    targetShip = saveShipToRepository.apply(targetShip);
                    Thread.sleep(LAUNCH_TIME);

                    // Condition degradation may have taken place, so ship status must be
                    // updated accordingly.

                    String shipStatus;
                    if (targetShip.getCondition() == 0) {
                        logger.info("Ship with ID " + targetShip.getId() + " has crashed.");
                        shipStatus = "CRASHED";
                    } else if (targetShip.getCondition() < (targetShip.getPeakCondition() / 10)) {
                        logger.info("Ship with ID " + targetShip.getId() + " has landed in a broken state.");
                        shipStatus = "BROKEN";
                    } else {
                        logger.info("Ship with ID " + targetShip.getId() + " has landed.");
                        shipStatus = "READY";
                    }

                    Mission mission = targetShip.getMission();
                    mission.setArrivalTime(Timestamp.from(Instant.now()));
                    saveMissionToRepository.apply(mission);

                    targetShip.setStatus(shipStatus);
                    targetShip.setMission(null);
                    saveShipToRepository.apply(targetShip);

                    // Target ship is no longer at the launch site.

                    targetShip = null;

                    continue;
                }

                // Target ship has finished taking off.

                Mission mission = targetShip.getMission();
                mission.setDepartureTime(Timestamp.from(Instant.now()));
                saveMissionToRepository.apply(mission);

                addLogToShip("launch_site_finish_flavor");

                targetShip.setStatus("OUTBOUND");
                targetShip = saveShipToRepository.apply(targetShip);

                // Creating a transit ship for the target ship.

                TransitShip transitShip = new TransitShip(targetShip, saveShipToRepository, saveMissionToRepository);
                transitShip.toSpace();
                transitShip.start();
                logger.info("Ship with ID " + targetShip.getId() + " has finished taking off.");
                
                // Target ship is no longer at the launch site.

                targetShip = null;

            } else {
                throw new IllegalStateException("A ship is in the launch site with an illegal status code: " + targetShip.getStatus());
            }
        }
    }

    /**
     * Updates the status values of every ship currently in the queue to "AWAITING_TAKEOFF (i)",
     * where i is a ship entity's queue number.
     */
    private void updateQueueShipStatus() {
        int i = 1;
        for (Ship ship : launchQueue) {
            ship.setStatus("AWAITING_TAKEOFF (" + i + ")");
            saveShipToRepository.apply(ship);
            i++;
        }
    }

    /**
     * Adds a log entry for the ship that is currently being launched.
     * @param key A key for suitable log entries. See LogDistributor for the keys.
     */
    private void addLogToShip(String key) {
        Log log = LogDistributor.getInstance().generateShipLog(targetShip, key);
        log = saveLogToRepository.apply(log);
        
        List<Log> logs = targetShip.getLogs();
        logs.add(log);
        targetShip.setLogs(logs);

        targetShip = saveShipToRepository.apply(targetShip);
    }
}
