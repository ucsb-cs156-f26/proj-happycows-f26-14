import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
  onPostSuccess,
  wordToAxiosParamsPost,
} from "main/utils/chatFilterWordUtils";
import { vi } from "vitest";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    toast: (message) => mockToast(message),
  };
});

describe("chatFilterWordUtils tests", () => {
  beforeEach(() => {
    mockToast.mockClear();
  });

  test("onDeleteSuccess shows the backend message in a toast", () => {
    onDeleteSuccess({ message: "ChatFilterWord with id 1 deleted" });
    expect(mockToast).toHaveBeenCalledWith("ChatFilterWord with id 1 deleted");
  });

  test("cellToAxiosParamsDelete returns correct axios params", () => {
    const cell = { row: { values: { id: 42 } } };
    expect(cellToAxiosParamsDelete(cell)).toEqual({
      url: "/api/chatfilterwords",
      method: "DELETE",
      params: { id: 42 },
    });
  });

  test("wordToAxiosParamsPost returns correct axios params", () => {
    expect(wordToAxiosParamsPost({ word: "darn" })).toEqual({
      url: "/api/chatfilterwords",
      method: "POST",
      params: { word: "darn" },
    });
  });

  test("onPostSuccess shows the saved word in a toast", () => {
    onPostSuccess({ id: 1, word: "darn" });
    expect(mockToast).toHaveBeenCalledWith(
      '"darn" was added to the filter list',
    );
  });
});
