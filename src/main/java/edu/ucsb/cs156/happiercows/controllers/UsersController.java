package edu.ucsb.cs156.happiercows.controllers;

import java.time.Duration;
import java.time.Instant;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;
import edu.ucsb.cs156.happiercows.errors.InvalidCooldownDurationException;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;

@Tag(name="User information (admin only)")
@RequestMapping("/api/admin/users")
@RestController
public class UsersController extends ApiController {
    @Autowired
    UserRepository userRepository;

    @Autowired
    ObjectMapper mapper;

    @Operation(summary = "Get a list of all users")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("")
    public ResponseEntity<String> users()
            throws JsonProcessingException {
        Iterable<User> users = userRepository.findAll();
        String body = mapper.writeValueAsString(users);
        return ResponseEntity.ok().body(body);
    }

    @Operation(summary = "Suspend a user by id")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/suspend")
    public Object suspendUser(@Parameter(name="userId") @RequestParam long userId ) throws JsonProcessingException {

        User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException(User.class, userId));

        user.setSuspended(true);
        userRepository.save(user);
        return genericMessage("User with id %d suspended".formatted(userId));
    }

    @Operation(summary="Restore a user by id")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/restore")
    public Object restoreUser(@Parameter(name="userId") @RequestParam long userId ) throws JsonProcessingException {
        User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException(User.class, userId));

        user.setSuspended(false);
        userRepository.save(user);
        return genericMessage("User with id %d restored".formatted(userId));
    }

    @Operation(summary="Place a user on chat cooldown")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/cooldown")
    public Object cooldownUser(
            @Parameter(name="userId") @RequestParam long userId,
            @Parameter(name="durationMinutes") @RequestParam long durationMinutes
    ) throws InvalidCooldownDurationException {

        if (durationMinutes <= 0) {
            throw new InvalidCooldownDurationException(
                "Cooldown duration must be greater than zero minutes"
            );
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException(User.class, userId));

        Instant cooldownUntil = Instant.now().plus(Duration.ofMinutes(durationMinutes));
        user.setCooldownUntil(cooldownUntil);
        userRepository.save(user);

        return genericMessage(
            "User with id %d placed on cooldown for %d minutes"
                .formatted(userId, durationMinutes)
        );
    }

    @Operation(summary="Clear a user's chat cooldown")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/cooldown/clear")
    public Object clearCooldown(
            @Parameter(name="userId") @RequestParam long userId
    ) {

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException(User.class, userId));

        user.setCooldownUntil(null);
        userRepository.save(user);

        return genericMessage("Cooldown cleared for user with id %d".formatted(userId));
    }
}
