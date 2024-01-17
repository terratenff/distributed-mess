package org.tt.field.utils;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Utility class that is used to read properties from application.properties file.
 * 
 * @author terratenff
 */
public class PropertyUtils {

    private static final Logger logger = LoggerFactory.getLogger(PropertyUtils.class);

    /**
     * Creates base URL for the space module from application.properties file.
     * @return Base URL to space module.
     * @throws IOException
     */
    public static String getSpaceUrl() throws IOException {
        Properties props = new Properties();
        ClassLoader loader = Thread.currentThread().getContextClassLoader();
        InputStream stream = loader.getResourceAsStream("application.properties");
        props.load(stream);
        return props.getProperty("space.url");
    }

    /**
     * Get an integer value from application.properties file.
     * @param uri Variable name.
     * @param defaultValue Variable value to use, if variable cannot be found/used.
     * @return Variable value from application.properties or provided default value.
     */
    public static int getInteger(String uri, int defaultValue) {
        Properties props = new Properties();
        ClassLoader loader = Thread.currentThread().getContextClassLoader();
        InputStream stream = loader.getResourceAsStream("application.properties");
        try {
            props.load(stream);
            return Integer.parseInt(props.getProperty(uri));
        } catch (IOException e) {
            logger.error(e.getMessage());
            return defaultValue;
        }
    }

    /**
     * Get a boolean value from application.properties file.
     * @param uri Variable name.
     * @param defaultValue Variable value to use, if variable cannot be found/used.
     * @return Variable value from application.properties or provided default value.
     */
    public static boolean getBoolean(String uri, boolean defaultValue) {
        Properties props = new Properties();
        ClassLoader loader = Thread.currentThread().getContextClassLoader();
        InputStream stream = loader.getResourceAsStream("application.properties");
        try {
            props.load(stream);
            return Boolean.parseBoolean(props.getProperty(uri));
        } catch (IOException e) {
            logger.error(e.getMessage());
            return defaultValue;
        }
    }
}
