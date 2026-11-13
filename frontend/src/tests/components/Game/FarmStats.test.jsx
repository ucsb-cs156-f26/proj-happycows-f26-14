import { render, screen, waitFor } from "@testing-library/react";
import FarmStats from "main/components/Game/FarmStats";
import farmerFixtures from "fixtures/farmerFixtures";

import healthyCow from "../../../assets/cowHealth/cow-healthy.png";
import goodCow from "../../../assets/cowHealth/cow-good.png";
import angryCow from "../../../assets/cowHealth/cow-angry.png";
import anxiousCow from "../../../assets/cowHealth/cow-anxious.png";
import sadCow from "../../../assets/cowHealth/cow-sad.png";
import deadCow from "../../../assets/cowHealth/cow-dead.png";

describe("FarmStats tests", () => {
  test("renders without crashing", () => {
    render(<FarmStats farmer={farmerFixtures.oneFarmer[0]} />);
  });

  test("contains correct content", async () => {
    render(<FarmStats farmer={farmerFixtures.oneFarmer[0]} />);

    await waitFor(() => {
      expect(screen.getByText(/Total Wealth: \$1000/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Cow Health: 98%/)).toBeInTheDocument();
    expect(screen.getByText(/Total Cows Bought: 5/)).toBeInTheDocument();
    expect(screen.getByText(/Total Cows Sold: 5/)).toBeInTheDocument();
    expect(screen.getByText(/Cow Deaths: 5/)).toBeInTheDocument();
  });

  test.each([
    [100, healthyCow],
    [80, healthyCow],
    [79, goodCow],
    [60, goodCow],
    [59, angryCow],
    [40, angryCow],
    [39, anxiousCow],
    [20, anxiousCow],
    [19, sadCow],
    [1, sadCow],
    [0, deadCow],
  ])("displays the correct cow image at %i health", (health, image) => {
    const farmer = {
      ...farmerFixtures.oneFarmer[0],
      cowHealth: health,
    };

    render(<FarmStats farmer={farmer} />);

    const cowImage = screen.getByRole("img", {
      name: `Cow health: ${health}%`,
    });

    expect(cowImage).toHaveAttribute("src", image);
    expect(cowImage.style.height).toBe("auto");
    expect(cowImage).toHaveStyle({
      width: "150px",
      height: "auto",
    });
    expect(cowImage.parentElement).toHaveClass("text-center", "mt-3");
  });
});
