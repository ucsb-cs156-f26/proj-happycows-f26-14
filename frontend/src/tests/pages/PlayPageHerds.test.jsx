import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import "@testing-library/jest-dom";
import PlayPage from "main/pages/PlayPage";

const mocks = vi.hoisted(() => ({
  useBackend: vi.fn(),
  useBackendMutation: vi.fn(),
  invalidateQueries: vi.fn(),
  herdsResponse: [],
  mutations: {},
}));

const farmer = {
  userId: 1,
  gameId: 1,
  numOfCows: 5,
  totalWealth: 9500,
  cowsBought: 5,
  cowsSold: 0,
};

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useParams: () => ({ gameId: "1" }),
}));

vi.mock("react-query", async () => ({
  ...(await vi.importActual("react-query")),
  useQueryClient: () => ({
    invalidateQueries: mocks.invalidateQueries,
  }),
}));

vi.mock("main/utils/currentUser", () => ({
  useCurrentUser: () => ({
    data: {
      root: {
        user: {
          id: 1,
          game: [{ id: 1 }],
        },
      },
    },
  }),
  hasRole: () => false,
}));

vi.mock("main/utils/useBackend", () => ({
  useBackend: mocks.useBackend,
  useBackendMutation: mocks.useBackendMutation,
}));

vi.mock("main/layouts/BasicLayout/BasicLayout", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("main/components/Game/GameOverview", () => ({
  default: () => null,
}));

vi.mock("main/components/Game/GamePlay", () => ({
  default: () => null,
}));

vi.mock("main/components/Game/FarmStats", () => ({
  default: () => null,
}));

vi.mock("main/components/Game/Profits", () => ({
  default: () => null,
}));

vi.mock("main/components/Chat/ChatPanel", () => ({
  default: () => null,
}));

vi.mock("main/components/Game/ManageCows", () => ({
  default: ({ herds, setMessage, openModal }) => (
    <div>
      <output data-testid="received-herds">{JSON.stringify(herds)}</output>

      <button
        data-testid="open-buy"
        onClick={() => {
          setMessage("buy");
          openModal();
        }}
      >
        Buy cows
      </button>

      <button
        data-testid="open-sell"
        onClick={() => {
          setMessage("sell");
          openModal();
        }}
      >
        Sell cows
      </button>
    </div>
  ),
}));

vi.mock("main/components/Game/ManageCowsModal", () => ({
  default: ({ isOpen, message, farmer, onBuy, onSell }) => {
    if (!isOpen) {
      return null;
    }

    return (
      <button
        data-testid="confirm-transaction"
        onClick={() => {
          if (message === "buy") {
            onBuy(farmer, "4");
          } else {
            onSell(farmer, 2, 10);
          }
        }}
      >
        Confirm
      </button>
    );
  },
}));

describe("PlayPage herd functionality", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mutations = {};

    mocks.herdsResponse = [
      {
        id: 10,
        numOfCows: 5,
        cowHealth: 100,
      },
    ];

    mocks.useBackend.mockImplementation((_queryKey, request) => {
      switch (request.url) {
        case "/api/farmer/forcurrentuser":
          return { data: farmer };

        case "/api/farmer/herds":
          return { data: mocks.herdsResponse };

        case "/api/game/plus":
          return {
            data: {
              game: {
                id: 1,
                hidden: false,
                showChat: false,
              },
            },
          };

        case "/api/announcements/current":
          return { data: [] };

        case "/api/profits/all/gameid":
          return { data: [] };

        default:
          return { data: undefined };
      }
    });

    mocks.useBackendMutation.mockImplementation((requestFactory, options) => {
      const factorySource = requestFactory.toString();

      let name = "pageview";

      if (factorySource.includes("/api/farmer/buy")) {
        name = "buy";
      } else if (factorySource.includes("/api/farmer/sell/herd")) {
        name = "sell";
      }

      const mutate = vi.fn(() => {
        if (options?.onSuccess) {
          options.onSuccess();
        }
      });

      mocks.mutations[name] = {
        mutate,
        options,
      };

      return { mutate };
    });
  });

  test("fetches herds using the correct endpoint, method, and game ID", () => {
    render(<PlayPage />);

    expect(mocks.useBackend).toHaveBeenCalledWith(
      ["/api/farmer/herds?gameId=1"],
      {
        method: "GET",
        url: "/api/farmer/herds",
        params: {
          gameId: "1",
        },
      },
    );

    expect(
      JSON.parse(screen.getByTestId("received-herds").textContent),
    ).toEqual([
      {
        id: 10,
        numOfCows: 5,
        cowHealth: 100,
      },
    ]);
  });

  test("passes an empty herd list while data is unavailable", () => {
    mocks.herdsResponse = undefined;

    render(<PlayPage />);

    expect(
      JSON.parse(screen.getByTestId("received-herds").textContent),
    ).toEqual([]);
  });

  test("buying cows submits the correct quantity and invalidates both queries", () => {
    render(<PlayPage />);

    fireEvent.click(screen.getByTestId("open-buy"));
    fireEvent.click(screen.getByTestId("confirm-transaction"));

    expect(mocks.mutations.buy.mutate).toHaveBeenCalledWith({
      farmer,
      quantity: 4,
    });

    expect(mocks.invalidateQueries).toHaveBeenCalledTimes(2);

    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(1, [
      "/api/farmer/forcurrentuser?gameId=1",
    ]);

    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(2, [
      "/api/farmer/herds?gameId=1",
    ]);
  });

  test("selling from a herd invalidates farmer and herd data", () => {
    render(<PlayPage />);

    fireEvent.click(screen.getByTestId("open-sell"));
    fireEvent.click(screen.getByTestId("confirm-transaction"));

    expect(mocks.mutations.sell.mutate).toHaveBeenCalledWith({
      farmer,
      herdId: 10,
    });

    expect(mocks.invalidateQueries).toHaveBeenCalledTimes(2);

    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(1, [
      "/api/farmer/forcurrentuser?gameId=1",
    ]);

    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(2, [
      "/api/farmer/herds?gameId=1",
    ]);
  });
});
