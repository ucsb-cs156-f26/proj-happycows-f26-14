
package edu.ucsb.cs156.happiercows.repositories;

import edu.ucsb.cs156.happiercows.entities.CowHerd;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CowHerdRepository extends CrudRepository<CowHerd, Long> {

    Iterable<CowHerd> findByFarmer_Id_UserIdAndFarmer_Id_GameId(
        long userId, long gameId
    );
}

