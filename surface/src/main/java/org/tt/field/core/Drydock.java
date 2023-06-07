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

public class Drydock {

    private static final Logger logger = LoggerFactory.getLogger(Drydock.class);
    private static Drydock instance;

    private static final int IDLE_TIME = 10000;
    private static final int REPAIR_TIME = 5000;
    private static final double LOG_RATE = 0.001;
    
    public static Drydock getInstance() {
        if (instance == null) {
            instance = new Drydock();
        }
        return instance;
    }

    private Function<Ship, Ship> saveShipToRepository;
    private Function<Log, Log> saveLogToRepository;
    private Thread drydockThread;
    private Random random = new Random();
    private Queue<Ship> repairQueue = new LinkedList<Ship>();
    private Ship targetShip;
    private boolean initialized = false;
    private boolean interruptionRequested = false;

    public int addToQueue(Ship ship) throws IllegalStateException {
        if (!initialized) {
            throw new IllegalStateException("Drydock has not been initialized.");
        }
        ship.setStatus("AWAITING_REPAIRS (" + (repairQueue.size() + 1) + ")");
        repairQueue.add(saveShipToRepository.apply(ship));
        logger.info("A ship was added to queue. Queue size: " + repairQueue.size());
        return repairQueue.size();
    }

    public int getShipNumber(int shipId) {
        int i = 0;

        for (Ship ship : repairQueue) {
            if (ship.getId() == shipId) return i + 1;
            i++;
        }

        return -1;
    }

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

    public boolean isInitialized() {
        return initialized;
    }

    public void requestInterruption() {
        interruptionRequested = true;
    }

    private void repairCore() throws InterruptedException {
        logger.info("Drydock is now open.");
        while (true) {
            Thread.sleep(IDLE_TIME);
            if (targetShip == null) {
                targetShip = repairQueue.poll();
                if (targetShip != null) {
                    targetShip.setStatus("AWAITING_REPAIRS (Next)");
                    targetShip = saveShipToRepository.apply(targetShip);
                    updateQueueShipStatus();
                }
            } else if (targetShip.getStatus().startsWith("AWAITING_REPAIRS")) {
                targetShip.setStatus("REPAIR_IN_PROGRESS");
                targetShip = saveShipToRepository.apply(targetShip);
            } else {
                logger.info("Drydock is now repairing ship with ID " + targetShip.getId() + ".");
                while (!interruptionRequested && targetShip.getCondition() < targetShip.getPeakCondition()) {
                    Thread.sleep(REPAIR_TIME);

                    if (random.nextDouble() < LOG_RATE) {
                        addLogToShip("dry_dock_flavor");
                    }

                    targetShip.setCondition(targetShip.getCondition() + 1);
                    targetShip = saveShipToRepository.apply(targetShip);
                }

                addLogToShip("dry_dock_finish_flavor");

                logger.info("Drydock has finished repairing ship with ID " + targetShip.getId() + ".");
                interruptionRequested = false;
                targetShip.setStatus(targetShip.getCondition() > 0 ? "READY" : "BROKEN");
                saveShipToRepository.apply(targetShip);
                targetShip = null;
            }
        }
    }

    private void updateQueueShipStatus() {
        int i = 1;
        for (Ship ship : repairQueue) {
            ship.setStatus("AWAITING_REPAIRS (" + i + ")");
            saveShipToRepository.apply(ship);
            i++;
        }
    }

    private void addLogToShip(String key) {
        Log log = LogDistributor.getInstance().generateShipLog(targetShip, key);
        log = saveLogToRepository.apply(log);
        
        List<Log> logs = targetShip.getLogs();
        logs.add(log);
        targetShip.setLogs(logs);

        targetShip = saveShipToRepository.apply(targetShip);
    }
}
