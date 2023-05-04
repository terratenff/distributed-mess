package org.tt.field.core;

import java.util.LinkedList;
import java.util.Queue;
import java.util.function.Function;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.tt.field.domain.Ship;

public class Drydock {

    private static final Logger logger = LoggerFactory.getLogger(Drydock.class);
    private static Drydock instance;

    private static final int IDLE_TIME = 10000;
    private static final int REPAIR_TIME = 5000;
    
    public static Drydock getInstance() {
        if (instance == null) {
            instance = new Drydock();
        }
        return instance;
    }

    private Function<Ship, Ship> saveShipToRepository;
    private Thread drydockThread;
    private Queue<Ship> repairQueue = new LinkedList<Ship>();
    private Ship targetShip;
    private boolean initialized = false;
    private boolean interruptionRequested = false;

    public int addToQueue(Ship ship) throws IllegalStateException {
        if (!initialized) {
            throw new IllegalStateException("Drydock has not been initialized.");
        }
        ship.setStatus("AWAITING_REPAIRS (" + repairQueue.size() + 1 + ")");
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

    public void initialize(Function<Ship, Ship> callback) {
        saveShipToRepository = callback;
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
                    targetShip.setCondition(targetShip.getCondition() + 1);
                    targetShip = saveShipToRepository.apply(targetShip);
                }
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
}
