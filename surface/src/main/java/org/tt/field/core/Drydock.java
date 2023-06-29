package org.tt.field.core;

import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
import java.util.Random;
import java.util.function.Function;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.tt.field.domain.Log;
import org.tt.field.domain.Ship;

/**
 * Simulator class that acts as the dry dock for ship repairs. Only one ship can
 * be repaired at a time.
 * 
 * @author terratenff
 */
public class Drydock {

    private static final Logger logger = LoggerFactory.getLogger(Drydock.class);
    private static Drydock instance;

    /**
     * How long the dry dock stands by, waiting for a ship (milliseconds).
     */
    private static final int IDLE_TIME = 10000;

    /**
     * How long it takes to slightly repair a ship (milliseconds).
     */
    private static final int REPAIR_TIME = 5000;

    /**
     * The probability of a log entry being generated for a ship.
     * This is checked once a second.
     */
    private static final double LOG_RATE = 0.001;
    
    /**
     * Getter for singleton instance.
     * @return Drydock. Note that it must be initialized separately.
     */
    public static Drydock getInstance() {
        if (instance == null) {
            instance = new Drydock();
        }
        return instance;
    }

    /**
     * A function that is expected to save a ship entity to its repository.
     */
    private Function<Ship, Ship> saveShipToRepository;
    
    /**
     * A function that is expected to save a ship entity's log entry to its repository.
     */
    private Function<Log, Log> saveLogToRepository;
    
    /**
     * This thread object manages the dry dock.
     */
    private Thread drydockThread;

    private Random random = new Random();
    
    /**
     * Ship entity queue. Ships are added here to wait for their turn to be repaired.
     */
    private Queue<Ship> repairQueue = new LinkedList<Ship>();

    /**
     * Ship entity that is currently being repaired.
     */
    private Ship targetShip;

    /**
     * Determines whether the dry dock has been intialized.
     */
    private boolean initialized = false;

    /**
     * Determines whether the repairs of current ship must be aborted.
     */
    private boolean interruptionRequested = false;

    /**
     * Adds a ship entity to the queue and returns its number in line.
     * @param ship Ship that is to be added.
     * @return Integer that represents ship's queue number. Indexing starts at 1.
     * @throws IllegalStateException The dry dock must be initialized first.
     */
    public int addToQueue(Ship ship) throws IllegalStateException {
        if (!initialized) {
            throw new IllegalStateException("Drydock has not been initialized.");
        }
        ship.setStatus("AWAITING_REPAIRS (" + (repairQueue.size() + 1) + ")");
        repairQueue.add(saveShipToRepository.apply(ship));
        logger.info("A ship was added to queue. Queue size: " + repairQueue.size());
        return repairQueue.size();
    }

    /**
     * Gets specified ship entity's queue number.
     * @param shipId ID of the ship entity.
     * @return Queue number of the ship. Indexing starts at 1.
     */
    public int getShipNumber(int shipId) {
        int i = 0;

        for (Ship ship : repairQueue) {
            if (ship.getId() == shipId) return i + 1;
            i++;
        }

        return -1;
    }

    /**
     * Initializes the dry dock.
     * @param callbackShip Function must save a ship entity to its repository.
     * @param callbackLog Function that must save a ship entity's log entry to its repository.
     */
    public void initialize(Function<Ship, Ship> callbackShip, Function<Log, Log> callbackLog) {
        saveShipToRepository = callbackShip;
        saveLogToRepository = callbackLog;
        logger.info("Launching drydock...");
        drydockThread = new Thread(() -> {
            try {
                repairCore();
            } catch (InterruptedException e) {
                logger.error("Something went wrong with drydock thread: " + e.getMessage());
            }
        });
        drydockThread.start();
        initialized = true;
    }

    /**
     * Checks if the dry dock has been initialized.
     * @return true / false
     */
    public boolean isInitialized() {
        return initialized;
    }

    /**
     * Interrupts repairs of the current ship.
     */
    public void requestInterruption() {
        interruptionRequested = true;
    }

    /**
     * Core function of the dry dock.
     * @throws InterruptedException
     */
    private void repairCore() throws InterruptedException {
        logger.info("Drydock is now open.");
        while (true) {
            Thread.sleep(IDLE_TIME);
            if (targetShip == null) {

                // No ship is being repaired.

                targetShip = repairQueue.poll();
                if (targetShip != null) {

                    // First-in-line ship is selected to be repaired.

                    targetShip.setStatus("AWAITING_REPAIRS (Next)");
                    targetShip = saveShipToRepository.apply(targetShip);
                    updateQueueShipStatus();
                }
            } else if (targetShip.getStatus().startsWith("AWAITING_REPAIRS")) {

                // Target ship is waiting to be repaired.

                targetShip.setStatus("REPAIR_IN_PROGRESS");
                targetShip = saveShipToRepository.apply(targetShip);
            } else {

                // The repairs of target ship begin.

                logger.info("Drydock is now repairing ship with ID " + targetShip.getId() + ".");
                while (!interruptionRequested && targetShip.getCondition() < targetShip.getPeakCondition()) {
                    Thread.sleep(REPAIR_TIME);

                    if (random.nextDouble() < LOG_RATE) {
                        addLogToShip("dry_dock_flavor");
                    }

                    targetShip.setCondition(targetShip.getCondition() + 1);
                    targetShip = saveShipToRepository.apply(targetShip);
                }

                // The repairs of target ship have been finished/interrupted.

                addLogToShip("dry_dock_finish_flavor");

                logger.info("Drydock has finished repairing ship with ID " + targetShip.getId() + ".");
                interruptionRequested = false;
                targetShip.setStatus(targetShip.getCondition() > 0 ? "READY" : "BROKEN");
                saveShipToRepository.apply(targetShip);

                // Target ship is no longer at the dry dock.
                
                targetShip = null;
            }
        }
    }

    /**
     * Updates the status values of every ship currently in the queue to "AWAITING_REPAIRS (i)",
     * where i is a ship entity's queue number.
     */
    private void updateQueueShipStatus() {
        int i = 1;
        for (Ship ship : repairQueue) {
            ship.setStatus("AWAITING_REPAIRS (" + i + ")");
            saveShipToRepository.apply(ship);
            i++;
        }
    }

    /**
     * Adds a log entry for the ship that is currently being repaired.
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
