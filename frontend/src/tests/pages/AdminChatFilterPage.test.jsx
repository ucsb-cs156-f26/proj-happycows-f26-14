import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminChatFilterPage from "main/pages/AdminChatFilterPage";
import { chatFilterWordsFixtures } from "fixtures/chatFilterWordsFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { vi } from "vitest";

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  const toast = (x) => mockToast(x);
  toast.error = (x) => mockToast(x);
  return {
    __esModule: true,
    ...originalModule,
    toast,
  };
});

describe("AdminChatFilterPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const prefix = "AdminChatFilterPage";

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    mockToast.mockClear();
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
          <AdminChatFilterPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  test("renders the words from the backend", async () => {
    axiosMock
      .onGet("/api/chatfilterwords/all")
      .reply(200, chatFilterWordsFixtures.threeWords);

    renderPage();

    expect(screen.getByText("Chat Filter")).toBeInTheDocument();
    expect(await screen.findByText("fiddlesticks")).toBeInTheDocument();
    expect(screen.getByText("heck")).toBeInTheDocument();
  });

  test("adding a word posts it, toasts, clears the input", async () => {
    axiosMock.onGet("/api/chatfilterwords/all").reply(200, []);
    axiosMock
      .onPost("/api/chatfilterwords")
      .reply(200, { id: 4, word: "darn" });

    renderPage();

    const input = screen.getByTestId(`${prefix}-word`);
    fireEvent.change(input, { target: { value: "Darn" } });
    fireEvent.click(screen.getByTestId(`${prefix}-submit`));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    expect(axiosMock.history.post[0].params).toEqual({ word: "Darn" });
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith('Added "darn" to the chat filter'),
    );
    await waitFor(() => expect(input).toHaveValue(""));
  });

  test("a blank word shows a validation error and is not posted", async () => {
    axiosMock.onGet("/api/chatfilterwords/all").reply(200, []);

    renderPage();

    fireEvent.change(screen.getByTestId(`${prefix}-word`), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByTestId(`${prefix}-submit`));

    expect(await screen.findByText("Word is required.")).toBeInTheDocument();
    expect(screen.getByTestId(`${prefix}-word`)).toHaveClass("is-invalid");
    expect(axiosMock.history.post.length).toBe(0);
  });

  test("a duplicate word shows the backend's error message", async () => {
    axiosMock
      .onGet("/api/chatfilterwords/all")
      .reply(200, chatFilterWordsFixtures.oneWord);
    axiosMock
      .onPost("/api/chatfilterwords")
      .reply(409, { message: '"darn" is already on the list' });

    renderPage();

    fireEvent.change(screen.getByTestId(`${prefix}-word`), {
      target: { value: "darn" },
    });
    fireEvent.click(screen.getByTestId(`${prefix}-submit`));

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith('"darn" is already on the list'),
    );
    expect(screen.getByTestId(`${prefix}-word`)).toHaveValue("darn");
  });
});
