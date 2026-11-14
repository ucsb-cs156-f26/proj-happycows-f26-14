import React from "react";
import { Card } from "react-bootstrap";
import { ProgressBar } from "react-bootstrap";

import healthyCow from "../../../assets/cowHealth/cow-healthy.png";
import goodCow from "../../../assets/cowHealth/cow-good.png";
import angryCow from "../../../assets/cowHealth/cow-angry.png";
import anxiousCow from "../../../assets/cowHealth/cow-anxious.png";
import sadCow from "../../../assets/cowHealth/cow-sad.png";
import deadCow from "../../../assets/cowHealth/cow-dead.png";

// Choose the cow image based on its health
const getCowSprite = (health) => {
  if (health >= 80) return healthyCow;
  if (health >= 60) return goodCow;
  if (health >= 40) return angryCow;
  if (health >= 20) return anxiousCow;
  if (health > 0) return sadCow;
  return deadCow;
};

const FarmStats = ({ farmer }) => {
  return (
    <Card>
      <Card.Header as="h5" className="woodenboardtable">
        Your Farm Stats
      </Card.Header>
      <Card.Body
        style={
          // Stryker disable next-line all: don't test CSS params
          { backgroundColor: "rgb(245, 210, 140)" }
        }
      >
        {/* update total wealth and cow health with data from fixture */}
        <Card.Title className="text-center">
          💰 Total Wealth: ${farmer.totalWealth.toFixed(2)}
        </Card.Title>

        <Card.Text>Total Cows Bought: {farmer.cowsBought}</Card.Text>
        <Card.Text>Total Cows Sold: {farmer.cowsSold}</Card.Text>

        <Card.Title className="text-center">
          ❤️ Cow Health: {Math.round(farmer.cowHealth * 100) / 100}%
        </Card.Title>

        <ProgressBar
          now={farmer.cowHealth}
          min={0}
          max={100}
          variant="danger"
        />

        {/* Display cow image based on health */}
        <div className="text-center mt-3">
          <img
            src={getCowSprite(farmer.cowHealth)}
            alt={`Cow health: ${farmer.cowHealth}%`}
            style={{ width: "150px", height: "auto" }}
          />
        </div>

        <Card.Text>💀 Cow Deaths: {farmer.cowDeaths}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default FarmStats;
