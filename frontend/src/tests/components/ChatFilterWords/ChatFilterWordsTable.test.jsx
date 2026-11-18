import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";

import { chatFilterWordsFixtures } from "fixtures/chatFilterWordsFixtures";
import ChatFilterWordsTable from "main/components/ChatFilterWords/ChatFilterWordsTable";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/chatFilterWordUtils";

const { mockMutate, mockUseBackendMutation } = vi.hoisted(() => {
  const mutate = vi.fn();
  const useBackendMutationMock = vi.fn(() => ({ mutate }));
  return { mockMutate: mutate, mockUseBackendMutation: useBackendMutationMock };
});

vi.mock("main/utils/useBackend", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useBackendMutation: mockUseBackendMutation,
  };
});

describe("ChatFilterWordsTable tests", () => {
  const queryClient = new QueryClient();
  const testId = "ChatFilterWordsTable";

  beforeEach(() => {
    mockMutate.mockReset();
    mockUseBackendMutation.mockClear();
  });

  const renderTable = (words, props = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatFilterWordsTable words={words} {...props} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  test("has the expected headers, content, and delete buttons", () => {
    renderTable(chatFilterWordsFixtures.threeWords);

    expect(screen.getByText("id")).toBeInTheDocument();
    expect(screen.getByText("Word")).toBeInTheDocument();

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-word`),
    ).toHaveTextContent("darn");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-word`),
    ).toHaveTextContent("silly goose");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toHaveClass("btn-danger");
    expect(screen.queryByTestId(`${testId}-Modal`)).not.toBeInTheDocument();
  });

  test("uses the delete helpers and invalidates the word list", () => {
    renderTable(chatFilterWordsFixtures.threeWords);

    expect(mockUseBackendMutation).toHaveBeenCalledWith(
      cellToAxiosParamsDelete,
      { onSuccess: onDeleteSuccess },
      ["/api/chatfilterwords/all"],
    );
  });

  test("uses a custom testid when one is passed", () => {
    renderTable(chatFilterWordsFixtures.oneWord, { testid: "Custom" });
    expect(screen.getByTestId("Custom-cell-row-0-col-word")).toHaveTextContent(
      "darn",
    );
  });

  test("clicking Delete then Remove deletes the word", async () => {
    renderTable(chatFilterWordsFixtures.threeWords);

    fireEvent.click(
      screen.getByTestId(`${testId}-cell-row-1-col-Delete-button`),
    );

    expect(
      await screen.findByText(
        'Are you sure you want to remove "heck" from the filter list?',
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId(`${testId}-Modal-Delete`));

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate.mock.calls[0][0].row.values).toEqual({
      id: 2,
      word: "heck",
    });
    await waitFor(() =>
      expect(screen.queryByTestId(`${testId}-Modal`)).not.toBeInTheDocument(),
    );
  });

  test("clicking Delete then Keep does not delete the word", async () => {
    renderTable(chatFilterWordsFixtures.threeWords);

    fireEvent.click(
      screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`),
    );
    fireEvent.click(await screen.findByTestId(`${testId}-Modal-Cancel`));

    expect(mockMutate).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.queryByTestId(`${testId}-Modal`)).not.toBeInTheDocument(),
    );
  });

  test("closing the modal with the X does not delete the word", async () => {
    renderTable(chatFilterWordsFixtures.threeWords);

    fireEvent.click(
      screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`),
    );
    await screen.findByTestId(`${testId}-Modal`);
    fireEvent.click(screen.getByLabelText("Close"));

    expect(mockMutate).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.queryByTestId(`${testId}-Modal`)).not.toBeInTheDocument(),
    );
  });
});
