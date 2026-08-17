package com.bank.restrictions;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RestrictionsApplication {

	public static void main(String[] args) {
		SpringApplication.run(RestrictionsApplication.class, args);
	}

}
