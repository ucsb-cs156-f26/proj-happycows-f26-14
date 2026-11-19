import { fireEvent, render, screen } from "@testing-library/react";
import ManageCows from "main/components/Game/ManageCows";
import farmerFixtures from "fixtures/farmerFixtures";
import { QueryClient, QueryClientProvider } from "react-query";
import { useParams } from "react-router";
import * as currentUserModule from "main/utils/currentUser";
import { vi } from "vitest";

const queryClient = new QueryClient();

// Mock the useCurrentUser and hasRole functions
vi.mock("main/utils/currentUser", async () => ({
  ...(await vi.importActual("main/utils/currentUser")),
  useCurrentUser: vi.fn(),
  hasRole: vi.fn(),
}));
// mock useparams
vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useParams: vi.fn(),
}));
describe("ManageCows tests", () => {
  const mockSetMessage = vi.fn();
  const mockOpenModal = vi.fn();

  test("renders without crashing", () => {
    useParams.mockReturnValue({ userId: 1 }); // Replace with your desired mock values

    currentUserModule.useCurrentUser.mockReturnValue({
      data: {},
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ManageCows
          farmer={farmerFixtures.oneFarmer[0]}
          onBuy={(farmer) => {
            console.log("onBuy called:", farmer);
          }}
          onSell={(farmer) => {
            console.log("onSell called:", farmer);
          }}
        />
      </QueryClientProvider>,
    );
  });
  test("shows no herds when herds prop is not provided", () => {
    useParams.mockReturnValue({ userId: undefined });
    currentUserModule.useCurrentUser.mockReturnValue({
      data: { root: { user: { id: 1 } } },
    });
    currentUserModule.hasRole.mockReturnValue(true);

    render(
      <QueryClientProvider client={queryClient}>
        <ManageCows
          farmer={farmerFixtures.oneFarmer[0]}
          setMessage={mockSetMessage}
          openModal={mockOpenModal}
        />
      </QueryClientProvider>,
    );

    const section = screen.getByTestId("ManageCows-herds");
    expect(section).toHaveTextContent("Your Herds");
    expect(section).toHaveTextContent("No herds yet.");
    expect(section.querySelectorAll("li")).toHaveLength(0);
  });

  test("shows no herds when herd list is empty", () => {
    useParams.mockReturnValue({ userId: undefined });
    currentUserModule.useCurrentUser.mockReturnValue({
      data: { root: { user: { id: 1 } } },
    });
    currentUserModule.hasRole.mockReturnValue(true);

    render(
      <QueryClientProvider client={queryClient}>
        <ManageCows
          farmer={farmerFixtures.oneFarmer[0]}
          herds={[]}
          setMessage={mockSetMessage}
          openModal={mockOpenModal}
        />
      </QueryClientProvider>,
    );

    const section = screen.getByTestId("ManageCows-herds");
    expect(section).toHaveTextContent("No herds yet.");
    expect(section.querySelectorAll("li")).toHaveLength(0);
  });

  test("displays each herd with its ID, cow count, and health", () => {
    useParams.mockReturnValue({ userId: undefined });
    currentUserModule.useCurrentUser.mockReturnValue({
      data: { root: { user: { id: 1 } } },
    });
    currentUserModule.hasRole.mockReturnValue(true);

    const herds = [
      { id: 10, numOfCows: 5, cowHealth: 100 },
      { id: 11, numOfCows: 3, cowHealth: 75.556 },
    ];

    render(
      <QueryClientProvider client={queryClient}>
        <ManageCows
          farmer={farmerFixtures.oneFarmer[0]}
          herds={herds}
          setMessage={mockSetMessage}
          openModal={mockOpenModal}
        />
      </QueryClientProvider>,
    );

    const section = screen.getByTestId("ManageCows-herds");
    const items = section.querySelectorAll("li");

    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Herd 10: 5 cows — Health: 100%");
    expect(items[1]).toHaveTextContent("Herd 11: 3 cows — Health: 75.56%");
    expect(section).not.toHaveTextContent("No herds yet.");
  });

  test("renders message when admin visit other pages", async () => {
    useParams.mockReturnValue({ userId: 1 }); // Replace with your desired mock values

    currentUserModule.useCurrentUser.mockReturnValue({
      data: {
        root: {
          user: {
            id: 1,
          },
        },
      },
    });
    currentUserModule.hasRole.mockReturnValue(true);
    const mockBuy = vi.fn();
    const mockSell = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <ManageCows
          farmer={farmerFixtures.oneFarmer[0]}
          onBuy={mockBuy}
          onSell={mockSell}
          userId={1}
        />
      </QueryClientProvider>,
    );

    const messageElement = screen.getByTestId("ManageCows-ViewOnly");
    expect(messageElement).toBeInTheDocument();
    expect(messageElement).toHaveTextContent(
      "This page is for viewing only, cannot buy and sell cows.",
    );

    const buyButton = screen.queryByTestId("buy-cow-button");
    const sellButton = screen.queryByTestId("sell-cow-button");

    expect(buyButton).toBeNull();
    expect(sellButton).toBeNull();
  });

  test('calls setMessage with "buy" when the buy button is clicked', () => {
    useParams.mockReturnValue({ userId: undefined }); // Replace with your desired mock values

    currentUserModule.useCurrentUser.mockReturnValue({
      data: {
        root: {
          user: {
            id: NaN,
          },
        },
      },
    });
    currentUserModule.hasRole.mockReturnValue(true);
    render(
      <QueryClientProvider client={queryClient}>
        <ManageCows
          farmer={farmerFixtures.oneFarmer[0]}
          setMessage={mockSetMessage}
          openModal={mockOpenModal}
        />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByTestId("buy-cow-button"));
    expect(mockSetMessage).toHaveBeenCalledWith("buy");
    expect(mockOpenModal).toHaveBeenCalled();
  });

  test('calls setMessage with "sell" when the sell button is clicked', () => {
    useParams.mockReturnValue({ userId: undefined }); // Replace with your desired mock values

    currentUserModule.useCurrentUser.mockReturnValue({
      data: {
        root: {
          user: {
            id: NaN,
          },
        },
      },
    });
    currentUserModule.hasRole.mockReturnValue(true);
    render(
      <QueryClientProvider client={queryClient}>
        <ManageCows
          farmer={farmerFixtures.oneFarmer[0]}
          setMessage={mockSetMessage}
          openModal={mockOpenModal}
        />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByTestId("sell-cow-button"));
    expect(mockSetMessage).toHaveBeenCalledWith("sell");
    expect(mockOpenModal).toHaveBeenCalled();
  });
});
