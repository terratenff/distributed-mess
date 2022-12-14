package org.tt.field;

import java.util.Arrays;

import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class App implements CommandLineRunner
{
	private static Logger logger = LoggerFactory.getLogger(App.class);
	
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }

	@Override
	public void run(String... args) {
		if (args.length > 0) {
			logger.info("Args: " + Arrays.toString(args));
		}
	}
}
