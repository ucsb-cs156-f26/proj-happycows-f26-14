
package edu.ucsb.cs156.happiercows.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@Entity(name = "cowherd")
public class CowHerd {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumns({
        @JoinColumn(name = "farmer_user_id", referencedColumnName = "user_id"),
        @JoinColumn(name = "farmer_game_id", referencedColumnName = "game_id")
    })
    @JsonIgnore
    private Farmer farmer;

    @Column(name = "num_of_cows")
    private int numOfCows;

    @Column(name = "cow_health")
    private double cowHealth;
}
