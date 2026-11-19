import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import ManageCowsModal from "main/components/Game/ManageCowsModal";
import farmerFixtures from "fixtures/farmerFixtures";
import { vi } from "vitest";
import "@testing-library/jest-dom";

const mockToast = vi.fn();

vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: {
      ...originalModule.toast,
      warn: (message) => mockToast(message),
    },
  };
});

describe("ManageCowsModal", () => {
  const mockOnClose = vi.fn();
  const mockSetNumber = vi.fn();
  const mockOnBuy = vi.fn();
  const mockOnSell = vi.fn();

  window.alert = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the modal when isOpen is true", () => {
    render(
      <ManageCowsModal
        isOpen={true}
        onClose={mockOnClose}
        message="buy"
        setNumber={mockSetNumber}
      />,
    );

    expect(screen.getByTestId("buy-sell-cow-modal")).toBeInTheDocument();
  });

  test("modal has correct buy capitalization", () => {
    render(
      <ManageCowsModal
        isOpen={true}
        onClose={mockOnClose}
        message="buy"
        setNumber={mockSetNumber}
      />,
    );

    expect(screen.getByText("Buy")).toBeInTheDocument();
  });

  test("modal has correct sell capitalization", () => {
    render(
      <ManageCowsModal
        isOpen={true}
        onClose={mockOnClose}
        message="sell"
        setNumber={mockSetNumber}
      />,
    );

    expect(screen.getByText("Sell")).toBeInTheDocument();
  });

  test("does not render the modal when isOpen is false", () => {
    render(
      <ManageCowsModal
        isOpen={false}
        onClose={mockOnClose}
        message="buy"
        setNumber={mockSetNumber}
      />,
    );

    expect(screen.queryByTestId("buy-sell-cow-modal")).not.toBeInTheDocument();
  });

  test("calls onClose and setNumber when close button is clicked", () => {
    render(
      <ManageCowsModal
        isOpen={true}
        onClose={mockOnClose}
        message="buy"
        setNumber={mockSetNumber}
      />,
    );

    fireEvent.click(screen.getByTestId("buy-sell-cow-modal-close"));

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockSetNumber).toHaveBeenCalledWith(1);
  });

  test("calls onClose and setNumber when cancel button is clicked", () => {
    render(
      <ManageCowsModal
        isOpen={true}
        onClose={mockOnClose}
        message="buy"
        setNumber={mockSetNumber}
      />,
    );

    fireEvent.click(screen.getByTestId("buy-sell-cow-modal-cancel"));

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockSetNumber).toHaveBeenCalledWith(1);
  });

  test("calls onBuy with correct arguments when buy button is clicked", async () => {
    const number = 5;

    render(
      <ManageCowsModal
        isOpen={true}
        onClose={mockOnClose}
        message="buy"
        farmer={farmerFixtures.oneFarmer[0]}
        number={number}
        onBuy={mockOnBuy}
        setNumber={mockSetNumber}
      />,
    );

    fireEvent.click(screen.getByTestId("buy-sell-cow-modal-submit"));

    await waitFor(() =>
      expect(mockOnBuy).toHaveBeenCalledWith(
        farmerFixtures.oneFarmer[0],
        number,
      ),
    );
  });

  test("calls onSell with correct arguments when sell button is clicked", async () => {
    const number2 = 3;

    render(
      <ManageCowsModal
        isOpen={true}
        onClose={mockOnClose}
        message="sell"
        farmer={farmerFixtures.oneFarmer[0]}
        number={number2}
        onSell={mockOnSell}
        setNumber={mockSetNumber}
        herds={[{ id: 10, numOfCows: 5, cowHealth: 100 }]}
      />,
    );

    fireEvent.change(screen.getByTestId("sell-herd-select"), {
      target: { value: "10" },
    });

    fireEvent.click(screen.getByTestId("buy-sell-cow-modal-submit"));

    await waitFor(() =>
      expect(mockOnSell).toHaveBeenCalledWith(
        farmerFixtures.oneFarmer[0],
        number2,
        10,
      ),
    );
  });

  test("does not sell without selecting a herd", () => {
    render(
      <ManageCowsModal
        isOpen={true}
        onClose={mockOnClose}
        message="sell"
        farmer={farmerFixtures.oneFarmer[0]}
        number={3}
        onSell={mockOnSell}
        setNumber={mockSetNumber}
        herds={[{ id: 10, numOfCows: 5, cowHealth: 100 }]}
      />,
    );

    fireEvent.click(screen.getByTestId("buy-sell-cow-modal-submit"));

    expect(window.alert).toHaveBeenCalledWith("Please select a herd first!");
    expect(mockOnSell).not.toHaveBeenCalled();
  });

  test("does not sell zero cows", async () => {
    const number2 = 0;

    render(
      <ManageCowsModal
        isOpen={true}
        onClose={mockOnClose}
        message="sell"
        farmer={farmerFixtures.oneFarmer[0]}
        number={number2}
        onSell={mockOnSell}
        setNumber={mockSetNumber}
        herds={[{ id: 10, numOfCows: 5, cowHealth: 100 }]}
      />,
    );

    fireEvent.change(screen.getByTestId("sell-herd-select"), {
      target: { value: "10" },
    });

    fireEvent.click(screen.getByTestId("buy-sell-cow-modal-submit"));

    expect(mockOnSell).not.toHaveBeenCalled();
  });

  test("windows toolkit warning for buying negative cows", () => {
    render(
      <ManageCowsModal
        isOpen={true}
        onClose={mockOnClose}
        message="buy"
        farmer={farmerFixtures.oneFarmer[0]}
        number={-3}
        onBuy={mockOnBuy}
        setNumber={mockSetNumber}
      />,
    );

    fireEvent.click(screen.getByTestId("buy-sell-cow-modal-submit"));

    expect(window.alert).toHaveBeenCalledWith(
      "You cannot buy a negative number of cows! Please enter a non-negative number.",
    );
    expect(mockOnBuy).not.toHaveBeenCalled();
  });

  test("windows toolkit warning for selling negative cows", async () => {
    const number2 = -3;

    render(
      <ManageCowsModal
        isOpen={true}
        onClose={mockOnClose}
        message="sell"
        farmer={farmerFixtures.oneFarmer[0]}
        number={number2}
        onSell={mockOnSell}
        setNumber={mockSetNumber}
      />,
    );

    fireEvent.click(screen.getByTestId("buy-sell-cow-modal-submit"));

    expect(window.alert).toHaveBeenCalledWith(
      "You cannot sell a negative number of cows! Please enter a non-negative number.",
    );
  });

  test("toast warning for inputing negative number when buying cows", async () => {
    render(
      <ManageCowsModal
        isOpen={true}
        onClose={mockOnClose}
        message="buy"
        setNumber={mockSetNumber}
      />,
    );

    const input = screen.getByTestId("buy-sell-cow-modal-input");

    fireEvent.change(input, { target: { value: "-3" } });

    expect(mockSetNumber).toHaveBeenCalledWith("-3");
    expect(mockToast).toHaveBeenCalledWith(
      "Warning: You cannot buy a negative number of cows!",
    );
  });

  test("toast warning for inputing negative number when selling cows", async () => {
    render(
      <ManageCowsModal
        isOpen={true}
        onClose={mockOnClose}
        message="sell"
        setNumber={mockSetNumber}
      />,
    );

    const input = screen.getByTestId("buy-sell-cow-modal-input");

    fireEvent.change(input, { target: { value: "-3" } });

    expect(mockSetNumber).toHaveBeenCalledWith("-3");
    expect(mockToast).toHaveBeenCalledWith(
      "Warning: You cannot sell a negative number of cows!",
    );
  });

  test("toast warning not present when buying 0 cows", async () => {
    render(
      <ManageCowsModal
        isOpen={true}
        onClose={mockOnClose}
        message="buy"
        setNumber={mockSetNumber}
      />,
    );

    const input = screen.getByTestId("buy-sell-cow-modal-input");

    fireEvent.change(input, { target: { value: "0" } });

    expect(mockSetNumber).toHaveBeenCalledWith("0");
    expect(mockToast).not.toHaveBeenCalledWith(
      "Warning: You cannot buy a negative number of cows!",
    );
  });

  test("toast warning not present when selling 0 cows", async () => {
    render(
      <ManageCowsModal
        isOpen={true}
        onClose={mockOnClose}
        message="sell"
        setNumber={mockSetNumber}
      />,
    );

    const input = screen.getByTestId("buy-sell-cow-modal-input");

    fireEvent.change(input, { target: { value: "0" } });

    expect(mockSetNumber).toHaveBeenCalledWith("0");
    expect(mockToast).not.toHaveBeenCalledWith(
      "Warning: You cannot sell a negative number of cows!",
    );
  });

  test("updates the number state on input change", () => {
    render(
      <ManageCowsModal
        isOpen={true}
        onClose={mockOnClose}
        message="buy"
        setNumber={mockSetNumber}
      />,
    );

    const input = screen.getByTestId("buy-sell-cow-modal-input");

    fireEvent.change(input, { target: { value: "10" } });

    expect(mockSetNumber).toHaveBeenCalledWith("10");
  });

  test("Check styling of modal components", () => {
    render(
      <ManageCowsModal
        isOpen={true}
        onClose={mockOnClose}
        message="buy"
        setNumber={mockSetNumber}
      />,
    );

    const footer = screen.getByTestId("buy-sell-cow-modal-footer");

    expect(footer).toHaveAttribute("style", "border-top: 0px;");
    expect(footer.style.borderTop).toBe("0px");

    expect(screen.getByTestId("buy-sell-cow-modal-input")).toHaveStyle(
      "width: 20%",
    );

    expect(screen.getByTestId("buy-sell-cow-modal-close")).toHaveStyle(
      "color: rgb(0, 0, 0); border-color: #fff; background-color: rgb(255, 255, 255);",
    );

    expect(screen.getByTestId("buy-sell-cow-modal-close").style.color).toBe(
      "rgb(0, 0, 0)",
    );

    expect(screen.getByTestId("buy-sell-cow-modal-closeGroup")).toHaveStyle(
      "display: flex; justify-content: right",
    );
  });

  test("shows a warning and does not buy fractional cows", () => {
    const number = 1.2;

    render(
      <ManageCowsModal
        isOpen={true}
        onClose={mockOnClose}
        message="buy"
        farmer={farmerFixtures.oneFarmer[0]}
        number={number}
        onBuy={mockOnBuy}
        setNumber={mockSetNumber}
      />,
    );

    fireEvent.click(screen.getByTestId("buy-sell-cow-modal-submit"));

    expect(window.alert).toHaveBeenCalledWith(
      "You cannot buy a fraction of a cow! Please enter a whole number.",
    );
    expect(mockOnBuy).not.toHaveBeenCalled();
  });

  test("shows a warning and does not sell fractional cows", () => {
    const number = 1.2;

    render(
      <ManageCowsModal
        isOpen={true}
        onClose={mockOnClose}
        message="sell"
        farmer={farmerFixtures.oneFarmer[0]}
        number={number}
        onSell={mockOnSell}
        setNumber={mockSetNumber}
      />,
    );

    fireEvent.click(screen.getByTestId("buy-sell-cow-modal-submit"));

    expect(window.alert).toHaveBeenCalledWith(
      "You cannot sell a fraction of a cow! Please enter a whole number.",
    );
    expect(mockOnSell).not.toHaveBeenCalled();
  });

  test("buy modal does not display a herd dropdown", () => {
    render(
      <ManageCowsModal
        isOpen={true}
        onClose={mockOnClose}
        message="buy"
        number={2}
        setNumber={mockSetNumber}
        herds={[{ id: 10, numOfCows: 5, cowHealth: 100 }]}
      />,
    );

    expect(screen.queryByTestId("sell-herd-select")).not.toBeInTheDocument();
  });

  test("sell modal uses an empty herd list when herds prop is omitted", () => {
    render(
      <ManageCowsModal
        isOpen={true}
        onClose={mockOnClose}
        message="sell"
        number={2}
        setNumber={mockSetNumber}
        onSell={mockOnSell}
      />,
    );

    const select = screen.getByTestId("sell-herd-select");

    expect(select.options).toHaveLength(1);
    expect(select.options[0].value).toBe("");
    expect(select.options[0]).toHaveTextContent("Choose a herd");
  });

  test("sell dropdown filters out zero and negative cow herds", () => {
    const herds = [
      { id: 10, numOfCows: 0, cowHealth: 100 },
      { id: 11, numOfCows: -2, cowHealth: 50 },
      { id: 12, numOfCows: 4, cowHealth: 90 },
      { id: 13, numOfCows: 1, cowHealth: 75 },
    ];

    render(
      <ManageCowsModal
        isOpen={true}
        onClose={mockOnClose}
        message="sell"
        farmer={farmerFixtures.oneFarmer[0]}
        number={1}
        setNumber={mockSetNumber}
        onSell={mockOnSell}
        herds={herds}
      />,
    );

    const select = screen.getByTestId("sell-herd-select");

    expect(Array.from(select.options, (option) => option.value)).toEqual([
      "",
      "12",
      "13",
    ]);

    expect(select.options[1]).toHaveTextContent(/Herd 12.*4 cows.*90% health/);
    expect(select.options[2]).toHaveTextContent(/Herd 13.*1 cows.*75% health/);

    fireEvent.change(select, { target: { value: "13" } });
    fireEvent.click(screen.getByTestId("buy-sell-cow-modal-submit"));

    expect(mockOnSell).toHaveBeenCalledWith(farmerFixtures.oneFarmer[0], 1, 13);
  });

  test("buying zero cows displays the exact warning and does not submit", () => {
    render(
      <ManageCowsModal
        isOpen={true}
        onClose={mockOnClose}
        message="buy"
        farmer={farmerFixtures.oneFarmer[0]}
        number={0}
        setNumber={mockSetNumber}
        onBuy={mockOnBuy}
      />,
    );

    fireEvent.click(screen.getByTestId("buy-sell-cow-modal-submit"));

    expect(window.alert).toHaveBeenCalledWith("You must buy at least one cow!");
    expect(mockOnBuy).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test("selling zero cows displays the exact warning and does not submit", () => {
    render(
      <ManageCowsModal
        isOpen={true}
        onClose={mockOnClose}
        message="sell"
        farmer={farmerFixtures.oneFarmer[0]}
        number={0}
        setNumber={mockSetNumber}
        onSell={mockOnSell}
        herds={[{ id: 10, numOfCows: 5, cowHealth: 100 }]}
      />,
    );

    fireEvent.change(screen.getByTestId("sell-herd-select"), {
      target: { value: "10" },
    });

    fireEvent.click(screen.getByTestId("buy-sell-cow-modal-submit"));

    expect(window.alert).toHaveBeenCalledWith(
      "You must sell at least one cow!",
    );
    expect(mockOnSell).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
