export function wordToAxiosParamsPost(word) {
  return {
    url: "/api/chatfilterwords",
    method: "POST",
    params: { word },
  };
}

export function cellToAxiosParamsDelete(cell) {
  return {
    url: "/api/chatfilterwords",
    method: "DELETE",
    params: { id: cell.row.values.id },
  };
}
