
package edu.ucsb.cs156.happiercows.repositories;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import edu.ucsb.cs156.happiercows.entities.CowHerd;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.User;

@DataJpaTest
public class CowHerdRepositoryTests {

    @Autowired
    private CowHerdRepository cowHerdRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GameRepository gameRepository;

    private Farmer farmer;
    private Farmer otherFarmer;

    @BeforeEach
    void setUp() {
        Game game = gameRepository.save(
            Game.builder()
                .name("test game")
                .lastDate(LocalDateTime.now())
                .build()
        );

        User user = userRepository.save(
            User.builder().email("student@ucsb.edu").build()
        );

        User otherUser = userRepository.save(
            User.builder().email("other@ucsb.edu").build()
        );

        farmer = farmerRepository.save(
            Farmer.builder()
                .user(user)
                .game(game)
                .username("student")
                .build()
        );

        otherFarmer = farmerRepository.save(
            Farmer.builder()
                .user(otherUser)
                .game(game)
                .username("other")
                .build()
        );
    }

    @Test
    void testSaveCowHerd() {
        CowHerd herd = CowHerd.builder()
            .farmer(farmer)
            .numOfCows(5)
            .cowHealth(100)
            .build();

        CowHerd saved = cowHerdRepository.save(herd);

        CowHerd found = cowHerdRepository.findById(saved.getId()).orElseThrow();

        assertEquals(5, found.getNumOfCows());
        assertEquals(100, found.getCowHealth());
        assertEquals(farmer.getId(), found.getFarmer().getId());
    }

    @Test
    void testMultipleHerds() {
        CowHerd herd1 = cowHerdRepository.save(
            CowHerd.builder()
                .farmer(farmer)
                .numOfCows(5)
                .cowHealth(100)
                .build()
        );

        CowHerd herd2 = cowHerdRepository.save(
            CowHerd.builder()
                .farmer(farmer)
                .numOfCows(3)
                .cowHealth(75)
                .build()
        );

        List<CowHerd> results = new ArrayList<>();

        cowHerdRepository.findByFarmer_Id_UserIdAndFarmer_Id_GameId(
            farmer.getUser().getId(),
            farmer.getGame().getId()
        ).forEach(results::add);

        assertEquals(2, results.size());
        assertTrue(results.stream().anyMatch(h -> h.getId() == herd1.getId()));
        assertTrue(results.stream().anyMatch(h -> h.getId() == herd2.getId()));
    }

    @Test
    void testDifferentFarmers() {
        cowHerdRepository.save(
            CowHerd.builder()
                .farmer(farmer)
                .numOfCows(5)
                .cowHealth(100)
                .build()
        );

        cowHerdRepository.save(
            CowHerd.builder()
                .farmer(otherFarmer)
                .numOfCows(3)
                .cowHealth(80)
                .build()
        );

        List<CowHerd> results = new ArrayList<>();

        cowHerdRepository.findByFarmer_Id_UserIdAndFarmer_Id_GameId(
            farmer.getUser().getId(),
            farmer.getGame().getId()
        ).forEach(results::add);

        assertEquals(1, results.size());
        assertEquals(5, results.get(0).getNumOfCows());
    }
}
