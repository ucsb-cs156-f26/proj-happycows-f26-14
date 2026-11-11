import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import ChatFilterWordsTable from "main/components/Chat/ChatFilterWordsTable";
import { chatFilterWordsFixtures } from "fixtures/chatFilterWordsFixtures";
import { vi } from "vitest";

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("ChatFilterWordsTable tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "ChatFilterWordsTable";

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    mockToast.mockClear();
  });

  const renderTable = (props) =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <ChatFilterWordsTable {...props} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  test("renders headers and rows", () => {
    renderTable({ words: chatFilterWordsFixtures.threeWords });

    [
      ["id", "id"],
      ["word", "Word"],
      ["Delete", "Delete"],
    ].forEach(([id, label]) =>
      expect(screen.getByTestId(`${testId}-header-${id}`)).toHaveTextContent(
        label,
      ),
    );
    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-word`),
    ).toHaveTextContent("fiddlesticks");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).toHaveClass("btn-danger");
  });

  test("uses a custom testid when given", () => {
    renderTable({ words: chatFilterWordsFixtures.oneWord, testid: "custom" });
    expect(screen.getByTestId("custom-cell-row-0-col-word")).toHaveTextContent(
      "darn",
    );
  });

  test("clicking Delete deletes the word and toasts the response", async () => {
    axiosMock
      .onDelete("/api/chatfilterwords")
      .reply(200, { message: "ChatFilterWord with id 2 deleted" });

    renderTable({ words: chatFilterWordsFixtures.threeWords });

    fireEvent.click(
      screen.getByTestId(`${testId}-cell-row-1-col-Delete-button`),
    );

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 2 });
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        "ChatFilterWord with id 2 deleted",
      ),
    );
  });
});
