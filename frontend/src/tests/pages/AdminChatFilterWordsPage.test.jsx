import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { vi } from "vitest";

import AdminChatFilterWordsPage from "main/pages/AdminChatFilterWordsPage";
import { chatFilterWordsFixtures } from "fixtures/chatFilterWordsFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

const { mockToast } = vi.hoisted(() => {
  const toast = vi.fn();
  toast.error = vi.fn();
  return { mockToast: toast };
});

vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: mockToast,
  };
});

describe("AdminChatFilterWordsPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const tableId = "ChatFilterWordsTable";
  const formId = "ChatFilterWordForm";

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    mockToast.mockClear();
    mockToast.error.mockClear();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const renderPage = () =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <AdminChatFilterWordsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  test("shows the heading, description, form, and words from the backend", async () => {
    axiosMock
      .onGet("/api/chatfilterwords/all")
      .reply(200, chatFilterWordsFixtures.threeWords);

    renderPage();

    expect(
      screen.getByRole("heading", { name: "Chat Filter Words" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Words and phrases on this list will be censored with asterisks in game chat. Words are saved in lowercase.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId(`${formId}-word`)).toBeInTheDocument();
    expect(
      await screen.findByTestId(`${tableId}-cell-row-2-col-word`),
    ).toHaveTextContent("silly goose");
  });

  test("shows an empty table when there are no words", async () => {
    axiosMock.onGet("/api/chatfilterwords/all").reply(200, []);

    renderPage();

    await waitFor(() =>
      expect(
        axiosMock.history.get.filter(
          (r) => r.url === "/api/chatfilterwords/all",
        ).length,
      ).toBe(1),
    );
    expect(
      screen.queryByTestId(`${tableId}-cell-row-0-col-id`),
    ).not.toBeInTheDocument();
  });

  test("adding a word posts it, shows a toast, clears the input, and refreshes the list", async () => {
    axiosMock
      .onGet("/api/chatfilterwords/all")
      .replyOnce(200, [])
      .onGet("/api/chatfilterwords/all")
      .reply(200, chatFilterWordsFixtures.oneWord);
    axiosMock
      .onPost("/api/chatfilterwords")
      .reply(200, { id: 1, word: "darn" });

    renderPage();

    const getCount = (url) =>
      axiosMock.history.get.filter((r) => r.url === url).length;
    await waitFor(() => expect(getCount("/api/chatfilterwords/all")).toBe(1));
    await waitFor(() => expect(getCount("/api/systemInfo")).toBe(1));

    const input = screen.getByTestId(`${formId}-word`);
    fireEvent.change(input, { target: { value: "  DARN " } });
    fireEvent.click(screen.getByTestId(`${formId}-submit`));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    expect(axiosMock.history.post[0].params).toEqual({ word: "  DARN " });
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        '"darn" was added to the filter list',
      ),
    );
    await waitFor(() => expect(input).toHaveValue(""));
    expect(
      await screen.findByTestId(`${tableId}-cell-row-0-col-word`),
    ).toHaveTextContent("darn");
    // Only the word list is refetched, not every query on the page.
    expect(getCount("/api/chatfilterwords/all")).toBe(2);
    expect(getCount("/api/systemInfo")).toBe(1);
  });

  test("a duplicate word shows the backend error and keeps the input", async () => {
    axiosMock
      .onGet("/api/chatfilterwords/all")
      .reply(200, chatFilterWordsFixtures.oneWord);
    axiosMock
      .onPost("/api/chatfilterwords")
      .reply(409, { message: '"darn" is already on the list' });

    renderPage();

    const input = screen.getByTestId(`${formId}-word`);
    fireEvent.change(input, { target: { value: "darn" } });
    fireEvent.click(screen.getByTestId(`${formId}-submit`));

    await waitFor(() =>
      expect(mockToast.error).toHaveBeenCalledWith(
        '"darn" is already on the list',
      ),
    );
    expect(mockToast).not.toHaveBeenCalled();
    expect(input).toHaveValue("darn");
  });

  test("deleting a word sends the id and shows the backend message", async () => {
    axiosMock
      .onGet("/api/chatfilterwords/all")
      .reply(200, chatFilterWordsFixtures.threeWords);
    axiosMock
      .onDelete("/api/chatfilterwords")
      .reply(200, { message: "ChatFilterWord with id 1 deleted" });

    renderPage();

    fireEvent.click(
      await screen.findByTestId(`${tableId}-cell-row-0-col-Delete-button`),
    );
    fireEvent.click(await screen.findByTestId(`${tableId}-Modal-Delete`));

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        "ChatFilterWord with id 1 deleted",
      ),
    );
  });
});
