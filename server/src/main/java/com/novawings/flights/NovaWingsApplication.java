package com.novawings.flights;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class NovaWingsApplication {

	public static void main(String[] args) {
		SpringApplication.run(NovaWingsApplication.class, args);
	}

}
