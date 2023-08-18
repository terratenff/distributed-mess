package org.tt.field.core;

import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.tt.field.domain.Ship;

public class ShipHttpUtility {

    private static final Logger logger = LoggerFactory.getLogger(ShipHttpUtility.class);
    
    public static boolean sendShip(Ship ship) {
        try {
            URL url = new URL("http://localhost:8003/ships");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "application/json");
            conn.setRequestProperty("Host", "localhost:8003");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            conn.setDoOutput(true);

            String jsonString = ship.toJson().replaceAll("\"", "\\\"");
            OutputStream os = conn.getOutputStream();
            byte[] input = jsonString.getBytes("utf-8");
            os.write(input, 0, input.length);

            int responseCode = conn.getResponseCode();
            logger.info("Sending POST request to " + url);
            logger.info("Response code: " + responseCode);

            return responseCode >= 200 && responseCode < 300;
            
        } catch (MalformedURLException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }

        return false;
    }
}
