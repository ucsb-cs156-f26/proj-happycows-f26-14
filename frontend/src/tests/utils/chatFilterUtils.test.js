import {
  cellToAxiosParamsDelete,
  wordToAxiosParamsPost,
} from "main/utils/chatFilterUtils";

describe("chatFilterUtils tests", () => {
  test("wordToAxiosParamsPost builds the post request", () => {
    expect(wordToAxiosParamsPost("darn")).toEqual({
      url: "/api/chatfilterwords",
      method: "POST",
      params: { word: "darn" },
    });
  });

  test("cellToAxiosParamsDelete builds the delete request", () => {
    const cell = { row: { values: { id: 17 } } };
    expect(cellToAxiosParamsDelete(cell)).toEqual({
      url: "/api/chatfilterwords",
      method: "DELETE",
      params: { id: 17 },
    });
  });
});
